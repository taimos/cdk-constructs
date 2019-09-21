"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_certificatemanager_1 = require("@aws-cdk/aws-certificatemanager");
const aws_cloudfront_1 = require("@aws-cdk/aws-cloudfront");
const aws_iam_1 = require("@aws-cdk/aws-iam");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2luZ2xlLXBhZ2UtYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic2luZ2xlLXBhZ2UtYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNEVBQTBFO0FBQzFFLDREQUF5STtBQUN6SSw4Q0FBMkU7QUFDM0Usc0RBQXlFO0FBQ3pFLHdFQUE4RDtBQUM5RCxzRUFBZ0U7QUFDaEUsNENBQXlDO0FBQ3pDLGtFQUFzRTtBQUN0RSx3Q0FBK0M7QUFpQy9DLE1BQWEsb0JBQXFCLFNBQVEsZ0JBQVM7SUFNL0MsWUFBWSxLQUFpQixFQUFFLEVBQVcsRUFBRSxLQUFpQztRQUN6RSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRWpCLE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU8sS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ25GLE1BQU0sa0JBQWtCLEdBQUcsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsT0FBTyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUM7UUFFM0YsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsd0JBQVUsQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO1lBQ2hGLFlBQVksRUFBRSxLQUFLLENBQUMsTUFBTTtZQUMxQixRQUFRLEVBQUUsS0FBSyxDQUFDLFFBQVE7U0FDM0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyx3QkFBVSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLEVBQUUsVUFBVSxFQUFFLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBRS9FLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFPLElBQUksSUFBSSxnREFBdUIsQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFO1lBQzlFLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLFVBQVU7WUFDVixNQUFNLEVBQUUsV0FBVztTQUN0QixDQUFDLENBQUMsY0FBYyxDQUFDO1FBRWxCLE1BQU0sR0FBRyxHQUFHLElBQUksa0RBQWlDLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRTtZQUMzRCxvQ0FBb0MsRUFBRSxFQUFFLE9BQU8sRUFBRSxVQUFHLENBQUMsVUFBVSxFQUFFO1NBQ3BFLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxlQUFNLENBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRSxFQUFFLG9CQUFvQixFQUFFLFlBQVksRUFBRSxDQUFDLENBQUM7UUFDdkYsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLHlCQUFlLENBQUM7WUFDbkQsT0FBTyxFQUFFLENBQUMsY0FBYyxDQUFDO1lBQ3pCLFNBQVMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzlDLFVBQVUsRUFBRSxDQUFDLElBQUksZ0NBQXNCLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUM7U0FDdEUsQ0FBQyxDQUFDLENBQUM7UUFFSixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksMENBQXlCLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRTtZQUNwRSxhQUFhLEVBQUUsQ0FBQztvQkFDWixTQUFTLEVBQUUsQ0FBQyxFQUFFLGlCQUFpQixFQUFFLElBQUksRUFBRSxDQUFDO29CQUN4QyxjQUFjLEVBQUU7d0JBQ1osY0FBYyxFQUFFLElBQUksQ0FBQyxTQUFTO3dCQUM5QixzQkFBc0IsRUFBRSxHQUFHLENBQUMsR0FBRztxQkFDbEM7aUJBQ0osQ0FBQztZQUNGLGtCQUFrQixFQUFFO2dCQUNoQixVQUFVLEVBQUUsT0FBTztnQkFDbkIsS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDO2FBQ3RCO1lBQ0QsbUJBQW1CLEVBQUUsQ0FBQztvQkFDbEIsU0FBUyxFQUFFLEdBQUc7b0JBQ2QsWUFBWSxFQUFFLEdBQUc7b0JBQ2pCLGdCQUFnQixFQUFFLGFBQWE7aUJBQ2xDLEVBQUU7b0JBQ0MsU0FBUyxFQUFFLEdBQUc7b0JBQ2QsWUFBWSxFQUFFLEdBQUc7b0JBQ2pCLGdCQUFnQixFQUFFLGFBQWE7aUJBQ2xDLENBQUM7WUFDRixPQUFPLEVBQUUsR0FBRyxVQUFVLFVBQVU7WUFDaEMsVUFBVSxFQUFFLDJCQUFVLENBQUMsZUFBZTtZQUN0QyxvQkFBb0IsRUFBRSxxQ0FBb0IsQ0FBQyxpQkFBaUI7U0FDL0QsQ0FBQyxDQUFDO1FBRUgsSUFBSSxLQUFLLENBQUMsU0FBUyxFQUFFO1lBQ2pCLElBQUksb0NBQWdCLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRTtnQkFDeEMsT0FBTyxFQUFFLENBQUMsMEJBQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUN4QyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsU0FBUztnQkFDakMsWUFBWSxFQUFFLElBQUksQ0FBQyxZQUFZO2FBQ2xDLENBQUMsQ0FBQztTQUNOO1FBRUQsSUFBSSxxQkFBTyxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUU7WUFDN0IsVUFBVSxFQUFFLFVBQVU7WUFDdEIsSUFBSTtZQUNKLE1BQU0sRUFBRSwwQkFBWSxDQUFDLFNBQVMsQ0FBQyxJQUFJLHNDQUFnQixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUMxRSxDQUFDLENBQUM7UUFFSCxJQUFJLG9DQUFhLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRTtZQUNoQyxJQUFJO1lBQ0osV0FBVyxFQUFFLENBQUMsa0JBQWtCLENBQUM7WUFDakMsWUFBWSxFQUFFLFVBQVU7U0FDM0IsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKO0FBaEZELG9EQWdGQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERuc1ZhbGlkYXRlZENlcnRpZmljYXRlIH0gZnJvbSAnQGF3cy1jZGsvYXdzLWNlcnRpZmljYXRlbWFuYWdlcic7XG5pbXBvcnQgeyBDZm5DbG91ZEZyb250T3JpZ2luQWNjZXNzSWRlbnRpdHksIENsb3VkRnJvbnRXZWJEaXN0cmlidXRpb24sIFByaWNlQ2xhc3MsIFZpZXdlclByb3RvY29sUG9saWN5IH0gZnJvbSAnQGF3cy1jZGsvYXdzLWNsb3VkZnJvbnQnO1xuaW1wb3J0IHsgQ2Fub25pY2FsVXNlclByaW5jaXBhbCwgUG9saWN5U3RhdGVtZW50IH0gZnJvbSAnQGF3cy1jZGsvYXdzLWlhbSc7XG5pbXBvcnQgeyBBUmVjb3JkLCBIb3N0ZWRab25lLCBSZWNvcmRUYXJnZXQgfSBmcm9tICdAYXdzLWNkay9hd3Mtcm91dGU1Myc7XG5pbXBvcnQgeyBIdHRwc1JlZGlyZWN0IH0gZnJvbSAnQGF3cy1jZGsvYXdzLXJvdXRlNTMtcGF0dGVybnMnO1xuaW1wb3J0IHsgQ2xvdWRGcm9udFRhcmdldCB9IGZyb20gJ0Bhd3MtY2RrL2F3cy1yb3V0ZTUzLXRhcmdldHMnO1xuaW1wb3J0IHsgQnVja2V0IH0gZnJvbSAnQGF3cy1jZGsvYXdzLXMzJztcbmltcG9ydCB7IEJ1Y2tldERlcGxveW1lbnQsIFNvdXJjZSB9IGZyb20gJ0Bhd3MtY2RrL2F3cy1zMy1kZXBsb3ltZW50JztcbmltcG9ydCB7IEF3cywgQ29uc3RydWN0IH0gZnJvbSAnQGF3cy1jZGsvY29yZSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2luZ2xlUGFnZUFwcEhvc3RpbmdQcm9wcyB7XG4gICAgLyoqXG4gICAgICogTmFtZSBvZiB0aGUgSG9zdGVkWm9uZSBvZiB0aGUgZG9tYWluXG4gICAgICovXG4gICAgcmVhZG9ubHkgem9uZU5hbWUgOiBzdHJpbmc7XG4gICAgLyoqXG4gICAgICogVGhlIEFSTiBvZiB0aGUgY2VydGlmaWNhdGU7IEhhcyB0byBiZSBpbiB1cy1lYXN0LTFcbiAgICAgKlxuICAgICAqIEBkZWZhdWx0IC0gY3JlYXRlIGEgbmV3IGNlcnRpZmljYXRlIGluIHVzLWVhc3QtMVxuICAgICAqL1xuICAgIHJlYWRvbmx5IGNlcnRBcm4/IDogc3RyaW5nO1xuICAgIC8qKlxuICAgICAqIElEIG9mIHRoZSBIb3N0ZWRab25lIG9mIHRoZSBkb21haW5cbiAgICAgKlxuICAgICAqIEBkZWZhdWx0IC0gbG9va3VwIHpvbmUgZnJvbSBjb250ZXh0IHVzaW5nIHRoZSB6b25lIG5hbWVcbiAgICAgKi9cbiAgICByZWFkb25seSB6b25lSWQ/IDogc3RyaW5nO1xuICAgIC8qKlxuICAgICAqIGxvY2FsIGZvbGRlciB3aXRoIGNvbnRlbnRzIGZvciB0aGUgd2Vic2l0ZSBidWNrZXRcbiAgICAgKlxuICAgICAqIEBkZWZhdWx0IC0gbm8gZmlsZSBkZXBsb3ltZW50XG4gICAgICovXG4gICAgcmVhZG9ubHkgd2ViRm9sZGVyPyA6IHN0cmluZztcbiAgICAvKipcbiAgICAgKiBEZWZpbmUgaWYgdGhlIG1haW4gZG9tYWluIGlzIHdpdGggb3Igd2l0aG91dCB3d3cuXG4gICAgICpcbiAgICAgKiBAZGVmYXVsdCBmYWxzZSAtIFJlZGlyZWN0IGV4YW1wbGUuY29tIHRvIHd3dy5leGFtcGxlLmNvbVxuICAgICAqL1xuICAgIHJlYWRvbmx5IHJlZGlyZWN0VG9BcGV4PyA6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjbGFzcyBTaW5nbGVQYWdlQXBwSG9zdGluZyBleHRlbmRzIENvbnN0cnVjdCB7XG5cbiAgICBwdWJsaWMgcmVhZG9ubHkgd2ViQnVja2V0IDogQnVja2V0O1xuXG4gICAgcHVibGljIHJlYWRvbmx5IGRpc3RyaWJ1dGlvbiA6IENsb3VkRnJvbnRXZWJEaXN0cmlidXRpb247XG5cbiAgICBjb25zdHJ1Y3RvcihzY29wZSA6IENvbnN0cnVjdCwgaWQgOiBzdHJpbmcsIHByb3BzIDogU2luZ2xlUGFnZUFwcEhvc3RpbmdQcm9wcykge1xuICAgICAgICBzdXBlcihzY29wZSwgaWQpO1xuXG4gICAgICAgIGNvbnN0IGRvbWFpbk5hbWUgPSBwcm9wcy5yZWRpcmVjdFRvQXBleCA/IHByb3BzLnpvbmVOYW1lIDogYHd3dy4ke3Byb3BzLnpvbmVOYW1lfWA7XG4gICAgICAgIGNvbnN0IHJlZGlyZWN0RG9tYWluTmFtZSA9IHByb3BzLnJlZGlyZWN0VG9BcGV4ID8gYHd3dy4ke3Byb3BzLnpvbmVOYW1lfWAgOiBwcm9wcy56b25lTmFtZTtcblxuICAgICAgICBjb25zdCB6b25lID0gcHJvcHMuem9uZUlkID8gSG9zdGVkWm9uZS5mcm9tSG9zdGVkWm9uZUF0dHJpYnV0ZXModGhpcywgJ0hvc3RlZFpvbmUnLCB7XG4gICAgICAgICAgICBob3N0ZWRab25lSWQ6IHByb3BzLnpvbmVJZCxcbiAgICAgICAgICAgIHpvbmVOYW1lOiBwcm9wcy56b25lTmFtZSxcbiAgICAgICAgfSkgOiBIb3N0ZWRab25lLmZyb21Mb29rdXAodGhpcywgJ0hvc3RlZFpvbmUnLCB7IGRvbWFpbk5hbWU6IHByb3BzLnpvbmVOYW1lIH0pO1xuXG4gICAgICAgIGNvbnN0IGNlcnRBcm4gPSBwcm9wcy5jZXJ0QXJuIHx8IG5ldyBEbnNWYWxpZGF0ZWRDZXJ0aWZpY2F0ZSh0aGlzLCAnQ2VydGlmaWNhdGUnLCB7XG4gICAgICAgICAgICBob3N0ZWRab25lOiB6b25lLFxuICAgICAgICAgICAgZG9tYWluTmFtZSxcbiAgICAgICAgICAgIHJlZ2lvbjogJ3VzLWVhc3QtMScsXG4gICAgICAgIH0pLmNlcnRpZmljYXRlQXJuO1xuXG4gICAgICAgIGNvbnN0IG9haSA9IG5ldyBDZm5DbG91ZEZyb250T3JpZ2luQWNjZXNzSWRlbnRpdHkodGhpcywgJ09BSScsIHtcbiAgICAgICAgICAgIGNsb3VkRnJvbnRPcmlnaW5BY2Nlc3NJZGVudGl0eUNvbmZpZzogeyBjb21tZW50OiBBd3MuU1RBQ0tfTkFNRSB9LFxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLndlYkJ1Y2tldCA9IG5ldyBCdWNrZXQodGhpcywgJ1dlYkJ1Y2tldCcsIHsgd2Vic2l0ZUluZGV4RG9jdW1lbnQ6ICdpbmRleC5odG1sJyB9KTtcbiAgICAgICAgdGhpcy53ZWJCdWNrZXQuYWRkVG9SZXNvdXJjZVBvbGljeShuZXcgUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgICAgIGFjdGlvbnM6IFsnczM6R2V0T2JqZWN0J10sXG4gICAgICAgICAgICByZXNvdXJjZXM6IFt0aGlzLndlYkJ1Y2tldC5hcm5Gb3JPYmplY3RzKCcqJyldLFxuICAgICAgICAgICAgcHJpbmNpcGFsczogW25ldyBDYW5vbmljYWxVc2VyUHJpbmNpcGFsKG9haS5hdHRyUzNDYW5vbmljYWxVc2VySWQpXSxcbiAgICAgICAgfSkpO1xuXG4gICAgICAgIHRoaXMuZGlzdHJpYnV0aW9uID0gbmV3IENsb3VkRnJvbnRXZWJEaXN0cmlidXRpb24odGhpcywgJ0Rpc3RyaWJ1dGlvbicsIHtcbiAgICAgICAgICAgIG9yaWdpbkNvbmZpZ3M6IFt7XG4gICAgICAgICAgICAgICAgYmVoYXZpb3JzOiBbeyBpc0RlZmF1bHRCZWhhdmlvcjogdHJ1ZSB9XSxcbiAgICAgICAgICAgICAgICBzM09yaWdpblNvdXJjZToge1xuICAgICAgICAgICAgICAgICAgICBzM0J1Y2tldFNvdXJjZTogdGhpcy53ZWJCdWNrZXQsXG4gICAgICAgICAgICAgICAgICAgIG9yaWdpbkFjY2Vzc0lkZW50aXR5SWQ6IG9haS5yZWYsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH1dLFxuICAgICAgICAgICAgYWxpYXNDb25maWd1cmF0aW9uOiB7XG4gICAgICAgICAgICAgICAgYWNtQ2VydFJlZjogY2VydEFybixcbiAgICAgICAgICAgICAgICBuYW1lczogW2RvbWFpbk5hbWVdLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVycm9yQ29uZmlndXJhdGlvbnM6IFt7XG4gICAgICAgICAgICAgICAgZXJyb3JDb2RlOiA0MDMsXG4gICAgICAgICAgICAgICAgcmVzcG9uc2VDb2RlOiAyMDAsXG4gICAgICAgICAgICAgICAgcmVzcG9uc2VQYWdlUGF0aDogJy9pbmRleC5odG1sJyxcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBlcnJvckNvZGU6IDQwNCxcbiAgICAgICAgICAgICAgICByZXNwb25zZUNvZGU6IDIwMCxcbiAgICAgICAgICAgICAgICByZXNwb25zZVBhZ2VQYXRoOiAnL2luZGV4Lmh0bWwnLFxuICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICBjb21tZW50OiBgJHtkb21haW5OYW1lfSBXZWJzaXRlYCxcbiAgICAgICAgICAgIHByaWNlQ2xhc3M6IFByaWNlQ2xhc3MuUFJJQ0VfQ0xBU1NfQUxMLFxuICAgICAgICAgICAgdmlld2VyUHJvdG9jb2xQb2xpY3k6IFZpZXdlclByb3RvY29sUG9saWN5LlJFRElSRUNUX1RPX0hUVFBTLFxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAocHJvcHMud2ViRm9sZGVyKSB7XG4gICAgICAgICAgICBuZXcgQnVja2V0RGVwbG95bWVudCh0aGlzLCAnRGVwbG95V2Vic2l0ZScsIHtcbiAgICAgICAgICAgICAgICBzb3VyY2VzOiBbU291cmNlLmFzc2V0KHByb3BzLndlYkZvbGRlcildLFxuICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uQnVja2V0OiB0aGlzLndlYkJ1Y2tldCxcbiAgICAgICAgICAgICAgICBkaXN0cmlidXRpb246IHRoaXMuZGlzdHJpYnV0aW9uLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBuZXcgQVJlY29yZCh0aGlzLCAnQWxpYXNSZWNvcmQnLCB7XG4gICAgICAgICAgICByZWNvcmROYW1lOiBkb21haW5OYW1lLFxuICAgICAgICAgICAgem9uZSxcbiAgICAgICAgICAgIHRhcmdldDogUmVjb3JkVGFyZ2V0LmZyb21BbGlhcyhuZXcgQ2xvdWRGcm9udFRhcmdldCh0aGlzLmRpc3RyaWJ1dGlvbikpLFxuICAgICAgICB9KTtcblxuICAgICAgICBuZXcgSHR0cHNSZWRpcmVjdCh0aGlzLCAnUmVkaXJlY3QnLCB7XG4gICAgICAgICAgICB6b25lLFxuICAgICAgICAgICAgcmVjb3JkTmFtZXM6IFtyZWRpcmVjdERvbWFpbk5hbWVdLFxuICAgICAgICAgICAgdGFyZ2V0RG9tYWluOiBkb21haW5OYW1lLFxuICAgICAgICB9KTtcbiAgICB9XG59XG4iXX0=