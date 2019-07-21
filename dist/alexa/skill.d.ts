import { App, Stack } from '@aws-cdk/core';
export interface AlexaSkillConfig {
    /** The Alexa Skill id */
    readonly skillId: string;
    /** The Alexa Skill name */
    readonly skillName: string;
    /** Optional API Key for Thundra */
    readonly thundraKey?: string;
    /** Environement variables for the Lambda function */
    readonly environment?: {
        [key: string]: string;
    };
    /**
     * name of the user attribute for DynamoDB
     * @default id
     */
    readonly userAttribute?: string;
}
export declare class AlexaSkillStack extends Stack {
    constructor(parent: App, config: AlexaSkillConfig);
}
