# Alexa Deployment Pipeline

This construct creates a CodePipeline to deploy Alexa Skills to Lambda and to the Developer console using AWS SAM and the DeployToAlexa action of CodePipeline.

## Prerequisits

You need to create secrets in SecretManager containing access to the Alexa Developer Console and optionally to GitHub when your code resides there.

### Alexa Credentials

First of all, generate a client and a token using the official documentation: https://developer.amazon.com/docs/smapi/ask-cli-command-reference.html#generate-lwa-tokens

The create a Secret with the fields: `ClientId`, `ClientSecret` and `RefreshToken`

### GitHub

Create a personal access token and store it in a secret with one Key/Value pair named `Token`

### Code layout

...

## Usage

The library provides a class called `AlexaSkillPipelineStack` which can be added to your CDK app.

```ts
import { App } from '@aws-cdk/cdk';
import { AlexaSkillPipelineStack } from 'taimos-cdk-constructs';

const app = new App();
new AlexaSkillPipelineStack(app, {
  skillName: 'my-skill',
  githubOwner: 'taimos',
  githubRepo: 'my-skill',
  skillId: 'amzn1.ask.skill.????????-????-????-????-????????????',
});
app.run();
```

The following options can be specified:

* `skillId` - Skill Id in the develoepr console (mandatory)
* `skillName` - Skill name without spaces or special characters (mandatory)
* `branch` - The branch to deploy (Default `master`)
* `githubOwner` - The owner of the GitHub project
* `githubRepo` - The repo name in GitHub
* `githubSecretId` - The name of the SecretsManager secret containing the GitHub token (Default: `GitHub`)
* `AlexaSecretId` - The name of the SecretsManager secret containing the Developer console token (Default: `Alexa`)

If you do not specify GitHub owner and repo, the stack will create a CodeCommit repository instead of deploying from GitHub.
