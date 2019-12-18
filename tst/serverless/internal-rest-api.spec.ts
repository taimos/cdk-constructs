import { expect } from '@aws-cdk/assert';
import { MethodLoggingLevel } from '@aws-cdk/aws-apigateway';
import { Vpc } from '@aws-cdk/aws-ec2';
import { HostedZone } from '@aws-cdk/aws-route53';
import { Stack, Tag } from '@aws-cdk/core';
import { readFileSync } from 'fs';
import { join } from 'path';
import { InternalRestApi } from '../../lib';

describe('Internal REST API', () => {

    it('should be valid', () => {
        const stack = new Stack();
        const vpc = new Vpc(stack, 'VPC');
        Tag.remove(vpc, 'Name', { includeResourceTypes: ['AWS::EC2::EIP'] });

        const api = new InternalRestApi(stack, 'RestApi', {
            vpc,
            hostedZone: new HostedZone(stack, 'HostedZone', { zoneName: 'example.com' }),
            domainName: 'api.example.com',
        });
        api.api.root.resourceForPath('/foo/bar').addMethod('GET');

        expect(stack).toMatch(JSON.parse(readFileSync(join(__dirname, 'internal-rest-api.fixture.json')).toString('utf-8')));
        // writeFileSync('tst/serverless/internal-rest-api.fixture.json', JSON.stringify(SynthUtils.toCloudFormation(stack, {}), null, 2));
    });

    it('should be working with custom api options', () => {
        const stack = new Stack();
        const vpc = new Vpc(stack, 'VPC');
        Tag.remove(vpc, 'Name', { includeResourceTypes: ['AWS::EC2::EIP'] });

        const api = new InternalRestApi(stack, 'RestApi', {
            vpc,
            hostedZone: new HostedZone(stack, 'HostedZone', { zoneName: 'example.com' }),
            domainName: 'api.example.com',
            apiProps: {
                deployOptions: {
                    loggingLevel: MethodLoggingLevel.INFO,
                    tracingEnabled: true,
                },
            },
        });
        api.api.root.resourceForPath('/foo/bar').addMethod('GET');

        expect(stack).toMatch(JSON.parse(readFileSync(join(__dirname, 'internal-rest-api.fixture2.json')).toString('utf-8')));
        // writeFileSync('tst/serverless/internal-rest-api.fixture2.json', JSON.stringify(SynthUtils.toCloudFormation(stack, {}), null, 2));
    });

});
