"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_cloudfront_1 = require("@aws-cdk/aws-cloudfront");
const aws_iam_1 = require("@aws-cdk/aws-iam");
const aws_route53_1 = require("@aws-cdk/aws-route53");
const aws_route53_targets_1 = require("@aws-cdk/aws-route53-targets");
const aws_s3_1 = require("@aws-cdk/aws-s3");
const aws_s3_deployment_1 = require("@aws-cdk/aws-s3-deployment");
const core_1 = require("@aws-cdk/core");
class SinglePageAppHosting extends core_1.Construct {
    constructor(scope, id, props) {
        super(scope, id);
        const zone = aws_route53_1.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
            hostedZoneId: props.zoneId,
            zoneName: props.zoneName,
        });
        const oai = new aws_cloudfront_1.CfnCloudFrontOriginAccessIdentity(this, 'OAI', {
            cloudFrontOriginAccessIdentityConfig: { comment: core_1.Aws.STACK_NAME },
        });
        this.webBucket = new aws_s3_1.Bucket(this, 'WebBucket', { websiteIndexDocument: 'index.html' });
        this.webBucket.addToResourcePolicy(new aws_iam_1.PolicyStatement({
            actions: ['s3:GetObject'],
            resources: [this.webBucket.arnForObjects('*')],
            principals: [new aws_iam_1.CanonicalUserPrincipal(oai.attrS3CanonicalUserId)],
        }));
        this.distribution = new aws_cloudfront_1.CloudFrontWebDistribution(this, 'Distribution', {
            originConfigs: [{
                    behaviors: [{ isDefaultBehavior: true }],
                    s3OriginSource: {
                        s3BucketSource: this.webBucket,
                        originAccessIdentityId: oai.ref,
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
            priceClass: aws_cloudfront_1.PriceClass.PRICE_CLASS_ALL,
            viewerProtocolPolicy: aws_cloudfront_1.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        });
        if (props.webFolder) {
            new aws_s3_deployment_1.BucketDeployment(this, 'DeployWebsite', {
                source: aws_s3_deployment_1.Source.asset(props.webFolder),
                destinationBucket: this.webBucket,
            });
        }
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
                        domainName: core_1.Fn.select(2, core_1.Fn.split('/', redirectBucket.attrWebsiteUrl)),
                        originProtocolPolicy: aws_cloudfront_1.OriginProtocolPolicy.HTTP_ONLY,
                    },
                }],
            aliasConfiguration: {
                acmCertRef: props.certArn,
                names: [props.zoneName],
            },
            comment: `${props.zoneName} Redirect to www.${props.zoneName}`,
            priceClass: aws_cloudfront_1.PriceClass.PRICE_CLASS_ALL,
            viewerProtocolPolicy: aws_cloudfront_1.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        });
        new aws_route53_1.ARecord(this, 'RedirectAliasRecord', {
            recordName: props.zoneName,
            zone,
            target: aws_route53_1.RecordTarget.fromAlias(new aws_route53_targets_1.CloudFrontTarget(redirectDist)),
        });
    }
}
exports.SinglePageAppHosting = SinglePageAppHosting;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2luZ2xlLXBhZ2UtYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic2luZ2xlLXBhZ2UtYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNERBQStKO0FBQy9KLDhDQUEyRTtBQUMzRSxzREFBeUU7QUFDekUsc0VBQWdFO0FBQ2hFLDRDQUFvRDtBQUNwRCxrRUFBc0U7QUFDdEUsd0NBQW1EO0FBU25ELE1BQWEsb0JBQXFCLFNBQVEsZ0JBQVM7SUFNL0MsWUFBWSxLQUFpQixFQUFFLEVBQVcsRUFBRSxLQUFpQztRQUN6RSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRWpCLE1BQU0sSUFBSSxHQUFHLHdCQUFVLENBQUMsd0JBQXdCLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRTtZQUNqRSxZQUFZLEVBQUUsS0FBSyxDQUFDLE1BQU07WUFDMUIsUUFBUSxFQUFFLEtBQUssQ0FBQyxRQUFRO1NBQzNCLENBQUMsQ0FBQztRQUVILE1BQU0sR0FBRyxHQUFHLElBQUksa0RBQWlDLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRTtZQUMzRCxvQ0FBb0MsRUFBRSxFQUFFLE9BQU8sRUFBRSxVQUFHLENBQUMsVUFBVSxFQUFFO1NBQ3BFLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxlQUFNLENBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRSxFQUFFLG9CQUFvQixFQUFFLFlBQVksRUFBRSxDQUFDLENBQUM7UUFDdkYsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLHlCQUFlLENBQUM7WUFDbkQsT0FBTyxFQUFFLENBQUMsY0FBYyxDQUFDO1lBQ3pCLFNBQVMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzlDLFVBQVUsRUFBRSxDQUFDLElBQUksZ0NBQXNCLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUM7U0FDdEUs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QUFFLHFCQUFxQixFQUFFO1lBQ3JDLFVBQVUsRUFBRSxLQUFLLENBQUMsUUFBUTtZQUMxQixJQUFJO1lBQ0osTUFBTSxFQUFFLDBCQUFZLENBQUMsU0FBUyxDQUFDLElBQUksc0NBQWdCLENBQUMsWUFBWSxDQUFDLENBQUM7U0FDckUsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKO0FBL0ZELG9EQStGQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENmbkNsb3VkRnJvbnRPcmlnaW5BY2Nlc3NJZGVudGl0eSwgQ2xvdWRGcm9udFdlYkRpc3RyaWJ1dGlvbiwgT3JpZ2luUHJvdG9jb2xQb2xpY3ksIFByaWNlQ2xhc3MsIFZpZXdlclByb3RvY29sUG9saWN5IH0gZnJvbSAnQGF3cy1jZGsvYXdzLWNsb3VkZnJvbnQnO1xuaW1wb3J0IHsgQ2Fub25pY2FsVXNlclByaW5jaXBhbCwgUG9saWN5U3RhdGVtZW50IH0gZnJvbSAnQGF3cy1jZGsvYXdzLWlhbSc7XG5pbXBvcnQgeyBBUmVjb3JkLCBIb3N0ZWRab25lLCBSZWNvcmRUYXJnZXQgfSBmcm9tICdAYXdzLWNkay9hd3Mtcm91dGU1Myc7XG5pbXBvcnQgeyBDbG91ZEZyb250VGFyZ2V0IH0gZnJvbSAnQGF3cy1jZGsvYXdzLXJvdXRlNTMtdGFyZ2V0cyc7XG5pbXBvcnQgeyBCdWNrZXQsIENmbkJ1Y2tldCB9IGZyb20gJ0Bhd3MtY2RrL2F3cy1zMyc7XG5pbXBvcnQgeyBCdWNrZXREZXBsb3ltZW50LCBTb3VyY2UgfSBmcm9tICdAYXdzLWNkay9hd3MtczMtZGVwbG95bWVudCc7XG5pbXBvcnQgeyBBd3MsIENvbnN0cnVjdCwgRm4gfSBmcm9tICdAYXdzLWNkay9jb3JlJztcblxuZXhwb3J0IGludGVyZmFjZSBTaW5nbGVQYWdlQXBwSG9zdGluZ1Byb3BzIHtcbiAgICByZWFkb25seSBjZXJ0QXJuIDogc3RyaW5nO1xuICAgIHJlYWRvbmx5IHpvbmVJZCA6IHN0cmluZztcbiAgICByZWFkb25seSB6b25lTmFtZSA6IHN0cmluZztcbiAgICByZWFkb25seSB3ZWJGb2xkZXI/IDogc3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgU2luZ2xlUGFnZUFwcEhvc3RpbmcgZXh0ZW5kcyBDb25zdHJ1Y3Qge1xuXG4gICAgcHVibGljIHJlYWRvbmx5IHdlYkJ1Y2tldCA6IEJ1Y2tldDtcblxuICAgIHB1YmxpYyByZWFkb25seSBkaXN0cmlidXRpb24gOiBDbG91ZEZyb250V2ViRGlzdHJpYnV0aW9uO1xuXG4gICAgY29uc3RydWN0b3Ioc2NvcGUgOiBDb25zdHJ1Y3QsIGlkIDogc3RyaW5nLCBwcm9wcyA6IFNpbmdsZVBhZ2VBcHBIb3N0aW5nUHJvcHMpIHtcbiAgICAgICAgc3VwZXIoc2NvcGUsIGlkKTtcblxuICAgICAgICBjb25zdCB6b25lID0gSG9zdGVkWm9uZS5mcm9tSG9zdGVkWm9uZUF0dHJpYnV0ZXModGhpcywgJ0hvc3RlZFpvbmUnLCB7XG4gICAgICAgICAgICBob3N0ZWRab25lSWQ6IHByb3BzLnpvbmVJZCxcbiAgICAgICAgICAgIHpvbmVOYW1lOiBwcm9wcy56b25lTmFtZSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3Qgb2FpID0gbmV3IENmbkNsb3VkRnJvbnRPcmlnaW5BY2Nlc3NJZGVudGl0eSh0aGlzLCAnT0FJJywge1xuICAgICAgICAgICAgY2xvdWRGcm9udE9yaWdpbkFjY2Vzc0lkZW50aXR5Q29uZmlnOiB7IGNvbW1lbnQ6IEF3cy5TVEFDS19OQU1FIH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMud2ViQnVja2V0ID0gbmV3IEJ1Y2tldCh0aGlzLCAnV2ViQnVja2V0JywgeyB3ZWJzaXRlSW5kZXhEb2N1bWVudDogJ2luZGV4Lmh0bWwnIH0pO1xuICAgICAgICB0aGlzLndlYkJ1Y2tldC5hZGRUb1Jlc291cmNlUG9saWN5KG5ldyBQb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICAgICAgYWN0aW9uczogWydzMzpHZXRPYmplY3QnXSxcbiAgICAgICAgICAgIHJlc291cmNlczogW3RoaXMud2ViQnVja2V0LmFybkZvck9iamVjdHMoJyonKV0sXG4gICAgICAgICAgICBwcmluY2lwYWxzOiBbbmV3IENhbm9uaWNhbFVzZXJQcmluY2lwYWwob2FpLmF0dHJTM0Nhbm9uaWNhbFVzZXJJZCldLFxuICAgICAgICB9KSk7XG5cbiAgICAgICAgdGhpcy5kaXN0cmlidXRpb24gPSBuZXcgQ2xvdWRGcm9udFdlYkRpc3RyaWJ1dGlvbih0aGlzLCAnRGlzdHJpYnV0aW9uJywge1xuICAgICAgICAgICAgb3JpZ2luQ29uZmlnczogW3tcbiAgICAgICAgICAgICAgICBiZWhhdmlvcnM6IFt7IGlzRGVmYXVsdEJlaGF2aW9yOiB0cnVlIH1dLFxuICAgICAgICAgICAgICAgIHMzT3JpZ2luU291cmNlOiB7XG4gICAgICAgICAgICAgICAgICAgIHMzQnVja2V0U291cmNlOiB0aGlzLndlYkJ1Y2tldCxcbiAgICAgICAgICAgICAgICAgICAgb3JpZ2luQWNjZXNzSWRlbnRpdHlJZDogb2FpLnJlZixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICBhbGlhc0NvbmZpZ3VyYXRpb246IHtcbiAgICAgICAgICAgICAgICBhY21DZXJ0UmVmOiBwcm9wcy5jZXJ0QXJuLFxuICAgICAgICAgICAgICAgIG5hbWVzOiBbYHd3dy4ke3Byb3BzLnpvbmVOYW1lfWBdLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVycm9yQ29uZmlndXJhdGlvbnM6IFt7XG4gICAgICAgICAgICAgICAgZXJyb3JDb2RlOiA0MDMsXG4gICAgICAgICAgICAgICAgcmVzcG9uc2VDb2RlOiAyMDAsXG4gICAgICAgICAgICAgICAgcmVzcG9uc2VQYWdlUGF0aDogJy9pbmRleC5odG1sJyxcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBlcnJvckNvZGU6IDQwNCxcbiAgICAgICAgICAgICAgICByZXNwb25zZUNvZGU6IDIwMCxcbiAgICAgICAgICAgICAgICByZXNwb25zZVBhZ2VQYXRoOiAnL2luZGV4Lmh0bWwnLFxuICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICBjb21tZW50OiBgd3d3LiR7cHJvcHMuem9uZU5hbWV9IFdlYnNpdGVgLFxuICAgICAgICAgICAgcHJpY2VDbGFzczogUHJpY2VDbGFzcy5QUklDRV9DTEFTU19BTEwsXG4gICAgICAgICAgICB2aWV3ZXJQcm90b2NvbFBvbGljeTogVmlld2VyUHJvdG9jb2xQb2xpY3kuUkVESVJFQ1RfVE9fSFRUUFMsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChwcm9wcy53ZWJGb2xkZXIpIHtcbiAgICAgICAgICAgIG5ldyBCdWNrZXREZXBsb3ltZW50KHRoaXMsICdEZXBsb3lXZWJzaXRlJywge1xuICAgICAgICAgICAgICAgIHNvdXJjZTogU291cmNlLmFzc2V0KHByb3BzLndlYkZvbGRlciksXG4gICAgICAgICAgICAgICAgZGVzdGluYXRpb25CdWNrZXQ6IHRoaXMud2ViQnVja2V0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBuZXcgQVJlY29yZCh0aGlzLCAnQWxpYXNSZWNvcmQnLCB7XG4gICAgICAgICAgICByZWNvcmROYW1lOiBgd3d3LiR7cHJvcHMuem9uZU5hbWV9YCxcbiAgICAgICAgICAgIHpvbmUsXG4gICAgICAgICAgICB0YXJnZXQ6IFJlY29yZFRhcmdldC5mcm9tQWxpYXMobmV3IENsb3VkRnJvbnRUYXJnZXQodGhpcy5kaXN0cmlidXRpb24pKSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgcmVkaXJlY3RCdWNrZXQgPSBuZXcgQ2ZuQnVja2V0KHRoaXMsICdSZWRpcmVjdEJ1Y2tldCcsIHtcbiAgICAgICAgICAgIHdlYnNpdGVDb25maWd1cmF0aW9uOiB7XG4gICAgICAgICAgICAgICAgcmVkaXJlY3RBbGxSZXF1ZXN0c1RvOiB7XG4gICAgICAgICAgICAgICAgICAgIGhvc3ROYW1lOiBgd3d3LiR7cHJvcHMuem9uZU5hbWV9YCxcbiAgICAgICAgICAgICAgICAgICAgcHJvdG9jb2w6ICdodHRwcycsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCByZWRpcmVjdERpc3QgPSBuZXcgQ2xvdWRGcm9udFdlYkRpc3RyaWJ1dGlvbih0aGlzLCAnUmVkaXJlY3REaXN0cmlidXRpb24nLCB7XG4gICAgICAgICAgICBvcmlnaW5Db25maWdzOiBbe1xuICAgICAgICAgICAgICAgIGJlaGF2aW9yczogW3sgaXNEZWZhdWx0QmVoYXZpb3I6IHRydWUgfV0sXG4gICAgICAgICAgICAgICAgY3VzdG9tT3JpZ2luU291cmNlOiB7XG4gICAgICAgICAgICAgICAgICAgIGRvbWFpbk5hbWU6IEZuLnNlbGVjdCgyLCBGbi5zcGxpdCgnLycsIHJlZGlyZWN0QnVja2V0LmF0dHJXZWJzaXRlVXJsKSksXG4gICAgICAgICAgICAgICAgICAgIG9yaWdpblByb3RvY29sUG9saWN5OiBPcmlnaW5Qcm90b2NvbFBvbGljeS5IVFRQX09OTFksXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH1dLFxuICAgICAgICAgICAgYWxpYXNDb25maWd1cmF0aW9uOiB7XG4gICAgICAgICAgICAgICAgYWNtQ2VydFJlZjogcHJvcHMuY2VydEFybixcbiAgICAgICAgICAgICAgICBuYW1lczogW3Byb3BzLnpvbmVOYW1lXSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb21tZW50OiBgJHtwcm9wcy56b25lTmFtZX0gUmVkaXJlY3QgdG8gd3d3LiR7cHJvcHMuem9uZU5hbWV9YCxcbiAgICAgICAgICAgIHByaWNlQ2xhc3M6IFByaWNlQ2xhc3MuUFJJQ0VfQ0xBU1NfQUxMLFxuICAgICAgICAgICAgdmlld2VyUHJvdG9jb2xQb2xpY3k6IFZpZXdlclByb3RvY29sUG9saWN5LlJFRElSRUNUX1RPX0hUVFBTLFxuICAgICAgICB9KTtcblxuICAgICAgICBuZXcgQVJlY29yZCh0aGlzLCAnUmVkaXJlY3RBbGlhc1JlY29yZCcsIHtcbiAgICAgICAgICAgIHJlY29yZE5hbWU6IHByb3BzLnpvbmVOYW1lLFxuICAgICAgICAgICAgem9uZSxcbiAgICAgICAgICAgIHRhcmdldDogUmVjb3JkVGFyZ2V0LmZyb21BbGlhcyhuZXcgQ2xvdWRGcm9udFRhcmdldChyZWRpcmVjdERpc3QpKSxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIl19