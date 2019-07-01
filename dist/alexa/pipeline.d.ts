import { App, Stack } from '@aws-cdk/core';
export interface AlexaSkillDeploymentConfig {
    skillId: string;
    skillName: string;
    branch?: string;
    githubOwner?: string;
    githubRepo?: string;
    githubSecretId?: string;
    AlexaSecretId?: string;
}
export declare class AlexaSkillPipelineStack extends Stack {
    constructor(parent: App, config: AlexaSkillDeploymentConfig);
}
