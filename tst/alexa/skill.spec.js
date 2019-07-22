"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("@aws-cdk/assert");
const core_1 = require("@aws-cdk/core");
const lib_1 = require("../../lib");
describe('Alexa Skill generation', () => {
    it('should be valid', () => {
        const app = new core_1.App();
        const testee = new lib_1.AlexaSkillStack(app, {
            skillName: 'test-skill',
            skillId: 'amzn1.ask.skill.SOME_ID',
        });
        assert_1.expect(testee).to(assert_1.haveResource('AWS::Serverless::Function'));
        // console.log(JSON.stringify(SynthUtils.toCloudFormation(testee, {}), null, 2));
    });
    it('should be valid with thundra', () => {
        const app = new core_1.App();
        const testee = new lib_1.AlexaSkillStack(app, {
            skillName: 'test-skill',
            skillId: 'amzn1.ask.skill.SOME_ID',
            thundraKey: 'ThundraDemoKey',
        });
        assert_1.expect(testee).to(assert_1.haveResource('AWS::Serverless::Function'));
        // console.log(JSON.stringify(SynthUtils.toCloudFormation(testee, {}), null, 2));
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2tpbGwuc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNraWxsLnNwZWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw0Q0FBdUQ7QUFDdkQsd0NBQW9DO0FBQ3BDLG1DQUE0QztBQUU1QyxRQUFRLENBQUMsd0JBQXdCLEVBQUUsR0FBRyxFQUFFO0lBRXBDLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLEVBQUU7UUFDdkIsTUFBTSxHQUFHLEdBQUcsSUFBSSxVQUFHLEVBQUUsQ0FBQztRQUN0QixNQUFNLE1BQU0sR0FBRyxJQUFJLHFCQUFlLENBQUMsR0FBRyxFQUFFO1lBQ3BDLFNBQVMsRUFBRSxZQUFZO1lBQ3ZCLE9BQU8sRUFBRSx5QkFBeUI7U0FDckMsQ0FBQyxDQUFDO1FBRUgsZUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxxQkFBWSxDQUFDLDJCQUEyQixDQUFDLENBQUMsQ0FBQztRQUM3RCxpRkFBaUY7SUFDckYsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsOEJBQThCLEVBQUUsR0FBRyxFQUFFO1FBQ3BDLE1BQU0sR0FBRyxHQUFHLElBQUksVUFBRyxFQUFFLENBQUM7UUFDdEIsTUFBTSxNQUFNLEdBQUcsSUFBSSxxQkFBZSxDQUFDLEdBQUcsRUFBRTtZQUNwQyxTQUFTLEVBQUUsWUFBWTtZQUN2QixPQUFPLEVBQUUseUJBQXlCO1lBQ2xDLFVBQVUsRUFBRSxnQkFBZ0I7U0FDL0IsQ0FBQyxDQUFDO1FBRUgsZUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxxQkFBWSxDQUFDLDJCQUEyQixDQUFDLENBQUMsQ0FBQztRQUM3RCxpRkFBaUY7SUFDckYsQ0FBQyxDQUFDLENBQUM7QUFFUCxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGV4cGVjdCwgaGF2ZVJlc291cmNlIH0gZnJvbSAnQGF3cy1jZGsvYXNzZXJ0JztcbmltcG9ydCB7IEFwcCB9IGZyb20gJ0Bhd3MtY2RrL2NvcmUnO1xuaW1wb3J0IHsgQWxleGFTa2lsbFN0YWNrIH0gZnJvbSAnLi4vLi4vbGliJztcblxuZGVzY3JpYmUoJ0FsZXhhIFNraWxsIGdlbmVyYXRpb24nLCAoKSA9PiB7XG5cbiAgICBpdCgnc2hvdWxkIGJlIHZhbGlkJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBhcHAgPSBuZXcgQXBwKCk7XG4gICAgICAgIGNvbnN0IHRlc3RlZSA9IG5ldyBBbGV4YVNraWxsU3RhY2soYXBwLCB7XG4gICAgICAgICAgICBza2lsbE5hbWU6ICd0ZXN0LXNraWxsJyxcbiAgICAgICAgICAgIHNraWxsSWQ6ICdhbXpuMS5hc2suc2tpbGwuU09NRV9JRCcsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGV4cGVjdCh0ZXN0ZWUpLnRvKGhhdmVSZXNvdXJjZSgnQVdTOjpTZXJ2ZXJsZXNzOjpGdW5jdGlvbicpKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkoU3ludGhVdGlscy50b0Nsb3VkRm9ybWF0aW9uKHRlc3RlZSwge30pLCBudWxsLCAyKSk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGJlIHZhbGlkIHdpdGggdGh1bmRyYScsICgpID0+IHtcbiAgICAgICAgY29uc3QgYXBwID0gbmV3IEFwcCgpO1xuICAgICAgICBjb25zdCB0ZXN0ZWUgPSBuZXcgQWxleGFTa2lsbFN0YWNrKGFwcCwge1xuICAgICAgICAgICAgc2tpbGxOYW1lOiAndGVzdC1za2lsbCcsXG4gICAgICAgICAgICBza2lsbElkOiAnYW16bjEuYXNrLnNraWxsLlNPTUVfSUQnLFxuICAgICAgICAgICAgdGh1bmRyYUtleTogJ1RodW5kcmFEZW1vS2V5JyxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZXhwZWN0KHRlc3RlZSkudG8oaGF2ZVJlc291cmNlKCdBV1M6OlNlcnZlcmxlc3M6OkZ1bmN0aW9uJykpO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShTeW50aFV0aWxzLnRvQ2xvdWRGb3JtYXRpb24odGVzdGVlLCB7fSksIG51bGwsIDIpKTtcbiAgICB9KTtcblxufSk7XG4iXX0=