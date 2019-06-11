"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_codebuild_1 = require("@aws-cdk/aws-codebuild");
const aws_events_targets_1 = require("@aws-cdk/aws-events-targets");
const aws_sns_1 = require("@aws-cdk/aws-sns");
const cdk_1 = require("@aws-cdk/cdk");
class SimpleCodeBuildStack extends cdk_1.Stack {
    constructor(parent, config) {
        super(parent, `${config.githubOwner}-${config.githubRepo}-codebuild`);
        this.templateOptions.description = `The CodeBuild project for repo ${config.githubOwner}/${config.githubRepo}`;
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
        const alertTopic = new aws_sns_1.Topic(this, 'AlertTopic', {
            displayName: `Alert Topic for repo ${config.githubOwner}/${config.githubRepo}`,
        });
        if (config.alertEmail) {
            alertTopic.subscribeEmail('DefaultSubscription', config.alertEmail, { json: false });
        }
        const source = new aws_codebuild_1.GitHubSource({
            owner: config.githubOwner,
            repo: config.githubRepo,
            webhook: true,
            reportBuildStatus: true,
        });
        const buildProject = new aws_codebuild_1.Project(this, 'BuildProject', {
            source,
            badge: true,
            buildSpec: config.useBuildSpecFile ? 'buildspec.yaml' : buildSpec,
            environment: {
                buildImage: aws_codebuild_1.LinuxBuildImage.UBUNTU_14_04_NODEJS_10_1_0,
            },
            description: `The CodeBuild project for repo ${config.githubOwner}/${config.githubRepo}`,
            projectName: `${config.githubOwner}-${config.githubRepo}`,
        });
        buildProject.onBuildFailed('BuildFailed', { target: new aws_events_targets_1.SnsTopic(alertTopic) });
    }
}
exports.SimpleCodeBuildStack = SimpleCodeBuildStack;
//# sourceMappingURL=simple-codebuild.js.map