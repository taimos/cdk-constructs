import { Rule, RuleTargetInput, Schedule } from '@aws-cdk/aws-events';
import { LambdaFunction } from '@aws-cdk/aws-events-targets';
import { Function, FunctionProps } from '@aws-cdk/aws-lambda';
import { Construct } from '@aws-cdk/core';

export interface ScheduledLambdaProps extends FunctionProps {
    /**
     * The schedule or rate (frequency) that determines when CloudWatch Events
     * triggers the Lambda function. For more information, see Schedule Expression Syntax for
     * Rules in the Amazon CloudWatch User Guide.
     *
     * @see http://docs.aws.amazon.com/AmazonCloudWatch/latest/events/ScheduledEvents.html
     */
    readonly schedule : Schedule;

    /**
     * The input to send to the lambda
     *
     * @default - use the CloudWatch Event
     */
    readonly input? : RuleTargetInput;
}

export class ScheduledLambda extends Function {

    constructor(scope : Construct, id : string, props : ScheduledLambdaProps) {
        super(scope, id, props);

        new Rule(this, 'Rule', {
            description: 'Rule to trigger scheduled lambda function',
            schedule: props.schedule,
            targets: [
                new LambdaFunction(this, {event: props.input}),
            ],
        });
    }

}
