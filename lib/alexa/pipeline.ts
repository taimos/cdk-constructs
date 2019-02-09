import {AlexaSkillDeployAction} from '@aws-cdk/alexa-ask';
import {CloudFormationCapabilities, PipelineCreateReplaceChangeSetAction, PipelineExecuteChangeSetAction} from '@aws-cdk/aws-cloudformation';
import {LinuxBuildImage, Project, S3BucketBuildArtifacts} from '@aws-cdk/aws-codebuild';
import {PipelineSourceAction, Repository} from '@aws-cdk/aws-codecommit';
import {GitHubSourceAction, Pipeline} from '@aws-cdk/aws-codepipeline';
import {Bucket, PipelineDeployAction} from '@aws-cdk/aws-s3';
import {SecretString} from '@aws-cdk/aws-secretsmanager';
import {App, Aws, Secret, Stack} from '@aws-cdk/cdk';

export interface AlexaSkillDeploymentConfig {
    skillId : string;
    skillName : string;
    branch? : string;
    githubOwner? : string;
    githubRepo? : string;
    githubSecretId? : string;
    AlexaSecretId? : string;
}

export class AlexaSkillPipelineStack extends Stack {
    constructor(parent : App, config : AlexaSkillDeploymentConfig) {
        super(parent, `${config.skillName}-pipeline`);
        this.templateOptions.description = `The deployment pipeline for ${config.skillName}`;
        const aws = new Aws(this);

        const pipeline = new Pipeline(this, 'Pipeline', {});

        // Source
        const sourceStage = pipeline.addStage('Source');

        let sourceAction;

        if (config.githubOwner && config.githubRepo) {
            const githubAccessToken = new SecretString(this, 'GithubToken', {secretId: config.githubSecretId || 'GitHub'});
            sourceAction = new GitHubSourceAction(this, 'GitHubSource', {
                stage: sourceStage,
                owner: config.githubOwner,
                repo: config.githubRepo,
                branch: config.branch || 'master',
                oauthToken: new Secret(githubAccessToken.jsonFieldValue('Token')),
            });
        } else {
            const codecommit = new Repository(this, 'CodeCommitRepo', {repositoryName: config.skillName});
            sourceAction = new PipelineSourceAction(this, 'CodeCommitSource', {
                stage: sourceStage,
                branch: config.branch || 'master',
                repository: codecommit,
            });
        }

        // Build
        const buildProject = new Project(this, 'BuildProject', {
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
                buildImage: LinuxBuildImage.UBUNTU_14_04_NODEJS_10_1_0,
            },
            secondaryArtifacts: [
                new S3BucketBuildArtifacts({
                    identifier: 'output',
                    bucket: pipeline.artifactBucket,
                    name: 'output.zip',
                }),
                new S3BucketBuildArtifacts({
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

        new PipelineCreateReplaceChangeSetAction(this, 'PrepareChangesTest', {
            stage: deployStage,
            runOrder: 1,
            stackName,
            changeSetName,
            adminPermissions: true,
            templatePath: buildAction.outputArtifact.atPath('cfn.packaged.yaml'),
            capabilities: CloudFormationCapabilities.NamedIAM,
        });

        const executePipeline = new PipelineExecuteChangeSetAction(this, 'ExecuteChangesTest', {
            stage: deployStage,
            runOrder: 2,
            stackName,
            changeSetName,
            outputFileName: 'overrides.json',
            outputArtifactName: 'CloudFormation',
        });

        new PipelineDeployAction(this, 'DeployAssets', {
            stage: deployStage,
            runOrder: 3,
            bucket: Bucket.import(this, 'DeployBucket', {
                bucketName: `${aws.accountId}-${stackName}-${aws.region}-assets`,
            }),
            inputArtifact: buildAction.additionalOutputArtifact('assets'),
        });

        const alexaSecrets = new SecretString(this, 'AlexaSecrets', {secretId: config.AlexaSecretId || 'Alexa'});
        new AlexaSkillDeployAction(this, 'DeploySkill', {
            stage: deployStage,
            runOrder: 4,
            inputArtifact: buildAction.outputArtifact,
            parameterOverridesArtifact: executePipeline.outputArtifact,
            clientId: new Secret(alexaSecrets.jsonFieldValue('ClientId')),
            clientSecret: new Secret(alexaSecrets.jsonFieldValue('ClientSecret')),
            refreshToken: new Secret(alexaSecrets.jsonFieldValue('RefreshToken')),
            skillId: config.skillId,
        });

    }
}
