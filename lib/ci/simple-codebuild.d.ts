import { App, Stack } from '@aws-cdk/core';
export interface SimpleCodeBuildConfig {
    readonly githubOwner: string;
    readonly githubRepo: string;
    readonly branch?: string;
    readonly githubSecretId?: string;
    readonly useBuildSpecFile?: boolean;
    readonly alertEmail?: string;
}
export declare class SimpleCodeBuildStack extends Stack {
    constructor(parent: App, config: SimpleCodeBuildConfig);
}
