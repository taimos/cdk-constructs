import { CloudFrontWebDistribution } from '@aws-cdk/aws-cloudfront';
import { Bucket } from '@aws-cdk/aws-s3';
import { Construct } from '@aws-cdk/core';
export interface SinglePageAppHostingProps {
    /**
     * Name of the HostedZone of the domain
     */
    readonly zoneName: string;
    /**
     * The ARN of the certificate; Has to be in us-east-1
     */
    readonly certArn: string;
    /**
     * ID of the HostedZone of the domain
     *
     * @default - lookup zone from context using the zone name
     */
    readonly zoneId?: string;
    /**
     * local folder with contents for the website bucket
     *
     * @default - no file deployment
     */
    readonly webFolder?: string;
    /**
     * Define if the main domain is with or without www.
     *
     * @default false - Redirect example.com to www.example.com
     */
    readonly redirectToApex?: boolean;
}
export declare class SinglePageAppHosting extends Construct {
    readonly webBucket: Bucket;
    readonly distribution: CloudFrontWebDistribution;
    constructor(scope: Construct, id: string, props: SinglePageAppHostingProps);
}
