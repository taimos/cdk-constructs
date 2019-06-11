"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_cloudfront_1 = require("@aws-cdk/aws-cloudfront");
const aws_iam_1 = require("@aws-cdk/aws-iam");
const aws_route53_1 = require("@aws-cdk/aws-route53");
const aws_route53_targets_1 = require("@aws-cdk/aws-route53-targets");
const aws_s3_1 = require("@aws-cdk/aws-s3");
const cdk_1 = require("@aws-cdk/cdk");
class SinglePageAppHosting extends cdk_1.Construct {
    constructor(scope, id, props) {
        super(scope, id);
        const zone = aws_route53_1.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
            hostedZoneId: props.zoneId,
            zoneName: props.zoneName,
        });
        const oai = new aws_cloudfront_1.CfnCloudFrontOriginAccessIdentity(this, 'OAI', {
            cloudFrontOriginAccessIdentityConfig: { comment: cdk_1.Aws.stackName },
        });
        this.webBucket = new aws_s3_1.Bucket(this, 'WebBucket', { websiteIndexDocument: 'index.html' });
        this.webBucket.addToResourcePolicy(new aws_iam_1.PolicyStatement()
            .allow()
            .addAction('s3:GetObject')
            .addResource(this.webBucket.arnForObjects('*'))
            .addCanonicalUserPrincipal(oai.cloudFrontOriginAccessIdentityS3CanonicalUserId));
        this.distribution = new aws_cloudfront_1.CloudFrontWebDistribution(this, 'Distribution', {
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
            priceClass: aws_cloudfront_1.PriceClass.PriceClassAll,
            viewerProtocolPolicy: aws_cloudfront_1.ViewerProtocolPolicy.RedirectToHTTPS,
        });
        new aws_route53_1.ARecord(this, 'AliasRecord', {
            recordName: `www.${props.zoneName}`,
            zone,
            target: aws_route53_1.RecordTarget.fromAlias(new aws_route53_targets_1.CloudFrontTarget(this.distribution)),
        });
        const redirectBucket = new aws_s3_1.CfnBucket(this, 'RedirectBucket', {
            websiteConfiguration: {
                redirectAllRequestsTo: {
                    hostName: `www.${props.zoneName}`,
                    protocol: 'https',
                },
            },
        });
        const redirectDist = new aws_cloudfront_1.CloudFrontWebDistribution(this, 'RedirectDistribution', {
            originConfigs: [{
                    behaviors: [{ isDefaultBehavior: true }],
                    customOriginSource: {
                        domainName: cdk_1.Fn.select(2, cdk_1.Fn.split('/', redirectBucket.bucketWebsiteUrl)),
                        originProtocolPolicy: aws_cloudfront_1.OriginProtocolPolicy.HttpOnly,
                    },
                }],
            aliasConfiguration: {
                acmCertRef: props.certArn,
                names: [props.zoneName],
            },
            comment: `${props.zoneName} Redirect to www.${props.zoneName}`,
            priceClass: aws_cloudfront_1.PriceClass.PriceClassAll,
            viewerProtocolPolicy: aws_cloudfront_1.ViewerProtocolPolicy.RedirectToHTTPS,
        });
        new aws_route53_1.ARecord(this, 'RedirectAliasRecord', {
            recordName: props.zoneName,
            zone,
            target: aws_route53_1.RecordTarget.fromAlias(new aws_route53_targets_1.CloudFrontTarget(redirectDist)),
        });
    }
}
exports.SinglePageAppHosting = SinglePageAppHosting;
//# sourceMappingURL=single_page_app.js.map