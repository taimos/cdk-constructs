"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("@aws-cdk/assert");
const core_1 = require("@aws-cdk/core");
const lib_1 = require("../../lib");
describe('Single Page App Hosting', () => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2luZ2xlLXBhZ2UtYXBwLnNwZWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzaW5nbGUtcGFnZS1hcHAuc3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDRDQUF1RDtBQUN2RCx3Q0FBc0M7QUFDdEMsbUNBQWlEO0FBRWpELFFBQVEsQ0FBQyx5QkFBeUIsRUFBRSxHQUFHLEVBQUU7SUFFckMsRUFBRSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsRUFBRTtRQUN2QixNQUFNLEtBQUssR0FBRyxJQUFJLFlBQUssRUFBRSxDQUFDO1FBQzFCLElBQUksMEJBQW9CLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRTtZQUNuQyxPQUFPLEVBQUUsMERBQTBEO1lBQ25FLE1BQU0sRUFBRSxZQUFZO1lBQ3BCLFFBQVEsRUFBRSxhQUFhO1NBQzFCLENBQUMsQ0FBQztRQUVILGVBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMscUJBQVksQ0FBQywrQkFBK0IsQ0FBQyxDQUFDLENBQUM7UUFDaEUsZ0ZBQWdGO0lBQ3BGLENBQUMsQ0FBQyxDQUFDO0FBRVAsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBleHBlY3QsIGhhdmVSZXNvdXJjZSB9IGZyb20gJ0Bhd3MtY2RrL2Fzc2VydCc7XG5pbXBvcnQgeyBTdGFjayB9IGZyb20gJ0Bhd3MtY2RrL2NvcmUnO1xuaW1wb3J0IHsgU2luZ2xlUGFnZUFwcEhvc3RpbmcgfSBmcm9tICcuLi8uLi9saWInO1xuXG5kZXNjcmliZSgnU2luZ2xlIFBhZ2UgQXBwIEhvc3RpbmcnLCAoKSA9PiB7XG5cbiAgICBpdCgnc2hvdWxkIGJlIHZhbGlkJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBzdGFjayA9IG5ldyBTdGFjaygpO1xuICAgICAgICBuZXcgU2luZ2xlUGFnZUFwcEhvc3Rpbmcoc3RhY2ssICdTUEEnLCB7XG4gICAgICAgICAgICBjZXJ0QXJuOiAnYXJuOmF3czphY206MTIzNDU2Nzg5MDEyOmV1LWNlbnRyYWwtMS9jZXJ0aWZpY2F0ZS9mb29iYXInLFxuICAgICAgICAgICAgem9uZUlkOiAnMTIzNDU2Nzg5MCcsXG4gICAgICAgICAgICB6b25lTmFtZTogJ2V4YW1wbGUubmV0JyxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZXhwZWN0KHN0YWNrKS50byhoYXZlUmVzb3VyY2UoJ0FXUzo6Q2xvdWRGcm9udDo6RGlzdHJpYnV0aW9uJykpO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShTeW50aFV0aWxzLnRvQ2xvdWRGb3JtYXRpb24oc3RhY2ssIHt9KSwgbnVsbCwgMikpO1xuICAgIH0pO1xuXG59KTtcbiJdfQ==