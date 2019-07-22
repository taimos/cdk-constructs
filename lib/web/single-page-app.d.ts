import { CloudFrontWebDistribution } from '@aws-cdk/aws-cloudfront';
import { Bucket } from '@aws-cdk/aws-s3';
import { Construct } from '@aws-cdk/core';
export interface SinglePageAppHostingProps {
    readonly certArn: string;
    readonly zoneId: string;
    readonly zoneName: string;
    readonly webFolder?: string;
}
export declare class SinglePageAppHosting extends Construct {
    readonly webBucket: Bucket;
    readonly distribution: CloudFrontWebDistribution;
    constructor(scope: Construct, id: string, props: SinglePageAppHostingProps);
}
