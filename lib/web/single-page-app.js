"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_certificatemanager_1 = require("@aws-cdk/aws-certificatemanager");
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
        const domainName = props.redirectToApex ? props.zoneName : `www.${props.zoneName}`;
        const redirectDomainName = props.redirectToApex ? `www.${props.zoneName}` : props.zoneName;
        const zone = props.zoneId ? aws_route53_1.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
            hostedZoneId: props.zoneId,
            zoneName: props.zoneName,
        }) : aws_route53_1.HostedZone.fromLookup(this, 'HostedZone', { domainName: props.zoneName });
        const certArn = props.certArn || new aws_certificatemanager_1.DnsValidatedCertificate(this, 'Certificate', {
            hostedZone: zone,
            domainName,
            region: 'us-east-1',
        }).certificateArn;
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
                acmCertRef: certArn,
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
            recordName: domainName,
            zone,
            target: aws_route53_1.RecordTarget.fromAlias(new aws_route53_targets_1.CloudFrontTarget(this.distribution)),
        });
        const redirectCertArn = props.certArn || new aws_certificatemanager_1.DnsValidatedCertificate(this, 'Certificate', {
            hostedZone: zone,
            domainName: redirectDomainName,
            region: 'us-east-1',
        }).certificateArn;
        const redirectBucket = new aws_s3_1.CfnBucket(this, 'RedirectBucket', {
            websiteConfiguration: {
                redirectAllRequestsTo: {
                    hostName: domainName,
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
                acmCertRef: redirectCertArn,
                names: [redirectDomainName],
            },
            comment: `${redirectDomainName} Redirect to ${domainName}`,
            priceClass: aws_cloudfront_1.PriceClass.PRICE_CLASS_ALL,
            viewerProtocolPolicy: aws_cloudfront_1.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        });
        new aws_route53_1.ARecord(this, 'RedirectAliasRecord', {
            recordName: redirectDomainName,
            zone,
            target: aws_route53_1.RecordTarget.fromAlias(new aws_route53_targets_1.CloudFrontTarget(redirectDist)),
        });
    }
}
exports.SinglePageAppHosting = SinglePageAppHosting;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2luZ2xlLXBhZ2UtYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic2luZ2xlLXBhZ2UtYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNEVBQTBFO0FBQzFFLDREQUErSjtBQUMvSiw4Q0FBMkU7QUFDM0Usc0RBQXlFO0FBQ3pFLHNFQUFnRTtBQUNoRSw0Q0FBb0Q7QUFDcEQsa0VBQXNFO0FBQ3RFLHdDQUFtRDtBQWlDbkQsTUFBYSxvQkFBcUIsU0FBUSxnQkFBUztJQU0vQyxZQUFZLEtBQWlCLEVBQUUsRUFBVyxFQUFFLEtBQWlDO1FBQ3pFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFakIsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDbkYsTUFBTSxrQkFBa0IsR0FBRyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxPQUFPLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQztRQUUzRixNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyx3QkFBVSxDQUFDLHdCQUF3QixDQUFDLElBQUksRUFBRSxZQUFZLEVBQUU7WUFDaEYsWUFBWSxFQUFFLEtBQUssQ0FBQyxNQUFNO1lBQzFCLFFBQVEsRUFBRSxLQUFLLENBQUMsUUFBUTtTQUMzQixDQUFDLENBQUMsQ0FBQyxDQUFDLHdCQUFVLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsRUFBRSxVQUFVLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFFL0UsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sSUFBSSxJQUFJLGdEQUF1QixDQUFDLElBQUksRUFBRSxhQUFhLEVBQUU7WUFD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QUFPO2lCQUNwQjthQUNKO1NBQ0osQ0FBQyxDQUFDO1FBQ0gsTUFBTSxZQUFZLEdBQUcsSUFBSSwwQ0FBeUIsQ0FBQyxJQUFJLEVBQUUsc0JBQXNCLEVBQUU7WUFDN0UsYUFBYSxFQUFFLENBQUM7b0JBQ1osU0FBUyxFQUFFLENBQUMsRUFBRSxpQkFBaUIsRUFBRSxJQUFJLEVBQUUsQ0FBQztvQkFDeEMsa0JBQWtCLEVBQUU7d0JBQ2hCLFVBQVUsRUFBRSxTQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxTQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxjQUFjLENBQUMsY0FBYyxDQUFDLENBQUM7d0JBQ3RFLG9CQUFvQixFQUFFLHFDQUFvQixDQUFDLFNBQVM7cUJBQ3ZEO2lCQUNKLENBQUM7WUFDRixrQkFBa0IsRUFBRTtnQkFDaEIsVUFBVSxFQUFFLGVBQWU7Z0JBQzNCLEtBQUssRUFBRSxDQUFDLGtCQUFrQixDQUFDO2FBQzlCO1lBQ0QsT0FBTyxFQUFFLEdBQUcsa0JBQWtCLGdCQUFnQixVQUFVLEVBQUU7WUFDMUQsVUFBVSxFQUFFLDJCQUFVLENBQUMsZUFBZTtZQUN0QyxvQkFBb0IsRUFBRSxxQ0FBb0IsQ0FBQyxpQkFBaUI7U0FDL0QsQ0FBQyxDQUFDO1FBRUgsSUFBSSxxQkFBTyxDQUFDLElBQUksRUFBRSxxQkFBcUIsRUFBRTtZQUNyQyxVQUFVLEVBQUUsa0JBQWtCO1lBQzlCLElBQUk7WUFDSixNQUFNLEVBQUUsMEJBQVksQ0FBQyxTQUFTLENBQUMsSUFBSSxzQ0FBZ0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUNyRSxDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7QUE5R0Qsb0RBOEdDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRG5zVmFsaWRhdGVkQ2VydGlmaWNhdGUgfSBmcm9tICdAYXdzLWNkay9hd3MtY2VydGlmaWNhdGVtYW5hZ2VyJztcbmltcG9ydCB7IENmbkNsb3VkRnJvbnRPcmlnaW5BY2Nlc3NJZGVudGl0eSwgQ2xvdWRGcm9udFdlYkRpc3RyaWJ1dGlvbiwgT3JpZ2luUHJvdG9jb2xQb2xpY3ksIFByaWNlQ2xhc3MsIFZpZXdlclByb3RvY29sUG9saWN5IH0gZnJvbSAnQGF3cy1jZGsvYXdzLWNsb3VkZnJvbnQnO1xuaW1wb3J0IHsgQ2Fub25pY2FsVXNlclByaW5jaXBhbCwgUG9saWN5U3RhdGVtZW50IH0gZnJvbSAnQGF3cy1jZGsvYXdzLWlhbSc7XG5pbXBvcnQgeyBBUmVjb3JkLCBIb3N0ZWRab25lLCBSZWNvcmRUYXJnZXQgfSBmcm9tICdAYXdzLWNkay9hd3Mtcm91dGU1Myc7XG5pbXBvcnQgeyBDbG91ZEZyb250VGFyZ2V0IH0gZnJvbSAnQGF3cy1jZGsvYXdzLXJvdXRlNTMtdGFyZ2V0cyc7XG5pbXBvcnQgeyBCdWNrZXQsIENmbkJ1Y2tldCB9IGZyb20gJ0Bhd3MtY2RrL2F3cy1zMyc7XG5pbXBvcnQgeyBCdWNrZXREZXBsb3ltZW50LCBTb3VyY2UgfSBmcm9tICdAYXdzLWNkay9hd3MtczMtZGVwbG95bWVudCc7XG5pbXBvcnQgeyBBd3MsIENvbnN0cnVjdCwgRm4gfSBmcm9tICdAYXdzLWNkay9jb3JlJztcblxuZXhwb3J0IGludGVyZmFjZSBTaW5nbGVQYWdlQXBwSG9zdGluZ1Byb3BzIHtcbiAgICAvKipcbiAgICAgKiBOYW1lIG9mIHRoZSBIb3N0ZWRab25lIG9mIHRoZSBkb21haW5cbiAgICAgKi9cbiAgICByZWFkb25seSB6b25lTmFtZSA6IHN0cmluZztcbiAgICAvKipcbiAgICAgKiBUaGUgQVJOIG9mIHRoZSBjZXJ0aWZpY2F0ZTsgSGFzIHRvIGJlIGluIHVzLWVhc3QtMVxuICAgICAqXG4gICAgICogQGRlZmF1bHQgLSBjcmVhdGUgYSBuZXcgY2VydGlmaWNhdGUgaW4gdXMtZWFzdC0xXG4gICAgICovXG4gICAgcmVhZG9ubHkgY2VydEFybj8gOiBzdHJpbmc7XG4gICAgLyoqXG4gICAgICogSUQgb2YgdGhlIEhvc3RlZFpvbmUgb2YgdGhlIGRvbWFpblxuICAgICAqXG4gICAgICogQGRlZmF1bHQgLSBsb29rdXAgem9uZSBmcm9tIGNvbnRleHQgdXNpbmcgdGhlIHpvbmUgbmFtZVxuICAgICAqL1xuICAgIHJlYWRvbmx5IHpvbmVJZD8gOiBzdHJpbmc7XG4gICAgLyoqXG4gICAgICogbG9jYWwgZm9sZGVyIHdpdGggY29udGVudHMgZm9yIHRoZSB3ZWJzaXRlIGJ1Y2tldFxuICAgICAqXG4gICAgICogQGRlZmF1bHQgLSBubyBmaWxlIGRlcGxveW1lbnRcbiAgICAgKi9cbiAgICByZWFkb25seSB3ZWJGb2xkZXI/IDogc3RyaW5nO1xuICAgIC8qKlxuICAgICAqIERlZmluZSBpZiB0aGUgbWFpbiBkb21haW4gaXMgd2l0aCBvciB3aXRob3V0IHd3dy5cbiAgICAgKlxuICAgICAqIEBkZWZhdWx0IGZhbHNlIC0gUmVkaXJlY3QgZXhhbXBsZS5jb20gdG8gd3d3LmV4YW1wbGUuY29tXG4gICAgICovXG4gICAgcmVhZG9ubHkgcmVkaXJlY3RUb0FwZXg/IDogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNsYXNzIFNpbmdsZVBhZ2VBcHBIb3N0aW5nIGV4dGVuZHMgQ29uc3RydWN0IHtcblxuICAgIHB1YmxpYyByZWFkb25seSB3ZWJCdWNrZXQgOiBCdWNrZXQ7XG5cbiAgICBwdWJsaWMgcmVhZG9ubHkgZGlzdHJpYnV0aW9uIDogQ2xvdWRGcm9udFdlYkRpc3RyaWJ1dGlvbjtcblxuICAgIGNvbnN0cnVjdG9yKHNjb3BlIDogQ29uc3RydWN0LCBpZCA6IHN0cmluZywgcHJvcHMgOiBTaW5nbGVQYWdlQXBwSG9zdGluZ1Byb3BzKSB7XG4gICAgICAgIHN1cGVyKHNjb3BlLCBpZCk7XG5cbiAgICAgICAgY29uc3QgZG9tYWluTmFtZSA9IHByb3BzLnJlZGlyZWN0VG9BcGV4ID8gcHJvcHMuem9uZU5hbWUgOiBgd3d3LiR7cHJvcHMuem9uZU5hbWV9YDtcbiAgICAgICAgY29uc3QgcmVkaXJlY3REb21haW5OYW1lID0gcHJvcHMucmVkaXJlY3RUb0FwZXggPyBgd3d3LiR7cHJvcHMuem9uZU5hbWV9YCA6IHByb3BzLnpvbmVOYW1lO1xuXG4gICAgICAgIGNvbnN0IHpvbmUgPSBwcm9wcy56b25lSWQgPyBIb3N0ZWRab25lLmZyb21Ib3N0ZWRab25lQXR0cmlidXRlcyh0aGlzLCAnSG9zdGVkWm9uZScsIHtcbiAgICAgICAgICAgIGhvc3RlZFpvbmVJZDogcHJvcHMuem9uZUlkLFxuICAgICAgICAgICAgem9uZU5hbWU6IHByb3BzLnpvbmVOYW1lLFxuICAgICAgICB9KSA6IEhvc3RlZFpvbmUuZnJvbUxvb2t1cCh0aGlzLCAnSG9zdGVkWm9uZScsIHsgZG9tYWluTmFtZTogcHJvcHMuem9uZU5hbWUgfSk7XG5cbiAgICAgICAgY29uc3QgY2VydEFybiA9IHByb3BzLmNlcnRBcm4gfHwgbmV3IERuc1ZhbGlkYXRlZENlcnRpZmljYXRlKHRoaXMsICdDZXJ0aWZpY2F0ZScsIHtcbiAgICAgICAgICAgIGhvc3RlZFpvbmU6IHpvbmUsXG4gICAgICAgICAgICBkb21haW5OYW1lLFxuICAgICAgICAgICAgcmVnaW9uOiAndXMtZWFzdC0xJyxcbiAgICAgICAgfSkuY2VydGlmaWNhdGVBcm47XG5cbiAgICAgICAgY29uc3Qgb2FpID0gbmV3IENmbkNsb3VkRnJvbnRPcmlnaW5BY2Nlc3NJZGVudGl0eSh0aGlzLCAnT0FJJywge1xuICAgICAgICAgICAgY2xvdWRGcm9udE9yaWdpbkFjY2Vzc0lkZW50aXR5Q29uZmlnOiB7IGNvbW1lbnQ6IEF3cy5TVEFDS19OQU1FIH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMud2ViQnVja2V0ID0gbmV3IEJ1Y2tldCh0aGlzLCAnV2ViQnVja2V0JywgeyB3ZWJzaXRlSW5kZXhEb2N1bWVudDogJ2luZGV4Lmh0bWwnIH0pO1xuICAgICAgICB0aGlzLndlYkJ1Y2tldC5hZGRUb1Jlc291cmNlUG9saWN5KG5ldyBQb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICAgICAgYWN0aW9uczogWydzMzpHZXRPYmplY3QnXSxcbiAgICAgICAgICAgIHJlc291cmNlczogW3RoaXMud2ViQnVja2V0LmFybkZvck9iamVjdHMoJyonKV0sXG4gICAgICAgICAgICBwcmluY2lwYWxzOiBbbmV3IENhbm9uaWNhbFVzZXJQcmluY2lwYWwob2FpLmF0dHJTM0Nhbm9uaWNhbFVzZXJJZCldLFxuICAgICAgICB9KSk7XG5cbiAgICAgICAgdGhpcy5kaXN0cmlidXRpb24gPSBuZXcgQ2xvdWRGcm9udFdlYkRpc3RyaWJ1dGlvbih0aGlzLCAnRGlzdHJpYnV0aW9uJywge1xuICAgICAgICAgICAgb3JpZ2luQ29uZmlnczogW3tcbiAgICAgICAgICAgICAgICBiZWhhdmlvcnM6IFt7IGlzRGVmYXVsdEJlaGF2aW9yOiB0cnVlIH1dLFxuICAgICAgICAgICAgICAgIHMzT3JpZ2luU291cmNlOiB7XG4gICAgICAgICAgICAgICAgICAgIHMzQnVja2V0U291cmNlOiB0aGlzLndlYkJ1Y2tldCxcbiAgICAgICAgICAgICAgICAgICAgb3JpZ2luQWNjZXNzSWRlbnRpdHlJZDogb2FpLnJlZixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICBhbGlhc0NvbmZpZ3VyYXRpb246IHtcbiAgICAgICAgICAgICAgICBhY21DZXJ0UmVmOiBjZXJ0QXJuLFxuICAgICAgICAgICAgICAgIG5hbWVzOiBbZG9tYWluTmFtZV0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZXJyb3JDb25maWd1cmF0aW9uczogW3tcbiAgICAgICAgICAgICAgICBlcnJvckNvZGU6IDQwMyxcbiAgICAgICAgICAgICAgICByZXNwb25zZUNvZGU6IDIwMCxcbiAgICAgICAgICAgICAgICByZXNwb25zZVBhZ2VQYXRoOiAnL2luZGV4Lmh0bWwnLFxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGVycm9yQ29kZTogNDA0LFxuICAgICAgICAgICAgICAgIHJlc3BvbnNlQ29kZTogMjAwLFxuICAgICAgICAgICAgICAgIHJlc3BvbnNlUGFnZVBhdGg6ICcvaW5kZXguaHRtbCcsXG4gICAgICAgICAgICB9XSxcbiAgICAgICAgICAgIGNvbW1lbnQ6IGAke2RvbWFpbk5hbWV9IFdlYnNpdGVgLFxuICAgICAgICAgICAgcHJpY2VDbGFzczogUHJpY2VDbGFzcy5QUklDRV9DTEFTU19BTEwsXG4gICAgICAgICAgICB2aWV3ZXJQcm90b2NvbFBvbGljeTogVmlld2VyUHJvdG9jb2xQb2xpY3kuUkVESVJFQ1RfVE9fSFRUUFMsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChwcm9wcy53ZWJGb2xkZXIpIHtcbiAgICAgICAgICAgIG5ldyBCdWNrZXREZXBsb3ltZW50KHRoaXMsICdEZXBsb3lXZWJzaXRlJywge1xuICAgICAgICAgICAgICAgIHNvdXJjZTogU291cmNlLmFzc2V0KHByb3BzLndlYkZvbGRlciksXG4gICAgICAgICAgICAgICAgZGVzdGluYXRpb25CdWNrZXQ6IHRoaXMud2ViQnVja2V0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBuZXcgQVJlY29yZCh0aGlzLCAnQWxpYXNSZWNvcmQnLCB7XG4gICAgICAgICAgICByZWNvcmROYW1lOiBkb21haW5OYW1lLFxuICAgICAgICAgICAgem9uZSxcbiAgICAgICAgICAgIHRhcmdldDogUmVjb3JkVGFyZ2V0LmZyb21BbGlhcyhuZXcgQ2xvdWRGcm9udFRhcmdldCh0aGlzLmRpc3RyaWJ1dGlvbikpLFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCByZWRpcmVjdENlcnRBcm4gPSBwcm9wcy5jZXJ0QXJuIHx8IG5ldyBEbnNWYWxpZGF0ZWRDZXJ0aWZpY2F0ZSh0aGlzLCAnQ2VydGlmaWNhdGUnLCB7XG4gICAgICAgICAgICBob3N0ZWRab25lOiB6b25lLFxuICAgICAgICAgICAgZG9tYWluTmFtZTogcmVkaXJlY3REb21haW5OYW1lLFxuICAgICAgICAgICAgcmVnaW9uOiAndXMtZWFzdC0xJyxcbiAgICAgICAgfSkuY2VydGlmaWNhdGVBcm47XG5cbiAgICAgICAgY29uc3QgcmVkaXJlY3RCdWNrZXQgPSBuZXcgQ2ZuQnVja2V0KHRoaXMsICdSZWRpcmVjdEJ1Y2tldCcsIHtcbiAgICAgICAgICAgIHdlYnNpdGVDb25maWd1cmF0aW9uOiB7XG4gICAgICAgICAgICAgICAgcmVkaXJlY3RBbGxSZXF1ZXN0c1RvOiB7XG4gICAgICAgICAgICAgICAgICAgIGhvc3ROYW1lOiBkb21haW5OYW1lLFxuICAgICAgICAgICAgICAgICAgICBwcm90b2NvbDogJ2h0dHBzJyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHJlZGlyZWN0RGlzdCA9IG5ldyBDbG91ZEZyb250V2ViRGlzdHJpYnV0aW9uKHRoaXMsICdSZWRpcmVjdERpc3RyaWJ1dGlvbicsIHtcbiAgICAgICAgICAgIG9yaWdpbkNvbmZpZ3M6IFt7XG4gICAgICAgICAgICAgICAgYmVoYXZpb3JzOiBbeyBpc0RlZmF1bHRCZWhhdmlvcjogdHJ1ZSB9XSxcbiAgICAgICAgICAgICAgICBjdXN0b21PcmlnaW5Tb3VyY2U6IHtcbiAgICAgICAgICAgICAgICAgICAgZG9tYWluTmFtZTogRm4uc2VsZWN0KDIsIEZuLnNwbGl0KCcvJywgcmVkaXJlY3RCdWNrZXQuYXR0cldlYnNpdGVVcmwpKSxcbiAgICAgICAgICAgICAgICAgICAgb3JpZ2luUHJvdG9jb2xQb2xpY3k6IE9yaWdpblByb3RvY29sUG9saWN5LkhUVFBfT05MWSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICBhbGlhc0NvbmZpZ3VyYXRpb246IHtcbiAgICAgICAgICAgICAgICBhY21DZXJ0UmVmOiByZWRpcmVjdENlcnRBcm4sXG4gICAgICAgICAgICAgICAgbmFtZXM6IFtyZWRpcmVjdERvbWFpbk5hbWVdLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbW1lbnQ6IGAke3JlZGlyZWN0RG9tYWluTmFtZX0gUmVkaXJlY3QgdG8gJHtkb21haW5OYW1lfWAsXG4gICAgICAgICAgICBwcmljZUNsYXNzOiBQcmljZUNsYXNzLlBSSUNFX0NMQVNTX0FMTCxcbiAgICAgICAgICAgIHZpZXdlclByb3RvY29sUG9saWN5OiBWaWV3ZXJQcm90b2NvbFBvbGljeS5SRURJUkVDVF9UT19IVFRQUyxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbmV3IEFSZWNvcmQodGhpcywgJ1JlZGlyZWN0QWxpYXNSZWNvcmQnLCB7XG4gICAgICAgICAgICByZWNvcmROYW1lOiByZWRpcmVjdERvbWFpbk5hbWUsXG4gICAgICAgICAgICB6b25lLFxuICAgICAgICAgICAgdGFyZ2V0OiBSZWNvcmRUYXJnZXQuZnJvbUFsaWFzKG5ldyBDbG91ZEZyb250VGFyZ2V0KHJlZGlyZWN0RGlzdCkpLFxuICAgICAgICB9KTtcbiAgICB9XG59XG4iXX0=