"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("@aws-cdk/assert");
const aws_events_1 = require("@aws-cdk/aws-events");
const aws_lambda_1 = require("@aws-cdk/aws-lambda");
const core_1 = require("@aws-cdk/core");
const lib_1 = require("../../lib");
describe('Scheduled Lambda Function', () => {
    it('should be valid', () => {
        const stack = new core_1.Stack();
        new lib_1.ScheduledLambda(stack, 'Function', {
            code: aws_lambda_1.Code.inline('def handler(event, context):\n  print(event)'),
            runtime: aws_lambda_1.Runtime.PYTHON_3_7,
            handler: 'index.handler',
            schedule: aws_events_1.Schedule.rate(core_1.Duration.minutes(5)),
        });
        assert_1.expect(stack).to(assert_1.haveResource('AWS::Lambda::Function'));
        console.log(JSON.stringify(assert_1.SynthUtils.toCloudFormation(stack, {}), null, 2));
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NoZWR1bGVkLWxhbWJkYS5zcGVjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic2NoZWR1bGVkLWxhbWJkYS5zcGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNENBQW1FO0FBQ25FLG9EQUErQztBQUMvQyxvREFBb0Q7QUFDcEQsd0NBQWdEO0FBQ2hELG1DQUE0QztBQUU1QyxRQUFRLENBQUMsMkJBQTJCLEVBQUUsR0FBRyxFQUFFO0lBRXZDLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLEVBQUU7UUFDdkIsTUFBTSxLQUFLLEdBQUcsSUFBSSxZQUFLLEVBQUUsQ0FBQztRQUMxQixJQUFJLHFCQUFlLENBQUMsS0FBSyxFQUFFLFVBQVUsRUFBRTtZQUNuQyxJQUFJLEVBQUUsaUJBQUksQ0FBQyxNQUFNLENBQUMsOENBQThDLENBQUM7WUFDakUsT0FBTyxFQUFFLG9CQUFPLENBQUMsVUFBVTtZQUMzQixPQUFPLEVBQUUsZUFBZTtZQUN4QixRQUFRLEVBQUUscUJBQVEsQ0FBQyxJQUFJLENBQUMsZUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUMvQyxDQUFDLENBQUM7UUFFSCxlQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLHFCQUFZLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDO1FBQ3hELE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBVSxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNqRixDQUFDLENBQUMsQ0FBQztBQUVQLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZXhwZWN0LCBoYXZlUmVzb3VyY2UsIFN5bnRoVXRpbHMgfSBmcm9tICdAYXdzLWNkay9hc3NlcnQnO1xuaW1wb3J0IHsgU2NoZWR1bGUgfSBmcm9tICdAYXdzLWNkay9hd3MtZXZlbnRzJztcbmltcG9ydCB7IENvZGUsIFJ1bnRpbWUgfSBmcm9tICdAYXdzLWNkay9hd3MtbGFtYmRhJztcbmltcG9ydCB7IER1cmF0aW9uLCBTdGFjayB9IGZyb20gJ0Bhd3MtY2RrL2NvcmUnO1xuaW1wb3J0IHsgU2NoZWR1bGVkTGFtYmRhIH0gZnJvbSAnLi4vLi4vbGliJztcblxuZGVzY3JpYmUoJ1NjaGVkdWxlZCBMYW1iZGEgRnVuY3Rpb24nLCAoKSA9PiB7XG5cbiAgICBpdCgnc2hvdWxkIGJlIHZhbGlkJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBzdGFjayA9IG5ldyBTdGFjaygpO1xuICAgICAgICBuZXcgU2NoZWR1bGVkTGFtYmRhKHN0YWNrLCAnRnVuY3Rpb24nLCB7XG4gICAgICAgICAgICBjb2RlOiBDb2RlLmlubGluZSgnZGVmIGhhbmRsZXIoZXZlbnQsIGNvbnRleHQpOlxcbiAgcHJpbnQoZXZlbnQpJyksXG4gICAgICAgICAgICBydW50aW1lOiBSdW50aW1lLlBZVEhPTl8zXzcsXG4gICAgICAgICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICAgICAgICBzY2hlZHVsZTogU2NoZWR1bGUucmF0ZShEdXJhdGlvbi5taW51dGVzKDUpKSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZXhwZWN0KHN0YWNrKS50byhoYXZlUmVzb3VyY2UoJ0FXUzo6TGFtYmRhOjpGdW5jdGlvbicpKTtcbiAgICAgICAgY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkoU3ludGhVdGlscy50b0Nsb3VkRm9ybWF0aW9uKHN0YWNrLCB7fSksIG51bGwsIDIpKTtcbiAgICB9KTtcblxufSk7XG4iXX0=