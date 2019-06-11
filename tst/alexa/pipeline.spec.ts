import { expect, haveResource, SynthUtils } from '@aws-cdk/assert';
import { App } from '@aws-cdk/cdk';
import { AlexaSkillPipelineStack } from '../../lib';

describe('Alexa Pipeline generation', () => {

    it('should be valid', () => {
        const app = new App();
        const testee = new AlexaSkillPipelineStack(app, {
            skillName: 'test-skill',
            githubOwner: 'taimos',
            githubRepo: 'test-skill',
            skillId: 'amzn1.ask.skill.SOME_ID',
        });

        expect(testee).to(haveResource('AWS::CodePipeline::Pipeline'));
        // console.log(JSON.stringify(SynthUtils.toCloudFormation(testee, {}), null, 2));
    });

});
