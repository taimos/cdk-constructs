"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("@aws-cdk/assert");
const core_1 = require("@aws-cdk/core");
const lib_1 = require("../../lib");
describe('Alexa Pipeline generation', () => {
    it('should be valid', () => {
        const app = new core_1.App();
        const testee = new lib_1.AlexaSkillPipelineStack(app, {
            skillName: 'test-skill',
            githubOwner: 'taimos',
            githubRepo: 'test-skill',
            skillId: 'amzn1.ask.skill.SOME_ID',
        });
        assert_1.expect(testee).to(assert_1.haveResource('AWS::CodePipeline::Pipeline'));
        // console.log(JSON.stringify(SynthUtils.toCloudFormation(testee, {}), null, 2));
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGlwZWxpbmUuc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInBpcGVsaW5lLnNwZWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw0Q0FBdUQ7QUFDdkQsd0NBQW9DO0FBQ3BDLG1DQUFvRDtBQUVwRCxRQUFRLENBQUMsMkJBQTJCLEVBQUUsR0FBRyxFQUFFO0lBRXZDLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLEVBQUU7UUFDdkIsTUFBTSxHQUFHLEdBQUcsSUFBSSxVQUFHLEVBQUUsQ0FBQztRQUN0QixNQUFNLE1BQU0sR0FBRyxJQUFJLDZCQUF1QixDQUFDLEdBQUcsRUFBRTtZQUM1QyxTQUFTLEVBQUUsWUFBWTtZQUN2QixXQUFXLEVBQUUsUUFBUTtZQUNyQixVQUFVLEVBQUUsWUFBWTtZQUN4QixPQUFPLEVBQUUseUJBQXlCO1NBQ3JDLENBQUMsQ0FBQztRQUVILGVBQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMscUJBQVksQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDLENBQUM7UUFDL0QsaUZBQWlGO0lBQ3JGLENBQUMsQ0FBQyxDQUFDO0FBRVAsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBleHBlY3QsIGhhdmVSZXNvdXJjZSB9IGZyb20gJ0Bhd3MtY2RrL2Fzc2VydCc7XG5pbXBvcnQgeyBBcHAgfSBmcm9tICdAYXdzLWNkay9jb3JlJztcbmltcG9ydCB7IEFsZXhhU2tpbGxQaXBlbGluZVN0YWNrIH0gZnJvbSAnLi4vLi4vbGliJztcblxuZGVzY3JpYmUoJ0FsZXhhIFBpcGVsaW5lIGdlbmVyYXRpb24nLCAoKSA9PiB7XG5cbiAgICBpdCgnc2hvdWxkIGJlIHZhbGlkJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBhcHAgPSBuZXcgQXBwKCk7XG4gICAgICAgIGNvbnN0IHRlc3RlZSA9IG5ldyBBbGV4YVNraWxsUGlwZWxpbmVTdGFjayhhcHAsIHtcbiAgICAgICAgICAgIHNraWxsTmFtZTogJ3Rlc3Qtc2tpbGwnLFxuICAgICAgICAgICAgZ2l0aHViT3duZXI6ICd0YWltb3MnLFxuICAgICAgICAgICAgZ2l0aHViUmVwbzogJ3Rlc3Qtc2tpbGwnLFxuICAgICAgICAgICAgc2tpbGxJZDogJ2Ftem4xLmFzay5za2lsbC5TT01FX0lEJyxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZXhwZWN0KHRlc3RlZSkudG8oaGF2ZVJlc291cmNlKCdBV1M6OkNvZGVQaXBlbGluZTo6UGlwZWxpbmUnKSk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KFN5bnRoVXRpbHMudG9DbG91ZEZvcm1hdGlvbih0ZXN0ZWUsIHt9KSwgbnVsbCwgMikpO1xuICAgIH0pO1xuXG59KTtcbiJdfQ==