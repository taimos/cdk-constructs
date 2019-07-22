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
            clientId: core_1.SecretValue.secretsManager(config.alexaSecretId || 'Alexa', { jsonField: 'ClientId' }).toString(),
            clientSecret: core_1.SecretValue.secretsManager(config.alexaSecretId || 'Alexa', { jsonField: 'ClientSecret' }),
            refreshToken: core_1.SecretValue.secretsManager(config.alexaSecretId || 'Alexa', { jsonField: 'RefreshToken' }),
            skillId: config.skillId,
        }));
    }
}
exports.AlexaSkillPipelineStack = AlexaSkillPipelineStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGlwZWxpbmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJwaXBlbGluZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG9FQUF5RTtBQUN6RSwwREFBd0Y7QUFDeEYsNERBQXFEO0FBQ3JELGdFQUErRDtBQUMvRCxnRkFBME87QUFDMU8sNENBQXlDO0FBQ3pDLHdDQUFtRTtBQVluRSxNQUFhLHVCQUF3QixTQUFRLFlBQUs7SUFDOUMsWUFBWSxNQUFZLEVBQUUsTUFBbUM7UUFDekQsS0FBSyxDQUFDLE1BQU0sRUFBRSxHQUFHLE1BQU0sQ0FBQyxTQUFTLFdBQVcsQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxlQUFlLENBQUMsV0FBVyxHQUFHLCtCQUErQixNQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDckYsTUFBTSxHQUFHLEdBQUcsSUFBSSxnQkFBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRWhDLE1BQU0sUUFBUSxHQUFHLElBQUksMkJBQVEsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRXBELFNBQVM7UUFDVCxJQUFJLFlBQVksQ0FBQztRQUNqQixNQUFNLFlBQVksR0FBRyxJQUFJLDJCQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7UUFFaEQsSUFBSSxNQUFNLENBQUMsV0FBVyxJQUFJLE1BQU0sQ0FBQyxVQUFVLEVBQUU7WUFDekMsTUFBTSxpQkFBaUIsR0FBRyxrQkFBVyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsY0FBYyxJQUFJLFFBQVEsRUFBRSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQ2hILFlBQVksR0FBRyxJQUFJLDZDQUFrQixDQUFDO2dCQUNsQyxLQUFLLEVBQUUsTUFBTSxDQUFDLFdBQVc7Z0JBQ3pCLElBQUksRUFBRSxNQUFNLENBQUMsVUFBVTtnQkFDdkIsTUFBTSxFQUFFLE1BQU0sQ0FBQyxNQUFNLElBQUksUUFBUTtnQkFDakMsVUFBVSxFQUFFLGlC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QUM7WUFDekcsS0FBSyxFQUFFLGFBQWE7U0FDdkIsQ0FBQyxDQUFDLENBQUM7UUFFSixXQUFXLENBQUMsU0FBUyxDQUFDLElBQUksaURBQXNCLENBQUM7WUFDN0MsVUFBVSxFQUFFLGFBQWE7WUFDekIsUUFBUSxFQUFFLENBQUM7WUFDWCxLQUFLLEVBQUUsYUFBYTtZQUNwQiwwQkFBMEIsRUFBRSxzQkFBc0I7WUFDbEQsUUFBUSxFQUFFLGtCQUFXLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxhQUFhLElBQUksT0FBTyxFQUFFLEVBQUMsU0FBUyxFQUFFLFVBQVUsRUFBQyxDQUFDLENBQUMsUUFBUSxFQUFFO1lBQ3pHLFlBQVksRUFBRSxrQkFBVyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsYUFBYSxJQUFJLE9BQU8sRUFBRSxFQUFDLFNBQVMsRUFBRSxjQUFjLEVBQUMsQ0FBQztZQUN0RyxZQUFZLEVBQUUsa0JBQVcsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLGFBQWEsSUFBSSxPQUFPLEVBQUUsRUFBQyxTQUFTLEVBQUUsY0FBYyxFQUFDLENBQUM7WUFDdEcsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPO1NBQzFCLENBQUMsQ0FBQyxDQUFDO0lBQ1IsQ0FBQztDQUNKO0FBbEpELDBEQWtKQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENsb3VkRm9ybWF0aW9uQ2FwYWJpbGl0aWVzIH0gZnJvbSAnQGF3cy1jZGsvYXdzLWNsb3VkZm9ybWF0aW9uJztcbmltcG9ydCB7IEFydGlmYWN0cywgQnVpbGRTcGVjLCBMaW51eEJ1aWxkSW1hZ2UsIFByb2plY3QgfSBmcm9tICdAYXdzLWNkay9hd3MtY29kZWJ1aWxkJztcbmltcG9ydCB7IFJlcG9zaXRvcnkgfSBmcm9tICdAYXdzLWNkay9hd3MtY29kZWNvbW1pdCc7XG5pbXBvcnQgeyBBcnRpZmFjdCwgUGlwZWxpbmUgfSBmcm9tICdAYXdzLWNkay9hd3MtY29kZXBpcGVsaW5lJztcbmltcG9ydCB7IEFsZXhhU2tpbGxEZXBsb3lBY3Rpb24sIENsb3VkRm9ybWF0aW9uQ3JlYXRlUmVwbGFjZUNoYW5nZVNldEFjdGlvbiwgQ2xvdWRGb3JtYXRpb25FeGVjdXRlQ2hhbmdlU2V0QWN0aW9uLCBDb2RlQnVpbGRBY3Rpb24sIENvZGVDb21taXRTb3VyY2VBY3Rpb24sIEdpdEh1YlNvdXJjZUFjdGlvbiwgUzNEZXBsb3lBY3Rpb24gfSBmcm9tICdAYXdzLWNkay9hd3MtY29kZXBpcGVsaW5lLWFjdGlvbnMnO1xuaW1wb3J0IHsgQnVja2V0IH0gZnJvbSAnQGF3cy1jZGsvYXdzLXMzJztcbmltcG9ydCB7IEFwcCwgU2NvcGVkQXdzLCBTZWNyZXRWYWx1ZSwgU3RhY2sgfSBmcm9tICdAYXdzLWNkay9jb3JlJztcblxuZXhwb3J0IGludGVyZmFjZSBBbGV4YVNraWxsRGVwbG95bWVudENvbmZpZyB7XG4gICAgcmVhZG9ubHkgc2tpbGxJZCA6IHN0cmluZztcbiAgICByZWFkb25seSBza2lsbE5hbWUgOiBzdHJpbmc7XG4gICAgcmVhZG9ubHkgYnJhbmNoPyA6IHN0cmluZztcbiAgICByZWFkb25seSBnaXRodWJPd25lcj8gOiBzdHJpbmc7XG4gICAgcmVhZG9ubHkgZ2l0aHViUmVwbz8gOiBzdHJpbmc7XG4gICAgcmVhZG9ubHkgZ2l0aHViU2VjcmV0SWQ/IDogc3RyaW5nO1xuICAgIHJlYWRvbmx5IGFsZXhhU2VjcmV0SWQ/IDogc3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgQWxleGFTa2lsbFBpcGVsaW5lU3RhY2sgZXh0ZW5kcyBTdGFjayB7XG4gICAgY29uc3RydWN0b3IocGFyZW50IDogQXBwLCBjb25maWcgOiBBbGV4YVNraWxsRGVwbG95bWVudENvbmZpZykge1xuICAgICAgICBzdXBlcihwYXJlbnQsIGAke2NvbmZpZy5za2lsbE5hbWV9LXBpcGVsaW5lYCk7XG4gICAgICAgIHRoaXMudGVtcGxhdGVPcHRpb25zLmRlc2NyaXB0aW9uID0gYFRoZSBkZXBsb3ltZW50IHBpcGVsaW5lIGZvciAke2NvbmZpZy5za2lsbE5hbWV9YDtcbiAgICAgICAgY29uc3QgYXdzID0gbmV3IFNjb3BlZEF3cyh0aGlzKTtcblxuICAgICAgICBjb25zdCBwaXBlbGluZSA9IG5ldyBQaXBlbGluZSh0aGlzLCAnUGlwZWxpbmUnLCB7fSk7XG5cbiAgICAgICAgLy8gU291cmNlXG4gICAgICAgIGxldCBzb3VyY2VBY3Rpb247XG4gICAgICAgIGNvbnN0IHNvdXJjZU91dHB1dCA9IG5ldyBBcnRpZmFjdCgnU291cmNlQ29kZScpO1xuXG4gICAgICAgIGlmIChjb25maWcuZ2l0aHViT3duZXIgJiYgY29uZmlnLmdpdGh1YlJlcG8pIHtcbiAgICAgICAgICAgIGNvbnN0IGdpdGh1YkFjY2Vzc1Rva2VuID0gU2VjcmV0VmFsdWUuc2VjcmV0c01hbmFnZXIoY29uZmlnLmdpdGh1YlNlY3JldElkIHx8ICdHaXRIdWInLCB7IGpzb25GaWVsZDogJ1Rva2VuJyB9KTtcbiAgICAgICAgICAgIHNvdXJjZUFjdGlvbiA9IG5ldyBHaXRIdWJTb3VyY2VBY3Rpb24oe1xuICAgICAgICAgICAgICAgIG93bmVyOiBjb25maWcuZ2l0aHViT3duZXIsXG4gICAgICAgICAgICAgICAgcmVwbzogY29uZmlnLmdpdGh1YlJlcG8sXG4gICAgICAgICAgICAgICAgYnJhbmNoOiBjb25maWcuYnJhbmNoIHx8ICdtYXN0ZXInLFxuICAgICAgICAgICAgICAgIG9hdXRoVG9rZW46IGdpdGh1YkFjY2Vzc1Rva2VuLFxuICAgICAgICAgICAgICAgIGFjdGlvbk5hbWU6ICdHaXRodWJTb3VyY2UnLFxuICAgICAgICAgICAgICAgIG91dHB1dDogc291cmNlT3V0cHV0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBjb2RlY29tbWl0ID0gbmV3IFJlcG9zaXRvcnkodGhpcywgJ0NvZGVDb21taXRSZXBvJywgeyByZXBvc2l0b3J5TmFtZTogY29uZmlnLnNraWxsTmFtZSB9KTtcbiAgICAgICAgICAgIHNvdXJjZUFjdGlvbiA9IG5ldyBDb2RlQ29tbWl0U291cmNlQWN0aW9uKHtcbiAgICAgICAgICAgICAgICBicmFuY2g6IGNvbmZpZy5icmFuY2ggfHwgJ21hc3RlcicsXG4gICAgICAgICAgICAgICAgcmVwb3NpdG9yeTogY29kZWNvbW1pdCxcbiAgICAgICAgICAgICAgICBvdXRwdXQ6IHNvdXJjZU91dHB1dCxcbiAgICAgICAgICAgICAgICBhY3Rpb25OYW1lOiAnQ29kZUNvbW1pdFNvdXJjZScsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzb3VyY2VTdGFnZSA9IHBpcGVsaW5lLmFkZFN0YWdlKHsgc3RhZ2VOYW1lOiAnU291cmNlJyB9KTtcbiAgICAgICAgc291cmNlU3RhZ2UuYWRkQWN0aW9uKHNvdXJjZUFjdGlvbik7XG5cbiAgICAgICAgLy8gQnVpbGRcbiAgICAgICAgY29uc3QgYnVpbGRQcm9qZWN0ID0gbmV3IFByb2plY3QodGhpcywgJ0J1aWxkUHJvamVjdCcsIHtcbiAgICAgICAgICAgIGJ1aWxkU3BlYzogQnVpbGRTcGVjLmZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgIHZlcnNpb246IDAuMixcbiAgICAgICAgICAgICAgICBwaGFzZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFsbDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29tbWFuZHM6IFsncGlwIGluc3RhbGwgLS11cGdyYWRlIGF3c2NsaSddLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBwcmVfYnVpbGQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbW1hbmRzOiBbJ25wbSBpbnN0YWxsIC0tcHJlZml4IHNraWxsLycsICducG0gaW5zdGFsbCAtLXByZWZpeCB2b2ljZS1pbnRlcmZhY2UvJywgJ25wbSBpbnN0YWxsIC0tcHJlZml4IGRlcGxveW1lbnQvJ10sXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGJ1aWxkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb21tYW5kczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICducG0gdGVzdCAtLXByZWZpeCBza2lsbC8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICducG0gcnVuIGJ1aWxkIC0tcHJlZml4IHNraWxsLycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ25wbSBydW4gYnVpbGQgLS1wcmVmaXggdm9pY2UtaW50ZXJmYWNlLycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ25wbSBydW4gc2tpbGw6c3ludGggLS1wcmVmaXggZGVwbG95bWVudC8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBhd3MgY2xvdWRmb3JtYXRpb24gcGFja2FnZSAtLXRlbXBsYXRlLWZpbGUgJHtjb25maWcuc2tpbGxOYW1lfS50ZW1wbGF0ZS55YW1sIC0tczMtYnVja2V0ICR7cGlwZWxpbmUuYXJ0aWZhY3RCdWNrZXQuYnVja2V0TmFtZX0gLS1vdXRwdXQtdGVtcGxhdGUtZmlsZSBjZm4ucGFja2FnZWQueWFtbGAsXG4gICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgYXJ0aWZhY3RzOiB7XG4gICAgICAgICAgICAgICAgICAgICdzZWNvbmRhcnktYXJ0aWZhY3RzJzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2Nmbi5wYWNrYWdlZC55YW1sJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2ludGVyYWN0aW9uTW9kZWwvKi5qc29uJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3NraWxsLmpzb24nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXRzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2ZpbGVzJzogWydhc3NldHMvKiddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkaXNjYXJkLXBhdGhzJzogJ3llcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ25hbWUnOiAnYXNzZXRzLnppcCcsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgICAgICAgICAgYnVpbGRJbWFnZTogTGludXhCdWlsZEltYWdlLlVCVU5UVV8xNF8wNF9OT0RFSlNfMTBfMV8wLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNlY29uZGFyeUFydGlmYWN0czogW1xuICAgICAgICAgICAgICAgIEFydGlmYWN0cy5zMyh7XG4gICAgICAgICAgICAgICAgICAgIGlkZW50aWZpZXI6ICdvdXRwdXQnLFxuICAgICAgICAgICAgICAgICAgICBidWNrZXQ6IHBpcGVsaW5lLmFydGlmYWN0QnVja2V0LFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnb3V0cHV0LnppcCcsXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgQXJ0aWZhY3RzLnMzKHtcbiAgICAgICAgICAgICAgICAgICAgaWRlbnRpZmllcjogJ2Fzc2V0cycsXG4gICAgICAgICAgICAgICAgICAgIGJ1Y2tldDogcGlwZWxpbmUuYXJ0aWZhY3RCdWNrZXQsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdhc3NldHMuemlwJyxcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGJ1aWxkQXJ0aWZhY3QgPSBuZXcgQXJ0aWZhY3QoJ0J1aWxkT3V0cHV0Jyk7XG4gICAgICAgIGNvbnN0IGFzc2V0QXJ0aWZhY3QgPSBuZXcgQXJ0aWZhY3QoJ0Fzc2V0cycpO1xuXG4gICAgICAgIGNvbnN0IGJ1aWxkQWN0aW9uID0gbmV3IENvZGVCdWlsZEFjdGlvbih7XG4gICAgICAgICAgICBwcm9qZWN0OiBidWlsZFByb2plY3QsXG4gICAgICAgICAgICBpbnB1dDogc291cmNlT3V0cHV0LFxuICAgICAgICAgICAgb3V0cHV0czogW2J1aWxkQXJ0aWZhY3QsIGFzc2V0QXJ0aWZhY3RdLFxuICAgICAgICAgICAgYWN0aW9uTmFtZTogJ0NvZGVCdWlsZCcsXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBidWlsZFN0YWdlID0gcGlwZWxpbmUuYWRkU3RhZ2UoeyBzdGFnZU5hbWU6ICdCdWlsZCcgfSk7XG4gICAgICAgIGJ1aWxkU3RhZ2UuYWRkQWN0aW9uKGJ1aWxkQWN0aW9uKTtcblxuICAgICAgICAvLyBEZXBsb3lcbiAgICAgICAgY29uc3QgZGVwbG95U3RhZ2UgPSBwaXBlbGluZS5hZGRTdGFnZSh7IHN0YWdlTmFtZTogJ0RlcGxveScgfSk7XG4gICAgICAgIGNvbnN0IHN0YWNrTmFtZSA9IGNvbmZpZy5za2lsbE5hbWU7XG4gICAgICAgIGNvbnN0IGNoYW5nZVNldE5hbWUgPSAnU3RhZ2VkQ2hhbmdlU2V0JztcblxuICAgICAgICBkZXBsb3lTdGFnZS5hZGRBY3Rpb24obmV3IENsb3VkRm9ybWF0aW9uQ3JlYXRlUmVwbGFjZUNoYW5nZVNldEFjdGlvbih7XG4gICAgICAgICAgICBhY3Rpb25OYW1lOiAnUHJlcGFyZUNoYW5nZXNUZXN0JyxcbiAgICAgICAgICAgIHJ1bk9yZGVyOiAxLFxuICAgICAgICAgICAgc3RhY2tOYW1lLFxuICAgICAgICAgICAgY2hhbmdlU2V0TmFtZSxcbiAgICAgICAgICAgIGFkbWluUGVybWlzc2lvbnM6IHRydWUsXG4gICAgICAgICAgICB0ZW1wbGF0ZVBhdGg6IGJ1aWxkQXJ0aWZhY3QuYXRQYXRoKCdjZm4ucGFja2FnZWQueWFtbCcpLFxuICAgICAgICAgICAgY2FwYWJpbGl0aWVzOiBbQ2xvdWRGb3JtYXRpb25DYXBhYmlsaXRpZXMuTkFNRURfSUFNXSxcbiAgICAgICAgfSkpO1xuXG4gICAgICAgIGNvbnN0IGNsb3VkRm9ybWF0aW9uQXJ0aWZhY3QgPSBuZXcgQXJ0aWZhY3QoJ0Nsb3VkRm9ybWF0aW9uJyk7XG5cbiAgICAgICAgY29uc3QgZXhlY3V0ZVBpcGVsaW5lID0gbmV3IENsb3VkRm9ybWF0aW9uRXhlY3V0ZUNoYW5nZVNldEFjdGlvbih7XG4gICAgICAgICAgICBhY3Rpb25OYW1lOiAnRXhlY3V0ZUNoYW5nZXNUZXN0JyxcbiAgICAgICAgICAgIHJ1bk9yZGVyOiAyLFxuICAgICAgICAgICAgc3RhY2tOYW1lLFxuICAgICAgICAgICAgY2hhbmdlU2V0TmFtZSxcbiAgICAgICAgICAgIG91dHB1dEZpbGVOYW1lOiAnb3ZlcnJpZGVzLmpzb24nLFxuICAgICAgICAgICAgb3V0cHV0OiBjbG91ZEZvcm1hdGlvbkFydGlmYWN0LFxuICAgICAgICB9KTtcbiAgICAgICAgZGVwbG95U3RhZ2UuYWRkQWN0aW9uKGV4ZWN1dGVQaXBlbGluZSk7XG5cbiAgICAgICAgZGVwbG95U3RhZ2UuYWRkQWN0aW9uKG5ldyBTM0RlcGxveUFjdGlvbih7XG4gICAgICAgICAgICBhY3Rpb25OYW1lOiAnRGVwbG95QXNzZXRzJyxcbiAgICAgICAgICAgIHJ1bk9yZGVyOiAzLFxuICAgICAgICAgICAgYnVja2V0OiBCdWNrZXQuZnJvbUJ1Y2tldE5hbWUodGhpcywgJ0RlcGxveUJ1Y2tldCcsIGAke2F3cy5hY2NvdW50SWR9LSR7c3RhY2tOYW1lfS0ke2F3cy5yZWdpb259LWFzc2V0c2ApLFxuICAgICAgICAgICAgaW5wdXQ6IGFzc2V0QXJ0aWZhY3QsXG4gICAgICAgIH0pKTtcblxuICAgICAgICBkZXBsb3lTdGFnZS5hZGRBY3Rpb24obmV3IEFsZXhhU2tpbGxEZXBsb3lBY3Rpb24oe1xuICAgICAgICAgICAgYWN0aW9uTmFtZTogJ0RlcGxveVNraWxsJyxcbiAgICAgICAgICAgIHJ1bk9yZGVyOiA0LFxuICAgICAgICAgICAgaW5wdXQ6IGJ1aWxkQXJ0aWZhY3QsXG4gICAgICAgICAgICBwYXJhbWV0ZXJPdmVycmlkZXNBcnRpZmFjdDogY2xvdWRGb3JtYXRpb25BcnRpZmFjdCxcbiAgICAgICAgICAgIGNsaWVudElkOiBTZWNyZXRWYWx1ZS5zZWNyZXRzTWFuYWdlcihjb25maWcuYWxleGFTZWNyZXRJZCB8fCAnQWxleGEnLCB7anNvbkZpZWxkOiAnQ2xpZW50SWQnfSkudG9TdHJpbmcoKSxcbiAgICAgICAgICAgIGNsaWVudFNlY3JldDogU2VjcmV0VmFsdWUuc2VjcmV0c01hbmFnZXIoY29uZmlnLmFsZXhhU2VjcmV0SWQgfHwgJ0FsZXhhJywge2pzb25GaWVsZDogJ0NsaWVudFNlY3JldCd9KSxcbiAgICAgICAgICAgIHJlZnJlc2hUb2tlbjogU2VjcmV0VmFsdWUuc2VjcmV0c01hbmFnZXIoY29uZmlnLmFsZXhhU2VjcmV0SWQgfHwgJ0FsZXhhJywge2pzb25GaWVsZDogJ1JlZnJlc2hUb2tlbid9KSxcbiAgICAgICAgICAgIHNraWxsSWQ6IGNvbmZpZy5za2lsbElkLFxuICAgICAgICB9KSk7XG4gICAgfVxufVxuIl19