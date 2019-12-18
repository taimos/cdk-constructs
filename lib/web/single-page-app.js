"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_certificatemanager_1 = require("@aws-cdk/aws-certificatemanager");
const aws_cloudfront_1 = require("@aws-cdk/aws-cloudfront");
const aws_route53_1 = require("@aws-cdk/aws-route53");
const aws_route53_patterns_1 = require("@aws-cdk/aws-route53-patterns");
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
        const cert = props.certArn ?
            aws_certificatemanager_1.Certificate.fromCertificateArn(this, 'Certificate', props.certArn) :
            new aws_certificatemanager_1.DnsValidatedCertificate(this, 'Certificate', {
                hostedZone: zone,
                domainName,
                region: 'us-east-1',
            });
        const originAccessIdentity = new aws_cloudfront_1.OriginAccessIdentity(this, 'OAI', { comment: core_1.Aws.STACK_NAME });
        this.webBucket = new aws_s3_1.Bucket(this, 'WebBucket', { websiteIndexDocument: 'index.html' });
        this.webBucket.grantRead(originAccessIdentity);
        this.distribution = new aws_cloudfront_1.CloudFrontWebDistribution(this, 'Distribution', {
            originConfigs: [{
                    behaviors: [{ isDefaultBehavior: true }],
                    s3OriginSource: {
                        s3BucketSource: this.webBucket,
                        originAccessIdentity,
                    },
                }],
            viewerCertificate: aws_cloudfront_1.ViewerCertificate.fromAcmCertificate(cert, {
                aliases: [domainName],
            }),
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
                sources: [aws_s3_deployment_1.Source.asset(props.webFolder)],
                destinationBucket: this.webBucket,
                distribution: this.distribution,
            });
        }
        new aws_route53_1.ARecord(this, 'AliasRecord', {
            recordName: domainName,
            zone,
            target: aws_route53_1.RecordTarget.fromAlias(new aws_route53_targets_1.CloudFrontTarget(this.distribution)),
        });
        new aws_route53_patterns_1.HttpsRedirect(this, 'Redirect', {
            zone,
            recordNames: [redirectDomainName],
            targetDomain: domainName,
        });
    }
}
exports.SinglePageAppHosting = SinglePageAppHosting;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2luZ2xlLXBhZ2UtYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic2luZ2xlLXBhZ2UtYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNEVBQXVGO0FBQ3ZGLDREQUErSTtBQUMvSSxzREFBeUU7QUFDekUsd0VBQThEO0FBQzlELHNFQUFnRTtBQUNoRSw0Q0FBeUM7QUFDekMsa0VBQXNFO0FBQ3RFLHdDQUErQztBQWlDL0MsTUFBYSxvQkFBcUIsU0FBUSxnQkFBUztJQU0vQyxZQUFZLEtBQWlCLEVBQUUsRUFBVyxFQUFFLEtBQWlDO1FBQ3pFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFakIsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDbkYsTUFBTSxrQkFBa0IsR0FBRyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxPQUFPLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQztRQUUzRixNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyx3QkFBVSxDQUFDLHdCQUF3QixDQUFDLElBQUksRUFBRSxZQUFZLEVBQUU7WUFDaEYsWUFBWSxFQUFFLEtBQUssQ0FBQyxNQUFNO1lBQzFCLFFBQVEsRUFBRSxLQUFLLENBQUMsUUFBUTtTQUMzQixDQUFDLENBQUMsQ0FBQyxDQUFDLHdCQUFVLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsRUFBRSxVQUFVLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFFL0UsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3hCLG9DQUFXLENBQUMsa0JBQWtCLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNwRSxJQUFJLGdEQUF1QixDQUFDLElBQUksRUFBRSxhQUFhLEVBQUU7Z0JBQzdDLFVBQVUsRUFBRSxJQUFJO2dCQUNoQixVQUFVO2dCQUNWLE1BQU0sRUFBRSxXQUFXO2FBQ3RCLENBQUMsQ0FBQztRQUVQLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxxQ0FBb0IsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUUsT0FBTyxFQUFFLFVBQUcsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO1FBQ2hHLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxlQUFNLENBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRSxFQUFFLG9CQUFvQixFQUFFLFlBQVksRUFBRSxDQUFDLENBQUM7UUFDdkYsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUUvQyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksMENBQXlCLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRTtZQUNwRSxhQUFhLEVBQUUsQ0FBQztvQkFDWixTQUFTLEVBQUUsQ0FBQyxFQUFFLGlCQUFpQixFQUFFLElBQUksRUFBRSxDQUFDO29CQUN4QyxjQUFjLEVBQUU7d0JBQ1osY0FBYyxFQUFFLElBQUksQ0FBQyxTQUFTO3dCQUM5QixvQkFBb0I7cUJBQ3ZCO2lCQUNKLENBQUM7WUFDRixpQkFBaUIsRUFBRSxrQ0FBaUIsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUU7Z0JBQzFELE9BQU8sRUFBRSxDQUFDLFVBQVUsQ0FBQzthQUN4QixDQUFDO1lBQ0YsbUJBQW1CLEVBQUUsQ0FBQztvQkFDbEIsU0FBUyxFQUFFLEdBQUc7b0JBQ2QsWUFBWSxFQUFFLEdBQUc7b0JBQ2pCLGdCQUFnQixFQUFFLGFBQWE7aUJBQ2xDLEVBQUU7b0JBQ0MsU0FBUyxFQUFFLEdBQUc7b0JBQ2QsWUFBWSxFQUFFLEdBQUc7b0JBQ2pCLGdCQUFnQixFQUFFLGFBQWE7aUJBQ2xDLENBQUM7WUFDRixPQUFPLEVBQUUsR0FBRyxVQUFVLFVBQVU7WUFDaEMsVUFBVSxFQUFFLDJCQUFVLENBQUMsZUFBZTtZQUN0QyxvQkFBb0IsRUFBRSxxQ0FBb0IsQ0FBQyxpQkFBaUI7U0FDL0QsQ0FBQyxDQUFDO1FBRUgsSUFBSSxLQUFLLENBQUMsU0FBUyxFQUFFO1lBQ2pCLElBQUksb0NBQWdCLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRTtnQkFDeEMsT0FBTyxFQUFFLENBQUMsMEJBQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUN4QyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsU0FBUztnQkFDakMsWUFBWSxFQUFFLElBQUksQ0FBQyxZQUFZO2FBQ2xDLENBQUMsQ0FBQztTQUNOO1FBRUQsSUFBSSxxQkFBTyxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUU7WUFDN0IsVUFBVSxFQUFFLFVBQVU7WUFDdEIsSUFBSTtZQUNKLE1BQU0sRUFBRSwwQkFBWSxDQUFDLFNBQVMsQ0FBQyxJQUFJLHNDQUFnQixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUMxRSxDQUFDLENBQUM7UUFFSCxJQUFJLG9DQUFhLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRTtZQUNoQyxJQUFJO1lBQ0osV0FBVyxFQUFFLENBQUMsa0JBQWtCLENBQUM7WUFDakMsWUFBWSxFQUFFLFVBQVU7U0FDM0IsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKO0FBMUVELG9EQTBFQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENlcnRpZmljYXRlLCBEbnNWYWxpZGF0ZWRDZXJ0aWZpY2F0ZSB9IGZyb20gJ0Bhd3MtY2RrL2F3cy1jZXJ0aWZpY2F0ZW1hbmFnZXInO1xuaW1wb3J0IHsgQ2xvdWRGcm9udFdlYkRpc3RyaWJ1dGlvbiwgT3JpZ2luQWNjZXNzSWRlbnRpdHksIFByaWNlQ2xhc3MsIFZpZXdlckNlcnRpZmljYXRlLCBWaWV3ZXJQcm90b2NvbFBvbGljeSB9IGZyb20gJ0Bhd3MtY2RrL2F3cy1jbG91ZGZyb250JztcbmltcG9ydCB7IEFSZWNvcmQsIEhvc3RlZFpvbmUsIFJlY29yZFRhcmdldCB9IGZyb20gJ0Bhd3MtY2RrL2F3cy1yb3V0ZTUzJztcbmltcG9ydCB7IEh0dHBzUmVkaXJlY3QgfSBmcm9tICdAYXdzLWNkay9hd3Mtcm91dGU1My1wYXR0ZXJucyc7XG5pbXBvcnQgeyBDbG91ZEZyb250VGFyZ2V0IH0gZnJvbSAnQGF3cy1jZGsvYXdzLXJvdXRlNTMtdGFyZ2V0cyc7XG5pbXBvcnQgeyBCdWNrZXQgfSBmcm9tICdAYXdzLWNkay9hd3MtczMnO1xuaW1wb3J0IHsgQnVja2V0RGVwbG95bWVudCwgU291cmNlIH0gZnJvbSAnQGF3cy1jZGsvYXdzLXMzLWRlcGxveW1lbnQnO1xuaW1wb3J0IHsgQXdzLCBDb25zdHJ1Y3QgfSBmcm9tICdAYXdzLWNkay9jb3JlJztcblxuZXhwb3J0IGludGVyZmFjZSBTaW5nbGVQYWdlQXBwSG9zdGluZ1Byb3BzIHtcbiAgICAvKipcbiAgICAgKiBOYW1lIG9mIHRoZSBIb3N0ZWRab25lIG9mIHRoZSBkb21haW5cbiAgICAgKi9cbiAgICByZWFkb25seSB6b25lTmFtZSA6IHN0cmluZztcbiAgICAvKipcbiAgICAgKiBUaGUgQVJOIG9mIHRoZSBjZXJ0aWZpY2F0ZTsgSGFzIHRvIGJlIGluIHVzLWVhc3QtMVxuICAgICAqXG4gICAgICogQGRlZmF1bHQgLSBjcmVhdGUgYSBuZXcgY2VydGlmaWNhdGUgaW4gdXMtZWFzdC0xXG4gICAgICovXG4gICAgcmVhZG9ubHkgY2VydEFybj8gOiBzdHJpbmc7XG4gICAgLyoqXG4gICAgICogSUQgb2YgdGhlIEhvc3RlZFpvbmUgb2YgdGhlIGRvbWFpblxuICAgICAqXG4gICAgICogQGRlZmF1bHQgLSBsb29rdXAgem9uZSBmcm9tIGNvbnRleHQgdXNpbmcgdGhlIHpvbmUgbmFtZVxuICAgICAqL1xuICAgIHJlYWRvbmx5IHpvbmVJZD8gOiBzdHJpbmc7XG4gICAgLyoqXG4gICAgICogbG9jYWwgZm9sZGVyIHdpdGggY29udGVudHMgZm9yIHRoZSB3ZWJzaXRlIGJ1Y2tldFxuICAgICAqXG4gICAgICogQGRlZmF1bHQgLSBubyBmaWxlIGRlcGxveW1lbnRcbiAgICAgKi9cbiAgICByZWFkb25seSB3ZWJGb2xkZXI/IDogc3RyaW5nO1xuICAgIC8qKlxuICAgICAqIERlZmluZSBpZiB0aGUgbWFpbiBkb21haW4gaXMgd2l0aCBvciB3aXRob3V0IHd3dy5cbiAgICAgKlxuICAgICAqIEBkZWZhdWx0IGZhbHNlIC0gUmVkaXJlY3QgZXhhbXBsZS5jb20gdG8gd3d3LmV4YW1wbGUuY29tXG4gICAgICovXG4gICAgcmVhZG9ubHkgcmVkaXJlY3RUb0FwZXg/IDogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNsYXNzIFNpbmdsZVBhZ2VBcHBIb3N0aW5nIGV4dGVuZHMgQ29uc3RydWN0IHtcblxuICAgIHB1YmxpYyByZWFkb25seSB3ZWJCdWNrZXQgOiBCdWNrZXQ7XG5cbiAgICBwdWJsaWMgcmVhZG9ubHkgZGlzdHJpYnV0aW9uIDogQ2xvdWRGcm9udFdlYkRpc3RyaWJ1dGlvbjtcblxuICAgIGNvbnN0cnVjdG9yKHNjb3BlIDogQ29uc3RydWN0LCBpZCA6IHN0cmluZywgcHJvcHMgOiBTaW5nbGVQYWdlQXBwSG9zdGluZ1Byb3BzKSB7XG4gICAgICAgIHN1cGVyKHNjb3BlLCBpZCk7XG5cbiAgICAgICAgY29uc3QgZG9tYWluTmFtZSA9IHByb3BzLnJlZGlyZWN0VG9BcGV4ID8gcHJvcHMuem9uZU5hbWUgOiBgd3d3LiR7cHJvcHMuem9uZU5hbWV9YDtcbiAgICAgICAgY29uc3QgcmVkaXJlY3REb21haW5OYW1lID0gcHJvcHMucmVkaXJlY3RUb0FwZXggPyBgd3d3LiR7cHJvcHMuem9uZU5hbWV9YCA6IHByb3BzLnpvbmVOYW1lO1xuXG4gICAgICAgIGNvbnN0IHpvbmUgPSBwcm9wcy56b25lSWQgPyBIb3N0ZWRab25lLmZyb21Ib3N0ZWRab25lQXR0cmlidXRlcyh0aGlzLCAnSG9zdGVkWm9uZScsIHtcbiAgICAgICAgICAgIGhvc3RlZFpvbmVJZDogcHJvcHMuem9uZUlkLFxuICAgICAgICAgICAgem9uZU5hbWU6IHByb3BzLnpvbmVOYW1lLFxuICAgICAgICB9KSA6IEhvc3RlZFpvbmUuZnJvbUxvb2t1cCh0aGlzLCAnSG9zdGVkWm9uZScsIHsgZG9tYWluTmFtZTogcHJvcHMuem9uZU5hbWUgfSk7XG5cbiAgICAgICAgY29uc3QgY2VydCA9IHByb3BzLmNlcnRBcm4gP1xuICAgICAgICAgICAgQ2VydGlmaWNhdGUuZnJvbUNlcnRpZmljYXRlQXJuKHRoaXMsICdDZXJ0aWZpY2F0ZScsIHByb3BzLmNlcnRBcm4pIDpcbiAgICAgICAgICAgIG5ldyBEbnNWYWxpZGF0ZWRDZXJ0aWZpY2F0ZSh0aGlzLCAnQ2VydGlmaWNhdGUnLCB7XG4gICAgICAgICAgICAgICAgaG9zdGVkWm9uZTogem9uZSxcbiAgICAgICAgICAgICAgICBkb21haW5OYW1lLFxuICAgICAgICAgICAgICAgIHJlZ2lvbjogJ3VzLWVhc3QtMScsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBvcmlnaW5BY2Nlc3NJZGVudGl0eSA9IG5ldyBPcmlnaW5BY2Nlc3NJZGVudGl0eSh0aGlzLCAnT0FJJywgeyBjb21tZW50OiBBd3MuU1RBQ0tfTkFNRSB9KTtcbiAgICAgICAgdGhpcy53ZWJCdWNrZXQgPSBuZXcgQnVja2V0KHRoaXMsICdXZWJCdWNrZXQnLCB7IHdlYnNpdGVJbmRleERvY3VtZW50OiAnaW5kZXguaHRtbCcgfSk7XG4gICAgICAgIHRoaXMud2ViQnVja2V0LmdyYW50UmVhZChvcmlnaW5BY2Nlc3NJZGVudGl0eSk7XG5cbiAgICAgICAgdGhpcy5kaXN0cmlidXRpb24gPSBuZXcgQ2xvdWRGcm9udFdlYkRpc3RyaWJ1dGlvbih0aGlzLCAnRGlzdHJpYnV0aW9uJywge1xuICAgICAgICAgICAgb3JpZ2luQ29uZmlnczogW3tcbiAgICAgICAgICAgICAgICBiZWhhdmlvcnM6IFt7IGlzRGVmYXVsdEJlaGF2aW9yOiB0cnVlIH1dLFxuICAgICAgICAgICAgICAgIHMzT3JpZ2luU291cmNlOiB7XG4gICAgICAgICAgICAgICAgICAgIHMzQnVja2V0U291cmNlOiB0aGlzLndlYkJ1Y2tldCxcbiAgICAgICAgICAgICAgICAgICAgb3JpZ2luQWNjZXNzSWRlbnRpdHksXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH1dLFxuICAgICAgICAgICAgdmlld2VyQ2VydGlmaWNhdGU6IFZpZXdlckNlcnRpZmljYXRlLmZyb21BY21DZXJ0aWZpY2F0ZShjZXJ0LCB7XG4gICAgICAgICAgICAgICAgYWxpYXNlczogW2RvbWFpbk5hbWVdLFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBlcnJvckNvbmZpZ3VyYXRpb25zOiBbe1xuICAgICAgICAgICAgICAgIGVycm9yQ29kZTogNDAzLFxuICAgICAgICAgICAgICAgIHJlc3BvbnNlQ29kZTogMjAwLFxuICAgICAgICAgICAgICAgIHJlc3BvbnNlUGFnZVBhdGg6ICcvaW5kZXguaHRtbCcsXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgZXJyb3JDb2RlOiA0MDQsXG4gICAgICAgICAgICAgICAgcmVzcG9uc2VDb2RlOiAyMDAsXG4gICAgICAgICAgICAgICAgcmVzcG9uc2VQYWdlUGF0aDogJy9pbmRleC5odG1sJyxcbiAgICAgICAgICAgIH1dLFxuICAgICAgICAgICAgY29tbWVudDogYCR7ZG9tYWluTmFtZX0gV2Vic2l0ZWAsXG4gICAgICAgICAgICBwcmljZUNsYXNzOiBQcmljZUNsYXNzLlBSSUNFX0NMQVNTX0FMTCxcbiAgICAgICAgICAgIHZpZXdlclByb3RvY29sUG9saWN5OiBWaWV3ZXJQcm90b2NvbFBvbGljeS5SRURJUkVDVF9UT19IVFRQUyxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHByb3BzLndlYkZvbGRlcikge1xuICAgICAgICAgICAgbmV3IEJ1Y2tldERlcGxveW1lbnQodGhpcywgJ0RlcGxveVdlYnNpdGUnLCB7XG4gICAgICAgICAgICAgICAgc291cmNlczogW1NvdXJjZS5hc3NldChwcm9wcy53ZWJGb2xkZXIpXSxcbiAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbkJ1Y2tldDogdGhpcy53ZWJCdWNrZXQsXG4gICAgICAgICAgICAgICAgZGlzdHJpYnV0aW9uOiB0aGlzLmRpc3RyaWJ1dGlvbixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgbmV3IEFSZWNvcmQodGhpcywgJ0FsaWFzUmVjb3JkJywge1xuICAgICAgICAgICAgcmVjb3JkTmFtZTogZG9tYWluTmFtZSxcbiAgICAgICAgICAgIHpvbmUsXG4gICAgICAgICAgICB0YXJnZXQ6IFJlY29yZFRhcmdldC5mcm9tQWxpYXMobmV3IENsb3VkRnJvbnRUYXJnZXQodGhpcy5kaXN0cmlidXRpb24pKSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbmV3IEh0dHBzUmVkaXJlY3QodGhpcywgJ1JlZGlyZWN0Jywge1xuICAgICAgICAgICAgem9uZSxcbiAgICAgICAgICAgIHJlY29yZE5hbWVzOiBbcmVkaXJlY3REb21haW5OYW1lXSxcbiAgICAgICAgICAgIHRhcmdldERvbWFpbjogZG9tYWluTmFtZSxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIl19