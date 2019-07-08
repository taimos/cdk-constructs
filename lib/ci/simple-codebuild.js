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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2ltcGxlLWNvZGVidWlsZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNpbXBsZS1jb2RlYnVpbGQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwwREFBcUY7QUFDckYsb0VBQXVEO0FBQ3ZELDhDQUF5QztBQUN6QywwRUFBbUU7QUFDbkUsd0NBQTJDO0FBVzNDLE1BQWEsb0JBQXFCLFNBQVEsWUFBSztJQUMzQyxZQUFZLE1BQVksRUFBRSxNQUE4QjtRQUNwRCxLQUFLLENBQUMsTUFBTSxFQUFFLEdBQUcsTUFBTSxDQUFDLFdBQVcsSUFBSSxNQUFNLENBQUMsVUFBVSxZQUFZLENBQUMsQ0FBQztRQUN0RSxJQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsR0FBRyxrQ0FBa0MsTUFBTSxDQUFDLFdBQVcsSUFBSSxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7UUFFL0csTUFBTSxTQUFTLEdBQUcseUJBQVMsQ0FBQyxVQUFVLENBQUM7WUFDbkMsT0FBTyxFQUFFLEdBQUc7WUFDWixNQUFNLEVBQUU7Z0JBQ0osU0FBUyxFQUFFO29CQUNQLFFBQVEsRUFBRSxDQUFDLGFBQWEsQ0FBQztpQkFDNUI7Z0JBQ0QsS0FBSyxFQUFFO29CQUNILFFBQVEsRUFBRTt3QkFDTixVQUFVO3dCQUNWLGVBQWU7cUJBQ2xCO2lCQUNKO2FBQ0o7U0FDSixDQUFDLENBQUM7UUFFSCxNQUFNLFVBQVUsR0FBRyxJQUFJLGVBQUssQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO1lBQzdDLFdBQVcsRUFBRSx3QkFBd0IsTUFBTSxDQUFDLFdBQVcsSUFBSSxNQUFNLENBQUMsVUFBVSxFQUFFO1NBQ2pGLENBQUMsQ0FBQztRQUNILElBQUksTUFBTSxDQUFDLFVBQVUsRUFBRTtZQUNuQixVQUFVLENBQUMsZUFBZSxDQUFDLElBQUkseUNBQWlCLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDekY7UUFFRCxNQUFNLE1BQU0sR0FBRyxzQkFBTSxDQUFDLE1BQU0sQ0FBQztZQUN6QixLQUFLLEVBQUUsTUFBTSxDQUFDLFdBQVc7WUFDekIsSUFBSSxFQUFFLE1BQU0sQ0FBQyxVQUFVO1lBQ3ZCLE9BQU8sRUFBRSxJQUFJO1lBQ2IsaUJBQWlCLEVBQUUsSUFBSTtTQUMxQixDQUFDLENBQUM7UUFDSCxNQUFNLFlBQVksR0FBRyxJQUFJLHVCQUFPLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRTtZQUNuRCxNQUFNO1lBQ04sS0FBSyxFQUFFLElBQUk7WUFDWCxTQUFTLEVBQUUsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyx5QkFBUyxDQUFDLGtCQUFrQixDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVM7WUFDL0YsV0FBVyxFQUFFO2dCQUNULFVBQVUsRUFBRSwrQkFBZSxDQUFDLDBCQUEwQjthQUN6RDtZQUNELFdBQVcsRUFBRSxrQ0FBa0MsTUFBTSxDQUFDLFdBQVcsSUFBSSxNQUFNLENBQUMsVUFBVSxFQUFFO1lBQ3hGLFdBQVcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxXQUFXLElBQUksTUFBTSxDQUFDLFVBQVUsRUFBRTtTQUM1RCxDQUFDLENBQUM7UUFDSCxZQUFZLENBQUMsYUFBYSxDQUFDLGFBQWEsRUFBRSxFQUFDLE1BQU0sRUFBRSxJQUFJLDZCQUFRLENBQUMsVUFBVSxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQ2xGLENBQUM7Q0FDSjtBQTdDRCxvREE2Q0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBCdWlsZFNwZWMsIExpbnV4QnVpbGRJbWFnZSwgUHJvamVjdCwgU291cmNlIH0gZnJvbSAnQGF3cy1jZGsvYXdzLWNvZGVidWlsZCc7XG5pbXBvcnQgeyBTbnNUb3BpYyB9IGZyb20gJ0Bhd3MtY2RrL2F3cy1ldmVudHMtdGFyZ2V0cyc7XG5pbXBvcnQgeyBUb3BpYyB9IGZyb20gJ0Bhd3MtY2RrL2F3cy1zbnMnO1xuaW1wb3J0IHsgRW1haWxTdWJzY3JpcHRpb24gfSBmcm9tICdAYXdzLWNkay9hd3Mtc25zLXN1YnNjcmlwdGlvbnMnO1xuaW1wb3J0IHsgQXBwLCBTdGFjayB9IGZyb20gJ0Bhd3MtY2RrL2NvcmUnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNpbXBsZUNvZGVCdWlsZENvbmZpZyB7XG4gICAgcmVhZG9ubHkgZ2l0aHViT3duZXIgOiBzdHJpbmc7XG4gICAgcmVhZG9ubHkgZ2l0aHViUmVwbyA6IHN0cmluZztcbiAgICByZWFkb25seSBicmFuY2g/IDogc3RyaW5nO1xuICAgIHJlYWRvbmx5IGdpdGh1YlNlY3JldElkPyA6IHN0cmluZztcbiAgICByZWFkb25seSB1c2VCdWlsZFNwZWNGaWxlPyA6IGJvb2xlYW47XG4gICAgcmVhZG9ubHkgYWxlcnRFbWFpbD8gOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjbGFzcyBTaW1wbGVDb2RlQnVpbGRTdGFjayBleHRlbmRzIFN0YWNrIHtcbiAgICBjb25zdHJ1Y3RvcihwYXJlbnQgOiBBcHAsIGNvbmZpZyA6IFNpbXBsZUNvZGVCdWlsZENvbmZpZykge1xuICAgICAgICBzdXBlcihwYXJlbnQsIGAke2NvbmZpZy5naXRodWJPd25lcn0tJHtjb25maWcuZ2l0aHViUmVwb30tY29kZWJ1aWxkYCk7XG4gICAgICAgIHRoaXMudGVtcGxhdGVPcHRpb25zLmRlc2NyaXB0aW9uID0gYFRoZSBDb2RlQnVpbGQgcHJvamVjdCBmb3IgcmVwbyAke2NvbmZpZy5naXRodWJPd25lcn0vJHtjb25maWcuZ2l0aHViUmVwb31gO1xuXG4gICAgICAgIGNvbnN0IGJ1aWxkU3BlYyA9IEJ1aWxkU3BlYy5mcm9tT2JqZWN0KHtcbiAgICAgICAgICAgIHZlcnNpb246IDAuMixcbiAgICAgICAgICAgIHBoYXNlczoge1xuICAgICAgICAgICAgICAgIHByZV9idWlsZDoge1xuICAgICAgICAgICAgICAgICAgICBjb21tYW5kczogWyducG0gaW5zdGFsbCddLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgYnVpbGQ6IHtcbiAgICAgICAgICAgICAgICAgICAgY29tbWFuZHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICducG0gdGVzdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAnbnBtIHJ1biBidWlsZCcsXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGFsZXJ0VG9waWMgPSBuZXcgVG9waWModGhpcywgJ0FsZXJ0VG9waWMnLCB7XG4gICAgICAgICAgICBkaXNwbGF5TmFtZTogYEFsZXJ0IFRvcGljIGZvciByZXBvICR7Y29uZmlnLmdpdGh1Yk93bmVyfS8ke2NvbmZpZy5naXRodWJSZXBvfWAsXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoY29uZmlnLmFsZXJ0RW1haWwpIHtcbiAgICAgICAgICAgIGFsZXJ0VG9waWMuYWRkU3Vic2NyaXB0aW9uKG5ldyBFbWFpbFN1YnNjcmlwdGlvbihjb25maWcuYWxlcnRFbWFpbCwgeyBqc29uOiBmYWxzZSB9KSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzb3VyY2UgPSBTb3VyY2UuZ2l0SHViKHtcbiAgICAgICAgICAgIG93bmVyOiBjb25maWcuZ2l0aHViT3duZXIsXG4gICAgICAgICAgICByZXBvOiBjb25maWcuZ2l0aHViUmVwbyxcbiAgICAgICAgICAgIHdlYmhvb2s6IHRydWUsXG4gICAgICAgICAgICByZXBvcnRCdWlsZFN0YXR1czogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IGJ1aWxkUHJvamVjdCA9IG5ldyBQcm9qZWN0KHRoaXMsICdCdWlsZFByb2plY3QnLCB7XG4gICAgICAgICAgICBzb3VyY2UsXG4gICAgICAgICAgICBiYWRnZTogdHJ1ZSxcbiAgICAgICAgICAgIGJ1aWxkU3BlYzogY29uZmlnLnVzZUJ1aWxkU3BlY0ZpbGUgPyBCdWlsZFNwZWMuZnJvbVNvdXJjZUZpbGVuYW1lKCdidWlsZHNwZWMueWFtbCcpIDogYnVpbGRTcGVjLFxuICAgICAgICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgICAgICAgICBidWlsZEltYWdlOiBMaW51eEJ1aWxkSW1hZ2UuVUJVTlRVXzE0XzA0X05PREVKU18xMF8xXzAsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IGBUaGUgQ29kZUJ1aWxkIHByb2plY3QgZm9yIHJlcG8gJHtjb25maWcuZ2l0aHViT3duZXJ9LyR7Y29uZmlnLmdpdGh1YlJlcG99YCxcbiAgICAgICAgICAgIHByb2plY3ROYW1lOiBgJHtjb25maWcuZ2l0aHViT3duZXJ9LSR7Y29uZmlnLmdpdGh1YlJlcG99YCxcbiAgICAgICAgfSk7XG4gICAgICAgIGJ1aWxkUHJvamVjdC5vbkJ1aWxkRmFpbGVkKCdCdWlsZEZhaWxlZCcsIHt0YXJnZXQ6IG5ldyBTbnNUb3BpYyhhbGVydFRvcGljKX0pO1xuICAgIH1cbn1cbiJdfQ==