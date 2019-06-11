import { expect, haveResource, SynthUtils } from '@aws-cdk/assert';
import { App, Stack } from '@aws-cdk/cdk';
import { SinglePageAppHosting } from '../../lib';

describe('Alexa Skill generation', () => {

    it('should be valid', () => {
        const stack = new Stack();
        new SinglePageAppHosting(stack, 'SPA', {
            certArn: 'arn:aws:acm:123456789012:eu-central-1/certificate/foobar',
            zoneId: '1234567890',
            zoneName: 'example.net',
        });

        expect(stack).to(haveResource('AWS::CloudFront::Distribution'));
        console.log(JSON.stringify(SynthUtils.toCloudFormation(stack, {}), null, 2));
    });

});
