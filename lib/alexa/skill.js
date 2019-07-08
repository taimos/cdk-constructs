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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2tpbGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJza2lsbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDhDQUFtRDtBQUNuRCxvREFBb0Q7QUFDcEQsNENBQXlDO0FBQ3pDLDhDQUErRDtBQUMvRCx3Q0FBd0Y7QUFzQnhGLE1BQWEsZUFBZ0IsU0FBUSxZQUFLO0lBQ3RDLFlBQVksTUFBWSxFQUFFLE1BQXlCO1FBQy9DLEtBQUssQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxlQUFlLENBQUMsV0FBVyxHQUFHLG1CQUFtQixNQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDekUsTUFBTSxHQUFHLEdBQUcsSUFBSSxnQkFBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRWhDLE1BQU0sV0FBVyxHQUFHLElBQUksZUFBTSxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUU7WUFDaEQsVUFBVSxFQUFFLEdBQUcsR0FBRyxDQUFDLFNBQVMsSUFBSSxNQUFNLENBQUMsU0FBUyxJQUFJLEdBQUcsQ0FBQyxNQUFNLFNBQVM7U0FDMUUsQ0FBQyxDQUFDO1FBQ0gsV0FBVyxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFFaEMsTUFBTSxTQUFTLEdBQUcsSUFBSSx3QkFBYyxDQUFDLElBQUksRUFBRSxpQkFBaUIsRUFBRTtZQUMxRCxVQUFVLEVBQUU7Z0JBQ1IsSUFBSSxFQUFFLE1BQU0sQ0FBQyxhQUFhLElBQUksSUFBSTtnQkFDbEMsSUFBSSxFQUFFLFFBQVE7YUFDakI7U0FDSixDQUFDLENBQUM7UUFFSCxJQUFJLHFCQUFXLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRTtZQUNuQyxPQUFPLEVBQUUsb0JBQW9CO1lBQzdCLE9BQU8sRUFBRSxZQUFZO1lBQ3JCLE9BQU8sRUFBRSxFQUFFO1lBQ1gsZ0JBQWdCLEVBQUUsUUFBUTtZQUMxQixPQUFPLEVBQUUseUJBQXlCO1lBQ2xDLFFBQVEsRUFBRTtnQkFDTjtvQkFDSSxTQUFTLEVBQUUsSUFBSSx5QkFBZSxDQUFDO3dCQUMzQixPQUFPLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxxQkFBcUIsRUFBRSxlQUFlLEVBQUUsa0JBQWtCLEVBQUUscUJBQXFCLEVBQUUsZ0JBQWdCLEVBQUUsZUFBZSxDQUFDO3dCQUNsSix1REFBdUQ7d0JBQ3ZELFNBQVMsRUFBRSxDQUFDLFNBQUUsQ0FBQyxHQUFHLENBQUMsNEVBQTRFLENBQUMsQ0FBQztxQkFDcEcsQ0FBQztpQkFDTDthQUNKO1lBQ0QsV0FBVyxFQUFFO2dCQUNULFNBQVMsRUFBRTtvQkFDUCxHQUFHLE1BQU0sQ0FBQyxXQUFXO29CQUNyQixVQUFVLEVBQUUsU0FBUyxDQUFDLEdBQUc7b0JBQ3pCLFlBQVksRUFBRSxXQUFXLENBQUMsVUFBVTtvQkFDcEMsZ0JBQWdCLEVBQUUsV0FBVyxDQUFDLGdCQUFnQjtvQkFDOUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxPQUFPO29CQUN4QixHQUFHLE1BQU0sQ0FBQyxVQUFVLElBQUksRUFBRSxjQUFjLEVBQUUsTUFBTSxDQUFDLFVBQVUsRUFBRTtpQkFDaEU7YUFDSjtZQUNELEdBQUcsTUFBTSxDQUFDLFVBQVUsSUFBSTtnQkFDcEIsT0FBTyxFQUFFLFVBQVU7Z0JBQ25CLE1BQU0sRUFBRSxDQUFDLGtCQUFrQixHQUFHLENBQUMsTUFBTSxrREFBa0QsQ0FBQzthQUMzRjtTQUNKLENBQUMsQ0FBQztRQUVILE1BQU0sdUJBQXVCLEdBQUcsSUFBSSwwQkFBYSxDQUFDLElBQUksRUFBRSx5QkFBeUIsRUFBRTtZQUMvRSxNQUFNLEVBQUUsdUJBQXVCO1lBQy9CLHVEQUF1RDtZQUN2RCxZQUFZLEVBQUUsU0FBRSxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQztZQUNoRCxTQUFTLEVBQUUseUJBQXlCO1NBQ3ZDLENBQUMsQ0FBQztRQUNILHVCQUF1QixDQUFDLFVBQVUsQ0FBQyxjQUFjLEdBQUcsd0JBQWlCLENBQUMsTUFBTSxDQUFDO1FBQzdFLHVCQUF1QixDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsR0FBRyx3QkFBaUIsQ0FBQyxNQUFNLENBQUM7UUFFbEYsSUFBSSxnQkFBUyxDQUFDLElBQUksRUFBRSxXQUFXLEVBQUU7WUFDN0IsdURBQXVEO1lBQ3ZELEtBQUssRUFBRSxTQUFFLENBQUMsR0FBRyxDQUFDLHVGQUF1RixDQUFDO1NBQ3pHLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQS9ERCwwQ0ErREMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQb2xpY3lTdGF0ZW1lbnQgfSBmcm9tICdAYXdzLWNkay9hd3MtaWFtJztcbmltcG9ydCB7IENmblBlcm1pc3Npb24gfSBmcm9tICdAYXdzLWNkay9hd3MtbGFtYmRhJztcbmltcG9ydCB7IEJ1Y2tldCB9IGZyb20gJ0Bhd3MtY2RrL2F3cy1zMyc7XG5pbXBvcnQgeyBDZm5GdW5jdGlvbiwgQ2ZuU2ltcGxlVGFibGUgfSBmcm9tICdAYXdzLWNkay9hd3Mtc2FtJztcbmltcG9ydCB7IEFwcCwgQ2ZuRGVsZXRpb25Qb2xpY3ksIENmbk91dHB1dCwgRm4sIFNjb3BlZEF3cywgU3RhY2sgfSBmcm9tICdAYXdzLWNkay9jb3JlJztcblxuZXhwb3J0IGludGVyZmFjZSBBbGV4YVNraWxsQ29uZmlnIHtcbiAgICAvKiogVGhlIEFsZXhhIFNraWxsIGlkICovXG4gICAgcmVhZG9ubHkgc2tpbGxJZCA6IHN0cmluZztcblxuICAgIC8qKiBUaGUgQWxleGEgU2tpbGwgbmFtZSAqL1xuICAgIHJlYWRvbmx5IHNraWxsTmFtZSA6IHN0cmluZztcblxuICAgIC8qKiBPcHRpb25hbCBBUEkgS2V5IGZvciBUaHVuZHJhICovXG4gICAgcmVhZG9ubHkgdGh1bmRyYUtleT8gOiBzdHJpbmc7XG5cbiAgICAvKiogRW52aXJvbmVtZW50IHZhcmlhYmxlcyBmb3IgdGhlIExhbWJkYSBmdW5jdGlvbiAqL1xuICAgIHJlYWRvbmx5IGVudmlyb25tZW50PyA6IHsgW2tleSA6IHN0cmluZ10gOiBzdHJpbmcgfTtcblxuICAgIC8qKlxuICAgICAqIG5hbWUgb2YgdGhlIHVzZXIgYXR0cmlidXRlIGZvciBEeW5hbW9EQlxuICAgICAqIEBkZWZhdWx0IGlkXG4gICAgICovXG4gICAgcmVhZG9ubHkgdXNlckF0dHJpYnV0ZT8gOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjbGFzcyBBbGV4YVNraWxsU3RhY2sgZXh0ZW5kcyBTdGFjayB7XG4gICAgY29uc3RydWN0b3IocGFyZW50IDogQXBwLCBjb25maWcgOiBBbGV4YVNraWxsQ29uZmlnKSB7XG4gICAgICAgIHN1cGVyKHBhcmVudCwgY29uZmlnLnNraWxsTmFtZSk7XG4gICAgICAgIHRoaXMudGVtcGxhdGVPcHRpb25zLmRlc2NyaXB0aW9uID0gYFRoZSBBbGV4YSBTa2lsbCAke2NvbmZpZy5za2lsbE5hbWV9YDtcbiAgICAgICAgY29uc3QgYXdzID0gbmV3IFNjb3BlZEF3cyh0aGlzKTtcblxuICAgICAgICBjb25zdCBhc3NldEJ1Y2tldCA9IG5ldyBCdWNrZXQodGhpcywgJ0Fzc2V0QnVja2V0Jywge1xuICAgICAgICAgICAgYnVja2V0TmFtZTogYCR7YXdzLmFjY291bnRJZH0tJHtjb25maWcuc2tpbGxOYW1lfS0ke2F3cy5yZWdpb259LWFzc2V0c2AsXG4gICAgICAgIH0pO1xuICAgICAgICBhc3NldEJ1Y2tldC5ncmFudFB1YmxpY0FjY2VzcygpO1xuXG4gICAgICAgIGNvbnN0IHVzZXJUYWJsZSA9IG5ldyBDZm5TaW1wbGVUYWJsZSh0aGlzLCAnQXR0cmlidXRlc1RhYmxlJywge1xuICAgICAgICAgICAgcHJpbWFyeUtleToge1xuICAgICAgICAgICAgICAgIG5hbWU6IGNvbmZpZy51c2VyQXR0cmlidXRlIHx8ICdpZCcsXG4gICAgICAgICAgICAgICAgdHlwZTogJ1N0cmluZycsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcblxuICAgICAgICBuZXcgQ2ZuRnVuY3Rpb24odGhpcywgJ1NraWxsRnVuY3Rpb24nLCB7XG4gICAgICAgICAgICBoYW5kbGVyOiAnZGlzdC9pbmRleC5oYW5kbGVyJyxcbiAgICAgICAgICAgIHJ1bnRpbWU6ICdub2RlanM4LjEwJyxcbiAgICAgICAgICAgIHRpbWVvdXQ6IDEwLFxuICAgICAgICAgICAgYXV0b1B1Ymxpc2hBbGlhczogJ2xhdGVzdCcsXG4gICAgICAgICAgICBjb2RlVXJpOiAnLi9za2lsbC9kaXN0L2J1bmRsZS56aXAnLFxuICAgICAgICAgICAgcG9saWNpZXM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXRlbWVudDogbmV3IFBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25zOiBbJ2R5bmFtb2RiOkJhdGNoKicsICdkeW5hbW9kYjpEZWxldGVJdGVtJywgJ2R5bmFtb2RiOkdldConLCAnZHluYW1vZGI6UHV0SXRlbScsICdkeW5hbW9kYjpVcGRhdGVJdGVtJywgJ2R5bmFtb2RiOlF1ZXJ5JywgJ2R5bmFtb2RiOlNjYW4nXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1pbnZhbGlkLXRlbXBsYXRlLXN0cmluZ3NcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc291cmNlczogW0ZuLnN1YignYXJuOmF3czpkeW5hbW9kYjoke0FXUzo6UmVnaW9ufToke0FXUzo6QWNjb3VudElkfTp0YWJsZS8ke0F0dHJpYnV0ZXNUYWJsZX0nKV0sXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgICAgICAgICB2YXJpYWJsZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgLi4uY29uZmlnLmVudmlyb25tZW50LFxuICAgICAgICAgICAgICAgICAgICBUQUJMRV9OQU1FOiB1c2VyVGFibGUucmVmLFxuICAgICAgICAgICAgICAgICAgICBBU1NFVF9CVUNLRVQ6IGFzc2V0QnVja2V0LmJ1Y2tldE5hbWUsXG4gICAgICAgICAgICAgICAgICAgIEFTU0VUX0JVQ0tFVF9VUkw6IGFzc2V0QnVja2V0LmJ1Y2tldFdlYnNpdGVVcmwsXG4gICAgICAgICAgICAgICAgICAgIFNLSUxMX0lEOiBjb25maWcuc2tpbGxJZCxcbiAgICAgICAgICAgICAgICAgICAgLi4uY29uZmlnLnRodW5kcmFLZXkgJiYgeyB0aHVuZHJhX2FwaUtleTogY29uZmlnLnRodW5kcmFLZXkgfSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC4uLmNvbmZpZy50aHVuZHJhS2V5ICYmIHtcbiAgICAgICAgICAgICAgICBydW50aW1lOiAncHJvdmlkZWQnLFxuICAgICAgICAgICAgICAgIGxheWVyczogW2Bhcm46YXdzOmxhbWJkYToke2F3cy5yZWdpb259OjI2OTg2MzA2MDAzMDpsYXllcjp0aHVuZHJhLWxhbWJkYS1ub2RlLWxheWVyOjEyYF0sXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBza2lsbEZ1bmN0aW9uUGVybWlzc2lvbiA9IG5ldyBDZm5QZXJtaXNzaW9uKHRoaXMsICdTa2lsbEZ1bmN0aW9uUGVybWlzc2lvbicsIHtcbiAgICAgICAgICAgIGFjdGlvbjogJ2xhbWJkYTppbnZva2VGdW5jdGlvbicsXG4gICAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8taW52YWxpZC10ZW1wbGF0ZS1zdHJpbmdzXG4gICAgICAgICAgICBmdW5jdGlvbk5hbWU6IEZuLnN1YignJHtTa2lsbEZ1bmN0aW9uLlZlcnNpb259JyksXG4gICAgICAgICAgICBwcmluY2lwYWw6ICdhbGV4YS1hcHBraXQuYW1hem9uLmNvbScsXG4gICAgICAgIH0pO1xuICAgICAgICBza2lsbEZ1bmN0aW9uUGVybWlzc2lvbi5jZm5PcHRpb25zLmRlbGV0aW9uUG9saWN5ID0gQ2ZuRGVsZXRpb25Qb2xpY3kuUkVUQUlOO1xuICAgICAgICBza2lsbEZ1bmN0aW9uUGVybWlzc2lvbi5jZm5PcHRpb25zLnVwZGF0ZVJlcGxhY2VQb2xpY3kgPSBDZm5EZWxldGlvblBvbGljeS5SRVRBSU47XG5cbiAgICAgICAgbmV3IENmbk91dHB1dCh0aGlzLCAnb3ZlcnJpZGVzJywge1xuICAgICAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWludmFsaWQtdGVtcGxhdGUtc3RyaW5nc1xuICAgICAgICAgICAgdmFsdWU6IEZuLnN1Yigne1wibWFuaWZlc3RcIjoge1wiYXBpc1wiOiB7XCJjdXN0b21cIjoge1wiZW5kcG9pbnRcIjoge1widXJpXCI6IFwiJHtTa2lsbEZ1bmN0aW9uLlZlcnNpb259XCJ9fX19fScpLFxuICAgICAgICB9KTtcbiAgICB9XG59XG4iXX0=