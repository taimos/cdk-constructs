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
        const aws = new cdk_1.Aws(this);
        const pipeline = new aws_codepipeline_1.Pipeline(this, 'Pipeline', {});
        // Source
        const sourceStage = pipeline.addStage('Source');
        let sourceAction;
        if (config.githubOwner && config.githubRepo) {
            const githubAccessToken = new aws_secretsmanager_1.SecretString(this, 'GithubToken', { secretId: config.githubSecretId || 'GitHub' });
            sourceAction = new aws_codepipeline_1.GitHubSourceAction(this, 'GitHubSource', {
                stage: sourceStage,
                owner: config.githubOwner,
                repo: config.githubRepo,
                branch: config.branch || 'master',
                oauthToken: new cdk_1.Secret(githubAccessToken.jsonFieldValue('Token')),
            });
        }
        else {
            const codecommit = new aws_codecommit_1.Repository(this, 'CodeCommitRepo', { repositoryName: config.skillName });
            sourceAction = new aws_codecommit_1.PipelineSourceAction(this, 'CodeCommitSource', {
                stage: sourceStage,
                branch: config.branch || 'master',
                repository: codecommit,
            });
        }
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
        const buildStage = pipeline.addStage('Build');
        const buildAction = buildProject.addToPipeline(buildStage, 'CodeBuild', {
            inputArtifact: sourceAction.outputArtifact,
            outputArtifactName: 'output',
            additionalOutputArtifactNames: ['assets'],
        });
        // Deploy
        const deployStage = pipeline.addStage('Deploy');
        const stackName = config.skillName;
        const changeSetName = 'StagedChangeSet';
        new aws_cloudformation_1.PipelineCreateReplaceChangeSetAction(this, 'PrepareChangesTest', {
            stage: deployStage,
            runOrder: 1,
            stackName,
            changeSetName,
            adminPermissions: true,
            templatePath: buildAction.outputArtifact.atPath('cfn.packaged.yaml'),
            capabilities: aws_cloudformation_1.CloudFormationCapabilities.NamedIAM,
        });
        const executePipeline = new aws_cloudformation_1.PipelineExecuteChangeSetAction(this, 'ExecuteChangesTest', {
            stage: deployStage,
            runOrder: 2,
            stackName,
            changeSetName,
            outputFileName: 'overrides.json',
            outputArtifactName: 'CloudFormation',
        });
        new aws_s3_1.PipelineDeployAction(this, 'DeployAssets', {
            stage: deployStage,
            runOrder: 3,
            bucket: aws_s3_1.Bucket.import(this, 'DeployBucket', {
                bucketName: `${aws.accountId}-${stackName}-${aws.region}-assets`,
            }),
            inputArtifact: buildAction.additionalOutputArtifact('assets'),
        });
        const alexaSecrets = new aws_secretsmanager_1.SecretString(this, 'AlexaSecrets', { secretId: config.AlexaSecretId || 'Alexa' });
        new alexa_ask_1.AlexaSkillDeployAction(this, 'DeploySkill', {
            stage: deployStage,
            runOrder: 4,
            inputArtifact: buildAction.outputArtifact,
            parameterOverridesArtifact: executePipeline.outputArtifact,
            clientId: new cdk_1.Secret(alexaSecrets.jsonFieldValue('ClientId')),
            clientSecret: new cdk_1.Secret(alexaSecrets.jsonFieldValue('ClientSecret')),
            refreshToken: new cdk_1.Secret(alexaSecrets.jsonFieldValue('RefreshToken')),
            skillId: config.skillId,
        });
    }
}
exports.AlexaSkillPipelineStack = AlexaSkillPipelineStack;
//# sourceMappingURL=pipeline.js.map