import { App, Stack } from '@aws-cdk/core';
export interface SimpleCodeBuildConfig {
    githubOwner: string;
    githubRepo: string;
    branch?: string;
    githubSecretId?: string;
    useBuildSpecFile?: boolean;
    alertEmail?: string;
}
export declare class SimpleCodeBuildStack extends Stack {
    constructor(parent: App, config: SimpleCodeBuildConfig);
}
