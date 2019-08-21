# 1.2.0
* Update CDK to version 1.5.0
* Invalidate CF distibution after deployment

# 1.1.1
* fix bug in `SinglePageAppHosting` with auto-generated cert

# 1.1.0

* Update CDK to version 1.3.0
* Add `redirectToApex` option to SPA construct
* Make `certArn` optional for SPA and create new certificate if blank

# 1.0.0

Initial version with the constructs. Based on the GA version of CDK (1.1.0)

* `SinglePageAppHosting`
* `SimpleCodeBuildStack`
* `AlexaSkillStack`
* `AlexaSkillPipelineStack`
* `ScheduledLambda`
