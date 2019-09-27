[![npm version](https://badge.fury.io/js/taimos-cdk-constructs.svg)](https://badge.fury.io/js/taimos-cdk-constructs)
[![PyPI version](https://badge.fury.io/py/taimos-cdk.svg)](https://badge.fury.io/py/taimos-cdk)
![Build Status](https://codebuild.eu-west-1.amazonaws.com/badges?uuid=eyJlbmNyeXB0ZWREYXRhIjoieEFBVDZIcTZpZUQxMm1LS1hqckdTdnhCdm5CSHRlOXB1WkIrK1d2OHplRERMb1ExNk9zMGRWcm5ZZXIwaWlnRDVyTkFDZWNDdTRYQWFSckx3OW1jYjJVPSIsIml2UGFyYW1ldGVyU3BlYyI6IjkrS3NacTN5NU4xU3FXNXMiLCJtYXRlcmlhbFNldFNlcmlhbCI6MX0%3D&branch=master)

This repository contains a library with higher-level constructs for AWS CDK (https://github.com/awslabs/aws-cdk) written in TypeScript.

# Installation

You can install the library into your project using npm or pip.

```bash
npm install taimos-cdk-constructs

pip3 install taimos-cdk
```

# Constructs

* [Deployment Pipeline and Skill Blueprint for Alexa](lib/alexa/README.md)
* [Hosting for Single Page Application](lib/web/single-page-app.ts)
* [Simple CodeBuild project for NodeJS projects](lib/ci/simple-codebuild.ts)
* [Scheduled Lambda function](lib/serverless/scheduled-lambda.ts)
* [VPC Internal REST API](lib/serverless/internal-rest-api.ts)

# Contributing

We welcome community contributions and pull requests. 

# License

The CDK construct library is distributed under the [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0).

See [LICENSE](./LICENSE) and [NOTICE](./NOTICE) for more information.