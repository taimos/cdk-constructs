import { BuildSpec, LinuxBuildImage, Project, Source } from '@aws-cdk/aws-codebuild';
import { SnsTopic } from '@aws-cdk/aws-events-targets';
import { Topic } from '@aws-cdk/aws-sns';
import { EmailSubscription } from '@aws-cdk/aws-sns-subscriptions';
import { App, Stack } from '@aws-cdk/core';

export interface SimpleCodeBuildConfig {
    readonly githubOwner : string;
    readonly githubRepo : string;
    readonly branch? : string;
    readonly githubSecretId? : string;
    readonly useBuildSpecFile? : boolean;
    readonly alertEmail? : string;
}

export class SimpleCodeBuildStack extends Stack {
    constructor(parent : App, config : SimpleCodeBuildConfig) {
        super(parent, `${config.githubOwner}-${config.githubRepo}-codebuild`);
        this.templateOptions.description = `The CodeBuild project for repo ${config.githubOwner}/${config.githubRepo}`;

        const buildSpec = BuildSpec.fromObject({
            version: 0.2,
            phases: {
                pre_build: {
                    commands: ['npm install'],
                },
                build: {
                    commands: [
                        'npm test',
                        'npm run build',
                    ],
                },
            },
        });

        const alertTopic = new Topic(this, 'AlertTopic', {
            displayName: `Alert Topic for repo ${config.githubOwner}/${config.githubRepo}`,
        });
        if (config.alertEmail) {
            alertTopic.addSubscription(new EmailSubscription(config.alertEmail, { json: false }));
        }

        const source = Source.gitHub({
            owner: config.githubOwner,
            repo: config.githubRepo,
            webhook: true,
            reportBuildStatus: true,
        });
        const buildProject = new Project(this, 'BuildProject', {
            source,
            badge: true,
            buildSpec: config.useBuildSpecFile ? BuildSpec.fromSourceFilename('buildspec.yaml') : buildSpec,
            environment: {
                buildImage: LinuxBuildImage.UBUNTU_14_04_NODEJS_10_1_0,
            },
            description: `The CodeBuild project for repo ${config.githubOwner}/${config.githubRepo}`,
            projectName: `${config.githubOwner}-${config.githubRepo}`,
        });
        buildProject.onBuildFailed('BuildFailed', {target: new SnsTopic(alertTopic)});
    }
}
