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
            subjectAlternativeNames: [redirectDomainName],
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
                acmCertRef: certArn,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2luZ2xlLXBhZ2UtYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic2luZ2xlLXBhZ2UtYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNEVBQTBFO0FBQzFFLDREQUErSjtBQUMvSiw4Q0FBMkU7QUFDM0Usc0RBQXlFO0FBQ3pFLHNFQUFnRTtBQUNoRSw0Q0FBb0Q7QUFDcEQsa0VBQXNFO0FBQ3RFLHdDQUFtRDtBQWlDbkQsTUFBYSxvQkFBcUIsU0FBUSxnQkFBUztJQU0vQyxZQUFZLEtBQWlCLEVBQUUsRUFBVyxFQUFFLEtBQWlDO1FBQ3pFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFakIsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDbkYsTUFBTSxrQkFBa0IsR0FBRyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxPQUFPLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQztRQUUzRixNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyx3QkFBVSxDQUFDLHdCQUF3QixDQUFDLElBQUksRUFBRSxZQUFZLEVBQUU7WUFDaEYsWUFBWSxFQUFFLEtBQUssQ0FBQyxNQUFNO1lBQzFCLFFBQVEsRUFBRSxLQUFLLENBQUMsUUFBUTtTQUMzQixDQUFDLENBQUMsQ0FBQyxDQUFDLHdCQUFVLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsRUFBRSxVQUFVLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFFL0UsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sSUFBSSxJQUFJLGdEQUF1QixDQUFDLElBQUksRUFBRSxhQUFhLEVBQUU7WUFD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QUUsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLENBQUM7b0JBQ3hDLGtCQUFrQixFQUFFO3dCQUNoQixVQUFVLEVBQUUsU0FBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsU0FBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsY0FBYyxDQUFDLGNBQWMsQ0FBQyxDQUFDO3dCQUN0RSxvQkFBb0IsRUFBRSxxQ0FBb0IsQ0FBQyxTQUFTO3FCQUN2RDtpQkFDSixDQUFDO1lBQ0Ysa0JBQWtCLEVBQUU7Z0JBQ2hCLFVBQVUsRUFBRSxPQUFPO2dCQUNuQixLQUFLLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQzthQUM5QjtZQUNELE9BQU8sRUFBRSxHQUFHLGtCQUFrQixnQkFBZ0IsVUFBVSxFQUFFO1lBQzFELFVBQVUsRUFBRSwyQkFBVSxDQUFDLGVBQWU7WUFDdEMsb0JBQW9CLEVBQUUscUNBQW9CLENBQUMsaUJBQWlCO1NBQy9ELENBQUMsQ0FBQztRQUVILElBQUkscUJBQU8sQ0FBQyxJQUFJLEVBQUUscUJBQXFCLEVBQUU7WUFDckMsVUFBVSxFQUFFLGtCQUFrQjtZQUM5QixJQUFJO1lBQ0osTUFBTSxFQUFFLDBCQUFZLENBQUMsU0FBUyxDQUFDLElBQUksc0NBQWdCLENBQUMsWUFBWSxDQUFDLENBQUM7U0FDckUsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKO0FBekdELG9EQXlHQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERuc1ZhbGlkYXRlZENlcnRpZmljYXRlIH0gZnJvbSAnQGF3cy1jZGsvYXdzLWNlcnRpZmljYXRlbWFuYWdlcic7XG5pbXBvcnQgeyBDZm5DbG91ZEZyb250T3JpZ2luQWNjZXNzSWRlbnRpdHksIENsb3VkRnJvbnRXZWJEaXN0cmlidXRpb24sIE9yaWdpblByb3RvY29sUG9saWN5LCBQcmljZUNsYXNzLCBWaWV3ZXJQcm90b2NvbFBvbGljeSB9IGZyb20gJ0Bhd3MtY2RrL2F3cy1jbG91ZGZyb250JztcbmltcG9ydCB7IENhbm9uaWNhbFVzZXJQcmluY2lwYWwsIFBvbGljeVN0YXRlbWVudCB9IGZyb20gJ0Bhd3MtY2RrL2F3cy1pYW0nO1xuaW1wb3J0IHsgQVJlY29yZCwgSG9zdGVkWm9uZSwgUmVjb3JkVGFyZ2V0IH0gZnJvbSAnQGF3cy1jZGsvYXdzLXJvdXRlNTMnO1xuaW1wb3J0IHsgQ2xvdWRGcm9udFRhcmdldCB9IGZyb20gJ0Bhd3MtY2RrL2F3cy1yb3V0ZTUzLXRhcmdldHMnO1xuaW1wb3J0IHsgQnVja2V0LCBDZm5CdWNrZXQgfSBmcm9tICdAYXdzLWNkay9hd3MtczMnO1xuaW1wb3J0IHsgQnVja2V0RGVwbG95bWVudCwgU291cmNlIH0gZnJvbSAnQGF3cy1jZGsvYXdzLXMzLWRlcGxveW1lbnQnO1xuaW1wb3J0IHsgQXdzLCBDb25zdHJ1Y3QsIEZuIH0gZnJvbSAnQGF3cy1jZGsvY29yZSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2luZ2xlUGFnZUFwcEhvc3RpbmdQcm9wcyB7XG4gICAgLyoqXG4gICAgICogTmFtZSBvZiB0aGUgSG9zdGVkWm9uZSBvZiB0aGUgZG9tYWluXG4gICAgICovXG4gICAgcmVhZG9ubHkgem9uZU5hbWUgOiBzdHJpbmc7XG4gICAgLyoqXG4gICAgICogVGhlIEFSTiBvZiB0aGUgY2VydGlmaWNhdGU7IEhhcyB0byBiZSBpbiB1cy1lYXN0LTFcbiAgICAgKlxuICAgICAqIEBkZWZhdWx0IC0gY3JlYXRlIGEgbmV3IGNlcnRpZmljYXRlIGluIHVzLWVhc3QtMVxuICAgICAqL1xuICAgIHJlYWRvbmx5IGNlcnRBcm4/IDogc3RyaW5nO1xuICAgIC8qKlxuICAgICAqIElEIG9mIHRoZSBIb3N0ZWRab25lIG9mIHRoZSBkb21haW5cbiAgICAgKlxuICAgICAqIEBkZWZhdWx0IC0gbG9va3VwIHpvbmUgZnJvbSBjb250ZXh0IHVzaW5nIHRoZSB6b25lIG5hbWVcbiAgICAgKi9cbiAgICByZWFkb25seSB6b25lSWQ/IDogc3RyaW5nO1xuICAgIC8qKlxuICAgICAqIGxvY2FsIGZvbGRlciB3aXRoIGNvbnRlbnRzIGZvciB0aGUgd2Vic2l0ZSBidWNrZXRcbiAgICAgKlxuICAgICAqIEBkZWZhdWx0IC0gbm8gZmlsZSBkZXBsb3ltZW50XG4gICAgICovXG4gICAgcmVhZG9ubHkgd2ViRm9sZGVyPyA6IHN0cmluZztcbiAgICAvKipcbiAgICAgKiBEZWZpbmUgaWYgdGhlIG1haW4gZG9tYWluIGlzIHdpdGggb3Igd2l0aG91dCB3d3cuXG4gICAgICpcbiAgICAgKiBAZGVmYXVsdCBmYWxzZSAtIFJlZGlyZWN0IGV4YW1wbGUuY29tIHRvIHd3dy5leGFtcGxlLmNvbVxuICAgICAqL1xuICAgIHJlYWRvbmx5IHJlZGlyZWN0VG9BcGV4PyA6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjbGFzcyBTaW5nbGVQYWdlQXBwSG9zdGluZyBleHRlbmRzIENvbnN0cnVjdCB7XG5cbiAgICBwdWJsaWMgcmVhZG9ubHkgd2ViQnVja2V0IDogQnVja2V0O1xuXG4gICAgcHVibGljIHJlYWRvbmx5IGRpc3RyaWJ1dGlvbiA6IENsb3VkRnJvbnRXZWJEaXN0cmlidXRpb247XG5cbiAgICBjb25zdHJ1Y3RvcihzY29wZSA6IENvbnN0cnVjdCwgaWQgOiBzdHJpbmcsIHByb3BzIDogU2luZ2xlUGFnZUFwcEhvc3RpbmdQcm9wcykge1xuICAgICAgICBzdXBlcihzY29wZSwgaWQpO1xuXG4gICAgICAgIGNvbnN0IGRvbWFpbk5hbWUgPSBwcm9wcy5yZWRpcmVjdFRvQXBleCA/IHByb3BzLnpvbmVOYW1lIDogYHd3dy4ke3Byb3BzLnpvbmVOYW1lfWA7XG4gICAgICAgIGNvbnN0IHJlZGlyZWN0RG9tYWluTmFtZSA9IHByb3BzLnJlZGlyZWN0VG9BcGV4ID8gYHd3dy4ke3Byb3BzLnpvbmVOYW1lfWAgOiBwcm9wcy56b25lTmFtZTtcblxuICAgICAgICBjb25zdCB6b25lID0gcHJvcHMuem9uZUlkID8gSG9zdGVkWm9uZS5mcm9tSG9zdGVkWm9uZUF0dHJpYnV0ZXModGhpcywgJ0hvc3RlZFpvbmUnLCB7XG4gICAgICAgICAgICBob3N0ZWRab25lSWQ6IHByb3BzLnpvbmVJZCxcbiAgICAgICAgICAgIHpvbmVOYW1lOiBwcm9wcy56b25lTmFtZSxcbiAgICAgICAgfSkgOiBIb3N0ZWRab25lLmZyb21Mb29rdXAodGhpcywgJ0hvc3RlZFpvbmUnLCB7IGRvbWFpbk5hbWU6IHByb3BzLnpvbmVOYW1lIH0pO1xuXG4gICAgICAgIGNvbnN0IGNlcnRBcm4gPSBwcm9wcy5jZXJ0QXJuIHx8IG5ldyBEbnNWYWxpZGF0ZWRDZXJ0aWZpY2F0ZSh0aGlzLCAnQ2VydGlmaWNhdGUnLCB7XG4gICAgICAgICAgICBob3N0ZWRab25lOiB6b25lLFxuICAgICAgICAgICAgZG9tYWluTmFtZSxcbiAgICAgICAgICAgIHN1YmplY3RBbHRlcm5hdGl2ZU5hbWVzOiBbcmVkaXJlY3REb21haW5OYW1lXSxcbiAgICAgICAgICAgIHJlZ2lvbjogJ3VzLWVhc3QtMScsXG4gICAgICAgIH0pLmNlcnRpZmljYXRlQXJuO1xuXG4gICAgICAgIGNvbnN0IG9haSA9IG5ldyBDZm5DbG91ZEZyb250T3JpZ2luQWNjZXNzSWRlbnRpdHkodGhpcywgJ09BSScsIHtcbiAgICAgICAgICAgIGNsb3VkRnJvbnRPcmlnaW5BY2Nlc3NJZGVudGl0eUNvbmZpZzogeyBjb21tZW50OiBBd3MuU1RBQ0tfTkFNRSB9LFxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLndlYkJ1Y2tldCA9IG5ldyBCdWNrZXQodGhpcywgJ1dlYkJ1Y2tldCcsIHsgd2Vic2l0ZUluZGV4RG9jdW1lbnQ6ICdpbmRleC5odG1sJyB9KTtcbiAgICAgICAgdGhpcy53ZWJCdWNrZXQuYWRkVG9SZXNvdXJjZVBvbGljeShuZXcgUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgICAgIGFjdGlvbnM6IFsnczM6R2V0T2JqZWN0J10sXG4gICAgICAgICAgICByZXNvdXJjZXM6IFt0aGlzLndlYkJ1Y2tldC5hcm5Gb3JPYmplY3RzKCcqJyldLFxuICAgICAgICAgICAgcHJpbmNpcGFsczogW25ldyBDYW5vbmljYWxVc2VyUHJpbmNpcGFsKG9haS5hdHRyUzNDYW5vbmljYWxVc2VySWQpXSxcbiAgICAgICAgfSkpO1xuXG4gICAgICAgIHRoaXMuZGlzdHJpYnV0aW9uID0gbmV3IENsb3VkRnJvbnRXZWJEaXN0cmlidXRpb24odGhpcywgJ0Rpc3RyaWJ1dGlvbicsIHtcbiAgICAgICAgICAgIG9yaWdpbkNvbmZpZ3M6IFt7XG4gICAgICAgICAgICAgICAgYmVoYXZpb3JzOiBbeyBpc0RlZmF1bHRCZWhhdmlvcjogdHJ1ZSB9XSxcbiAgICAgICAgICAgICAgICBzM09yaWdpblNvdXJjZToge1xuICAgICAgICAgICAgICAgICAgICBzM0J1Y2tldFNvdXJjZTogdGhpcy53ZWJCdWNrZXQsXG4gICAgICAgICAgICAgICAgICAgIG9yaWdpbkFjY2Vzc0lkZW50aXR5SWQ6IG9haS5yZWYsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH1dLFxuICAgICAgICAgICAgYWxpYXNDb25maWd1cmF0aW9uOiB7XG4gICAgICAgICAgICAgICAgYWNtQ2VydFJlZjogY2VydEFybixcbiAgICAgICAgICAgICAgICBuYW1lczogW2RvbWFpbk5hbWVdLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVycm9yQ29uZmlndXJhdGlvbnM6IFt7XG4gICAgICAgICAgICAgICAgZXJyb3JDb2RlOiA0MDMsXG4gICAgICAgICAgICAgICAgcmVzcG9uc2VDb2RlOiAyMDAsXG4gICAgICAgICAgICAgICAgcmVzcG9uc2VQYWdlUGF0aDogJy9pbmRleC5odG1sJyxcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBlcnJvckNvZGU6IDQwNCxcbiAgICAgICAgICAgICAgICByZXNwb25zZUNvZGU6IDIwMCxcbiAgICAgICAgICAgICAgICByZXNwb25zZVBhZ2VQYXRoOiAnL2luZGV4Lmh0bWwnLFxuICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICBjb21tZW50OiBgJHtkb21haW5OYW1lfSBXZWJzaXRlYCxcbiAgICAgICAgICAgIHByaWNlQ2xhc3M6IFByaWNlQ2xhc3MuUFJJQ0VfQ0xBU1NfQUxMLFxuICAgICAgICAgICAgdmlld2VyUHJvdG9jb2xQb2xpY3k6IFZpZXdlclByb3RvY29sUG9saWN5LlJFRElSRUNUX1RPX0hUVFBTLFxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAocHJvcHMud2ViRm9sZGVyKSB7XG4gICAgICAgICAgICBuZXcgQnVja2V0RGVwbG95bWVudCh0aGlzLCAnRGVwbG95V2Vic2l0ZScsIHtcbiAgICAgICAgICAgICAgICBzb3VyY2U6IFNvdXJjZS5hc3NldChwcm9wcy53ZWJGb2xkZXIpLFxuICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uQnVja2V0OiB0aGlzLndlYkJ1Y2tldCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgbmV3IEFSZWNvcmQodGhpcywgJ0FsaWFzUmVjb3JkJywge1xuICAgICAgICAgICAgcmVjb3JkTmFtZTogZG9tYWluTmFtZSxcbiAgICAgICAgICAgIHpvbmUsXG4gICAgICAgICAgICB0YXJnZXQ6IFJlY29yZFRhcmdldC5mcm9tQWxpYXMobmV3IENsb3VkRnJvbnRUYXJnZXQodGhpcy5kaXN0cmlidXRpb24pKSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgcmVkaXJlY3RCdWNrZXQgPSBuZXcgQ2ZuQnVja2V0KHRoaXMsICdSZWRpcmVjdEJ1Y2tldCcsIHtcbiAgICAgICAgICAgIHdlYnNpdGVDb25maWd1cmF0aW9uOiB7XG4gICAgICAgICAgICAgICAgcmVkaXJlY3RBbGxSZXF1ZXN0c1RvOiB7XG4gICAgICAgICAgICAgICAgICAgIGhvc3ROYW1lOiBkb21haW5OYW1lLFxuICAgICAgICAgICAgICAgICAgICBwcm90b2NvbDogJ2h0dHBzJyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHJlZGlyZWN0RGlzdCA9IG5ldyBDbG91ZEZyb250V2ViRGlzdHJpYnV0aW9uKHRoaXMsICdSZWRpcmVjdERpc3RyaWJ1dGlvbicsIHtcbiAgICAgICAgICAgIG9yaWdpbkNvbmZpZ3M6IFt7XG4gICAgICAgICAgICAgICAgYmVoYXZpb3JzOiBbeyBpc0RlZmF1bHRCZWhhdmlvcjogdHJ1ZSB9XSxcbiAgICAgICAgICAgICAgICBjdXN0b21PcmlnaW5Tb3VyY2U6IHtcbiAgICAgICAgICAgICAgICAgICAgZG9tYWluTmFtZTogRm4uc2VsZWN0KDIsIEZuLnNwbGl0KCcvJywgcmVkaXJlY3RCdWNrZXQuYXR0cldlYnNpdGVVcmwpKSxcbiAgICAgICAgICAgICAgICAgICAgb3JpZ2luUHJvdG9jb2xQb2xpY3k6IE9yaWdpblByb3RvY29sUG9saWN5LkhUVFBfT05MWSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICBhbGlhc0NvbmZpZ3VyYXRpb246IHtcbiAgICAgICAgICAgICAgICBhY21DZXJ0UmVmOiBjZXJ0QXJuLFxuICAgICAgICAgICAgICAgIG5hbWVzOiBbcmVkaXJlY3REb21haW5OYW1lXSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb21tZW50OiBgJHtyZWRpcmVjdERvbWFpbk5hbWV9IFJlZGlyZWN0IHRvICR7ZG9tYWluTmFtZX1gLFxuICAgICAgICAgICAgcHJpY2VDbGFzczogUHJpY2VDbGFzcy5QUklDRV9DTEFTU19BTEwsXG4gICAgICAgICAgICB2aWV3ZXJQcm90b2NvbFBvbGljeTogVmlld2VyUHJvdG9jb2xQb2xpY3kuUkVESVJFQ1RfVE9fSFRUUFMsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIG5ldyBBUmVjb3JkKHRoaXMsICdSZWRpcmVjdEFsaWFzUmVjb3JkJywge1xuICAgICAgICAgICAgcmVjb3JkTmFtZTogcmVkaXJlY3REb21haW5OYW1lLFxuICAgICAgICAgICAgem9uZSxcbiAgICAgICAgICAgIHRhcmdldDogUmVjb3JkVGFyZ2V0LmZyb21BbGlhcyhuZXcgQ2xvdWRGcm9udFRhcmdldChyZWRpcmVjdERpc3QpKSxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIl19