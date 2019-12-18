import { Certificate, DnsValidatedCertificate } from '@aws-cdk/aws-certificatemanager';
import { CloudFrontWebDistribution, OriginAccessIdentity, PriceClass, ViewerCertificate, ViewerProtocolPolicy } from '@aws-cdk/aws-cloudfront';
import { ARecord, HostedZone, RecordTarget } from '@aws-cdk/aws-route53';
import { HttpsRedirect } from '@aws-cdk/aws-route53-patterns';
import { CloudFrontTarget } from '@aws-cdk/aws-route53-targets';
import { Bucket } from '@aws-cdk/aws-s3';
import { BucketDeployment, Source } from '@aws-cdk/aws-s3-deployment';
import { Aws, Construct } from '@aws-cdk/core';

export interface SinglePageAppHostingProps {
    /**
     * Name of the HostedZone of the domain
     */
    readonly zoneName : string;
    /**
     * The ARN of the certificate; Has to be in us-east-1
     *
     * @default - create a new certificate in us-east-1
     */
    readonly certArn? : string;
    /**
     * ID of the HostedZone of the domain
     *
     * @default - lookup zone from context using the zone name
     */
    readonly zoneId? : string;
    /**
     * local folder with contents for the website bucket
     *
     * @default - no file deployment
     */
    readonly webFolder? : string;
    /**
     * Define if the main domain is with or without www.
     *
     * @default false - Redirect example.com to www.example.com
     */
    readonly redirectToApex? : boolean;
}

export class SinglePageAppHosting extends Construct {

    public readonly webBucket : Bucket;

    public readonly distribution : CloudFrontWebDistribution;

    constructor(scope : Construct, id : string, props : SinglePageAppHostingProps) {
        super(scope, id);

        const domainName = props.redirectToApex ? props.zoneName : `www.${props.zoneName}`;
        const redirectDomainName = props.redirectToApex ? `www.${props.zoneName}` : props.zoneName;

        const zone = props.zoneId ? HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
            hostedZoneId: props.zoneId,
            zoneName: props.zoneName,
        }) : HostedZone.fromLookup(this, 'HostedZone', { domainName: props.zoneName });

        const cert = props.certArn ?
            Certificate.fromCertificateArn(this, 'Certificate', props.certArn) :
            new DnsValidatedCertificate(this, 'Certificate', {
                hostedZone: zone,
                domainName,
                region: 'us-east-1',
            });

        const originAccessIdentity = new OriginAccessIdentity(this, 'OAI', { comment: Aws.STACK_NAME });
        this.webBucket = new Bucket(this, 'WebBucket', { websiteIndexDocument: 'index.html' });
        this.webBucket.grantRead(originAccessIdentity);

        this.distribution = new CloudFrontWebDistribution(this, 'Distribution', {
            originConfigs: [{
                behaviors: [{ isDefaultBehavior: true }],
                s3OriginSource: {
                    s3BucketSource: this.webBucket,
                    originAccessIdentity,
                },
            }],
            viewerCertificate: ViewerCertificate.fromAcmCertificate(cert, {
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
            priceClass: PriceClass.PRICE_CLASS_ALL,
            viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        });

        if (props.webFolder) {
            new BucketDeployment(this, 'DeployWebsite', {
                sources: [Source.asset(props.webFolder)],
                destinationBucket: this.webBucket,
                distribution: this.distribution,
            });
        }

        new ARecord(this, 'AliasRecord', {
            recordName: domainName,
            zone,
            target: RecordTarget.fromAlias(new CloudFrontTarget(this.distribution)),
        });

        new HttpsRedirect(this, 'Redirect', {
            zone,
            recordNames: [redirectDomainName],
            targetDomain: domainName,
        });
    }
}
