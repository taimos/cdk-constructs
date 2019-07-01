"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_cloudformation_1 = require("@aws-cdk/aws-cloudformation");
const aws_codebuild_1 = require("@aws-cdk/aws-codebuild");
const aws_codecommit_1 = require("@aws-cdk/aws-codecommit");
const aws_codepipeline_1 = require("@aws-cdk/aws-codepipeline");
const aws_codepipeline_actions_1 = require("@aws-cdk/aws-codepipeline-actions");
const aws_s3_1 = require("@aws-cdk/aws-s3");
const core_1 = require("@aws-cdk/core");
class AlexaSkillPipelineStack extends core_1.Stack {
    constructor(parent, config) {
        super(parent, `${config.skillName}-pipeline`);
        this.templateOptions.description = `The deployment pipeline for ${config.skillName}`;
        const aws = new core_1.ScopedAws(this);
        const pipeline = new aws_codepipeline_1.Pipeline(this, 'Pipeline', {});
        // Source
        let sourceAction;
        const sourceOutput = new aws_codepipeline_1.Artifact('SourceCode');
        if (config.githubOwner && config.githubRepo) {
            const githubAccessToken = core_1.SecretValue.secretsManager(config.githubSecretId || 'GitHub', { jsonField: 'Token' });
            sourceAction = new aws_codepipeline_actions_1.GitHubSourceAction({
                owner: config.githubOwner,
                repo: config.githubRepo,
                branch: config.branch || 'master',
                oauthToken: githubAccessToken,
                actionName: 'GithubSource',
                output: sourceOutput,
            });
        }
        else {
            const codecommit = new aws_codecommit_1.Repository(this, 'CodeCommitRepo', { repositoryName: config.skillName });
            sourceAction = new aws_codepipeline_actions_1.CodeCommitSourceAction({
                branch: config.branch || 'master',
                repository: codecommit,
                output: sourceOutput,
                actionName: 'CodeCommitSource',
            });
        }
        const sourceStage = pipeline.addStage({ stageName: 'Source' });
        sourceStage.addAction(sourceAction);
        // Build
        const buildProject = new aws_codebuild_1.Project(this, 'BuildProject', {
            buildSpec: aws_codebuild_1.BuildSpec.fromObject({
                version: 0.2,
                phases: {
                    install: {
                        commands: ['pip install --upgrade awscli'],
                    },
                    pre_build: {
                        commands: ['npm install --prefix skill/', 'npm install --prefix voice-interface/', 'npm install --prefix deployment/'],
                    },
                    build: {
                        commands: [
                            'npm test --prefix skill/',
                            'npm run build --prefix skill/',
                            'npm run build --prefix voice-interface/',
                            'npm run skill:synth --prefix deployment/',
                            `aws cloudformation package --template-file ${config.skillName}.template.yaml --s3-bucket ${pipeline.artifactBucket.bucketName} --output-template-file cfn.packaged.yaml`,
                        ],
                    },
                },
                artifacts: {
                    'secondary-artifacts': {
                        output: {
                            files: [
                                'cfn.packaged.yaml',
                                'interactionModel/*.json',
                                'skill.json',
                            ],
                        },
                        assets: {
                            'files': ['assets/*'],
                            'discard-paths': 'yes',
                            'name': 'assets.zip',
                        },
                    },
                },
            }),
            environment: {
                buildImage: aws_codebuild_1.LinuxBuildImage.UBUNTU_14_04_NODEJS_10_1_0,
            },
            secondaryArtifacts: [
                aws_codebuild_1.Artifacts.s3({
                    identifier: 'output',
                    bucket: pipeline.artifactBucket,
                    name: 'output.zip',
                }),
                aws_codebuild_1.Artifacts.s3({
                    identifier: 'assets',
                    bucket: pipeline.artifactBucket,
                    name: 'assets.zip',
                }),
            ],
        });
        const buildArtifact = new aws_codepipeline_1.Artifact('BuildOutput');
        const assetArtifact = new aws_codepipeline_1.Artifact('Assets');
        const buildAction = new aws_codepipeline_actions_1.CodeBuildAction({
            project: buildProject,
            input: sourceOutput,
            outputs: [buildArtifact, assetArtifact],
            actionName: 'CodeBuild',
        });
        const buildStage = pipeline.addStage({ stageName: 'Build' });
        buildStage.addAction(buildAction);
        // Deploy
        const deployStage = pipeline.addStage({ stageName: 'Deploy' });
        const stackName = config.skillName;
        const changeSetName = 'StagedChangeSet';
        deployStage.addAction(new aws_codepipeline_actions_1.CloudFormationCreateReplaceChangeSetAction({
            actionName: 'PrepareChangesTest',
            runOrder: 1,
            stackName,
            changeSetName,
            adminPermissions: true,
            templatePath: buildArtifact.atPath('cfn.packaged.yaml'),
            capabilities: [aws_cloudformation_1.CloudFormationCapabilities.NAMED_IAM],
        }));
        const cloudFormationArtifact = new aws_codepipeline_1.Artifact('CloudFormation');
        const executePipeline = new aws_codepipeline_actions_1.CloudFormationExecuteChangeSetAction({
            actionName: 'ExecuteChangesTest',
            runOrder: 2,
            stackName,
            changeSetName,
            outputFileName: 'overrides.json',
            output: cloudFormationArtifact,
        });
        deployStage.addAction(executePipeline);
        deployStage.addAction(new aws_codepipeline_actions_1.S3DeployAction({
            actionName: 'DeployAssets',
            runOrder: 3,
            bucket: aws_s3_1.Bucket.fromBucketName(this, 'DeployBucket', `${aws.accountId}-${stackName}-${aws.region}-assets`),
            input: assetArtifact,
        }));
        deployStage.addAction(new aws_codepipeline_actions_1.AlexaSkillDeployAction({
            actionName: 'DeploySkill',
            runOrder: 4,
            input: buildArtifact,
            parameterOverridesArtifact: cloudFormationArtifact,
            clientId: core_1.SecretValue.secretsManager(config.AlexaSecretId || 'Alexa', { jsonField: 'ClientId' }).toString(),
            clientSecret: core_1.SecretValue.secretsManager(config.AlexaSecretId || 'Alexa', { jsonField: 'ClientSecret' }),
            refreshToken: core_1.SecretValue.secretsManager(config.AlexaSecretId || 'Alexa', { jsonField: 'RefreshToken' }),
            skillId: config.skillId,
        }));
    }
}
exports.AlexaSkillPipelineStack = AlexaSkillPipelineStack;
//# sourceMappingURL=pipeline.js.map