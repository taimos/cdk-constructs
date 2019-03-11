import { expect, haveResource } from '@aws-cdk/assert';
import { App } from '@aws-cdk/cdk';
import { AlexaSkillStack } from '../../lib';

describe('Alexa Skill generation', () => {

    it('should be valid', () => {
        const app = new App();
        const testee = new AlexaSkillStack(app, {
            skillName: 'test-skill',
            skillId: 'amzn1.ask.skill.SOME_ID',
        });

        expect(testee).to(haveResource('AWS::Serverless::Function'));
    });

});