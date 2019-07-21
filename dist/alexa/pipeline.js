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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGlwZWxpbmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9saWIvYWxleGEvcGlwZWxpbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxvRUFBeUU7QUFDekUsMERBQXdGO0FBQ3hGLDREQUFxRDtBQUNyRCxnRUFBK0Q7QUFDL0QsZ0ZBQTBPO0FBQzFPLDRDQUF5QztBQUN6Qyx3Q0FBbUU7QUFZbkUsTUFBYSx1QkFBd0IsU0FBUSxZQUFLO0lBQzlDLFlBQVksTUFBWSxFQUFFLE1BQW1DO1FBQ3pELEtBQUssQ0FBQyxNQUFNLEVBQUUsR0FBRyxNQUFNLENBQUMsU0FBUyxXQUFXLENBQUMsQ0FBQztRQUM5QyxJQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsR0FBRywrQkFBK0IsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3JGLE1BQU0sR0FBRyxHQUFHLElBQUksZ0JBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVoQyxNQUFNLFFBQVEsR0FBRyxJQUFJLDJCQUFRLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVwRCxTQUFTO1FBQ1QsSUFBSSxZQUFZLENBQUM7UUFDakIsTUFBTSxZQUFZLEdBQUcsSUFBSSwyQkFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBRWhELElBQUksTUFBTSxDQUFDLFdBQVcsSUFBSSxNQUFNLENBQUMsVUFBVSxFQUFFO1lBQ3pDLE1BQU0saUJBQWlCLEdBQUcsa0JBQVcsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLGNBQWMsSUFBSSxRQUFRLEVBQUUsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUNoSCxZQUFZLEdBQUcsSUFBSSw2Q0FBa0IsQ0FBQztnQkFDbEMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxXQUFXO2dCQUN6QixJQUFJLEVBQUUsTUFBTSxDQUFDLFVBQVU7Z0JBQ3ZCLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTSxJQUFJLFFBQVE7Z0JB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QUFDLE1BQU0sU0FBUyxDQUFDO1lBQ3pHLEtBQUssRUFBRSxhQUFhO1NBQ3ZCLENBQUMsQ0FBQyxDQUFDO1FBRUosV0FBVyxDQUFDLFNBQVMsQ0FBQyxJQUFJLGlEQUFzQixDQUFDO1lBQzdDLFVBQVUsRUFBRSxhQUFhO1lBQ3pCLFFBQVEsRUFBRSxDQUFDO1lBQ1gsS0FBSyxFQUFFLGFBQWE7WUFDcEIsMEJBQTBCLEVBQUUsc0JBQXNCO1lBQ2xELFFBQVEsRUFBRSxrQkFBVyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsYUFBYSxJQUFJLE9BQU8sRUFBRSxFQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRTtZQUN6RyxZQUFZLEVBQUUsa0JBQVcsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLGFBQWEsSUFBSSxPQUFPLEVBQUUsRUFBQyxTQUFTLEVBQUUsY0FBYyxFQUFDLENBQUM7WUFDdEcsWUFBWSxFQUFFLGtCQUFXLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxhQUFhLElBQUksT0FBTyxFQUFFLEVBQUMsU0FBUyxFQUFFLGNBQWMsRUFBQyxDQUFDO1lBQ3RHLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTztTQUMxQixDQUFDLENBQUMsQ0FBQztJQUNSLENBQUM7Q0FDSjtBQWxKRCwwREFrSkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDbG91ZEZvcm1hdGlvbkNhcGFiaWxpdGllcyB9IGZyb20gJ0Bhd3MtY2RrL2F3cy1jbG91ZGZvcm1hdGlvbic7XG5pbXBvcnQgeyBBcnRpZmFjdHMsIEJ1aWxkU3BlYywgTGludXhCdWlsZEltYWdlLCBQcm9qZWN0IH0gZnJvbSAnQGF3cy1jZGsvYXdzLWNvZGVidWlsZCc7XG5pbXBvcnQgeyBSZXBvc2l0b3J5IH0gZnJvbSAnQGF3cy1jZGsvYXdzLWNvZGVjb21taXQnO1xuaW1wb3J0IHsgQXJ0aWZhY3QsIFBpcGVsaW5lIH0gZnJvbSAnQGF3cy1jZGsvYXdzLWNvZGVwaXBlbGluZSc7XG5pbXBvcnQgeyBBbGV4YVNraWxsRGVwbG95QWN0aW9uLCBDbG91ZEZvcm1hdGlvbkNyZWF0ZVJlcGxhY2VDaGFuZ2VTZXRBY3Rpb24sIENsb3VkRm9ybWF0aW9uRXhlY3V0ZUNoYW5nZVNldEFjdGlvbiwgQ29kZUJ1aWxkQWN0aW9uLCBDb2RlQ29tbWl0U291cmNlQWN0aW9uLCBHaXRIdWJTb3VyY2VBY3Rpb24sIFMzRGVwbG95QWN0aW9uIH0gZnJvbSAnQGF3cy1jZGsvYXdzLWNvZGVwaXBlbGluZS1hY3Rpb25zJztcbmltcG9ydCB7IEJ1Y2tldCB9IGZyb20gJ0Bhd3MtY2RrL2F3cy1zMyc7XG5pbXBvcnQgeyBBcHAsIFNjb3BlZEF3cywgU2VjcmV0VmFsdWUsIFN0YWNrIH0gZnJvbSAnQGF3cy1jZGsvY29yZSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQWxleGFTa2lsbERlcGxveW1lbnRDb25maWcge1xuICAgIHJlYWRvbmx5IHNraWxsSWQgOiBzdHJpbmc7XG4gICAgcmVhZG9ubHkgc2tpbGxOYW1lIDogc3RyaW5nO1xuICAgIHJlYWRvbmx5IGJyYW5jaD8gOiBzdHJpbmc7XG4gICAgcmVhZG9ubHkgZ2l0aHViT3duZXI/IDogc3RyaW5nO1xuICAgIHJlYWRvbmx5IGdpdGh1YlJlcG8/IDogc3RyaW5nO1xuICAgIHJlYWRvbmx5IGdpdGh1YlNlY3JldElkPyA6IHN0cmluZztcbiAgICByZWFkb25seSBhbGV4YVNlY3JldElkPyA6IHN0cmluZztcbn1cblxuZXhwb3J0IGNsYXNzIEFsZXhhU2tpbGxQaXBlbGluZVN0YWNrIGV4dGVuZHMgU3RhY2sge1xuICAgIGNvbnN0cnVjdG9yKHBhcmVudCA6IEFwcCwgY29uZmlnIDogQWxleGFTa2lsbERlcGxveW1lbnRDb25maWcpIHtcbiAgICAgICAgc3VwZXIocGFyZW50LCBgJHtjb25maWcuc2tpbGxOYW1lfS1waXBlbGluZWApO1xuICAgICAgICB0aGlzLnRlbXBsYXRlT3B0aW9ucy5kZXNjcmlwdGlvbiA9IGBUaGUgZGVwbG95bWVudCBwaXBlbGluZSBmb3IgJHtjb25maWcuc2tpbGxOYW1lfWA7XG4gICAgICAgIGNvbnN0IGF3cyA9IG5ldyBTY29wZWRBd3ModGhpcyk7XG5cbiAgICAgICAgY29uc3QgcGlwZWxpbmUgPSBuZXcgUGlwZWxpbmUodGhpcywgJ1BpcGVsaW5lJywge30pO1xuXG4gICAgICAgIC8vIFNvdXJjZVxuICAgICAgICBsZXQgc291cmNlQWN0aW9uO1xuICAgICAgICBjb25zdCBzb3VyY2VPdXRwdXQgPSBuZXcgQXJ0aWZhY3QoJ1NvdXJjZUNvZGUnKTtcblxuICAgICAgICBpZiAoY29uZmlnLmdpdGh1Yk93bmVyICYmIGNvbmZpZy5naXRodWJSZXBvKSB7XG4gICAgICAgICAgICBjb25zdCBnaXRodWJBY2Nlc3NUb2tlbiA9IFNlY3JldFZhbHVlLnNlY3JldHNNYW5hZ2VyKGNvbmZpZy5naXRodWJTZWNyZXRJZCB8fCAnR2l0SHViJywgeyBqc29uRmllbGQ6ICdUb2tlbicgfSk7XG4gICAgICAgICAgICBzb3VyY2VBY3Rpb24gPSBuZXcgR2l0SHViU291cmNlQWN0aW9uKHtcbiAgICAgICAgICAgICAgICBvd25lcjogY29uZmlnLmdpdGh1Yk93bmVyLFxuICAgICAgICAgICAgICAgIHJlcG86IGNvbmZpZy5naXRodWJSZXBvLFxuICAgICAgICAgICAgICAgIGJyYW5jaDogY29uZmlnLmJyYW5jaCB8fCAnbWFzdGVyJyxcbiAgICAgICAgICAgICAgICBvYXV0aFRva2VuOiBnaXRodWJBY2Nlc3NUb2tlbixcbiAgICAgICAgICAgICAgICBhY3Rpb25OYW1lOiAnR2l0aHViU291cmNlJyxcbiAgICAgICAgICAgICAgICBvdXRwdXQ6IHNvdXJjZU91dHB1dCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgY29kZWNvbW1pdCA9IG5ldyBSZXBvc2l0b3J5KHRoaXMsICdDb2RlQ29tbWl0UmVwbycsIHsgcmVwb3NpdG9yeU5hbWU6IGNvbmZpZy5za2lsbE5hbWUgfSk7XG4gICAgICAgICAgICBzb3VyY2VBY3Rpb24gPSBuZXcgQ29kZUNvbW1pdFNvdXJjZUFjdGlvbih7XG4gICAgICAgICAgICAgICAgYnJhbmNoOiBjb25maWcuYnJhbmNoIHx8ICdtYXN0ZXInLFxuICAgICAgICAgICAgICAgIHJlcG9zaXRvcnk6IGNvZGVjb21taXQsXG4gICAgICAgICAgICAgICAgb3V0cHV0OiBzb3VyY2VPdXRwdXQsXG4gICAgICAgICAgICAgICAgYWN0aW9uTmFtZTogJ0NvZGVDb21taXRTb3VyY2UnLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgc291cmNlU3RhZ2UgPSBwaXBlbGluZS5hZGRTdGFnZSh7IHN0YWdlTmFtZTogJ1NvdXJjZScgfSk7XG4gICAgICAgIHNvdXJjZVN0YWdlLmFkZEFjdGlvbihzb3VyY2VBY3Rpb24pO1xuXG4gICAgICAgIC8vIEJ1aWxkXG4gICAgICAgIGNvbnN0IGJ1aWxkUHJvamVjdCA9IG5ldyBQcm9qZWN0KHRoaXMsICdCdWlsZFByb2plY3QnLCB7XG4gICAgICAgICAgICBidWlsZFNwZWM6IEJ1aWxkU3BlYy5mcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICB2ZXJzaW9uOiAwLjIsXG4gICAgICAgICAgICAgICAgcGhhc2VzOiB7XG4gICAgICAgICAgICAgICAgICAgIGluc3RhbGw6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbW1hbmRzOiBbJ3BpcCBpbnN0YWxsIC0tdXBncmFkZSBhd3NjbGknXSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcHJlX2J1aWxkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb21tYW5kczogWyducG0gaW5zdGFsbCAtLXByZWZpeCBza2lsbC8nLCAnbnBtIGluc3RhbGwgLS1wcmVmaXggdm9pY2UtaW50ZXJmYWNlLycsICducG0gaW5zdGFsbCAtLXByZWZpeCBkZXBsb3ltZW50LyddLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBidWlsZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29tbWFuZHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnbnBtIHRlc3QgLS1wcmVmaXggc2tpbGwvJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnbnBtIHJ1biBidWlsZCAtLXByZWZpeCBza2lsbC8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICducG0gcnVuIGJ1aWxkIC0tcHJlZml4IHZvaWNlLWludGVyZmFjZS8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICducG0gcnVuIHNraWxsOnN5bnRoIC0tcHJlZml4IGRlcGxveW1lbnQvJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgYXdzIGNsb3VkZm9ybWF0aW9uIHBhY2thZ2UgLS10ZW1wbGF0ZS1maWxlICR7Y29uZmlnLnNraWxsTmFtZX0udGVtcGxhdGUueWFtbCAtLXMzLWJ1Y2tldCAke3BpcGVsaW5lLmFydGlmYWN0QnVja2V0LmJ1Y2tldE5hbWV9IC0tb3V0cHV0LXRlbXBsYXRlLWZpbGUgY2ZuLnBhY2thZ2VkLnlhbWxgLFxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGFydGlmYWN0czoge1xuICAgICAgICAgICAgICAgICAgICAnc2Vjb25kYXJ5LWFydGlmYWN0cyc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjZm4ucGFja2FnZWQueWFtbCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdpbnRlcmFjdGlvbk1vZGVsLyouanNvbicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdza2lsbC5qc29uJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2V0czoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdmaWxlcyc6IFsnYXNzZXRzLyonXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGlzY2FyZC1wYXRocyc6ICd5ZXMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICduYW1lJzogJ2Fzc2V0cy56aXAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICAgICAgICAgIGJ1aWxkSW1hZ2U6IExpbnV4QnVpbGRJbWFnZS5VQlVOVFVfMTRfMDRfTk9ERUpTXzEwXzFfMCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZWNvbmRhcnlBcnRpZmFjdHM6IFtcbiAgICAgICAgICAgICAgICBBcnRpZmFjdHMuczMoe1xuICAgICAgICAgICAgICAgICAgICBpZGVudGlmaWVyOiAnb3V0cHV0JyxcbiAgICAgICAgICAgICAgICAgICAgYnVja2V0OiBwaXBlbGluZS5hcnRpZmFjdEJ1Y2tldCxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ291dHB1dC56aXAnLFxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIEFydGlmYWN0cy5zMyh7XG4gICAgICAgICAgICAgICAgICAgIGlkZW50aWZpZXI6ICdhc3NldHMnLFxuICAgICAgICAgICAgICAgICAgICBidWNrZXQ6IHBpcGVsaW5lLmFydGlmYWN0QnVja2V0LFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnYXNzZXRzLnppcCcsXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBdLFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBidWlsZEFydGlmYWN0ID0gbmV3IEFydGlmYWN0KCdCdWlsZE91dHB1dCcpO1xuICAgICAgICBjb25zdCBhc3NldEFydGlmYWN0ID0gbmV3IEFydGlmYWN0KCdBc3NldHMnKTtcblxuICAgICAgICBjb25zdCBidWlsZEFjdGlvbiA9IG5ldyBDb2RlQnVpbGRBY3Rpb24oe1xuICAgICAgICAgICAgcHJvamVjdDogYnVpbGRQcm9qZWN0LFxuICAgICAgICAgICAgaW5wdXQ6IHNvdXJjZU91dHB1dCxcbiAgICAgICAgICAgIG91dHB1dHM6IFtidWlsZEFydGlmYWN0LCBhc3NldEFydGlmYWN0XSxcbiAgICAgICAgICAgIGFjdGlvbk5hbWU6ICdDb2RlQnVpbGQnLFxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgYnVpbGRTdGFnZSA9IHBpcGVsaW5lLmFkZFN0YWdlKHsgc3RhZ2VOYW1lOiAnQnVpbGQnIH0pO1xuICAgICAgICBidWlsZFN0YWdlLmFkZEFjdGlvbihidWlsZEFjdGlvbik7XG5cbiAgICAgICAgLy8gRGVwbG95XG4gICAgICAgIGNvbnN0IGRlcGxveVN0YWdlID0gcGlwZWxpbmUuYWRkU3RhZ2UoeyBzdGFnZU5hbWU6ICdEZXBsb3knIH0pO1xuICAgICAgICBjb25zdCBzdGFja05hbWUgPSBjb25maWcuc2tpbGxOYW1lO1xuICAgICAgICBjb25zdCBjaGFuZ2VTZXROYW1lID0gJ1N0YWdlZENoYW5nZVNldCc7XG5cbiAgICAgICAgZGVwbG95U3RhZ2UuYWRkQWN0aW9uKG5ldyBDbG91ZEZvcm1hdGlvbkNyZWF0ZVJlcGxhY2VDaGFuZ2VTZXRBY3Rpb24oe1xuICAgICAgICAgICAgYWN0aW9uTmFtZTogJ1ByZXBhcmVDaGFuZ2VzVGVzdCcsXG4gICAgICAgICAgICBydW5PcmRlcjogMSxcbiAgICAgICAgICAgIHN0YWNrTmFtZSxcbiAgICAgICAgICAgIGNoYW5nZVNldE5hbWUsXG4gICAgICAgICAgICBhZG1pblBlcm1pc3Npb25zOiB0cnVlLFxuICAgICAgICAgICAgdGVtcGxhdGVQYXRoOiBidWlsZEFydGlmYWN0LmF0UGF0aCgnY2ZuLnBhY2thZ2VkLnlhbWwnKSxcbiAgICAgICAgICAgIGNhcGFiaWxpdGllczogW0Nsb3VkRm9ybWF0aW9uQ2FwYWJpbGl0aWVzLk5BTUVEX0lBTV0sXG4gICAgICAgIH0pKTtcblxuICAgICAgICBjb25zdCBjbG91ZEZvcm1hdGlvbkFydGlmYWN0ID0gbmV3IEFydGlmYWN0KCdDbG91ZEZvcm1hdGlvbicpO1xuXG4gICAgICAgIGNvbnN0IGV4ZWN1dGVQaXBlbGluZSA9IG5ldyBDbG91ZEZvcm1hdGlvbkV4ZWN1dGVDaGFuZ2VTZXRBY3Rpb24oe1xuICAgICAgICAgICAgYWN0aW9uTmFtZTogJ0V4ZWN1dGVDaGFuZ2VzVGVzdCcsXG4gICAgICAgICAgICBydW5PcmRlcjogMixcbiAgICAgICAgICAgIHN0YWNrTmFtZSxcbiAgICAgICAgICAgIGNoYW5nZVNldE5hbWUsXG4gICAgICAgICAgICBvdXRwdXRGaWxlTmFtZTogJ292ZXJyaWRlcy5qc29uJyxcbiAgICAgICAgICAgIG91dHB1dDogY2xvdWRGb3JtYXRpb25BcnRpZmFjdCxcbiAgICAgICAgfSk7XG4gICAgICAgIGRlcGxveVN0YWdlLmFkZEFjdGlvbihleGVjdXRlUGlwZWxpbmUpO1xuXG4gICAgICAgIGRlcGxveVN0YWdlLmFkZEFjdGlvbihuZXcgUzNEZXBsb3lBY3Rpb24oe1xuICAgICAgICAgICAgYWN0aW9uTmFtZTogJ0RlcGxveUFzc2V0cycsXG4gICAgICAgICAgICBydW5PcmRlcjogMyxcbiAgICAgICAgICAgIGJ1Y2tldDogQnVja2V0LmZyb21CdWNrZXROYW1lKHRoaXMsICdEZXBsb3lCdWNrZXQnLCBgJHthd3MuYWNjb3VudElkfS0ke3N0YWNrTmFtZX0tJHthd3MucmVnaW9ufS1hc3NldHNgKSxcbiAgICAgICAgICAgIGlucHV0OiBhc3NldEFydGlmYWN0LFxuICAgICAgICB9KSk7XG5cbiAgICAgICAgZGVwbG95U3RhZ2UuYWRkQWN0aW9uKG5ldyBBbGV4YVNraWxsRGVwbG95QWN0aW9uKHtcbiAgICAgICAgICAgIGFjdGlvbk5hbWU6ICdEZXBsb3lTa2lsbCcsXG4gICAgICAgICAgICBydW5PcmRlcjogNCxcbiAgICAgICAgICAgIGlucHV0OiBidWlsZEFydGlmYWN0LFxuICAgICAgICAgICAgcGFyYW1ldGVyT3ZlcnJpZGVzQXJ0aWZhY3Q6IGNsb3VkRm9ybWF0aW9uQXJ0aWZhY3QsXG4gICAgICAgICAgICBjbGllbnRJZDogU2VjcmV0VmFsdWUuc2VjcmV0c01hbmFnZXIoY29uZmlnLmFsZXhhU2VjcmV0SWQgfHwgJ0FsZXhhJywge2pzb25GaWVsZDogJ0NsaWVudElkJ30pLnRvU3RyaW5nKCksXG4gICAgICAgICAgICBjbGllbnRTZWNyZXQ6IFNlY3JldFZhbHVlLnNlY3JldHNNYW5hZ2VyKGNvbmZpZy5hbGV4YVNlY3JldElkIHx8ICdBbGV4YScsIHtqc29uRmllbGQ6ICdDbGllbnRTZWNyZXQnfSksXG4gICAgICAgICAgICByZWZyZXNoVG9rZW46IFNlY3JldFZhbHVlLnNlY3JldHNNYW5hZ2VyKGNvbmZpZy5hbGV4YVNlY3JldElkIHx8ICdBbGV4YScsIHtqc29uRmllbGQ6ICdSZWZyZXNoVG9rZW4nfSksXG4gICAgICAgICAgICBza2lsbElkOiBjb25maWcuc2tpbGxJZCxcbiAgICAgICAgfSkpO1xuICAgIH1cbn1cbiJdfQ==