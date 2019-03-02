"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alexa_ask_1 = require("@aws-cdk/alexa-ask");
const aws_cloudformation_1 = require("@aws-cdk/aws-cloudformation");
const aws_codebuild_1 = require("@aws-cdk/aws-codebuild");
const aws_codecommit_1 = require("@aws-cdk/aws-codecommit");
const aws_codepipeline_1 = require("@aws-cdk/aws-codepipeline");
const aws_s3_1 = require("@aws-cdk/aws-s3");
const aws_secretsmanager_1 = require("@aws-cdk/aws-secretsmanager");
const cdk_1 = require("@aws-cdk/cdk");
class AlexaSkillPipelineStack extends cdk_1.Stack {
    constructor(parent, config) {
        super(parent, `${config.skillName}-pipeline`);
        this.templateOptions.description = `The deployment pipeline for ${config.skillName}`;
        const aws = new cdk_1.ScopedAws(this);
        const pipeline = new aws_codepipeline_1.Pipeline(this, 'Pipeline', {});
        // Source
        let sourceAction;
        if (config.githubOwner && config.githubRepo) {
            const githubAccessToken = new aws_secretsmanager_1.SecretString(this, 'GithubToken', { secretId: config.githubSecretId || 'GitHub' });
            sourceAction = new aws_codepipeline_1.GitHubSourceAction({
                owner: config.githubOwner,
                repo: config.githubRepo,
                branch: config.branch || 'master',
                oauthToken: new cdk_1.Secret(githubAccessToken.jsonFieldValue('Token')),
                outputArtifactName: 'SourceCode',
                actionName: 'GithubSource',
            });
        }
        else {
            const codecommit = new aws_codecommit_1.Repository(this, 'CodeCommitRepo', { repositoryName: config.skillName });
            sourceAction = new aws_codecommit_1.PipelineSourceAction({
                branch: config.branch || 'master',
                repository: codecommit,
                outputArtifactName: 'SourceCode',
                actionName: 'CodeCommitSource',
            });
        }
        const sourceStage = pipeline.addStage({ name: 'Source' });
        sourceStage.addAction(sourceAction);
        // Build
        const buildProject = new aws_codebuild_1.Project(this, 'BuildProject', {
            buildSpec: {
                version: 0.2,
                phases: {
                    install: {
                        commands: ['pip install --upgrade awscli'],
                    },
                    pre_build: {
                        commands: ['npm install --prefix skill/', 'npm install --prefix voice-interface/'],
                    },
                    build: {
                        commands: [
                            'npm test --prefix skill/',
                            'npm run build --prefix skill/',
                            'npm run build --prefix voice-interface/',
                            `aws cloudformation package --template-file cfn.yaml --s3-bucket ${pipeline.artifactBucket.bucketName} --output-template-file cfn.packaged.yaml`,
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
            },
            environment: {
                buildImage: aws_codebuild_1.LinuxBuildImage.UBUNTU_14_04_NODEJS_10_1_0,
            },
            secondaryArtifacts: [
                new aws_codebuild_1.S3BucketBuildArtifacts({
                    identifier: 'output',
                    bucket: pipeline.artifactBucket,
                    name: 'output.zip',
                }),
                new aws_codebuild_1.S3BucketBuildArtifacts({
                    identifier: 'assets',
                    bucket: pipeline.artifactBucket,
                    name: 'assets.zip',
                }),
            ],
        });
        const buildAction = buildProject.toCodePipelineBuildAction({
            inputArtifact: sourceAction.outputArtifact,
            outputArtifactName: 'output',
            additionalOutputArtifactNames: ['assets'],
            actionName: 'CodeBuild',
        });
        const buildStage = pipeline.addStage({ name: 'Build' });
        buildStage.addAction(buildAction);
        // Deploy
        const deployStage = pipeline.addStage({ name: 'Deploy' });
        const stackName = config.skillName;
        const changeSetName = 'StagedChangeSet';
        deployStage.addAction(new aws_cloudformation_1.PipelineCreateReplaceChangeSetAction({
            actionName: 'PrepareChangesTest',
            runOrder: 1,
            stackName,
            changeSetName,
            adminPermissions: true,
            templatePath: buildAction.outputArtifact.atPath('cfn.packaged.yaml'),
            capabilities: aws_cloudformation_1.CloudFormationCapabilities.NamedIAM,
        }));
        const executePipeline = new aws_cloudformation_1.PipelineExecuteChangeSetAction({
            actionName: 'ExecuteChangesTest',
            runOrder: 2,
            stackName,
            changeSetName,
            outputFileName: 'overrides.json',
            outputArtifactName: 'CloudFormation',
        });
        deployStage.addAction(executePipeline);
        deployStage.addAction(new aws_s3_1.PipelineDeployAction({
            actionName: 'DeployAssets',
            runOrder: 3,
            bucket: aws_s3_1.Bucket.import(this, 'DeployBucket', {
                bucketName: `${aws.accountId}-${stackName}-${aws.region}-assets`,
            }),
            inputArtifact: buildAction.additionalOutputArtifact('assets'),
        }));
        const alexaSecrets = new aws_secretsmanager_1.SecretString(this, 'AlexaSecrets', { secretId: config.AlexaSecretId || 'Alexa' });
        deployStage.addAction(new alexa_ask_1.AlexaSkillDeployAction({
            actionName: 'DeploySkill',
            runOrder: 4,
            inputArtifact: buildAction.outputArtifact,
            parameterOverridesArtifact: executePipeline.outputArtifact,
            clientId: new cdk_1.Secret(alexaSecrets.jsonFieldValue('ClientId')),
            clientSecret: new cdk_1.Secret(alexaSecrets.jsonFieldValue('ClientSecret')),
            refreshToken: new cdk_1.Secret(alexaSecrets.jsonFieldValue('RefreshToken')),
            skillId: config.skillId,
        }));
    }
}
exports.AlexaSkillPipelineStack = AlexaSkillPipelineStack;
//# sourceMappingURL=pipeline.js.map