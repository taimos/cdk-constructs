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
    it('should be auto generate certificates', () => {
        const stack = new core_1.Stack();
        new lib_1.SinglePageAppHosting(stack, 'SPA', {
            zoneId: '1234567890',
            zoneName: 'example.net',
        });
        assert_1.expect(stack).to(assert_1.haveResource('AWS::CloudFront::Distribution'));
        // console.log(JSON.stringify(SynthUtils.toCloudFormation(stack, {}), null, 2));
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2luZ2xlLXBhZ2UtYXBwLnNwZWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzaW5nbGUtcGFnZS1hcHAuc3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDRDQUF1RDtBQUN2RCx3Q0FBc0M7QUFDdEMsbUNBQWlEO0FBRWpELFFBQVEsQ0FBQyx5QkFBeUIsRUFBRSxHQUFHLEVBQUU7SUFFckMsRUFBRSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsRUFBRTtRQUN2QixNQUFNLEtBQUssR0FBRyxJQUFJLFlBQUssRUFBRSxDQUFDO1FBQzFCLElBQUksMEJBQW9CLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRTtZQUNuQyxPQUFPLEVBQUUsMERBQTBEO1lBQ25FLE1BQU0sRUFBRSxZQUFZO1lBQ3BCLFFBQVEsRUFBRSxhQUFhO1NBQzFCLENBQUMsQ0FBQztRQUVILGVBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMscUJBQVksQ0FBQywrQkFBK0IsQ0FBQyxDQUFDLENBQUM7UUFDaEUsZ0ZBQWdGO0lBQ3BGLENBQUMsQ0FBQyxDQUFDO0lBRUgsRUFBRSxDQUFDLHNDQUFzQyxFQUFFLEdBQUcsRUFBRTtRQUM1QyxNQUFNLEtBQUssR0FBRyxJQUFJLFlBQUssRUFBRSxDQUFDO1FBQzFCLElBQUksMEJBQW9CLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRTtZQUNuQyxNQUFNLEVBQUUsWUFBWTtZQUNwQixRQUFRLEVBQUUsYUFBYTtTQUMxQixDQUFDLENBQUM7UUFFSCxlQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLHFCQUFZLENBQUMsK0JBQStCLENBQUMsQ0FBQyxDQUFDO1FBQ2hFLGdGQUFnRjtJQUNwRixDQUFDLENBQUMsQ0FBQztBQUVQLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZXhwZWN0LCBoYXZlUmVzb3VyY2UgfSBmcm9tICdAYXdzLWNkay9hc3NlcnQnO1xuaW1wb3J0IHsgU3RhY2sgfSBmcm9tICdAYXdzLWNkay9jb3JlJztcbmltcG9ydCB7IFNpbmdsZVBhZ2VBcHBIb3N0aW5nIH0gZnJvbSAnLi4vLi4vbGliJztcblxuZGVzY3JpYmUoJ1NpbmdsZSBQYWdlIEFwcCBIb3N0aW5nJywgKCkgPT4ge1xuXG4gICAgaXQoJ3Nob3VsZCBiZSB2YWxpZCcsICgpID0+IHtcbiAgICAgICAgY29uc3Qgc3RhY2sgPSBuZXcgU3RhY2soKTtcbiAgICAgICAgbmV3IFNpbmdsZVBhZ2VBcHBIb3N0aW5nKHN0YWNrLCAnU1BBJywge1xuICAgICAgICAgICAgY2VydEFybjogJ2Fybjphd3M6YWNtOjEyMzQ1Njc4OTAxMjpldS1jZW50cmFsLTEvY2VydGlmaWNhdGUvZm9vYmFyJyxcbiAgICAgICAgICAgIHpvbmVJZDogJzEyMzQ1Njc4OTAnLFxuICAgICAgICAgICAgem9uZU5hbWU6ICdleGFtcGxlLm5ldCcsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGV4cGVjdChzdGFjaykudG8oaGF2ZVJlc291cmNlKCdBV1M6OkNsb3VkRnJvbnQ6OkRpc3RyaWJ1dGlvbicpKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkoU3ludGhVdGlscy50b0Nsb3VkRm9ybWF0aW9uKHN0YWNrLCB7fSksIG51bGwsIDIpKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgYmUgYXV0byBnZW5lcmF0ZSBjZXJ0aWZpY2F0ZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0YWNrID0gbmV3IFN0YWNrKCk7XG4gICAgICAgIG5ldyBTaW5nbGVQYWdlQXBwSG9zdGluZyhzdGFjaywgJ1NQQScsIHtcbiAgICAgICAgICAgIHpvbmVJZDogJzEyMzQ1Njc4OTAnLFxuICAgICAgICAgICAgem9uZU5hbWU6ICdleGFtcGxlLm5ldCcsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGV4cGVjdChzdGFjaykudG8oaGF2ZVJlc291cmNlKCdBV1M6OkNsb3VkRnJvbnQ6OkRpc3RyaWJ1dGlvbicpKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkoU3ludGhVdGlscy50b0Nsb3VkRm9ybWF0aW9uKHN0YWNrLCB7fSksIG51bGwsIDIpKTtcbiAgICB9KTtcblxufSk7XG4iXX0=