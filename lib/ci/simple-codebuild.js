"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_codebuild_1 = require("@aws-cdk/aws-codebuild");
const aws_events_targets_1 = require("@aws-cdk/aws-events-targets");
const aws_sns_1 = require("@aws-cdk/aws-sns");
const aws_sns_subscriptions_1 = require("@aws-cdk/aws-sns-subscriptions");
const core_1 = require("@aws-cdk/core");
class SimpleCodeBuildStack extends core_1.Stack {
    constructor(parent, config) {
        super(parent, `${config.githubOwner}-${config.githubRepo}-codebuild`);
        this.templateOptions.description = `The CodeBuild project for repo ${config.githubOwner}/${config.githubRepo}`;
        const buildSpec = aws_codebuild_1.BuildSpec.fromObject({
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
        const alertTopic = new aws_sns_1.Topic(this, 'AlertTopic', {
            displayName: `Alert Topic for repo ${config.githubOwner}/${config.githubRepo}`,
        });
        if (config.alertEmail) {
            alertTopic.addSubscription(new aws_sns_subscriptions_1.EmailSubscription(config.alertEmail, { json: false }));
        }
        const source = aws_codebuild_1.Source.gitHub({
            owner: config.githubOwner,
            repo: config.githubRepo,
            webhook: true,
            reportBuildStatus: true,
        });
        const buildProject = new aws_codebuild_1.Project(this, 'BuildProject', {
            source,
            badge: true,
            buildSpec: config.useBuildSpecFile ? aws_codebuild_1.BuildSpec.fromSourceFilename('buildspec.yaml') : buildSpec,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2ltcGxlLWNvZGVidWlsZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNpbXBsZS1jb2RlYnVpbGQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwwREFBcUY7QUFDckYsb0VBQXVEO0FBQ3ZELDhDQUF5QztBQUN6QywwRUFBbUU7QUFDbkUsd0NBQTJDO0FBVTNDLE1BQWEsb0JBQXFCLFNBQVEsWUFBSztJQUMzQyxZQUFZLE1BQVksRUFBRSxNQUE4QjtRQUNwRCxLQUFLLENBQUMsTUFBTSxFQUFFLEdBQUcsTUFBTSxDQUFDLFdBQVcsSUFBSSxNQUFNLENBQUMsVUFBVSxZQUFZLENBQUMsQ0FBQztRQUN0RSxJQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsR0FBRyxrQ0FBa0MsTUFBTSxDQUFDLFdBQVcsSUFBSSxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7UUFFL0csTUFBTSxTQUFTLEdBQUcseUJBQVMsQ0FBQyxVQUFVLENBQUM7WUFDbkMsT0FBTyxFQUFFLEdBQUc7WUFDWixNQUFNLEVBQUU7Z0JBQ0osU0FBUyxFQUFFO29CQUNQLFFBQVEsRUFBRSxDQUFDLGFBQWEsQ0FBQztpQkFDNUI7Z0JBQ0QsS0FBSyxFQUFFO29CQUNILFFBQVEsRUFBRTt3QkFDTixVQUFVO3dCQUNWLGVBQWU7cUJBQ2xCO2lCQUNKO2FBQ0o7U0FDSixDQUFDLENBQUM7UUFFSCxNQUFNLFVBQVUsR0FBRyxJQUFJLGVBQUssQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO1lBQzdDLFdBQVcsRUFBRSx3QkFBd0IsTUFBTSxDQUFDLFdBQVcsSUFBSSxNQUFNLENBQUMsVUFBVSxFQUFFO1NBQ2pGLENBQUMsQ0FBQztRQUNILElBQUksTUFBTSxDQUFDLFVBQVUsRUFBRTtZQUNuQixVQUFVLENBQUMsZUFBZSxDQUFDLElBQUkseUNBQWlCLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDekY7UUFFRCxNQUFNLE1BQU0sR0FBRyxzQkFBTSxDQUFDLE1BQU0sQ0FBQztZQUN6QixLQUFLLEVBQUUsTUFBTSxDQUFDLFdBQVc7WUFDekIsSUFBSSxFQUFFLE1BQU0sQ0FBQyxVQUFVO1lBQ3ZCLE9BQU8sRUFBRSxJQUFJO1lBQ2IsaUJBQWlCLEVBQUUsSUFBSTtTQUMxQixDQUFDLENBQUM7UUFDSCxNQUFNLFlBQVksR0FBRyxJQUFJLHVCQUFPLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRTtZQUNuRCxNQUFNO1lBQ04sS0FBSyxFQUFFLElBQUk7WUFDWCxTQUFTLEVBQUUsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyx5QkFBUyxDQUFDLGtCQUFrQixDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVM7WUFDL0YsV0FBVyxFQUFFO2dCQUNULFVBQVUsRUFBRSwrQkFBZSxDQUFDLDBCQUEwQjthQUN6RDtZQUNELFdBQVcsRUFBRSxrQ0FBa0MsTUFBTSxDQUFDLFdBQVcsSUFBSSxNQUFNLENBQUMsVUFBVSxFQUFFO1lBQ3hGLFdBQVcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxXQUFXLElBQUksTUFBTSxDQUFDLFVBQVUsRUFBRTtTQUM1RCxDQUFDLENBQUM7UUFDSCxZQUFZLENBQUMsYUFBYSxDQUFDLGFBQWEsRUFBRSxFQUFDLE1BQU0sRUFBRSxJQUFJLDZCQUFRLENBQUMsVUFBVSxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQ2xGLENBQUM7Q0FDSjtBQTdDRCxvREE2Q0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBCdWlsZFNwZWMsIExpbnV4QnVpbGRJbWFnZSwgUHJvamVjdCwgU291cmNlIH0gZnJvbSAnQGF3cy1jZGsvYXdzLWNvZGVidWlsZCc7XG5pbXBvcnQgeyBTbnNUb3BpYyB9IGZyb20gJ0Bhd3MtY2RrL2F3cy1ldmVudHMtdGFyZ2V0cyc7XG5pbXBvcnQgeyBUb3BpYyB9IGZyb20gJ0Bhd3MtY2RrL2F3cy1zbnMnO1xuaW1wb3J0IHsgRW1haWxTdWJzY3JpcHRpb24gfSBmcm9tICdAYXdzLWNkay9hd3Mtc25zLXN1YnNjcmlwdGlvbnMnO1xuaW1wb3J0IHsgQXBwLCBTdGFjayB9IGZyb20gJ0Bhd3MtY2RrL2NvcmUnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNpbXBsZUNvZGVCdWlsZENvbmZpZyB7XG4gICAgcmVhZG9ubHkgZ2l0aHViT3duZXIgOiBzdHJpbmc7XG4gICAgcmVhZG9ubHkgZ2l0aHViUmVwbyA6IHN0cmluZztcbiAgICByZWFkb25seSBicmFuY2g/IDogc3RyaW5nO1xuICAgIHJlYWRvbmx5IHVzZUJ1aWxkU3BlY0ZpbGU/IDogYm9vbGVhbjtcbiAgICByZWFkb25seSBhbGVydEVtYWlsPyA6IHN0cmluZztcbn1cblxuZXhwb3J0IGNsYXNzIFNpbXBsZUNvZGVCdWlsZFN0YWNrIGV4dGVuZHMgU3RhY2sge1xuICAgIGNvbnN0cnVjdG9yKHBhcmVudCA6IEFwcCwgY29uZmlnIDogU2ltcGxlQ29kZUJ1aWxkQ29uZmlnKSB7XG4gICAgICAgIHN1cGVyKHBhcmVudCwgYCR7Y29uZmlnLmdpdGh1Yk93bmVyfS0ke2NvbmZpZy5naXRodWJSZXBvfS1jb2RlYnVpbGRgKTtcbiAgICAgICAgdGhpcy50ZW1wbGF0ZU9wdGlvbnMuZGVzY3JpcHRpb24gPSBgVGhlIENvZGVCdWlsZCBwcm9qZWN0IGZvciByZXBvICR7Y29uZmlnLmdpdGh1Yk93bmVyfS8ke2NvbmZpZy5naXRodWJSZXBvfWA7XG5cbiAgICAgICAgY29uc3QgYnVpbGRTcGVjID0gQnVpbGRTcGVjLmZyb21PYmplY3Qoe1xuICAgICAgICAgICAgdmVyc2lvbjogMC4yLFxuICAgICAgICAgICAgcGhhc2VzOiB7XG4gICAgICAgICAgICAgICAgcHJlX2J1aWxkOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbW1hbmRzOiBbJ25wbSBpbnN0YWxsJ10sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBidWlsZDoge1xuICAgICAgICAgICAgICAgICAgICBjb21tYW5kczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJ25wbSB0ZXN0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICducG0gcnVuIGJ1aWxkJyxcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgYWxlcnRUb3BpYyA9IG5ldyBUb3BpYyh0aGlzLCAnQWxlcnRUb3BpYycsIHtcbiAgICAgICAgICAgIGRpc3BsYXlOYW1lOiBgQWxlcnQgVG9waWMgZm9yIHJlcG8gJHtjb25maWcuZ2l0aHViT3duZXJ9LyR7Y29uZmlnLmdpdGh1YlJlcG99YCxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChjb25maWcuYWxlcnRFbWFpbCkge1xuICAgICAgICAgICAgYWxlcnRUb3BpYy5hZGRTdWJzY3JpcHRpb24obmV3IEVtYWlsU3Vic2NyaXB0aW9uKGNvbmZpZy5hbGVydEVtYWlsLCB7IGpzb246IGZhbHNlIH0pKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNvdXJjZSA9IFNvdXJjZS5naXRIdWIoe1xuICAgICAgICAgICAgb3duZXI6IGNvbmZpZy5naXRodWJPd25lcixcbiAgICAgICAgICAgIHJlcG86IGNvbmZpZy5naXRodWJSZXBvLFxuICAgICAgICAgICAgd2ViaG9vazogdHJ1ZSxcbiAgICAgICAgICAgIHJlcG9ydEJ1aWxkU3RhdHVzOiB0cnVlLFxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgYnVpbGRQcm9qZWN0ID0gbmV3IFByb2plY3QodGhpcywgJ0J1aWxkUHJvamVjdCcsIHtcbiAgICAgICAgICAgIHNvdXJjZSxcbiAgICAgICAgICAgIGJhZGdlOiB0cnVlLFxuICAgICAgICAgICAgYnVpbGRTcGVjOiBjb25maWcudXNlQnVpbGRTcGVjRmlsZSA/IEJ1aWxkU3BlYy5mcm9tU291cmNlRmlsZW5hbWUoJ2J1aWxkc3BlYy55YW1sJykgOiBidWlsZFNwZWMsXG4gICAgICAgICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICAgICAgICAgIGJ1aWxkSW1hZ2U6IExpbnV4QnVpbGRJbWFnZS5VQlVOVFVfMTRfMDRfTk9ERUpTXzEwXzFfMCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogYFRoZSBDb2RlQnVpbGQgcHJvamVjdCBmb3IgcmVwbyAke2NvbmZpZy5naXRodWJPd25lcn0vJHtjb25maWcuZ2l0aHViUmVwb31gLFxuICAgICAgICAgICAgcHJvamVjdE5hbWU6IGAke2NvbmZpZy5naXRodWJPd25lcn0tJHtjb25maWcuZ2l0aHViUmVwb31gLFxuICAgICAgICB9KTtcbiAgICAgICAgYnVpbGRQcm9qZWN0Lm9uQnVpbGRGYWlsZWQoJ0J1aWxkRmFpbGVkJywge3RhcmdldDogbmV3IFNuc1RvcGljKGFsZXJ0VG9waWMpfSk7XG4gICAgfVxufVxuIl19