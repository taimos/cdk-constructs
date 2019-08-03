import { CfnCloudFrontOriginAccessIdentity, CloudFrontWebDistribution, OriginProtocolPolicy, PriceClass, ViewerProtocolPolicy } from '@aws-cdk/aws-cloudfront';
import { CanonicalUserPrincipal, PolicyStatement } from '@aws-cdk/aws-iam';
import { ARecord, HostedZone, RecordTarget } from '@aws-cdk/aws-route53';
import { CloudFrontTarget } from '@aws-cdk/aws-route53-targets';
import { Bucket, CfnBucket } from '@aws-cdk/aws-s3';
import { BucketDeployment, Source } from '@aws-cdk/aws-s3-deployment';
import { Aws, Construct, Fn } from '@aws-cdk/core';

export interface SinglePageAppHostingProps {
    /**
     * The ARN of the certificate; Has to be in us-east-1
     */
    readonly certArn : string;
    /**
     * ID of the HostedZone of the domain
     */
    readonly zoneId : string;
    /**
     * Name of the HostedZone of the domain
     */
    readonly zoneName : string;
    /**
     * local folder with contents for the website bucket
     *
     * @default - no file deployment
     */
    readonly webFolder? : string;
    /**
     * Define if the main domain is with or without www.
     *
     * @default false - Redirect example.com to www.example.com
     */
    readonly redirectToApex? : boolean;
}

export class SinglePageAppHosting extends Construct {

    public readonly webBucket : Bucket;

    public readonly distribution : CloudFrontWebDistribution;

    constructor(scope : Construct, id : string, props : SinglePageAppHostingProps) {
        super(scope, id);

        const domainName = props.redirectToApex ? props.zoneName : `www.${props.zoneName}`;
        const redirectDomainName = props.redirectToApex ? `www.${props.zoneName}` : props.zoneName;

        const zone = HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
            hostedZoneId: props.zoneId,
            zoneName: props.zoneName,
        });

        const oai = new CfnCloudFrontOriginAccessIdentity(this, 'OAI', {
            cloudFrontOriginAccessIdentityConfig: { comment: Aws.STACK_NAME },
        });

        this.webBucket = new Bucket(this, 'WebBucket', { websiteIndexDocument: 'index.html' });
        this.webBucket.addToResourcePolicy(new PolicyStatement({
            actions: ['s3:GetObject'],
            resources: [this.webBucket.arnForObjects('*')],
            principals: [new CanonicalUserPrincipal(oai.attrS3CanonicalUserId)],
        }));

        this.distribution = new CloudFrontWebDistribution(this, 'Distribution', {
            originConfigs: [{
                behaviors: [{ isDefaultBehavior: true }],
                s3OriginSource: {
                    s3BucketSource: this.webBucket,
                    originAccessIdentityId: oai.ref,
                },
            }],
            aliasConfiguration: {
                acmCertRef: props.certArn,
                names: [domainName],
            },
            errorConfigurations: [{
                errorCode: 403,
                responseCode: 200,
                responsePagePath: '/index.html',
            }, {
                errorCode: 404,
                responseCode: 200,
                responsePagePath: '/index.html',
            }],
            comment: `${domainName} Website`,
            priceClass: PriceClass.PRICE_CLASS_ALL,
            viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        });

        if (props.webFolder) {
            new BucketDeployment(this, 'DeployWebsite', {
                source: Source.asset(props.webFolder),
                destinationBucket: this.webBucket,
            });
        }

        new ARecord(this, 'AliasRecord', {
            recordName: domainName,
            zone,
            target: RecordTarget.fromAlias(new CloudFrontTarget(this.distribution)),
        });

        const redirectBucket = new CfnBucket(this, 'RedirectBucket', {
            websiteConfiguration: {
                redirectAllRequestsTo: {
                    hostName: domainName,
                    protocol: 'https',
                },
            },
        });
        const redirectDist = new CloudFrontWebDistribution(this, 'RedirectDistribution', {
            originConfigs: [{
                behaviors: [{ isDefaultBehavior: true }],
                customOriginSource: {
                    domainName: Fn.select(2, Fn.split('/', redirectBucket.attrWebsiteUrl)),
                    originProtocolPolicy: OriginProtocolPolicy.HTTP_ONLY,
                },
            }],
            aliasConfiguration: {
                acmCertRef: props.certArn,
                names: [redirectDomainName],
            },
            comment: `${redirectDomainName} Redirect to ${domainName}`,
            priceClass: PriceClass.PRICE_CLASS_ALL,
            viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        });

        new ARecord(this, 'RedirectAliasRecord', {
            recordName: redirectDomainName,
            zone,
            target: RecordTarget.fromAlias(new CloudFrontTarget(redirectDist)),
        });
    }
}
