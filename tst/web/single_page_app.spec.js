"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("@aws-cdk/assert");
const core_1 = require("@aws-cdk/core");
const lib_1 = require("../../lib");
describe('Alexa Skill generation', () => {
    it('should be valid', () => {
        const stack = new core_1.Stack();
        new lib_1.SinglePageAppHosting(stack, 'SPA', {
            certArn: 'arn:aws:acm:123456789012:eu-central-1/certificate/foobar',
            zoneId: '1234567890',
            zoneName: 'example.net',
        });
        assert_1.expect(stack).to(assert_1.haveResource('AWS::CloudFront::Distribution'));
        // console.log(JSON.stringify(SynthUtils.toCloudFormation(stack, {}), null, 2));
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2luZ2xlX3BhZ2VfYXBwLnNwZWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzaW5nbGVfcGFnZV9hcHAuc3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDRDQUF1RDtBQUN2RCx3Q0FBc0M7QUFDdEMsbUNBQWlEO0FBRWpELFFBQVEsQ0FBQyx3QkFBd0IsRUFBRSxHQUFHLEVBQUU7SUFFcEMsRUFBRSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsRUFBRTtRQUN2QixNQUFNLEtBQUssR0FBRyxJQUFJLFlBQUssRUFBRSxDQUFDO1FBQzFCLElBQUksMEJBQW9CLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRTtZQUNuQyxPQUFPLEVBQUUsMERBQTBEO1lBQ25FLE1BQU0sRUFBRSxZQUFZO1lBQ3BCLFFBQVEsRUFBRSxhQUFhO1NBQzFCLENBQUMsQ0FBQztRQUVILGVBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMscUJBQVksQ0FBQywrQkFBK0IsQ0FBQyxDQUFDLENBQUM7UUFDaEUsZ0ZBQWdGO0lBQ3BGLENBQUMsQ0FBQyxDQUFDO0FBRVAsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBleHBlY3QsIGhhdmVSZXNvdXJjZSB9IGZyb20gJ0Bhd3MtY2RrL2Fzc2VydCc7XG5pbXBvcnQgeyBTdGFjayB9IGZyb20gJ0Bhd3MtY2RrL2NvcmUnO1xuaW1wb3J0IHsgU2luZ2xlUGFnZUFwcEhvc3RpbmcgfSBmcm9tICcuLi8uLi9saWInO1xuXG5kZXNjcmliZSgnQWxleGEgU2tpbGwgZ2VuZXJhdGlvbicsICgpID0+IHtcblxuICAgIGl0KCdzaG91bGQgYmUgdmFsaWQnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0YWNrID0gbmV3IFN0YWNrKCk7XG4gICAgICAgIG5ldyBTaW5nbGVQYWdlQXBwSG9zdGluZyhzdGFjaywgJ1NQQScsIHtcbiAgICAgICAgICAgIGNlcnRBcm46ICdhcm46YXdzOmFjbToxMjM0NTY3ODkwMTI6ZXUtY2VudHJhbC0xL2NlcnRpZmljYXRlL2Zvb2JhcicsXG4gICAgICAgICAgICB6b25lSWQ6ICcxMjM0NTY3ODkwJyxcbiAgICAgICAgICAgIHpvbmVOYW1lOiAnZXhhbXBsZS5uZXQnLFxuICAgICAgICB9KTtcblxuICAgICAgICBleHBlY3Qoc3RhY2spLnRvKGhhdmVSZXNvdXJjZSgnQVdTOjpDbG91ZEZyb250OjpEaXN0cmlidXRpb24nKSk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KFN5bnRoVXRpbHMudG9DbG91ZEZvcm1hdGlvbihzdGFjaywge30pLCBudWxsLCAyKSk7XG4gICAgfSk7XG5cbn0pO1xuIl19