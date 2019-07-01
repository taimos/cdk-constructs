import { App, Stack } from '@aws-cdk/core';
export interface AlexaSkillConfig {
    /** The Alexa Skill id */
    skillId: string;
    /** The Alexa Skill name */
    skillName: string;
    /** Optional API Key for Thundra */
    thundraKey?: string;
    /** Environement variables for the Lambda function */
    environment?: {
        [key: string]: string;
    };
    /**
     * name of the user attribute for DynamoDB
     * @default id
     */
    userAttribute?: string;
}
export declare class AlexaSkillStack extends Stack {
    constructor(parent: App, config: AlexaSkillConfig);
}
