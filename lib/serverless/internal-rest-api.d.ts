import { IRestApi, RestApi, RestApiProps } from '@aws-cdk/aws-apigateway';
import { ICertificate } from '@aws-cdk/aws-certificatemanager';
import { ISecurityGroup, IVpc } from '@aws-cdk/aws-ec2';
import { ApplicationLoadBalancer } from '@aws-cdk/aws-elasticloadbalancingv2';
import { IHostedZone } from '@aws-cdk/aws-route53';
import { Construct, Stack } from '@aws-cdk/core';
export interface InternalRestApiProps {
    /**
     * The domain name to use for the internal API
     */
    readonly domainName: string;
    /**
     * The Route53 HostedZone to add the domain to.
     * This is used for ACM DNS validation too, if no certificate is provided.
     */
    readonly hostedZone: IHostedZone;
    /**
     * The VPC to deploy the internal ALB into
     */
    readonly vpc: IVpc;
    /**
     * API properties for the underlying RestApi construct
     *
     * @default - None
     */
    readonly apiProps?: RestApiProps;
    /**
     * The certificate to use for the ALB listener
     *
     * @default - Use ACM to create a DNS validated certificate for the given domain name
     */
    readonly certificate?: ICertificate;
    /**
     * Security group to associate with the internal load balancer
     *
     * @default - A security group is created
     */
    readonly securityGroup?: ISecurityGroup;
}
export declare class InternalRestApi extends Construct implements IRestApi {
    /**
     * The ID of this API Gateway RestApi.
     */
    readonly restApiId: string;
    /**
     * The stack in which this resource is defined.
     */
    readonly stack: Stack;
    /**
     * The underlying RestApi
     */
    readonly api: RestApi;
    /**
     * The underlying internal application load balancer
     */
    readonly alb: ApplicationLoadBalancer;
    private internalCertificate;
    private vpce;
    constructor(scope: Construct, id: string, props: InternalRestApiProps);
}
