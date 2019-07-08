import { App, Stack } from '@aws-cdk/core';
export interface AlexaSkillDeploymentConfig {
    readonly skillId: string;
    readonly skillName: string;
    readonly branch?: string;
    readonly githubOwner?: string;
    readonly githubRepo?: string;
    readonly githubSecretId?: string;
    readonly alexaSecretId?: string;
}
export declare class AlexaSkillPipelineStack extends Stack {
    constructor(parent: App, config: AlexaSkillDeploymentConfig);
}
