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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2luZ2xlLXBhZ2UtYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL3dlYi9zaW5nbGUtcGFnZS1hcHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw0REFBK0o7QUFDL0osOENBQTJFO0FBQzNFLHNEQUF5RTtBQUN6RSxzRUFBZ0U7QUFDaEUsNENBQW9EO0FBQ3BELGtFQUFzRTtBQUN0RSx3Q0FBbUQ7QUFTbkQsTUFBYSxvQkFBcUIsU0FBUSxnQkFBUztJQU0vQyxZQUFZLEtBQWlCLEVBQUUsRUFBVyxFQUFFLEtBQWlDO1FBQ3pFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFakIsTUFBTSxJQUFJLEdBQUcsd0JBQVUsQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO1lBQ2pFLFlBQVksRUFBRSxLQUFLLENBQUMsTUFBTTtZQUMxQixRQUFRLEVBQUUsS0FBSyxDQUFDLFFBQVE7U0FDM0IsQ0FBQyxDQUFDO1FBRUgsTUFBTSxHQUFHLEdBQUcsSUFBSSxrREFBaUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFO1lBQzNELG9DQUFvQyxFQUFFLEVBQUUsT0FBTyxFQUFFLFVBQUcsQ0FBQyxVQUFVLEVBQUU7U0FDcEUsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLGVBQU0sQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLEVBQUUsb0JBQW9CLEVBQUUsWUFBWSxFQUFFLENBQUMsQ0FBQztRQUN2RixJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFtQixDQUFDLElBQUkseUJBQWUsQ0FBQztZQUNuRCxPQUFPLEVBQUUsQ0FBQyxjQUFjLENBQUM7WUFDekIsU0FBUyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDOUMsVUFBVSxFQUFFLENBQUMsSUFBSSxnQ0FBc0IsQ0FBQyxHQUFHLENBQUMscUJBQXFCLENB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QU8sQ0FBQyxJQUFJLEVBQUUscUJBQXFCLEVBQUU7WUFDckMsVUFBVSxFQUFFLEtBQUssQ0FBQyxRQUFRO1lBQzFCLElBQUk7WUFDSixNQUFNLEVBQUUsMEJBQVksQ0FBQyxTQUFTLENBQUMsSUFBSSxzQ0FBZ0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUNyRSxDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7QUEvRkQsb0RBK0ZDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2ZuQ2xvdWRGcm9udE9yaWdpbkFjY2Vzc0lkZW50aXR5LCBDbG91ZEZyb250V2ViRGlzdHJpYnV0aW9uLCBPcmlnaW5Qcm90b2NvbFBvbGljeSwgUHJpY2VDbGFzcywgVmlld2VyUHJvdG9jb2xQb2xpY3kgfSBmcm9tICdAYXdzLWNkay9hd3MtY2xvdWRmcm9udCc7XG5pbXBvcnQgeyBDYW5vbmljYWxVc2VyUHJpbmNpcGFsLCBQb2xpY3lTdGF0ZW1lbnQgfSBmcm9tICdAYXdzLWNkay9hd3MtaWFtJztcbmltcG9ydCB7IEFSZWNvcmQsIEhvc3RlZFpvbmUsIFJlY29yZFRhcmdldCB9IGZyb20gJ0Bhd3MtY2RrL2F3cy1yb3V0ZTUzJztcbmltcG9ydCB7IENsb3VkRnJvbnRUYXJnZXQgfSBmcm9tICdAYXdzLWNkay9hd3Mtcm91dGU1My10YXJnZXRzJztcbmltcG9ydCB7IEJ1Y2tldCwgQ2ZuQnVja2V0IH0gZnJvbSAnQGF3cy1jZGsvYXdzLXMzJztcbmltcG9ydCB7IEJ1Y2tldERlcGxveW1lbnQsIFNvdXJjZSB9IGZyb20gJ0Bhd3MtY2RrL2F3cy1zMy1kZXBsb3ltZW50JztcbmltcG9ydCB7IEF3cywgQ29uc3RydWN0LCBGbiB9IGZyb20gJ0Bhd3MtY2RrL2NvcmUnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNpbmdsZVBhZ2VBcHBIb3N0aW5nUHJvcHMge1xuICAgIHJlYWRvbmx5IGNlcnRBcm4gOiBzdHJpbmc7XG4gICAgcmVhZG9ubHkgem9uZUlkIDogc3RyaW5nO1xuICAgIHJlYWRvbmx5IHpvbmVOYW1lIDogc3RyaW5nO1xuICAgIHJlYWRvbmx5IHdlYkZvbGRlcj8gOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjbGFzcyBTaW5nbGVQYWdlQXBwSG9zdGluZyBleHRlbmRzIENvbnN0cnVjdCB7XG5cbiAgICBwdWJsaWMgcmVhZG9ubHkgd2ViQnVja2V0IDogQnVja2V0O1xuXG4gICAgcHVibGljIHJlYWRvbmx5IGRpc3RyaWJ1dGlvbiA6IENsb3VkRnJvbnRXZWJEaXN0cmlidXRpb247XG5cbiAgICBjb25zdHJ1Y3RvcihzY29wZSA6IENvbnN0cnVjdCwgaWQgOiBzdHJpbmcsIHByb3BzIDogU2luZ2xlUGFnZUFwcEhvc3RpbmdQcm9wcykge1xuICAgICAgICBzdXBlcihzY29wZSwgaWQpO1xuXG4gICAgICAgIGNvbnN0IHpvbmUgPSBIb3N0ZWRab25lLmZyb21Ib3N0ZWRab25lQXR0cmlidXRlcyh0aGlzLCAnSG9zdGVkWm9uZScsIHtcbiAgICAgICAgICAgIGhvc3RlZFpvbmVJZDogcHJvcHMuem9uZUlkLFxuICAgICAgICAgICAgem9uZU5hbWU6IHByb3BzLnpvbmVOYW1lLFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBvYWkgPSBuZXcgQ2ZuQ2xvdWRGcm9udE9yaWdpbkFjY2Vzc0lkZW50aXR5KHRoaXMsICdPQUknLCB7XG4gICAgICAgICAgICBjbG91ZEZyb250T3JpZ2luQWNjZXNzSWRlbnRpdHlDb25maWc6IHsgY29tbWVudDogQXdzLlNUQUNLX05BTUUgfSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy53ZWJCdWNrZXQgPSBuZXcgQnVja2V0KHRoaXMsICdXZWJCdWNrZXQnLCB7IHdlYnNpdGVJbmRleERvY3VtZW50OiAnaW5kZXguaHRtbCcgfSk7XG4gICAgICAgIHRoaXMud2ViQnVja2V0LmFkZFRvUmVzb3VyY2VQb2xpY3kobmV3IFBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgICAgICBhY3Rpb25zOiBbJ3MzOkdldE9iamVjdCddLFxuICAgICAgICAgICAgcmVzb3VyY2VzOiBbdGhpcy53ZWJCdWNrZXQuYXJuRm9yT2JqZWN0cygnKicpXSxcbiAgICAgICAgICAgIHByaW5jaXBhbHM6IFtuZXcgQ2Fub25pY2FsVXNlclByaW5jaXBhbChvYWkuYXR0clMzQ2Fub25pY2FsVXNlcklkKV0sXG4gICAgICAgIH0pKTtcblxuICAgICAgICB0aGlzLmRpc3RyaWJ1dGlvbiA9IG5ldyBDbG91ZEZyb250V2ViRGlzdHJpYnV0aW9uKHRoaXMsICdEaXN0cmlidXRpb24nLCB7XG4gICAgICAgICAgICBvcmlnaW5Db25maWdzOiBbe1xuICAgICAgICAgICAgICAgIGJlaGF2aW9yczogW3sgaXNEZWZhdWx0QmVoYXZpb3I6IHRydWUgfV0sXG4gICAgICAgICAgICAgICAgczNPcmlnaW5Tb3VyY2U6IHtcbiAgICAgICAgICAgICAgICAgICAgczNCdWNrZXRTb3VyY2U6IHRoaXMud2ViQnVja2V0LFxuICAgICAgICAgICAgICAgICAgICBvcmlnaW5BY2Nlc3NJZGVudGl0eUlkOiBvYWkucmVmLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9XSxcbiAgICAgICAgICAgIGFsaWFzQ29uZmlndXJhdGlvbjoge1xuICAgICAgICAgICAgICAgIGFjbUNlcnRSZWY6IHByb3BzLmNlcnRBcm4sXG4gICAgICAgICAgICAgICAgbmFtZXM6IFtgd3d3LiR7cHJvcHMuem9uZU5hbWV9YF0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZXJyb3JDb25maWd1cmF0aW9uczogW3tcbiAgICAgICAgICAgICAgICBlcnJvckNvZGU6IDQwMyxcbiAgICAgICAgICAgICAgICByZXNwb25zZUNvZGU6IDIwMCxcbiAgICAgICAgICAgICAgICByZXNwb25zZVBhZ2VQYXRoOiAnL2luZGV4Lmh0bWwnLFxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGVycm9yQ29kZTogNDA0LFxuICAgICAgICAgICAgICAgIHJlc3BvbnNlQ29kZTogMjAwLFxuICAgICAgICAgICAgICAgIHJlc3BvbnNlUGFnZVBhdGg6ICcvaW5kZXguaHRtbCcsXG4gICAgICAgICAgICB9XSxcbiAgICAgICAgICAgIGNvbW1lbnQ6IGB3d3cuJHtwcm9wcy56b25lTmFtZX0gV2Vic2l0ZWAsXG4gICAgICAgICAgICBwcmljZUNsYXNzOiBQcmljZUNsYXNzLlBSSUNFX0NMQVNTX0FMTCxcbiAgICAgICAgICAgIHZpZXdlclByb3RvY29sUG9saWN5OiBWaWV3ZXJQcm90b2NvbFBvbGljeS5SRURJUkVDVF9UT19IVFRQUyxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHByb3BzLndlYkZvbGRlcikge1xuICAgICAgICAgICAgbmV3IEJ1Y2tldERlcGxveW1lbnQodGhpcywgJ0RlcGxveVdlYnNpdGUnLCB7XG4gICAgICAgICAgICAgICAgc291cmNlOiBTb3VyY2UuYXNzZXQocHJvcHMud2ViRm9sZGVyKSxcbiAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbkJ1Y2tldDogdGhpcy53ZWJCdWNrZXQsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIG5ldyBBUmVjb3JkKHRoaXMsICdBbGlhc1JlY29yZCcsIHtcbiAgICAgICAgICAgIHJlY29yZE5hbWU6IGB3d3cuJHtwcm9wcy56b25lTmFtZX1gLFxuICAgICAgICAgICAgem9uZSxcbiAgICAgICAgICAgIHRhcmdldDogUmVjb3JkVGFyZ2V0LmZyb21BbGlhcyhuZXcgQ2xvdWRGcm9udFRhcmdldCh0aGlzLmRpc3RyaWJ1dGlvbikpLFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCByZWRpcmVjdEJ1Y2tldCA9IG5ldyBDZm5CdWNrZXQodGhpcywgJ1JlZGlyZWN0QnVja2V0Jywge1xuICAgICAgICAgICAgd2Vic2l0ZUNvbmZpZ3VyYXRpb246IHtcbiAgICAgICAgICAgICAgICByZWRpcmVjdEFsbFJlcXVlc3RzVG86IHtcbiAgICAgICAgICAgICAgICAgICAgaG9zdE5hbWU6IGB3d3cuJHtwcm9wcy56b25lTmFtZX1gLFxuICAgICAgICAgICAgICAgICAgICBwcm90b2NvbDogJ2h0dHBzJyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHJlZGlyZWN0RGlzdCA9IG5ldyBDbG91ZEZyb250V2ViRGlzdHJpYnV0aW9uKHRoaXMsICdSZWRpcmVjdERpc3RyaWJ1dGlvbicsIHtcbiAgICAgICAgICAgIG9yaWdpbkNvbmZpZ3M6IFt7XG4gICAgICAgICAgICAgICAgYmVoYXZpb3JzOiBbeyBpc0RlZmF1bHRCZWhhdmlvcjogdHJ1ZSB9XSxcbiAgICAgICAgICAgICAgICBjdXN0b21PcmlnaW5Tb3VyY2U6IHtcbiAgICAgICAgICAgICAgICAgICAgZG9tYWluTmFtZTogRm4uc2VsZWN0KDIsIEZuLnNwbGl0KCcvJywgcmVkaXJlY3RCdWNrZXQuYXR0cldlYnNpdGVVcmwpKSxcbiAgICAgICAgICAgICAgICAgICAgb3JpZ2luUHJvdG9jb2xQb2xpY3k6IE9yaWdpblByb3RvY29sUG9saWN5LkhUVFBfT05MWSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICBhbGlhc0NvbmZpZ3VyYXRpb246IHtcbiAgICAgICAgICAgICAgICBhY21DZXJ0UmVmOiBwcm9wcy5jZXJ0QXJuLFxuICAgICAgICAgICAgICAgIG5hbWVzOiBbcHJvcHMuem9uZU5hbWVdLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbW1lbnQ6IGAke3Byb3BzLnpvbmVOYW1lfSBSZWRpcmVjdCB0byB3d3cuJHtwcm9wcy56b25lTmFtZX1gLFxuICAgICAgICAgICAgcHJpY2VDbGFzczogUHJpY2VDbGFzcy5QUklDRV9DTEFTU19BTEwsXG4gICAgICAgICAgICB2aWV3ZXJQcm90b2NvbFBvbGljeTogVmlld2VyUHJvdG9jb2xQb2xpY3kuUkVESVJFQ1RfVE9fSFRUUFMsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIG5ldyBBUmVjb3JkKHRoaXMsICdSZWRpcmVjdEFsaWFzUmVjb3JkJywge1xuICAgICAgICAgICAgcmVjb3JkTmFtZTogcHJvcHMuem9uZU5hbWUsXG4gICAgICAgICAgICB6b25lLFxuICAgICAgICAgICAgdGFyZ2V0OiBSZWNvcmRUYXJnZXQuZnJvbUFsaWFzKG5ldyBDbG91ZEZyb250VGFyZ2V0KHJlZGlyZWN0RGlzdCkpLFxuICAgICAgICB9KTtcbiAgICB9XG59XG4iXX0=