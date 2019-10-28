import { expect, haveResource } from '@aws-cdk/assert';
import { Stack } from '@aws-cdk/core';
import { SinglePageAppHosting } from '../../lib';

describe('Single Page App Hosting', () => {

    it('should be valid', () => {
        const stack = new Stack();
        new SinglePageAppHosting(stack, 'SPA', {
            certArn: 'arn:aws:acm:us-east-1:123456789012:certificate/foobar',
            zoneId: '1234567890',
            zoneName: 'example.net',
        });

        expect(stack).to(haveResource('AWS::CloudFront::Distribution'));
        // console.log(JSON.stringify(SynthUtils.toCloudFormation(stack, {}), null, 2));
    });

    it('should be auto generate certificates', () => {
        const stack = new Stack();
        new SinglePageAppHosting(stack, 'SPA', {
            zoneId: '1234567890',
            zoneName: 'example.net',
        });

        expect(stack).to(haveResource('AWS::CloudFront::Distribution'));
        // console.log(JSON.stringify(SynthUtils.toCloudFormation(stack, {}), null, 2));
    });

});
