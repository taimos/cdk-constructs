import { App, Stack } from '@aws-cdk/cdk';
export interface AlexaSkillConfig {
    skillId: string;
    skillName: string;
    thundraKey?: string;
    environment?: {
        [key: string]: string;
    };
    userAttribute?: string;
}
export declare class AlexaSkillStack extends Stack {
    constructor(parent: App, config: AlexaSkillConfig);
}
