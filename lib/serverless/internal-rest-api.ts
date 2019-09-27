import { EndpointType, IRestApi, RestApi, RestApiProps } from '@aws-cdk/aws-apigateway';
import { DnsValidatedCertificate, ICertificate } from '@aws-cdk/aws-certificatemanager';
import { InterfaceVpcEndpoint, InterfaceVpcEndpointAwsService, ISecurityGroup, IVpc, Port } from '@aws-cdk/aws-ec2';
import { ApplicationLoadBalancer, ApplicationTargetGroup, IpTarget, Protocol, TargetType } from '@aws-cdk/aws-elasticloadbalancingv2';
import { AnyPrincipal, Effect, PolicyDocument, PolicyStatement } from '@aws-cdk/aws-iam';
import { ARecord, IHostedZone, RecordTarget } from '@aws-cdk/aws-route53';
import { LoadBalancerTarget } from '@aws-cdk/aws-route53-targets';
import { Aws, Construct, Duration, Stack, Token } from '@aws-cdk/core';
import { AwsCustomResource } from '@aws-cdk/custom-resources';

export interface InternalRestApiProps {

    /**
     * The domain name to use for the internal API
     */
    readonly domainName : string;
    /**
     * The Route53 HostedZone to add the domain to.
     * This is used for ACM DNS validation too, if no certificate is provided.
     */
    readonly hostedZone : IHostedZone;
    /**
     * The VPC to deploy the internal ALB into
     */
    readonly vpc : IVpc;

    /**
     * API properties for the underlying RestApi construct
     *
     * @default - None
     */
    readonly apiProps? : RestApiProps;
    /**
     * The certificate to use for the ALB listener
     *
     * @default - Use ACM to create a DNS validated certificate for the given domain name
     */
    readonly certificate? : ICertificate;
    /**
     * Security group to associate with the internal load balancer
     *
     * @default - A security group is created
     */
    readonly securityGroup? : ISecurityGroup;
}

export class InternalRestApi extends Construct implements IRestApi {

    /**
     * The ID of this API Gateway RestApi.
     */
    public readonly restApiId : string;
    /**
     * The stack in which this resource is defined.
     */
    public readonly stack : Stack;
    /**
     * The underlying RestApi
     */
    public readonly api : RestApi;
    /**
     * The underlying internal application load balancer
     */
    public readonly alb : ApplicationLoadBalancer;

    private internalCertificate : ICertificate;
    private vpce : InterfaceVpcEndpoint;

    constructor(scope : Construct, id : string, props : InternalRestApiProps) {
        super(scope, id);
        this.stack = Stack.of(this);

        this.internalCertificate = props.certificate || new DnsValidatedCertificate(this, 'Certificate', {
            hostedZone: props.hostedZone,
            domainName: props.domainName,
        });

        this.vpce = new InterfaceVpcEndpoint(this, 'APIGWEndpoint', { privateDnsEnabled: false, service: InterfaceVpcEndpointAwsService.APIGATEWAY, vpc: props.vpc });

        this.api = new RestApi(this, 'Resource', {
            ...props.apiProps,
            endpointTypes: [EndpointType.PRIVATE],
            domainName: {
                endpointType: EndpointType.REGIONAL,
                domainName: props.domainName,
                certificate: this.internalCertificate,
            },
            policy: new PolicyDocument({
                statements: [
                    new PolicyStatement({
                        principals: [new AnyPrincipal()],
                        actions: ['execute-api:Invoke'],
                        resources: [`arn:aws:execute-api:${Aws.REGION}:${Aws.ACCOUNT_ID}:*`],
                    }),
                    new PolicyStatement({
                        effect: Effect.DENY,
                        principals: [new AnyPrincipal()],
                        actions: ['execute-api:Invoke'],
                        resources: [`arn:aws:execute-api:${Aws.REGION}:${Aws.ACCOUNT_ID}:*`],
                        conditions: { StringNotEquals: { 'aws:SourceVpce': this.vpce.vpcEndpointId } },
                    }),
                ],
            }),
        });
        this.restApiId = this.api.restApiId;

        this.alb = new ApplicationLoadBalancer(this, 'InternalALB', { vpc: props.vpc, securityGroup: props.securityGroup });
        this.vpce.connections.allowFrom(this.alb, Port.tcp(443));

        const targetGroup = new ApplicationTargetGroup(this, 'TargetGroup', {
            vpc: props.vpc,
            targetType: TargetType.IP,
            port: 443,
        });

        for (let index = 0; index < props.vpc.availabilityZones.length; index++) {
            const getEndpointIp = new AwsCustomResource(this, `GetEndpointIp${index}`, {
                onUpdate: {
                    service: 'EC2',
                    action: 'describeNetworkInterfaces',
                    outputPath: `NetworkInterfaces.${index}.PrivateIpAddress`,
                    parameters: { NetworkInterfaceIds: this.vpce.vpcEndpointNetworkInterfaceIds },
                    physicalResourceIdPath: `NetworkInterfaces.${index}.PrivateIpAddress`,
                },
            });
            targetGroup.addTarget(new IpTarget(Token.asString(getEndpointIp.getData(`NetworkInterfaces.${index}.PrivateIpAddress`))));
        }

        this.alb.addListener('Listener', {
            certificateArns: [this.internalCertificate.certificateArn],
            port: 443,
            defaultTargetGroups: [targetGroup],
        });
        targetGroup.configureHealthCheck({
            healthyHttpCodes: '403',
            healthyThresholdCount: 2,
            unhealthyThresholdCount: 2,
            interval: Duration.seconds(30),
            timeout: Duration.seconds(5),
            path: '/',
            protocol: Protocol.HTTPS,
        });

        new ARecord(this, 'R53Alias', {
            recordName: props.domainName,
            zone: props.hostedZone,
            target: RecordTarget.fromAlias(new LoadBalancerTarget(this.alb)),
        });
    }
}
