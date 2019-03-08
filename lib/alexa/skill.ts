import { PolicyStatement } from '@aws-cdk/aws-iam';
import { CfnPermission } from '@aws-cdk/aws-lambda';
import { Bucket, BucketPolicy } from '@aws-cdk/aws-s3';
import { SecretString } from '@aws-cdk/aws-secretsmanager';
import { CfnFunction, CfnFunctionProps, CfnSimpleTable } from '@aws-cdk/aws-serverless';
import { App, DeletionPolicy, Fn, Output, ScopedAws, Secret, Stack } from '@aws-cdk/cdk';

export interface AlexaSkillConfig {
    skillId : string;
    skillName : string;
    thundraKey? : string;
    environment? : { [key : string] : string };
    userAttribute? : string;
}

export class AlexaSkillStack extends Stack {
    constructor(parent : App, config : AlexaSkillConfig) {
        super(parent, config.skillName);
        this.templateOptions.description = `The Alexa Skill ${config.skillName}`;
        const aws = new ScopedAws(this);

        const assetBucket = new Bucket(this, 'AssetBucket', {
            bucketName: `${aws.accountId}-${config.skillName}-${aws.region}-assets`,
        });

        const assetBucketPolicy = new BucketPolicy(this, 'AssetBucketPolicy', {
            bucket: assetBucket,
        });
        assetBucketPolicy.document.addStatement(new PolicyStatement()
            .addAction('s3:GetObject')
            .addAnyPrincipal()
            .addResource(`${assetBucket.bucketArn}/*`));

        const userTable = new CfnSimpleTable(this, 'AttributesTable', {
            primaryKey: {
                name: config.userAttribute || 'userId',
                type: 'String',
            },
        });
        const functionConfig : CfnFunctionProps = {
            handler: 'bundle.handler',
            runtime: 'nodejs8.10',
            timeout: 10,
            autoPublishAlias: 'latest',
            codeUri: './skill/dist/bundle.js',
            policies: [
                {
                    statement: new PolicyStatement()
                        .addActions('dynamodb:Batch*', 'dynamodb:DeleteItem', 'dynamodb:Get*', 'dynamodb:PutItem', 'dynamodb:UpdateItem', 'dynamodb:Query', 'dynamodb:Scan')
                        // tslint:disable-next-line:no-invalid-template-strings
                        .addResource(Fn.sub('arn:aws:dynamodb:${AWS::Region}:${AWS::AccountId}:table/${AttributesTable}')),
                },
            ],
            environment: {
                variables: {
                    ...config.environment,
                    TABLE_NAME: userTable.ref,
                    ASSET_BUCKET: assetBucket.bucketName,
                    SKILL_ID: config.skillId,
                },
            },
        };
        if (config.thundraKey) {
            functionConfig.runtime = 'provided';
            functionConfig.layers = [`arn:aws:lambda:${aws.region}:269863060030:layer:thundra-lambda-node-layer:6`];
            ((functionConfig.environment as CfnFunction.FunctionEnvironmentProperty)
                .variables as { [key : string] : string }).thundra_apiKey = config.thundraKey;
        }
        const skillFunction = new CfnFunction(this, 'SkillFunction', functionConfig);

        const skillFunctionPermission = new CfnPermission(this, 'SkillFunctionPermission', {
            action: 'lambda:invokeFunction',
            // tslint:disable-next-line:no-invalid-template-strings
            functionName: Fn.sub('${SkillFunction.Version}'),
            principal: 'alexa-appkit.amazon.com',
        });
        skillFunctionPermission.options.deletionPolicy = DeletionPolicy.Retain;
        skillFunctionPermission.options.updateReplacePolicy = DeletionPolicy.Retain;

        const deployOutput = new Output(this, 'overrides', {
            // tslint:disable-next-line:no-invalid-template-strings
            value: Fn.sub('{"manifest": {"apis": {"custom": {"endpoint": {"uri": "${SkillFunction.Version}"}}}}}'),
        });
    }
}
