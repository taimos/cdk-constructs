"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_events_1 = require("@aws-cdk/aws-events");
const aws_events_targets_1 = require("@aws-cdk/aws-events-targets");
const aws_lambda_1 = require("@aws-cdk/aws-lambda");
class ScheduledLambda extends aws_lambda_1.Function {
    constructor(scope, id, props) {
        super(scope, id, props);
        new aws_events_1.Rule(this, 'Rule', {
            description: 'Rule to trigger scheduled lambda function',
            schedule: props.schedule,
            targets: [
                new aws_events_targets_1.LambdaFunction(this, { event: props.input }),
            ],
        });
    }
}
exports.ScheduledLambda = ScheduledLambda;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NoZWR1bGVkLWxhbWJkYS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9zZXJ2ZXJsZXNzL3NjaGVkdWxlZC1sYW1iZGEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxvREFBc0U7QUFDdEUsb0VBQTZEO0FBQzdELG9EQUE4RDtBQXFCOUQsTUFBYSxlQUFnQixTQUFRLHFCQUFRO0lBRXpDLFlBQVksS0FBaUIsRUFBRSxFQUFXLEVBQUUsS0FBNEI7UUFDcEUsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsSUFBSSxpQkFBSSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUU7WUFDbkIsV0FBVyxFQUFFLDJDQUEyQztZQUN4RCxRQUFRLEVBQUUsS0FBSyxDQUFDLFFBQVE7WUFDeEIsT0FBTyxFQUFFO2dCQUNMLElBQUksbUNBQWMsQ0FBQyxJQUFJLEVBQUUsRUFBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFBQyxDQUFDO2FBQ2pEO1NBQ0osQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUVKO0FBZEQsMENBY0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBSdWxlLCBSdWxlVGFyZ2V0SW5wdXQsIFNjaGVkdWxlIH0gZnJvbSAnQGF3cy1jZGsvYXdzLWV2ZW50cyc7XG5pbXBvcnQgeyBMYW1iZGFGdW5jdGlvbiB9IGZyb20gJ0Bhd3MtY2RrL2F3cy1ldmVudHMtdGFyZ2V0cyc7XG5pbXBvcnQgeyBGdW5jdGlvbiwgRnVuY3Rpb25Qcm9wcyB9IGZyb20gJ0Bhd3MtY2RrL2F3cy1sYW1iZGEnO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnQGF3cy1jZGsvY29yZSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2NoZWR1bGVkTGFtYmRhUHJvcHMgZXh0ZW5kcyBGdW5jdGlvblByb3BzIHtcbiAgICAvKipcbiAgICAgKiBUaGUgc2NoZWR1bGUgb3IgcmF0ZSAoZnJlcXVlbmN5KSB0aGF0IGRldGVybWluZXMgd2hlbiBDbG91ZFdhdGNoIEV2ZW50c1xuICAgICAqIHRyaWdnZXJzIHRoZSBMYW1iZGEgZnVuY3Rpb24uIEZvciBtb3JlIGluZm9ybWF0aW9uLCBzZWUgU2NoZWR1bGUgRXhwcmVzc2lvbiBTeW50YXggZm9yXG4gICAgICogUnVsZXMgaW4gdGhlIEFtYXpvbiBDbG91ZFdhdGNoIFVzZXIgR3VpZGUuXG4gICAgICpcbiAgICAgKiBAc2VlIGh0dHA6Ly9kb2NzLmF3cy5hbWF6b24uY29tL0FtYXpvbkNsb3VkV2F0Y2gvbGF0ZXN0L2V2ZW50cy9TY2hlZHVsZWRFdmVudHMuaHRtbFxuICAgICAqL1xuICAgIHJlYWRvbmx5IHNjaGVkdWxlIDogU2NoZWR1bGU7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgaW5wdXQgdG8gc2VuZCB0byB0aGUgbGFtYmRhXG4gICAgICpcbiAgICAgKiBAZGVmYXVsdCAtIHVzZSB0aGUgQ2xvdWRXYXRjaCBFdmVudFxuICAgICAqL1xuICAgIHJlYWRvbmx5IGlucHV0PyA6IFJ1bGVUYXJnZXRJbnB1dDtcbn1cblxuZXhwb3J0IGNsYXNzIFNjaGVkdWxlZExhbWJkYSBleHRlbmRzIEZ1bmN0aW9uIHtcblxuICAgIGNvbnN0cnVjdG9yKHNjb3BlIDogQ29uc3RydWN0LCBpZCA6IHN0cmluZywgcHJvcHMgOiBTY2hlZHVsZWRMYW1iZGFQcm9wcykge1xuICAgICAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgICAgICBuZXcgUnVsZSh0aGlzLCAnUnVsZScsIHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUnVsZSB0byB0cmlnZ2VyIHNjaGVkdWxlZCBsYW1iZGEgZnVuY3Rpb24nLFxuICAgICAgICAgICAgc2NoZWR1bGU6IHByb3BzLnNjaGVkdWxlLFxuICAgICAgICAgICAgdGFyZ2V0czogW1xuICAgICAgICAgICAgICAgIG5ldyBMYW1iZGFGdW5jdGlvbih0aGlzLCB7ZXZlbnQ6IHByb3BzLmlucHV0fSksXG4gICAgICAgICAgICBdLFxuICAgICAgICB9KTtcbiAgICB9XG5cbn1cbiJdfQ==