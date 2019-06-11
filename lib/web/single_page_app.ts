import { CfnCloudFrontOriginAccessIdentity, CloudFrontWebDistribution, OriginProtocolPolicy, PriceClass, ViewerProtocolPolicy } from '@aws-cdk/aws-cloudfront';
import { PolicyStatement } from '@aws-cdk/aws-iam';
import { ARecord, HostedZone, RecordTarget } from '@aws-cdk/aws-route53';
import { CloudFrontTarget } from '@aws-cdk/aws-route53-targets';
import { Bucket, CfnBucket } from '@aws-cdk/aws-s3';
import { App, Aws, CfnOutput, Construct, Fn } from '@aws-cdk/cdk';

export interface SinglePageAppHostingProps {
    certArn : string;
    zoneId : string;
    zoneName : string;
}

export class SinglePageAppHosting extends Construct {

    public readonly webBucket : Bucket;

    public readonly distribution : CloudFrontWebDistribution;

    constructor(scope : Construct, id : string, props : SinglePageAppHostingProps) {
        super(scope, id);

        const zone = HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
            hostedZoneId: props.zoneId,
            zoneName: props.zoneName,
        });

        const oai = new CfnCloudFrontOriginAccessIdentity(this, 'OAI', {
            cloudFrontOriginAccessIdentityConfig: { comment: Aws.stackName },
        });

        this.webBucket = new Bucket(this, 'WebBucket', { websiteIndexDocument: 'index.html' });
        this.webBucket.addToResourcePolicy(new PolicyStatement()
            .allow()
            .addAction('s3:GetObject')
            .addResource(this.webBucket.arnForObjects('*'))
            .addCanonicalUserPrincipal(oai.cloudFrontOriginAccessIdentityS3CanonicalUserId));

        this.distribution = new CloudFrontWebDistribution(this, 'Distribution', {
            originConfigs: [{
                behaviors: [{ isDefaultBehavior: true }],
                s3OriginSource: {
                    s3BucketSource: this.webBucket,
                    originAccessIdentityId: oai.cloudFrontOriginAccessIdentityId,
                },
            }],
            aliasConfiguration: {
                acmCertRef: props.certArn,
                names: [`www.${props.zoneName}`],
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
            comment: `www.${props.zoneName} Website`,
            priceClass: PriceClass.PriceClassAll,
            viewerProtocolPolicy: ViewerProtocolPolicy.RedirectToHTTPS,
        });

        new ARecord(this, 'AliasRecord', {
            recordName: `www.${props.zoneName}`,
            zone,
            target: RecordTarget.fromAlias(new CloudFrontTarget(this.distribution)),
        });

        const redirectBucket = new CfnBucket(this, 'RedirectBucket', {
            websiteConfiguration: {
                redirectAllRequestsTo: {
                    hostName: `www.${props.zoneName}`,
                    protocol: 'https',
                },
            },
        });
        const redirectDist = new CloudFrontWebDistribution(this, 'RedirectDistribution', {
            originConfigs: [{
                behaviors: [{ isDefaultBehavior: true }],
                customOriginSource: {
                    domainName: Fn.select(2, Fn.split('/', redirectBucket.bucketWebsiteUrl)),
                    originProtocolPolicy: OriginProtocolPolicy.HttpOnly,
                },
            }],
            aliasConfiguration: {
                acmCertRef: props.certArn,
                names: [props.zoneName],
            },
            comment: `${props.zoneName} Redirect to www.${props.zoneName}`,
            priceClass: PriceClass.PriceClassAll,
            viewerProtocolPolicy: ViewerProtocolPolicy.RedirectToHTTPS,
        });

        new ARecord(this, 'RedirectAliasRecord', {
            recordName: props.zoneName,
            zone,
            target: RecordTarget.fromAlias(new CloudFrontTarget(redirectDist)),
        });
    }
}
