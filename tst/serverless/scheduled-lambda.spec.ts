import { expect, haveResource, SynthUtils } from '@aws-cdk/assert';
import { Schedule } from '@aws-cdk/aws-events';
import { Code, Runtime } from '@aws-cdk/aws-lambda';
import { Duration, Stack } from '@aws-cdk/core';
import { ScheduledLambda } from '../../lib';

describe('Scheduled Lambda Function', () => {

    it('should be valid', () => {
        const stack = new Stack();
        new ScheduledLambda(stack, 'Function', {
            code: Code.inline('def handler(event, context):\n  print(event)'),
            runtime: Runtime.PYTHON_3_7,
            handler: 'index.handler',
            schedule: Schedule.rate(Duration.minutes(5)),
        });

        expect(stack).to(haveResource('AWS::Lambda::Function'));
        console.log(JSON.stringify(SynthUtils.toCloudFormation(stack, {}), null, 2));
    });

});
