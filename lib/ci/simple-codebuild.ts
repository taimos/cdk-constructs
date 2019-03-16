import { GitHubSource, LinuxBuildImage, Project } from '@aws-cdk/aws-codebuild';
import { SecretString } from '@aws-cdk/aws-secretsmanager';
import { Topic } from '@aws-cdk/aws-sns';
import { App, Secret, Stack } from '@aws-cdk/cdk';

export interface SimpleCodeBuildConfig {
    githubOwner : string;
    githubRepo : string;
    branch? : string;
    githubSecretId? : string;
    useBuildSpecFile? : boolean;
    alertEmail? : string;
}

export class SimpleCodeBuildStack extends Stack {
    constructor(parent : App, config : SimpleCodeBuildConfig) {
        super(parent, `${config.githubOwner}-${config.githubRepo}-codebuild`);
        this.templateOptions.description = `The CodeBuild project for repo ${config.githubOwner}/${config.githubRepo}`;

        const githubAccessToken = new SecretString(this, 'GithubToken', { secretId: config.githubSecretId || 'GitHub' });
        const buildSpec = {
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
        };

        const alertTopic = new Topic(this, 'AlertTopic', {
            displayName: `Alert Topic for repo ${config.githubOwner}/${config.githubRepo}`,
        });
        if (config.alertEmail) {
            alertTopic.subscribeEmail('DefaultSubscription', config.alertEmail, { json: false });
        }

        const source = new GitHubSource({
            owner: config.githubOwner,
            repo: config.githubRepo,
            oauthToken: new Secret(githubAccessToken.jsonFieldValue('Token')),
            webhook: true,
            reportBuildStatus: true,
        });
        const buildProject = new Project(this, 'BuildProject', {
            source,
            badge: true,
            buildSpec: config.useBuildSpecFile ? 'buildspec.yaml' : buildSpec,
            environment: {
                buildImage: LinuxBuildImage.UBUNTU_14_04_NODEJS_10_1_0,
            },
            description: `The CodeBuild project for repo ${config.githubOwner}/${config.githubRepo}`,
            projectName: `${config.githubOwner}-${config.githubRepo}`,
        });
        buildProject.onBuildFailed('BuildFailed', alertTopic);
    }
}
