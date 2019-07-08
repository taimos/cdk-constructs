import { CloudFormationCapabilities } from '@aws-cdk/aws-cloudformation';
import { Artifacts, BuildSpec, LinuxBuildImage, Project } from '@aws-cdk/aws-codebuild';
import { Repository } from '@aws-cdk/aws-codecommit';
import { Artifact, Pipeline } from '@aws-cdk/aws-codepipeline';
import { AlexaSkillDeployAction, CloudFormationCreateReplaceChangeSetAction, CloudFormationExecuteChangeSetAction, CodeBuildAction, CodeCommitSourceAction, GitHubSourceAction, S3DeployAction } from '@aws-cdk/aws-codepipeline-actions';
import { Bucket } from '@aws-cdk/aws-s3';
import { App, ScopedAws, SecretValue, Stack } from '@aws-cdk/core';

export interface AlexaSkillDeploymentConfig {
    readonly skillId : string;
    readonly skillName : string;
    readonly branch? : string;
    readonly githubOwner? : string;
    readonly githubRepo? : string;
    readonly githubSecretId? : string;
    readonly alexaSecretId? : string;
}

export class AlexaSkillPipelineStack extends Stack {
    constructor(parent : App, config : AlexaSkillDeploymentConfig) {
        super(parent, `${config.skillName}-pipeline`);
        this.templateOptions.description = `The deployment pipeline for ${config.skillName}`;
        const aws = new ScopedAws(this);

        const pipeline = new Pipeline(this, 'Pipeline', {});

        // Source
        let sourceAction;
        const sourceOutput = new Artifact('SourceCode');

        if (config.githubOwner && config.githubRepo) {
            const githubAccessToken = SecretValue.secretsManager(config.githubSecretId || 'GitHub', { jsonField: 'Token' });
            sourceAction = new GitHubSourceAction({
                owner: config.githubOwner,
                repo: config.githubRepo,
                branch: config.branch || 'master',
                oauthToken: githubAccessToken,
                actionName: 'GithubSource',
                output: sourceOutput,
            });
        } else {
            const codecommit = new Repository(this, 'CodeCommitRepo', { repositoryName: config.skillName });
            sourceAction = new CodeCommitSourceAction({
                branch: config.branch || 'master',
                repository: codecommit,
                output: sourceOutput,
                actionName: 'CodeCommitSource',
            });
        }
        const sourceStage = pipeline.addStage({ stageName: 'Source' });
        sourceStage.addAction(sourceAction);

        // Build
        const buildProject = new Project(this, 'BuildProject', {
            buildSpec: BuildSpec.fromObject({
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
                buildImage: LinuxBuildImage.UBUNTU_14_04_NODEJS_10_1_0,
            },
            secondaryArtifacts: [
                Artifacts.s3({
                    identifier: 'output',
                    bucket: pipeline.artifactBucket,
                    name: 'output.zip',
                }),
                Artifacts.s3({
                    identifier: 'assets',
                    bucket: pipeline.artifactBucket,
                    name: 'assets.zip',
                }),
            ],
        });

        const buildArtifact = new Artifact('BuildOutput');
        const assetArtifact = new Artifact('Assets');

        const buildAction = new CodeBuildAction({
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

        deployStage.addAction(new CloudFormationCreateReplaceChangeSetAction({
            actionName: 'PrepareChangesTest',
            runOrder: 1,
            stackName,
            changeSetName,
            adminPermissions: true,
            templatePath: buildArtifact.atPath('cfn.packaged.yaml'),
            capabilities: [CloudFormationCapabilities.NAMED_IAM],
        }));

        const cloudFormationArtifact = new Artifact('CloudFormation');

        const executePipeline = new CloudFormationExecuteChangeSetAction({
            actionName: 'ExecuteChangesTest',
            runOrder: 2,
            stackName,
            changeSetName,
            outputFileName: 'overrides.json',
            output: cloudFormationArtifact,
        });
        deployStage.addAction(executePipeline);

        deployStage.addAction(new S3DeployAction({
            actionName: 'DeployAssets',
            runOrder: 3,
            bucket: Bucket.fromBucketName(this, 'DeployBucket', `${aws.accountId}-${stackName}-${aws.region}-assets`),
            input: assetArtifact,
        }));

        deployStage.addAction(new AlexaSkillDeployAction({
            actionName: 'DeploySkill',
            runOrder: 4,
            input: buildArtifact,
            parameterOverridesArtifact: cloudFormationArtifact,
            clientId: SecretValue.secretsManager(config.alexaSecretId || 'Alexa', {jsonField: 'ClientId'}).toString(),
            clientSecret: SecretValue.secretsManager(config.alexaSecretId || 'Alexa', {jsonField: 'ClientSecret'}),
            refreshToken: SecretValue.secretsManager(config.alexaSecretId || 'Alexa', {jsonField: 'RefreshToken'}),
            skillId: config.skillId,
        }));
    }
}
