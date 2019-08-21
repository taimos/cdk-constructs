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
                distribution: this.distribution,
            });
        }
        new aws_route53_1.ARecord(this, 'AliasRecord', {
            recordName: domainName,
            zone,
            target: aws_route53_1.RecordTarget.fromAlias(new aws_route53_targets_1.CloudFrontTarget(this.distribution)),
        });
        const redirectCertArn = props.certArn || new aws_certificatemanager_1.DnsValidatedCertificate(this, 'RedirectCertificate', {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2luZ2xlLXBhZ2UtYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic2luZ2xlLXBhZ2UtYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNEVBQTBFO0FBQzFFLDREQUErSjtBQUMvSiw4Q0FBMkU7QUFDM0Usc0RBQXlFO0FBQ3pFLHNFQUFnRTtBQUNoRSw0Q0FBb0Q7QUFDcEQsa0VBQXNFO0FBQ3RFLHdDQUFtRDtBQWlDbkQsTUFBYSxvQkFBcUIsU0FBUSxnQkFBUztJQU0vQyxZQUFZLEtBQWlCLEVBQUUsRUFBVyxFQUFFLEtBQWlDO1FBQ3pFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFakIsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDbkYsTUFBTSxrQkFBa0IsR0FBRyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxPQUFPLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQztRQUUzRixNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyx3QkFBVSxDQUFDLHdCQUF3QixDQUFDLElBQUksRUFBRSxZQUFZLEVBQUU7WUFDaEYsWUFBWSxFQUFFLEtBQUssQ0FBQyxNQUFNO1lBQzFCLFFBQVEsRUFBRSxLQUFLLENBQUMsUUFBUTtTQUMzQixDQUFDLENBQUMsQ0FBQyxDQUFDLHdCQUFVLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsRUFBRSxVQUFVLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFFL0UsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sSUFBSSxJQUFJLGdEQUF1QixDQUFDLElBQUksRUFBRSxhQUFhLEVBQUU7WUFD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LFFBQVEsRUFBRSxVQUFVO29CQUNwQixRQUFRLEVBQUUsT0FBTztpQkFDcEI7YUFDSjtTQUNKLENBQUMsQ0FBQztRQUNILE1BQU0sWUFBWSxHQUFHLElBQUksMENBQXlCLENBQUMsSUFBSSxFQUFFLHNCQUFzQixFQUFFO1lBQzdFLGFBQWEsRUFBRSxDQUFDO29CQUNaLFNBQVMsRUFBRSxDQUFDLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLENBQUM7b0JBQ3hDLGtCQUFrQixFQUFFO3dCQUNoQixVQUFVLEVBQUUsU0FBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsU0FBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsY0FBYyxDQUFDLGNBQWMsQ0FBQyxDQUFDO3dCQUN0RSxvQkFBb0IsRUFBRSxxQ0FBb0IsQ0FBQyxTQUFTO3FCQUN2RDtpQkFDSixDQUFDO1lBQ0Ysa0JBQWtCLEVBQUU7Z0JBQ2hCLFVBQVUsRUFBRSxlQUFlO2dCQUMzQixLQUFLLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQzthQUM5QjtZQUNELE9BQU8sRUFBRSxHQUFHLGtCQUFrQixnQkFBZ0IsVUFBVSxFQUFFO1lBQzFELFVBQVUsRUFBRSwyQkFBVSxDQUFDLGVBQWU7WUFDdEMsb0JBQW9CLEVBQUUscUNBQW9CLENBQUMsaUJBQWlCO1NBQy9ELENBQUMsQ0FBQztRQUVILElBQUkscUJBQU8sQ0FBQyxJQUFJLEVBQUUscUJBQXFCLEVBQUU7WUFDckMsVUFBVSxFQUFFLGtCQUFrQjtZQUM5QixJQUFJO1lBQ0osTUFBTSxFQUFFLDBCQUFZLENBQUMsU0FBUyxDQUFDLElBQUksc0NBQWdCLENBQUMsWUFBWSxDQUFDLENBQUM7U0FDckUsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKO0FBL0dELG9EQStHQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERuc1ZhbGlkYXRlZENlcnRpZmljYXRlIH0gZnJvbSAnQGF3cy1jZGsvYXdzLWNlcnRpZmljYXRlbWFuYWdlcic7XG5pbXBvcnQgeyBDZm5DbG91ZEZyb250T3JpZ2luQWNjZXNzSWRlbnRpdHksIENsb3VkRnJvbnRXZWJEaXN0cmlidXRpb24sIE9yaWdpblByb3RvY29sUG9saWN5LCBQcmljZUNsYXNzLCBWaWV3ZXJQcm90b2NvbFBvbGljeSB9IGZyb20gJ0Bhd3MtY2RrL2F3cy1jbG91ZGZyb250JztcbmltcG9ydCB7IENhbm9uaWNhbFVzZXJQcmluY2lwYWwsIFBvbGljeVN0YXRlbWVudCB9IGZyb20gJ0Bhd3MtY2RrL2F3cy1pYW0nO1xuaW1wb3J0IHsgQVJlY29yZCwgSG9zdGVkWm9uZSwgUmVjb3JkVGFyZ2V0IH0gZnJvbSAnQGF3cy1jZGsvYXdzLXJvdXRlNTMnO1xuaW1wb3J0IHsgQ2xvdWRGcm9udFRhcmdldCB9IGZyb20gJ0Bhd3MtY2RrL2F3cy1yb3V0ZTUzLXRhcmdldHMnO1xuaW1wb3J0IHsgQnVja2V0LCBDZm5CdWNrZXQgfSBmcm9tICdAYXdzLWNkay9hd3MtczMnO1xuaW1wb3J0IHsgQnVja2V0RGVwbG95bWVudCwgU291cmNlIH0gZnJvbSAnQGF3cy1jZGsvYXdzLXMzLWRlcGxveW1lbnQnO1xuaW1wb3J0IHsgQXdzLCBDb25zdHJ1Y3QsIEZuIH0gZnJvbSAnQGF3cy1jZGsvY29yZSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2luZ2xlUGFnZUFwcEhvc3RpbmdQcm9wcyB7XG4gICAgLyoqXG4gICAgICogTmFtZSBvZiB0aGUgSG9zdGVkWm9uZSBvZiB0aGUgZG9tYWluXG4gICAgICovXG4gICAgcmVhZG9ubHkgem9uZU5hbWUgOiBzdHJpbmc7XG4gICAgLyoqXG4gICAgICogVGhlIEFSTiBvZiB0aGUgY2VydGlmaWNhdGU7IEhhcyB0byBiZSBpbiB1cy1lYXN0LTFcbiAgICAgKlxuICAgICAqIEBkZWZhdWx0IC0gY3JlYXRlIGEgbmV3IGNlcnRpZmljYXRlIGluIHVzLWVhc3QtMVxuICAgICAqL1xuICAgIHJlYWRvbmx5IGNlcnRBcm4/IDogc3RyaW5nO1xuICAgIC8qKlxuICAgICAqIElEIG9mIHRoZSBIb3N0ZWRab25lIG9mIHRoZSBkb21haW5cbiAgICAgKlxuICAgICAqIEBkZWZhdWx0IC0gbG9va3VwIHpvbmUgZnJvbSBjb250ZXh0IHVzaW5nIHRoZSB6b25lIG5hbWVcbiAgICAgKi9cbiAgICByZWFkb25seSB6b25lSWQ/IDogc3RyaW5nO1xuICAgIC8qKlxuICAgICAqIGxvY2FsIGZvbGRlciB3aXRoIGNvbnRlbnRzIGZvciB0aGUgd2Vic2l0ZSBidWNrZXRcbiAgICAgKlxuICAgICAqIEBkZWZhdWx0IC0gbm8gZmlsZSBkZXBsb3ltZW50XG4gICAgICovXG4gICAgcmVhZG9ubHkgd2ViRm9sZGVyPyA6IHN0cmluZztcbiAgICAvKipcbiAgICAgKiBEZWZpbmUgaWYgdGhlIG1haW4gZG9tYWluIGlzIHdpdGggb3Igd2l0aG91dCB3d3cuXG4gICAgICpcbiAgICAgKiBAZGVmYXVsdCBmYWxzZSAtIFJlZGlyZWN0IGV4YW1wbGUuY29tIHRvIHd3dy5leGFtcGxlLmNvbVxuICAgICAqL1xuICAgIHJlYWRvbmx5IHJlZGlyZWN0VG9BcGV4PyA6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjbGFzcyBTaW5nbGVQYWdlQXBwSG9zdGluZyBleHRlbmRzIENvbnN0cnVjdCB7XG5cbiAgICBwdWJsaWMgcmVhZG9ubHkgd2ViQnVja2V0IDogQnVja2V0O1xuXG4gICAgcHVibGljIHJlYWRvbmx5IGRpc3RyaWJ1dGlvbiA6IENsb3VkRnJvbnRXZWJEaXN0cmlidXRpb247XG5cbiAgICBjb25zdHJ1Y3RvcihzY29wZSA6IENvbnN0cnVjdCwgaWQgOiBzdHJpbmcsIHByb3BzIDogU2luZ2xlUGFnZUFwcEhvc3RpbmdQcm9wcykge1xuICAgICAgICBzdXBlcihzY29wZSwgaWQpO1xuXG4gICAgICAgIGNvbnN0IGRvbWFpbk5hbWUgPSBwcm9wcy5yZWRpcmVjdFRvQXBleCA/IHByb3BzLnpvbmVOYW1lIDogYHd3dy4ke3Byb3BzLnpvbmVOYW1lfWA7XG4gICAgICAgIGNvbnN0IHJlZGlyZWN0RG9tYWluTmFtZSA9IHByb3BzLnJlZGlyZWN0VG9BcGV4ID8gYHd3dy4ke3Byb3BzLnpvbmVOYW1lfWAgOiBwcm9wcy56b25lTmFtZTtcblxuICAgICAgICBjb25zdCB6b25lID0gcHJvcHMuem9uZUlkID8gSG9zdGVkWm9uZS5mcm9tSG9zdGVkWm9uZUF0dHJpYnV0ZXModGhpcywgJ0hvc3RlZFpvbmUnLCB7XG4gICAgICAgICAgICBob3N0ZWRab25lSWQ6IHByb3BzLnpvbmVJZCxcbiAgICAgICAgICAgIHpvbmVOYW1lOiBwcm9wcy56b25lTmFtZSxcbiAgICAgICAgfSkgOiBIb3N0ZWRab25lLmZyb21Mb29rdXAodGhpcywgJ0hvc3RlZFpvbmUnLCB7IGRvbWFpbk5hbWU6IHByb3BzLnpvbmVOYW1lIH0pO1xuXG4gICAgICAgIGNvbnN0IGNlcnRBcm4gPSBwcm9wcy5jZXJ0QXJuIHx8IG5ldyBEbnNWYWxpZGF0ZWRDZXJ0aWZpY2F0ZSh0aGlzLCAnQ2VydGlmaWNhdGUnLCB7XG4gICAgICAgICAgICBob3N0ZWRab25lOiB6b25lLFxuICAgICAgICAgICAgZG9tYWluTmFtZSxcbiAgICAgICAgICAgIHJlZ2lvbjogJ3VzLWVhc3QtMScsXG4gICAgICAgIH0pLmNlcnRpZmljYXRlQXJuO1xuXG4gICAgICAgIGNvbnN0IG9haSA9IG5ldyBDZm5DbG91ZEZyb250T3JpZ2luQWNjZXNzSWRlbnRpdHkodGhpcywgJ09BSScsIHtcbiAgICAgICAgICAgIGNsb3VkRnJvbnRPcmlnaW5BY2Nlc3NJZGVudGl0eUNvbmZpZzogeyBjb21tZW50OiBBd3MuU1RBQ0tfTkFNRSB9LFxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLndlYkJ1Y2tldCA9IG5ldyBCdWNrZXQodGhpcywgJ1dlYkJ1Y2tldCcsIHsgd2Vic2l0ZUluZGV4RG9jdW1lbnQ6ICdpbmRleC5odG1sJyB9KTtcbiAgICAgICAgdGhpcy53ZWJCdWNrZXQuYWRkVG9SZXNvdXJjZVBvbGljeShuZXcgUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgICAgIGFjdGlvbnM6IFsnczM6R2V0T2JqZWN0J10sXG4gICAgICAgICAgICByZXNvdXJjZXM6IFt0aGlzLndlYkJ1Y2tldC5hcm5Gb3JPYmplY3RzKCcqJyldLFxuICAgICAgICAgICAgcHJpbmNpcGFsczogW25ldyBDYW5vbmljYWxVc2VyUHJpbmNpcGFsKG9haS5hdHRyUzNDYW5vbmljYWxVc2VySWQpXSxcbiAgICAgICAgfSkpO1xuXG4gICAgICAgIHRoaXMuZGlzdHJpYnV0aW9uID0gbmV3IENsb3VkRnJvbnRXZWJEaXN0cmlidXRpb24odGhpcywgJ0Rpc3RyaWJ1dGlvbicsIHtcbiAgICAgICAgICAgIG9yaWdpbkNvbmZpZ3M6IFt7XG4gICAgICAgICAgICAgICAgYmVoYXZpb3JzOiBbeyBpc0RlZmF1bHRCZWhhdmlvcjogdHJ1ZSB9XSxcbiAgICAgICAgICAgICAgICBzM09yaWdpblNvdXJjZToge1xuICAgICAgICAgICAgICAgICAgICBzM0J1Y2tldFNvdXJjZTogdGhpcy53ZWJCdWNrZXQsXG4gICAgICAgICAgICAgICAgICAgIG9yaWdpbkFjY2Vzc0lkZW50aXR5SWQ6IG9haS5yZWYsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH1dLFxuICAgICAgICAgICAgYWxpYXNDb25maWd1cmF0aW9uOiB7XG4gICAgICAgICAgICAgICAgYWNtQ2VydFJlZjogY2VydEFybixcbiAgICAgICAgICAgICAgICBuYW1lczogW2RvbWFpbk5hbWVdLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVycm9yQ29uZmlndXJhdGlvbnM6IFt7XG4gICAgICAgICAgICAgICAgZXJyb3JDb2RlOiA0MDMsXG4gICAgICAgICAgICAgICAgcmVzcG9uc2VDb2RlOiAyMDAsXG4gICAgICAgICAgICAgICAgcmVzcG9uc2VQYWdlUGF0aDogJy9pbmRleC5odG1sJyxcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBlcnJvckNvZGU6IDQwNCxcbiAgICAgICAgICAgICAgICByZXNwb25zZUNvZGU6IDIwMCxcbiAgICAgICAgICAgICAgICByZXNwb25zZVBhZ2VQYXRoOiAnL2luZGV4Lmh0bWwnLFxuICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICBjb21tZW50OiBgJHtkb21haW5OYW1lfSBXZWJzaXRlYCxcbiAgICAgICAgICAgIHByaWNlQ2xhc3M6IFByaWNlQ2xhc3MuUFJJQ0VfQ0xBU1NfQUxMLFxuICAgICAgICAgICAgdmlld2VyUHJvdG9jb2xQb2xpY3k6IFZpZXdlclByb3RvY29sUG9saWN5LlJFRElSRUNUX1RPX0hUVFBTLFxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAocHJvcHMud2ViRm9sZGVyKSB7XG4gICAgICAgICAgICBuZXcgQnVja2V0RGVwbG95bWVudCh0aGlzLCAnRGVwbG95V2Vic2l0ZScsIHtcbiAgICAgICAgICAgICAgICBzb3VyY2U6IFNvdXJjZS5hc3NldChwcm9wcy53ZWJGb2xkZXIpLFxuICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uQnVja2V0OiB0aGlzLndlYkJ1Y2tldCxcbiAgICAgICAgICAgICAgICBkaXN0cmlidXRpb246IHRoaXMuZGlzdHJpYnV0aW9uLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBuZXcgQVJlY29yZCh0aGlzLCAnQWxpYXNSZWNvcmQnLCB7XG4gICAgICAgICAgICByZWNvcmROYW1lOiBkb21haW5OYW1lLFxuICAgICAgICAgICAgem9uZSxcbiAgICAgICAgICAgIHRhcmdldDogUmVjb3JkVGFyZ2V0LmZyb21BbGlhcyhuZXcgQ2xvdWRGcm9udFRhcmdldCh0aGlzLmRpc3RyaWJ1dGlvbikpLFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCByZWRpcmVjdENlcnRBcm4gPSBwcm9wcy5jZXJ0QXJuIHx8IG5ldyBEbnNWYWxpZGF0ZWRDZXJ0aWZpY2F0ZSh0aGlzLCAnUmVkaXJlY3RDZXJ0aWZpY2F0ZScsIHtcbiAgICAgICAgICAgIGhvc3RlZFpvbmU6IHpvbmUsXG4gICAgICAgICAgICBkb21haW5OYW1lOiByZWRpcmVjdERvbWFpbk5hbWUsXG4gICAgICAgICAgICByZWdpb246ICd1cy1lYXN0LTEnLFxuICAgICAgICB9KS5jZXJ0aWZpY2F0ZUFybjtcblxuICAgICAgICBjb25zdCByZWRpcmVjdEJ1Y2tldCA9IG5ldyBDZm5CdWNrZXQodGhpcywgJ1JlZGlyZWN0QnVja2V0Jywge1xuICAgICAgICAgICAgd2Vic2l0ZUNvbmZpZ3VyYXRpb246IHtcbiAgICAgICAgICAgICAgICByZWRpcmVjdEFsbFJlcXVlc3RzVG86IHtcbiAgICAgICAgICAgICAgICAgICAgaG9zdE5hbWU6IGRvbWFpbk5hbWUsXG4gICAgICAgICAgICAgICAgICAgIHByb3RvY29sOiAnaHR0cHMnLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgcmVkaXJlY3REaXN0ID0gbmV3IENsb3VkRnJvbnRXZWJEaXN0cmlidXRpb24odGhpcywgJ1JlZGlyZWN0RGlzdHJpYnV0aW9uJywge1xuICAgICAgICAgICAgb3JpZ2luQ29uZmlnczogW3tcbiAgICAgICAgICAgICAgICBiZWhhdmlvcnM6IFt7IGlzRGVmYXVsdEJlaGF2aW9yOiB0cnVlIH1dLFxuICAgICAgICAgICAgICAgIGN1c3RvbU9yaWdpblNvdXJjZToge1xuICAgICAgICAgICAgICAgICAgICBkb21haW5OYW1lOiBGbi5zZWxlY3QoMiwgRm4uc3BsaXQoJy8nLCByZWRpcmVjdEJ1Y2tldC5hdHRyV2Vic2l0ZVVybCkpLFxuICAgICAgICAgICAgICAgICAgICBvcmlnaW5Qcm90b2NvbFBvbGljeTogT3JpZ2luUHJvdG9jb2xQb2xpY3kuSFRUUF9PTkxZLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9XSxcbiAgICAgICAgICAgIGFsaWFzQ29uZmlndXJhdGlvbjoge1xuICAgICAgICAgICAgICAgIGFjbUNlcnRSZWY6IHJlZGlyZWN0Q2VydEFybixcbiAgICAgICAgICAgICAgICBuYW1lczogW3JlZGlyZWN0RG9tYWluTmFtZV0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY29tbWVudDogYCR7cmVkaXJlY3REb21haW5OYW1lfSBSZWRpcmVjdCB0byAke2RvbWFpbk5hbWV9YCxcbiAgICAgICAgICAgIHByaWNlQ2xhc3M6IFByaWNlQ2xhc3MuUFJJQ0VfQ0xBU1NfQUxMLFxuICAgICAgICAgICAgdmlld2VyUHJvdG9jb2xQb2xpY3k6IFZpZXdlclByb3RvY29sUG9saWN5LlJFRElSRUNUX1RPX0hUVFBTLFxuICAgICAgICB9KTtcblxuICAgICAgICBuZXcgQVJlY29yZCh0aGlzLCAnUmVkaXJlY3RBbGlhc1JlY29yZCcsIHtcbiAgICAgICAgICAgIHJlY29yZE5hbWU6IHJlZGlyZWN0RG9tYWluTmFtZSxcbiAgICAgICAgICAgIHpvbmUsXG4gICAgICAgICAgICB0YXJnZXQ6IFJlY29yZFRhcmdldC5mcm9tQWxpYXMobmV3IENsb3VkRnJvbnRUYXJnZXQocmVkaXJlY3REaXN0KSksXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiJdfQ==