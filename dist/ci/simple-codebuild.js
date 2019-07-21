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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2ltcGxlLWNvZGVidWlsZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9jaS9zaW1wbGUtY29kZWJ1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMERBQXFGO0FBQ3JGLG9FQUF1RDtBQUN2RCw4Q0FBeUM7QUFDekMsMEVBQW1FO0FBQ25FLHdDQUEyQztBQVczQyxNQUFhLG9CQUFxQixTQUFRLFlBQUs7SUFDM0MsWUFBWSxNQUFZLEVBQUUsTUFBOEI7UUFDcEQsS0FBSyxDQUFDLE1BQU0sRUFBRSxHQUFHLE1BQU0sQ0FBQyxXQUFXLElBQUksTUFBTSxDQUFDLFVBQVUsWUFBWSxDQUFDLENBQUM7UUFDdEUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLEdBQUcsa0NBQWtDLE1BQU0sQ0FBQyxXQUFXLElBQUksTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBRS9HLE1BQU0sU0FBUyxHQUFHLHlCQUFTLENBQUMsVUFBVSxDQUFDO1lBQ25DLE9BQU8sRUFBRSxHQUFHO1lBQ1osTUFBTSxFQUFFO2dCQUNKLFNBQVMsRUFBRTtvQkFDUCxRQUFRLEVBQUUsQ0FBQyxhQUFhLENBQUM7aUJBQzVCO2dCQUNELEtBQUssRUFBRTtvQkFDSCxRQUFRLEVBQUU7d0JBQ04sVUFBVTt3QkFDVixlQUFlO3FCQUNsQjtpQkFDSjthQUNKO1NBQ0osQ0FBQyxDQUFDO1FBRUgsTUFBTSxVQUFVLEdBQUcsSUFBSSxlQUFLLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRTtZQUM3QyxXQUFXLEVBQUUsd0JBQXdCLE1BQU0sQ0FBQyxXQUFXLElBQUksTUFBTSxDQUFDLFVBQVUsRUFBRTtTQUNqRixDQUFDLENBQUM7UUFDSCxJQUFJLE1BQU0sQ0FBQyxVQUFVLEVBQUU7WUFDbkIsVUFBVSxDQUFDLGVBQWUsQ0FBQyxJQUFJLHlDQUFpQixDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQ3pGO1FBRUQsTUFBTSxNQUFNLEdBQUcsc0JBQU0sQ0FBQyxNQUFNLENBQUM7WUFDekIsS0FBSyxFQUFFLE1BQU0sQ0FBQyxXQUFXO1lBQ3pCLElBQUksRUFBRSxNQUFNLENBQUMsVUFBVTtZQUN2QixPQUFPLEVBQUUsSUFBSTtZQUNiLGlCQUFpQixFQUFFLElBQUk7U0FDMUIsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxZQUFZLEdBQUcsSUFBSSx1QkFBTyxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUU7WUFDbkQsTUFBTTtZQUNOLEtBQUssRUFBRSxJQUFJO1lBQ1gsU0FBUyxFQUFFLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMseUJBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO1lBQy9GLFdBQVcsRUFBRTtnQkFDVCxVQUFVLEVBQUUsK0JBQWUsQ0FBQywwQkFBMEI7YUFDekQ7WUFDRCxXQUFXLEVBQUUsa0NBQWtDLE1BQU0sQ0FBQyxXQUFXLElBQUksTUFBTSxDQUFDLFVBQVUsRUFBRTtZQUN4RixXQUFXLEVBQUUsR0FBRyxNQUFNLENBQUMsV0FBVyxJQUFJLE1BQU0sQ0FBQyxVQUFVLEVBQUU7U0FDNUQsQ0FBQyxDQUFDO1FBQ0gsWUFBWSxDQUFDLGFBQWEsQ0FBQyxhQUFhLEVBQUUsRUFBQyxNQUFNLEVBQUUsSUFBSSw2QkFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFDLENBQUMsQ0FBQztJQUNsRixDQUFDO0NBQ0o7QUE3Q0Qsb0RBNkNDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQnVpbGRTcGVjLCBMaW51eEJ1aWxkSW1hZ2UsIFByb2plY3QsIFNvdXJjZSB9IGZyb20gJ0Bhd3MtY2RrL2F3cy1jb2RlYnVpbGQnO1xuaW1wb3J0IHsgU25zVG9waWMgfSBmcm9tICdAYXdzLWNkay9hd3MtZXZlbnRzLXRhcmdldHMnO1xuaW1wb3J0IHsgVG9waWMgfSBmcm9tICdAYXdzLWNkay9hd3Mtc25zJztcbmltcG9ydCB7IEVtYWlsU3Vic2NyaXB0aW9uIH0gZnJvbSAnQGF3cy1jZGsvYXdzLXNucy1zdWJzY3JpcHRpb25zJztcbmltcG9ydCB7IEFwcCwgU3RhY2sgfSBmcm9tICdAYXdzLWNkay9jb3JlJztcblxuZXhwb3J0IGludGVyZmFjZSBTaW1wbGVDb2RlQnVpbGRDb25maWcge1xuICAgIHJlYWRvbmx5IGdpdGh1Yk93bmVyIDogc3RyaW5nO1xuICAgIHJlYWRvbmx5IGdpdGh1YlJlcG8gOiBzdHJpbmc7XG4gICAgcmVhZG9ubHkgYnJhbmNoPyA6IHN0cmluZztcbiAgICByZWFkb25seSBnaXRodWJTZWNyZXRJZD8gOiBzdHJpbmc7XG4gICAgcmVhZG9ubHkgdXNlQnVpbGRTcGVjRmlsZT8gOiBib29sZWFuO1xuICAgIHJlYWRvbmx5IGFsZXJ0RW1haWw/IDogc3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgU2ltcGxlQ29kZUJ1aWxkU3RhY2sgZXh0ZW5kcyBTdGFjayB7XG4gICAgY29uc3RydWN0b3IocGFyZW50IDogQXBwLCBjb25maWcgOiBTaW1wbGVDb2RlQnVpbGRDb25maWcpIHtcbiAgICAgICAgc3VwZXIocGFyZW50LCBgJHtjb25maWcuZ2l0aHViT3duZXJ9LSR7Y29uZmlnLmdpdGh1YlJlcG99LWNvZGVidWlsZGApO1xuICAgICAgICB0aGlzLnRlbXBsYXRlT3B0aW9ucy5kZXNjcmlwdGlvbiA9IGBUaGUgQ29kZUJ1aWxkIHByb2plY3QgZm9yIHJlcG8gJHtjb25maWcuZ2l0aHViT3duZXJ9LyR7Y29uZmlnLmdpdGh1YlJlcG99YDtcblxuICAgICAgICBjb25zdCBidWlsZFNwZWMgPSBCdWlsZFNwZWMuZnJvbU9iamVjdCh7XG4gICAgICAgICAgICB2ZXJzaW9uOiAwLjIsXG4gICAgICAgICAgICBwaGFzZXM6IHtcbiAgICAgICAgICAgICAgICBwcmVfYnVpbGQ6IHtcbiAgICAgICAgICAgICAgICAgICAgY29tbWFuZHM6IFsnbnBtIGluc3RhbGwnXSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGJ1aWxkOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbW1hbmRzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAnbnBtIHRlc3QnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ25wbSBydW4gYnVpbGQnLFxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBhbGVydFRvcGljID0gbmV3IFRvcGljKHRoaXMsICdBbGVydFRvcGljJywge1xuICAgICAgICAgICAgZGlzcGxheU5hbWU6IGBBbGVydCBUb3BpYyBmb3IgcmVwbyAke2NvbmZpZy5naXRodWJPd25lcn0vJHtjb25maWcuZ2l0aHViUmVwb31gLFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGNvbmZpZy5hbGVydEVtYWlsKSB7XG4gICAgICAgICAgICBhbGVydFRvcGljLmFkZFN1YnNjcmlwdGlvbihuZXcgRW1haWxTdWJzY3JpcHRpb24oY29uZmlnLmFsZXJ0RW1haWwsIHsganNvbjogZmFsc2UgfSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc291cmNlID0gU291cmNlLmdpdEh1Yih7XG4gICAgICAgICAgICBvd25lcjogY29uZmlnLmdpdGh1Yk93bmVyLFxuICAgICAgICAgICAgcmVwbzogY29uZmlnLmdpdGh1YlJlcG8sXG4gICAgICAgICAgICB3ZWJob29rOiB0cnVlLFxuICAgICAgICAgICAgcmVwb3J0QnVpbGRTdGF0dXM6IHRydWUsXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBidWlsZFByb2plY3QgPSBuZXcgUHJvamVjdCh0aGlzLCAnQnVpbGRQcm9qZWN0Jywge1xuICAgICAgICAgICAgc291cmNlLFxuICAgICAgICAgICAgYmFkZ2U6IHRydWUsXG4gICAgICAgICAgICBidWlsZFNwZWM6IGNvbmZpZy51c2VCdWlsZFNwZWNGaWxlID8gQnVpbGRTcGVjLmZyb21Tb3VyY2VGaWxlbmFtZSgnYnVpbGRzcGVjLnlhbWwnKSA6IGJ1aWxkU3BlYyxcbiAgICAgICAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgICAgICAgICAgYnVpbGRJbWFnZTogTGludXhCdWlsZEltYWdlLlVCVU5UVV8xNF8wNF9OT0RFSlNfMTBfMV8wLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBgVGhlIENvZGVCdWlsZCBwcm9qZWN0IGZvciByZXBvICR7Y29uZmlnLmdpdGh1Yk93bmVyfS8ke2NvbmZpZy5naXRodWJSZXBvfWAsXG4gICAgICAgICAgICBwcm9qZWN0TmFtZTogYCR7Y29uZmlnLmdpdGh1Yk93bmVyfS0ke2NvbmZpZy5naXRodWJSZXBvfWAsXG4gICAgICAgIH0pO1xuICAgICAgICBidWlsZFByb2plY3Qub25CdWlsZEZhaWxlZCgnQnVpbGRGYWlsZWQnLCB7dGFyZ2V0OiBuZXcgU25zVG9waWMoYWxlcnRUb3BpYyl9KTtcbiAgICB9XG59XG4iXX0=