"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_iam_1 = require("@aws-cdk/aws-iam");
const aws_lambda_1 = require("@aws-cdk/aws-lambda");
const aws_s3_1 = require("@aws-cdk/aws-s3");
const aws_sam_1 = require("@aws-cdk/aws-sam");
const core_1 = require("@aws-cdk/core");
class AlexaSkillStack extends core_1.Stack {
    constructor(parent, config) {
        super(parent, config.skillName);
        this.templateOptions.description = `The Alexa Skill ${config.skillName}`;
        const aws = new core_1.ScopedAws(this);
        const assetBucket = new aws_s3_1.Bucket(this, 'AssetBucket', {
            bucketName: `${aws.accountId}-${config.skillName}-${aws.region}-assets`,
        });
        assetBucket.grantPublicAccess();
        const userTable = new aws_sam_1.CfnSimpleTable(this, 'AttributesTable', {
            primaryKey: {
                name: config.userAttribute || 'id',
                type: 'String',
            },
        });
        new aws_sam_1.CfnFunction(this, 'SkillFunction', {
            handler: 'dist/index.handler',
            runtime: 'nodejs8.10',
            timeout: 10,
            autoPublishAlias: 'latest',
            codeUri: './skill/dist/bundle.zip',
            policies: [
                {
                    statement: new aws_iam_1.PolicyStatement({
                        actions: ['dynamodb:Batch*', 'dynamodb:DeleteItem', 'dynamodb:Get*', 'dynamodb:PutItem', 'dynamodb:UpdateItem', 'dynamodb:Query', 'dynamodb:Scan'],
                        // tslint:disable-next-line:no-invalid-template-strings
                        resources: [core_1.Fn.sub('arn:aws:dynamodb:${AWS::Region}:${AWS::AccountId}:table/${AttributesTable}')],
                    }),
                },
            ],
            environment: {
                variables: {
                    ...config.environment,
                    TABLE_NAME: userTable.ref,
                    ASSET_BUCKET: assetBucket.bucketName,
                    ASSET_BUCKET_URL: assetBucket.bucketWebsiteUrl,
                    SKILL_ID: config.skillId,
                    ...config.thundraKey && { thundra_apiKey: config.thundraKey },
                },
            },
            ...config.thundraKey && {
                runtime: 'provided',
                layers: [`arn:aws:lambda:${aws.region}:269863060030:layer:thundra-lambda-node-layer:12`],
            },
        });
        const skillFunctionPermission = new aws_lambda_1.CfnPermission(this, 'SkillFunctionPermission', {
            action: 'lambda:invokeFunction',
            // tslint:disable-next-line:no-invalid-template-strings
            functionName: core_1.Fn.sub('${SkillFunction.Version}'),
            principal: 'alexa-appkit.amazon.com',
        });
        skillFunctionPermission.cfnOptions.deletionPolicy = core_1.CfnDeletionPolicy.RETAIN;
        skillFunctionPermission.cfnOptions.updateReplacePolicy = core_1.CfnDeletionPolicy.RETAIN;
        new core_1.CfnOutput(this, 'overrides', {
            // tslint:disable-next-line:no-invalid-template-strings
            value: core_1.Fn.sub('{"manifest": {"apis": {"custom": {"endpoint": {"uri": "${SkillFunction.Version}"}}}}}'),
        });
    }
}
exports.AlexaSkillStack = AlexaSkillStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2tpbGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9saWIvYWxleGEvc2tpbGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw4Q0FBbUQ7QUFDbkQsb0RBQW9EO0FBQ3BELDRDQUF5QztBQUN6Qyw4Q0FBK0Q7QUFDL0Qsd0NBQXdGO0FBc0J4RixNQUFhLGVBQWdCLFNBQVEsWUFBSztJQUN0QyxZQUFZLE1BQVksRUFBRSxNQUF5QjtRQUMvQyxLQUFLLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsR0FBRyxtQkFBbUIsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3pFLE1BQU0sR0FBRyxHQUFHLElBQUksZ0JBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVoQyxNQUFNLFdBQVcsR0FBRyxJQUFJLGVBQU0sQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFO1lBQ2hELFVBQVUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxTQUFTLElBQUksTUFBTSxDQUFDLFNBQVMsSUFBSSxHQUFHLENBQUMsTUFBTSxTQUFTO1NBQzFFLENBQUMsQ0FBQztRQUNILFdBQVcsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBRWhDLE1BQU0sU0FBUyxHQUFHLElBQUksd0JBQWMsQ0FBQyxJQUFJLEVBQUUsaUJBQWlCLEVBQUU7WUFDMUQsVUFBVSxFQUFFO2dCQUNSLElBQUksRUFBRSxNQUFNLENBQUMsYUFBYSxJQUFJLElBQUk7Z0JBQ2xDLElBQUksRUFBRSxRQUFRO2FBQ2pCO1NBQ0osQ0FBQyxDQUFDO1FBRUgsSUFBSSxxQkFBVyxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUU7WUFDbkMsT0FBTyxFQUFFLG9CQUFvQjtZQUM3QixPQUFPLEVBQUUsWUFBWTtZQUNyQixPQUFPLEVBQUUsRUFBRTtZQUNYLGdCQUFnQixFQUFFLFFBQVE7WUFDMUIsT0FBTyxFQUFFLHlCQUF5QjtZQUNsQyxRQUFRLEVBQUU7Z0JBQ047b0JBQ0ksU0FBUyxFQUFFLElBQUkseUJBQWUsQ0FBQzt3QkFDM0IsT0FBTyxFQUFFLENBQUMsaUJBQWlCLEVBQUUscUJBQXFCLEVBQUUsZUFBZSxFQUFFLGtCQUFrQixFQUFFLHFCQUFxQixFQUFFLGdCQUFnQixFQUFFLGVBQWUsQ0FBQzt3QkFDbEosdURBQXVEO3dCQUN2RCxTQUFTLEVBQUUsQ0FBQyxTQUFFLENBQUMsR0FBRyxDQUFDLDRFQUE0RSxDQUFDLENBQUM7cUJBQ3BHLENBQUM7aUJBQ0w7YUFDSjtZQUNELFdBQVcsRUFBRTtnQkFDVCxTQUFTLEVBQUU7b0JBQ1AsR0FBRyxNQUFNLENBQUMsV0FBVztvQkFDckIsVUFBVSxFQUFFLFNBQVMsQ0FBQyxHQUFHO29CQUN6QixZQUFZLEVBQUUsV0FBVyxDQUFDLFVBQVU7b0JBQ3BDLGdCQUFnQixFQUFFLFdBQVcsQ0FBQyxnQkFBZ0I7b0JBQzlDLFFBQVEsRUFBRSxNQUFNLENBQUMsT0FBTztvQkFDeEIsR0FBRyxNQUFNLENBQUMsVUFBVSxJQUFJLEVBQUUsY0FBYyxFQUFFLE1BQU0sQ0FBQyxVQUFVLEVBQUU7aUJBQ2hFO2FBQ0o7WUFDRCxHQUFHLE1BQU0sQ0FBQyxVQUFVLElBQUk7Z0JBQ3BCLE9BQU8sRUFBRSxVQUFVO2dCQUNuQixNQUFNLEVBQUUsQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLE1BQU0sa0RBQWtELENBQUM7YUFDM0Y7U0FDSixDQUFDLENBQUM7UUFFSCxNQUFNLHVCQUF1QixHQUFHLElBQUksMEJBQWEsQ0FBQyxJQUFJLEVBQUUseUJBQXlCLEVBQUU7WUFDL0UsTUFBTSxFQUFFLHVCQUF1QjtZQUMvQix1REFBdUQ7WUFDdkQsWUFBWSxFQUFFLFNBQUUsQ0FBQyxHQUFHLENBQUMsMEJBQTBCLENBQUM7WUFDaEQsU0FBUyxFQUFFLHlCQUF5QjtTQUN2QyxDQUFDLENBQUM7UUFDSCx1QkFBdUIsQ0FBQyxVQUFVLENBQUMsY0FBYyxHQUFHLHdCQUFpQixDQUFDLE1BQU0sQ0FBQztRQUM3RSx1QkFBdUIsQ0FBQyxVQUFVLENBQUMsbUJBQW1CLEdBQUcsd0JBQWlCLENBQUMsTUFBTSxDQUFDO1FBRWxGLElBQUksZ0JBQVMsQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFO1lBQzdCLHVEQUF1RDtZQUN2RCxLQUFLLEVBQUUsU0FBRSxDQUFDLEdBQUcsQ0FBQyx1RkFBdUYsQ0FBQztTQUN6RyxDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7QUEvREQsMENBK0RDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUG9saWN5U3RhdGVtZW50IH0gZnJvbSAnQGF3cy1jZGsvYXdzLWlhbSc7XG5pbXBvcnQgeyBDZm5QZXJtaXNzaW9uIH0gZnJvbSAnQGF3cy1jZGsvYXdzLWxhbWJkYSc7XG5pbXBvcnQgeyBCdWNrZXQgfSBmcm9tICdAYXdzLWNkay9hd3MtczMnO1xuaW1wb3J0IHsgQ2ZuRnVuY3Rpb24sIENmblNpbXBsZVRhYmxlIH0gZnJvbSAnQGF3cy1jZGsvYXdzLXNhbSc7XG5pbXBvcnQgeyBBcHAsIENmbkRlbGV0aW9uUG9saWN5LCBDZm5PdXRwdXQsIEZuLCBTY29wZWRBd3MsIFN0YWNrIH0gZnJvbSAnQGF3cy1jZGsvY29yZSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQWxleGFTa2lsbENvbmZpZyB7XG4gICAgLyoqIFRoZSBBbGV4YSBTa2lsbCBpZCAqL1xuICAgIHJlYWRvbmx5IHNraWxsSWQgOiBzdHJpbmc7XG5cbiAgICAvKiogVGhlIEFsZXhhIFNraWxsIG5hbWUgKi9cbiAgICByZWFkb25seSBza2lsbE5hbWUgOiBzdHJpbmc7XG5cbiAgICAvKiogT3B0aW9uYWwgQVBJIEtleSBmb3IgVGh1bmRyYSAqL1xuICAgIHJlYWRvbmx5IHRodW5kcmFLZXk/IDogc3RyaW5nO1xuXG4gICAgLyoqIEVudmlyb25lbWVudCB2YXJpYWJsZXMgZm9yIHRoZSBMYW1iZGEgZnVuY3Rpb24gKi9cbiAgICByZWFkb25seSBlbnZpcm9ubWVudD8gOiB7IFtrZXkgOiBzdHJpbmddIDogc3RyaW5nIH07XG5cbiAgICAvKipcbiAgICAgKiBuYW1lIG9mIHRoZSB1c2VyIGF0dHJpYnV0ZSBmb3IgRHluYW1vREJcbiAgICAgKiBAZGVmYXVsdCBpZFxuICAgICAqL1xuICAgIHJlYWRvbmx5IHVzZXJBdHRyaWJ1dGU/IDogc3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgQWxleGFTa2lsbFN0YWNrIGV4dGVuZHMgU3RhY2sge1xuICAgIGNvbnN0cnVjdG9yKHBhcmVudCA6IEFwcCwgY29uZmlnIDogQWxleGFTa2lsbENvbmZpZykge1xuICAgICAgICBzdXBlcihwYXJlbnQsIGNvbmZpZy5za2lsbE5hbWUpO1xuICAgICAgICB0aGlzLnRlbXBsYXRlT3B0aW9ucy5kZXNjcmlwdGlvbiA9IGBUaGUgQWxleGEgU2tpbGwgJHtjb25maWcuc2tpbGxOYW1lfWA7XG4gICAgICAgIGNvbnN0IGF3cyA9IG5ldyBTY29wZWRBd3ModGhpcyk7XG5cbiAgICAgICAgY29uc3QgYXNzZXRCdWNrZXQgPSBuZXcgQnVja2V0KHRoaXMsICdBc3NldEJ1Y2tldCcsIHtcbiAgICAgICAgICAgIGJ1Y2tldE5hbWU6IGAke2F3cy5hY2NvdW50SWR9LSR7Y29uZmlnLnNraWxsTmFtZX0tJHthd3MucmVnaW9ufS1hc3NldHNgLFxuICAgICAgICB9KTtcbiAgICAgICAgYXNzZXRCdWNrZXQuZ3JhbnRQdWJsaWNBY2Nlc3MoKTtcblxuICAgICAgICBjb25zdCB1c2VyVGFibGUgPSBuZXcgQ2ZuU2ltcGxlVGFibGUodGhpcywgJ0F0dHJpYnV0ZXNUYWJsZScsIHtcbiAgICAgICAgICAgIHByaW1hcnlLZXk6IHtcbiAgICAgICAgICAgICAgICBuYW1lOiBjb25maWcudXNlckF0dHJpYnV0ZSB8fCAnaWQnLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdTdHJpbmcnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbmV3IENmbkZ1bmN0aW9uKHRoaXMsICdTa2lsbEZ1bmN0aW9uJywge1xuICAgICAgICAgICAgaGFuZGxlcjogJ2Rpc3QvaW5kZXguaGFuZGxlcicsXG4gICAgICAgICAgICBydW50aW1lOiAnbm9kZWpzOC4xMCcsXG4gICAgICAgICAgICB0aW1lb3V0OiAxMCxcbiAgICAgICAgICAgIGF1dG9QdWJsaXNoQWxpYXM6ICdsYXRlc3QnLFxuICAgICAgICAgICAgY29kZVVyaTogJy4vc2tpbGwvZGlzdC9idW5kbGUuemlwJyxcbiAgICAgICAgICAgIHBvbGljaWVzOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBzdGF0ZW1lbnQ6IG5ldyBQb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uczogWydkeW5hbW9kYjpCYXRjaConLCAnZHluYW1vZGI6RGVsZXRlSXRlbScsICdkeW5hbW9kYjpHZXQqJywgJ2R5bmFtb2RiOlB1dEl0ZW0nLCAnZHluYW1vZGI6VXBkYXRlSXRlbScsICdkeW5hbW9kYjpRdWVyeScsICdkeW5hbW9kYjpTY2FuJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8taW52YWxpZC10ZW1wbGF0ZS1zdHJpbmdzXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvdXJjZXM6IFtGbi5zdWIoJ2Fybjphd3M6ZHluYW1vZGI6JHtBV1M6OlJlZ2lvbn06JHtBV1M6OkFjY291bnRJZH06dGFibGUvJHtBdHRyaWJ1dGVzVGFibGV9JyldLFxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgICAgICAgICAgdmFyaWFibGVzOiB7XG4gICAgICAgICAgICAgICAgICAgIC4uLmNvbmZpZy5lbnZpcm9ubWVudCxcbiAgICAgICAgICAgICAgICAgICAgVEFCTEVfTkFNRTogdXNlclRhYmxlLnJlZixcbiAgICAgICAgICAgICAgICAgICAgQVNTRVRfQlVDS0VUOiBhc3NldEJ1Y2tldC5idWNrZXROYW1lLFxuICAgICAgICAgICAgICAgICAgICBBU1NFVF9CVUNLRVRfVVJMOiBhc3NldEJ1Y2tldC5idWNrZXRXZWJzaXRlVXJsLFxuICAgICAgICAgICAgICAgICAgICBTS0lMTF9JRDogY29uZmlnLnNraWxsSWQsXG4gICAgICAgICAgICAgICAgICAgIC4uLmNvbmZpZy50aHVuZHJhS2V5ICYmIHsgdGh1bmRyYV9hcGlLZXk6IGNvbmZpZy50aHVuZHJhS2V5IH0sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAuLi5jb25maWcudGh1bmRyYUtleSAmJiB7XG4gICAgICAgICAgICAgICAgcnVudGltZTogJ3Byb3ZpZGVkJyxcbiAgICAgICAgICAgICAgICBsYXllcnM6IFtgYXJuOmF3czpsYW1iZGE6JHthd3MucmVnaW9ufToyNjk4NjMwNjAwMzA6bGF5ZXI6dGh1bmRyYS1sYW1iZGEtbm9kZS1sYXllcjoxMmBdLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3Qgc2tpbGxGdW5jdGlvblBlcm1pc3Npb24gPSBuZXcgQ2ZuUGVybWlzc2lvbih0aGlzLCAnU2tpbGxGdW5jdGlvblBlcm1pc3Npb24nLCB7XG4gICAgICAgICAgICBhY3Rpb246ICdsYW1iZGE6aW52b2tlRnVuY3Rpb24nLFxuICAgICAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWludmFsaWQtdGVtcGxhdGUtc3RyaW5nc1xuICAgICAgICAgICAgZnVuY3Rpb25OYW1lOiBGbi5zdWIoJyR7U2tpbGxGdW5jdGlvbi5WZXJzaW9ufScpLFxuICAgICAgICAgICAgcHJpbmNpcGFsOiAnYWxleGEtYXBwa2l0LmFtYXpvbi5jb20nLFxuICAgICAgICB9KTtcbiAgICAgICAgc2tpbGxGdW5jdGlvblBlcm1pc3Npb24uY2ZuT3B0aW9ucy5kZWxldGlvblBvbGljeSA9IENmbkRlbGV0aW9uUG9saWN5LlJFVEFJTjtcbiAgICAgICAgc2tpbGxGdW5jdGlvblBlcm1pc3Npb24uY2ZuT3B0aW9ucy51cGRhdGVSZXBsYWNlUG9saWN5ID0gQ2ZuRGVsZXRpb25Qb2xpY3kuUkVUQUlOO1xuXG4gICAgICAgIG5ldyBDZm5PdXRwdXQodGhpcywgJ292ZXJyaWRlcycsIHtcbiAgICAgICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1pbnZhbGlkLXRlbXBsYXRlLXN0cmluZ3NcbiAgICAgICAgICAgIHZhbHVlOiBGbi5zdWIoJ3tcIm1hbmlmZXN0XCI6IHtcImFwaXNcIjoge1wiY3VzdG9tXCI6IHtcImVuZHBvaW50XCI6IHtcInVyaVwiOiBcIiR7U2tpbGxGdW5jdGlvbi5WZXJzaW9ufVwifX19fX0nKSxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIl19