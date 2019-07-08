import { expect, haveResource } from '@aws-cdk/assert';
import { App } from '@aws-cdk/core';
import { AlexaSkillStack } from '../../lib';

describe('Alexa Skill generation', () => {

    it('should be valid', () => {
        const app = new App();
        const testee = new AlexaSkillStack(app, {
            skillName: 'test-skill',
            skillId: 'amzn1.ask.skill.SOME_ID',
        });

        expect(testee).to(haveResource('AWS::Serverless::Function'));
        // console.log(JSON.stringify(SynthUtils.toCloudFormation(testee, {}), null, 2));
    });

    it('should be valid with thundra', () => {
        const app = new App();
        const testee = new AlexaSkillStack(app, {
            skillName: 'test-skill',
            skillId: 'amzn1.ask.skill.SOME_ID',
            thundraKey: 'ThundraDemoKey',
        });

        expect(testee).to(haveResource('AWS::Serverless::Function'));
        // console.log(JSON.stringify(SynthUtils.toCloudFormation(testee, {}), null, 2));
    });

});
