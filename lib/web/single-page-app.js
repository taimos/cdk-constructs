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
        const domainName = props.redirectToApex ? props.zoneName : `www.${props.zoneName}`;
        const redirectDomainName = props.redirectToApex ? `www.${props.zoneName}` : props.zoneName;
        const zone = props.zoneId ? aws_route53_1.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
            hostedZoneId: props.zoneId,
            zoneName: props.zoneName,
        }) : aws_route53_1.HostedZone.fromLookup(this, 'HostedZone', { domainName: props.zoneName });
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
                acmCertRef: props.certArn,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2luZ2xlLXBhZ2UtYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic2luZ2xlLXBhZ2UtYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNERBQStKO0FBQy9KLDhDQUEyRTtBQUMzRSxzREFBeUU7QUFDekUsc0VBQWdFO0FBQ2hFLDRDQUFvRDtBQUNwRCxrRUFBc0U7QUFDdEUsd0NBQW1EO0FBK0JuRCxNQUFhLG9CQUFxQixTQUFRLGdCQUFTO0lBTS9DLFlBQVksS0FBaUIsRUFBRSxFQUFXLEVBQUUsS0FBaUM7UUFDekUsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVqQixNQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNuRixNQUFNLGtCQUFrQixHQUFHLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLE9BQU8sS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDO1FBRTNGLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLHdCQUFVLENBQUMsd0JBQXdCLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRTtZQUNoRixZQUFZLEVBQUUsS0FBSyxDQUFDLE1BQU07WUFDMUIsUUFBUSxFQUFFLEtBQUssQ0FBQyxRQUFRO1NBQzNCLENBQUMsQ0FBQyxDQUFDLENBQUMsd0JBQVUsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxFQUFFLFVBQVUsRUFBRSxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUUvRSxNQUFNLEdBQUcsR0FBRyxJQUFJLGtEQUFpQyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUU7WUFDM0Qsb0NBQW9DLEVBQUUsRUFBRSxPQUFPLEVBQUUsVUFBRyxDQUFDLFVBQVUsRUFBRTtTQUNwRSxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksZUFBTSxDQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsRUFBRSxvQkFBb0IsRUFBRSxZQUFZLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZGLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLENBQUMsSUFBSSx5QkFBZSxDQUFDO1lBQ25ELE9BQU8sRUFBRSxDQUFDLGNBQWMsQ0FBQztZQUN6QixTQUFTLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM5QyxVQUFVLEVBQUUsQ0FBQyxJQUFJLGdDQUFzQixDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1NBQ3RFLENBQUMsQ0FBQyxDQUFDO1FBRUosSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLDBDQUF5QixDQUFDLElBQUksRUFBRSxjQUFjLEVBQUU7WUFDcEUsYUFBYSxFQUFFLENBQUM7b0JBQ1osU0FBUyxFQUFFLENBQUMsRUFBRSxpQkFBaUIsRUFBRSxJQUFJLEVBQUUsQ0FBQztvQkFDeEMsY0FBYyxFQUFFO3dCQUNaLGNBQWMsRUFBRSxJQUFJLENBQUMsU0FBUzt3QkFDOUIsc0JBQXNCLEVBQUUsR0FBRyxDQUFDLEdBQUc7cUJBQ2xDO2lCQUNKLENBQUM7WUFDRixrQkFBa0IsRUFBRTtnQkFDaEIsVUFBVSxFQUFFLEtBQUssQ0FBQyxPQUFPO2dCQUN6QixLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUM7YUFDdEI7WUFDRCxtQkFBbUIsRUFBRSxDQUFDO29CQUNsQixTQUFTLEVBQUUsR0FBRztvQkFDZCxZQUFZLEVBQUUsR0FBRztvQkFDakIsZ0JBQWdCLEVBQUUsYUFBYTtpQkFDbEMsRUFBRTtvQkFDQyxTQUFTLEVBQUUsR0FBRztvQkFDZCxZQUFZLEVBQUUsR0FBRztvQkFDakIsZ0JBQWdCLEVBQUUsYUFBYTtpQkFDbEMsQ0FBQztZQUNGLE9BQU8sRUFBRSxHQUFHLFVBQVUsVUFBVTtZQUNoQyxVQUFVLEVBQUUsMkJBQVUsQ0FBQyxlQUFlO1lBQ3RDLG9CQUFvQixFQUFFLHFDQUFvQixDQUFDLGlCQUFpQjtTQUMvRCxDQUFDLENBQUM7UUFFSCxJQUFJLEtBQUssQ0FBQyxTQUFTLEVBQUU7WUFDakIsSUFBSSxvQ0FBZ0IsQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFO2dCQUN4QyxNQUFNLEVBQUUsMEJBQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQztnQkFDckMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLFNBQVM7YUFDcEMsQ0FBQyxDQUFDO1NBQ047UUFFRCxJQUFJLHFCQUFPLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRTtZQUM3QixVQUFVLEVBQUUsVUFBVTtZQUN0QixJQUFJO1lBQ0osTUFBTSxFQUFFLDBCQUFZLENBQUMsU0FBUyxDQUFDLElBQUksc0NBQWdCLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1NBQzFFLENBQUMsQ0FBQztRQUVILE1BQU0sY0FBYyxHQUFHLElBQUksa0JBQVMsQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUU7WUFDekQsb0JBQW9CLEVBQUU7Z0JBQ2xCLHFCQUFxQixFQUFFO29CQUNuQixRQUFRLEVBQUUsVUFBVTtvQkFDcEIsUUFBUSxFQUFFLE9BQU87aUJBQ3BCO2FBQ0o7U0FDSixDQUFDLENBQUM7UUFDSCxNQUFNLFlBQVksR0FBRyxJQUFJLDBDQUF5QixDQUFDLElBQUksRUFBRSxzQkFBc0IsRUFBRTtZQUM3RSxhQUFhLEVBQUUsQ0FBQztvQkFDWixTQUFTLEVBQUUsQ0FBQyxFQUFFLGlCQUFpQixFQUFFLElBQUksRUFBRSxDQUFDO29CQUN4QyxrQkFBa0IsRUFBRTt3QkFDaEIsVUFBVSxFQUFFLFNBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLFNBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLGNBQWMsQ0FBQyxjQUFjLENBQUMsQ0FBQzt3QkFDdEUsb0JBQW9CLEVBQUUscUNBQW9CLENBQUMsU0FBUztxQkFDdkQ7aUJBQ0osQ0FBQztZQUNGLGtCQUFrQixFQUFFO2dCQUNoQixVQUFVLEVBQUUsS0FBSyxDQUFDLE9BQU87Z0JBQ3pCLEtBQUssRUFBRSxDQUFDLGtCQUFrQixDQUFDO2FBQzlCO1lBQ0QsT0FBTyxFQUFFLEdBQUcsa0JBQWtCLGdCQUFnQixVQUFVLEVBQUU7WUFDMUQsVUFBVSxFQUFFLDJCQUFVLENBQUMsZUFBZTtZQUN0QyxvQkFBb0IsRUFBRSxxQ0FBb0IsQ0FBQyxpQkFBaUI7U0FDL0QsQ0FBQyxDQUFDO1FBRUgsSUFBSSxxQkFBTyxDQUFDLElBQUksRUFBRSxxQkFBcUIsRUFBRTtZQUNyQyxVQUFVLEVBQUUsa0JBQWtCO1lBQzlCLElBQUk7WUFDSixNQUFNLEVBQUUsMEJBQVksQ0FBQyxTQUFTLENBQUMsSUFBSSxzQ0FBZ0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUNyRSxDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7QUFsR0Qsb0RBa0dDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2ZuQ2xvdWRGcm9udE9yaWdpbkFjY2Vzc0lkZW50aXR5LCBDbG91ZEZyb250V2ViRGlzdHJpYnV0aW9uLCBPcmlnaW5Qcm90b2NvbFBvbGljeSwgUHJpY2VDbGFzcywgVmlld2VyUHJvdG9jb2xQb2xpY3kgfSBmcm9tICdAYXdzLWNkay9hd3MtY2xvdWRmcm9udCc7XG5pbXBvcnQgeyBDYW5vbmljYWxVc2VyUHJpbmNpcGFsLCBQb2xpY3lTdGF0ZW1lbnQgfSBmcm9tICdAYXdzLWNkay9hd3MtaWFtJztcbmltcG9ydCB7IEFSZWNvcmQsIEhvc3RlZFpvbmUsIFJlY29yZFRhcmdldCB9IGZyb20gJ0Bhd3MtY2RrL2F3cy1yb3V0ZTUzJztcbmltcG9ydCB7IENsb3VkRnJvbnRUYXJnZXQgfSBmcm9tICdAYXdzLWNkay9hd3Mtcm91dGU1My10YXJnZXRzJztcbmltcG9ydCB7IEJ1Y2tldCwgQ2ZuQnVja2V0IH0gZnJvbSAnQGF3cy1jZGsvYXdzLXMzJztcbmltcG9ydCB7IEJ1Y2tldERlcGxveW1lbnQsIFNvdXJjZSB9IGZyb20gJ0Bhd3MtY2RrL2F3cy1zMy1kZXBsb3ltZW50JztcbmltcG9ydCB7IEF3cywgQ29uc3RydWN0LCBGbiB9IGZyb20gJ0Bhd3MtY2RrL2NvcmUnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNpbmdsZVBhZ2VBcHBIb3N0aW5nUHJvcHMge1xuICAgIC8qKlxuICAgICAqIE5hbWUgb2YgdGhlIEhvc3RlZFpvbmUgb2YgdGhlIGRvbWFpblxuICAgICAqL1xuICAgIHJlYWRvbmx5IHpvbmVOYW1lIDogc3RyaW5nO1xuICAgIC8qKlxuICAgICAqIFRoZSBBUk4gb2YgdGhlIGNlcnRpZmljYXRlOyBIYXMgdG8gYmUgaW4gdXMtZWFzdC0xXG4gICAgICovXG4gICAgcmVhZG9ubHkgY2VydEFybiA6IHN0cmluZztcbiAgICAvKipcbiAgICAgKiBJRCBvZiB0aGUgSG9zdGVkWm9uZSBvZiB0aGUgZG9tYWluXG4gICAgICpcbiAgICAgKiBAZGVmYXVsdCAtIGxvb2t1cCB6b25lIGZyb20gY29udGV4dCB1c2luZyB0aGUgem9uZSBuYW1lXG4gICAgICovXG4gICAgcmVhZG9ubHkgem9uZUlkPyA6IHN0cmluZztcbiAgICAvKipcbiAgICAgKiBsb2NhbCBmb2xkZXIgd2l0aCBjb250ZW50cyBmb3IgdGhlIHdlYnNpdGUgYnVja2V0XG4gICAgICpcbiAgICAgKiBAZGVmYXVsdCAtIG5vIGZpbGUgZGVwbG95bWVudFxuICAgICAqL1xuICAgIHJlYWRvbmx5IHdlYkZvbGRlcj8gOiBzdHJpbmc7XG4gICAgLyoqXG4gICAgICogRGVmaW5lIGlmIHRoZSBtYWluIGRvbWFpbiBpcyB3aXRoIG9yIHdpdGhvdXQgd3d3LlxuICAgICAqXG4gICAgICogQGRlZmF1bHQgZmFsc2UgLSBSZWRpcmVjdCBleGFtcGxlLmNvbSB0byB3d3cuZXhhbXBsZS5jb21cbiAgICAgKi9cbiAgICByZWFkb25seSByZWRpcmVjdFRvQXBleD8gOiBib29sZWFuO1xufVxuXG5leHBvcnQgY2xhc3MgU2luZ2xlUGFnZUFwcEhvc3RpbmcgZXh0ZW5kcyBDb25zdHJ1Y3Qge1xuXG4gICAgcHVibGljIHJlYWRvbmx5IHdlYkJ1Y2tldCA6IEJ1Y2tldDtcblxuICAgIHB1YmxpYyByZWFkb25seSBkaXN0cmlidXRpb24gOiBDbG91ZEZyb250V2ViRGlzdHJpYnV0aW9uO1xuXG4gICAgY29uc3RydWN0b3Ioc2NvcGUgOiBDb25zdHJ1Y3QsIGlkIDogc3RyaW5nLCBwcm9wcyA6IFNpbmdsZVBhZ2VBcHBIb3N0aW5nUHJvcHMpIHtcbiAgICAgICAgc3VwZXIoc2NvcGUsIGlkKTtcblxuICAgICAgICBjb25zdCBkb21haW5OYW1lID0gcHJvcHMucmVkaXJlY3RUb0FwZXggPyBwcm9wcy56b25lTmFtZSA6IGB3d3cuJHtwcm9wcy56b25lTmFtZX1gO1xuICAgICAgICBjb25zdCByZWRpcmVjdERvbWFpbk5hbWUgPSBwcm9wcy5yZWRpcmVjdFRvQXBleCA/IGB3d3cuJHtwcm9wcy56b25lTmFtZX1gIDogcHJvcHMuem9uZU5hbWU7XG5cbiAgICAgICAgY29uc3Qgem9uZSA9IHByb3BzLnpvbmVJZCA/IEhvc3RlZFpvbmUuZnJvbUhvc3RlZFpvbmVBdHRyaWJ1dGVzKHRoaXMsICdIb3N0ZWRab25lJywge1xuICAgICAgICAgICAgaG9zdGVkWm9uZUlkOiBwcm9wcy56b25lSWQsXG4gICAgICAgICAgICB6b25lTmFtZTogcHJvcHMuem9uZU5hbWUsXG4gICAgICAgIH0pIDogSG9zdGVkWm9uZS5mcm9tTG9va3VwKHRoaXMsICdIb3N0ZWRab25lJywgeyBkb21haW5OYW1lOiBwcm9wcy56b25lTmFtZSB9KTtcblxuICAgICAgICBjb25zdCBvYWkgPSBuZXcgQ2ZuQ2xvdWRGcm9udE9yaWdpbkFjY2Vzc0lkZW50aXR5KHRoaXMsICdPQUknLCB7XG4gICAgICAgICAgICBjbG91ZEZyb250T3JpZ2luQWNjZXNzSWRlbnRpdHlDb25maWc6IHsgY29tbWVudDogQXdzLlNUQUNLX05BTUUgfSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy53ZWJCdWNrZXQgPSBuZXcgQnVja2V0KHRoaXMsICdXZWJCdWNrZXQnLCB7IHdlYnNpdGVJbmRleERvY3VtZW50OiAnaW5kZXguaHRtbCcgfSk7XG4gICAgICAgIHRoaXMud2ViQnVja2V0LmFkZFRvUmVzb3VyY2VQb2xpY3kobmV3IFBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgICAgICBhY3Rpb25zOiBbJ3MzOkdldE9iamVjdCddLFxuICAgICAgICAgICAgcmVzb3VyY2VzOiBbdGhpcy53ZWJCdWNrZXQuYXJuRm9yT2JqZWN0cygnKicpXSxcbiAgICAgICAgICAgIHByaW5jaXBhbHM6IFtuZXcgQ2Fub25pY2FsVXNlclByaW5jaXBhbChvYWkuYXR0clMzQ2Fub25pY2FsVXNlcklkKV0sXG4gICAgICAgIH0pKTtcblxuICAgICAgICB0aGlzLmRpc3RyaWJ1dGlvbiA9IG5ldyBDbG91ZEZyb250V2ViRGlzdHJpYnV0aW9uKHRoaXMsICdEaXN0cmlidXRpb24nLCB7XG4gICAgICAgICAgICBvcmlnaW5Db25maWdzOiBbe1xuICAgICAgICAgICAgICAgIGJlaGF2aW9yczogW3sgaXNEZWZhdWx0QmVoYXZpb3I6IHRydWUgfV0sXG4gICAgICAgICAgICAgICAgczNPcmlnaW5Tb3VyY2U6IHtcbiAgICAgICAgICAgICAgICAgICAgczNCdWNrZXRTb3VyY2U6IHRoaXMud2ViQnVja2V0LFxuICAgICAgICAgICAgICAgICAgICBvcmlnaW5BY2Nlc3NJZGVudGl0eUlkOiBvYWkucmVmLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9XSxcbiAgICAgICAgICAgIGFsaWFzQ29uZmlndXJhdGlvbjoge1xuICAgICAgICAgICAgICAgIGFjbUNlcnRSZWY6IHByb3BzLmNlcnRBcm4sXG4gICAgICAgICAgICAgICAgbmFtZXM6IFtkb21haW5OYW1lXSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlcnJvckNvbmZpZ3VyYXRpb25zOiBbe1xuICAgICAgICAgICAgICAgIGVycm9yQ29kZTogNDAzLFxuICAgICAgICAgICAgICAgIHJlc3BvbnNlQ29kZTogMjAwLFxuICAgICAgICAgICAgICAgIHJlc3BvbnNlUGFnZVBhdGg6ICcvaW5kZXguaHRtbCcsXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgZXJyb3JDb2RlOiA0MDQsXG4gICAgICAgICAgICAgICAgcmVzcG9uc2VDb2RlOiAyMDAsXG4gICAgICAgICAgICAgICAgcmVzcG9uc2VQYWdlUGF0aDogJy9pbmRleC5odG1sJyxcbiAgICAgICAgICAgIH1dLFxuICAgICAgICAgICAgY29tbWVudDogYCR7ZG9tYWluTmFtZX0gV2Vic2l0ZWAsXG4gICAgICAgICAgICBwcmljZUNsYXNzOiBQcmljZUNsYXNzLlBSSUNFX0NMQVNTX0FMTCxcbiAgICAgICAgICAgIHZpZXdlclByb3RvY29sUG9saWN5OiBWaWV3ZXJQcm90b2NvbFBvbGljeS5SRURJUkVDVF9UT19IVFRQUyxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHByb3BzLndlYkZvbGRlcikge1xuICAgICAgICAgICAgbmV3IEJ1Y2tldERlcGxveW1lbnQodGhpcywgJ0RlcGxveVdlYnNpdGUnLCB7XG4gICAgICAgICAgICAgICAgc291cmNlOiBTb3VyY2UuYXNzZXQocHJvcHMud2ViRm9sZGVyKSxcbiAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbkJ1Y2tldDogdGhpcy53ZWJCdWNrZXQsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIG5ldyBBUmVjb3JkKHRoaXMsICdBbGlhc1JlY29yZCcsIHtcbiAgICAgICAgICAgIHJlY29yZE5hbWU6IGRvbWFpbk5hbWUsXG4gICAgICAgICAgICB6b25lLFxuICAgICAgICAgICAgdGFyZ2V0OiBSZWNvcmRUYXJnZXQuZnJvbUFsaWFzKG5ldyBDbG91ZEZyb250VGFyZ2V0KHRoaXMuZGlzdHJpYnV0aW9uKSksXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHJlZGlyZWN0QnVja2V0ID0gbmV3IENmbkJ1Y2tldCh0aGlzLCAnUmVkaXJlY3RCdWNrZXQnLCB7XG4gICAgICAgICAgICB3ZWJzaXRlQ29uZmlndXJhdGlvbjoge1xuICAgICAgICAgICAgICAgIHJlZGlyZWN0QWxsUmVxdWVzdHNUbzoge1xuICAgICAgICAgICAgICAgICAgICBob3N0TmFtZTogZG9tYWluTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgcHJvdG9jb2w6ICdodHRwcycsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCByZWRpcmVjdERpc3QgPSBuZXcgQ2xvdWRGcm9udFdlYkRpc3RyaWJ1dGlvbih0aGlzLCAnUmVkaXJlY3REaXN0cmlidXRpb24nLCB7XG4gICAgICAgICAgICBvcmlnaW5Db25maWdzOiBbe1xuICAgICAgICAgICAgICAgIGJlaGF2aW9yczogW3sgaXNEZWZhdWx0QmVoYXZpb3I6IHRydWUgfV0sXG4gICAgICAgICAgICAgICAgY3VzdG9tT3JpZ2luU291cmNlOiB7XG4gICAgICAgICAgICAgICAgICAgIGRvbWFpbk5hbWU6IEZuLnNlbGVjdCgyLCBGbi5zcGxpdCgnLycsIHJlZGlyZWN0QnVja2V0LmF0dHJXZWJzaXRlVXJsKSksXG4gICAgICAgICAgICAgICAgICAgIG9yaWdpblByb3RvY29sUG9saWN5OiBPcmlnaW5Qcm90b2NvbFBvbGljeS5IVFRQX09OTFksXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH1dLFxuICAgICAgICAgICAgYWxpYXNDb25maWd1cmF0aW9uOiB7XG4gICAgICAgICAgICAgICAgYWNtQ2VydFJlZjogcHJvcHMuY2VydEFybixcbiAgICAgICAgICAgICAgICBuYW1lczogW3JlZGlyZWN0RG9tYWluTmFtZV0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY29tbWVudDogYCR7cmVkaXJlY3REb21haW5OYW1lfSBSZWRpcmVjdCB0byAke2RvbWFpbk5hbWV9YCxcbiAgICAgICAgICAgIHByaWNlQ2xhc3M6IFByaWNlQ2xhc3MuUFJJQ0VfQ0xBU1NfQUxMLFxuICAgICAgICAgICAgdmlld2VyUHJvdG9jb2xQb2xpY3k6IFZpZXdlclByb3RvY29sUG9saWN5LlJFRElSRUNUX1RPX0hUVFBTLFxuICAgICAgICB9KTtcblxuICAgICAgICBuZXcgQVJlY29yZCh0aGlzLCAnUmVkaXJlY3RBbGlhc1JlY29yZCcsIHtcbiAgICAgICAgICAgIHJlY29yZE5hbWU6IHJlZGlyZWN0RG9tYWluTmFtZSxcbiAgICAgICAgICAgIHpvbmUsXG4gICAgICAgICAgICB0YXJnZXQ6IFJlY29yZFRhcmdldC5mcm9tQWxpYXMobmV3IENsb3VkRnJvbnRUYXJnZXQocmVkaXJlY3REaXN0KSksXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiJdfQ==