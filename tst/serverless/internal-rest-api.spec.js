"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("@aws-cdk/assert");
const aws_apigateway_1 = require("@aws-cdk/aws-apigateway");
const aws_ec2_1 = require("@aws-cdk/aws-ec2");
const aws_route53_1 = require("@aws-cdk/aws-route53");
const core_1 = require("@aws-cdk/core");
const fs_1 = require("fs");
const path_1 = require("path");
const lib_1 = require("../../lib");
describe('Internal REST API', () => {
    it('should be valid', () => {
        const stack = new core_1.Stack();
        const vpc = new aws_ec2_1.Vpc(stack, 'VPC');
        const api = new lib_1.InternalRestApi(stack, 'RestApi', {
            vpc,
            hostedZone: new aws_route53_1.HostedZone(stack, 'HostedZone', { zoneName: 'example.com' }),
            domainName: 'api.example.com',
        });
        api.api.root.resourceForPath('/foo/bar').addMethod('GET');
        assert_1.expect(stack).toMatch(JSON.parse(fs_1.readFileSync(path_1.join(__dirname, 'internal-rest-api.fixture.json')).toString('utf-8')));
        // writeFileSync('tst/serverless/internal-rest-api.fixture.json', JSON.stringify(SynthUtils.toCloudFormation(stack, {}), null, 2));
    });
    it('should be work with custom api options', () => {
        const stack = new core_1.Stack();
        const vpc = new aws_ec2_1.Vpc(stack, 'VPC');
        const api = new lib_1.InternalRestApi(stack, 'RestApi', {
            vpc,
            hostedZone: new aws_route53_1.HostedZone(stack, 'HostedZone', { zoneName: 'example.com' }),
            domainName: 'api.example.com',
            apiProps: {
                deployOptions: {
                    loggingLevel: aws_apigateway_1.MethodLoggingLevel.INFO,
                    tracingEnabled: true,
                },
            },
        });
        api.api.root.resourceForPath('/foo/bar').addMethod('GET');
        assert_1.expect(stack).toMatch(JSON.parse(fs_1.readFileSync(path_1.join(__dirname, 'internal-rest-api.fixture2.json')).toString('utf-8')));
        // writeFileSync('tst/serverless/internal-rest-api.fixture2.json', JSON.stringify(SynthUtils.toCloudFormation(stack, {}), null, 2));
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJuYWwtcmVzdC1hcGkuc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImludGVybmFsLXJlc3QtYXBpLnNwZWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw0Q0FBeUM7QUFDekMsNERBQTZEO0FBQzdELDhDQUF1QztBQUN2QyxzREFBa0Q7QUFDbEQsd0NBQXNDO0FBQ3RDLDJCQUFrQztBQUNsQywrQkFBNEI7QUFDNUIsbUNBQTRDO0FBRTVDLFFBQVEsQ0FBQyxtQkFBbUIsRUFBRSxHQUFHLEVBQUU7SUFFL0IsRUFBRSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsRUFBRTtRQUN2QixNQUFNLEtBQUssR0FBRyxJQUFJLFlBQUssRUFBRSxDQUFDO1FBQzFCLE1BQU0sR0FBRyxHQUFHLElBQUksYUFBRyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUVsQyxNQUFNLEdBQUcsR0FBRyxJQUFJLHFCQUFlLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRTtZQUM5QyxHQUFHO1lBQ0gsVUFBVSxFQUFFLElBQUksd0JBQVUsQ0FBQyxLQUFLLEVBQUUsWUFBWSxFQUFFLEVBQUMsUUFBUSxFQUFFLGFBQWEsRUFBQyxDQUFDO1lBQzFFLFVBQVUsRUFBRSxpQkFBaUI7U0FDaEMsQ0FBQyxDQUFDO1FBQ0gsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUUxRCxlQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsaUJBQVksQ0FBQyxXQUFJLENBQUMsU0FBUyxFQUFFLGdDQUFnQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JILG1JQUFtSTtJQUN2SSxDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyx3Q0FBd0MsRUFBRSxHQUFHLEVBQUU7UUFDOUMsTUFBTSxLQUFLLEdBQUcsSUFBSSxZQUFLLEVBQUUsQ0FBQztRQUMxQixNQUFNLEdBQUcsR0FBRyxJQUFJLGFBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFbEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxxQkFBZSxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUU7WUFDOUMsR0FBRztZQUNILFVBQVUsRUFBRSxJQUFJLHdCQUFVLENBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxFQUFDLFFBQVEsRUFBRSxhQUFhLEVBQUMsQ0FBQztZQUMxRSxVQUFVLEVBQUUsaUJBQWlCO1lBQzdCLFFBQVEsRUFBRTtnQkFDTixhQUFhLEVBQUU7b0JBQ1gsWUFBWSxFQUFFLG1DQUFrQixDQUFDLElBQUk7b0JBQ3JDLGNBQWMsRUFBRSxJQUFJO2lCQUN2QjthQUNKO1NBQ0osQ0FBQyxDQUFDO1FBQ0gsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUUxRCxlQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsaUJBQVksQ0FBQyxXQUFJLENBQUMsU0FBUyxFQUFFLGlDQUFpQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RILG9JQUFvSTtJQUN4SSxDQUFDLENBQUMsQ0FBQztBQUVQLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZXhwZWN0IH0gZnJvbSAnQGF3cy1jZGsvYXNzZXJ0JztcbmltcG9ydCB7IE1ldGhvZExvZ2dpbmdMZXZlbCB9IGZyb20gJ0Bhd3MtY2RrL2F3cy1hcGlnYXRld2F5JztcbmltcG9ydCB7IFZwYyB9IGZyb20gJ0Bhd3MtY2RrL2F3cy1lYzInO1xuaW1wb3J0IHsgSG9zdGVkWm9uZSB9IGZyb20gJ0Bhd3MtY2RrL2F3cy1yb3V0ZTUzJztcbmltcG9ydCB7IFN0YWNrIH0gZnJvbSAnQGF3cy1jZGsvY29yZSc7XG5pbXBvcnQgeyByZWFkRmlsZVN5bmMgfSBmcm9tICdmcyc7XG5pbXBvcnQgeyBqb2luIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBJbnRlcm5hbFJlc3RBcGkgfSBmcm9tICcuLi8uLi9saWInO1xuXG5kZXNjcmliZSgnSW50ZXJuYWwgUkVTVCBBUEknLCAoKSA9PiB7XG5cbiAgICBpdCgnc2hvdWxkIGJlIHZhbGlkJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBzdGFjayA9IG5ldyBTdGFjaygpO1xuICAgICAgICBjb25zdCB2cGMgPSBuZXcgVnBjKHN0YWNrLCAnVlBDJyk7XG5cbiAgICAgICAgY29uc3QgYXBpID0gbmV3IEludGVybmFsUmVzdEFwaShzdGFjaywgJ1Jlc3RBcGknLCB7XG4gICAgICAgICAgICB2cGMsXG4gICAgICAgICAgICBob3N0ZWRab25lOiBuZXcgSG9zdGVkWm9uZShzdGFjaywgJ0hvc3RlZFpvbmUnLCB7em9uZU5hbWU6ICdleGFtcGxlLmNvbSd9KSxcbiAgICAgICAgICAgIGRvbWFpbk5hbWU6ICdhcGkuZXhhbXBsZS5jb20nLFxuICAgICAgICB9KTtcbiAgICAgICAgYXBpLmFwaS5yb290LnJlc291cmNlRm9yUGF0aCgnL2Zvby9iYXInKS5hZGRNZXRob2QoJ0dFVCcpO1xuXG4gICAgICAgIGV4cGVjdChzdGFjaykudG9NYXRjaChKU09OLnBhcnNlKHJlYWRGaWxlU3luYyhqb2luKF9fZGlybmFtZSwgJ2ludGVybmFsLXJlc3QtYXBpLmZpeHR1cmUuanNvbicpKS50b1N0cmluZygndXRmLTgnKSkpO1xuICAgICAgICAvLyB3cml0ZUZpbGVTeW5jKCd0c3Qvc2VydmVybGVzcy9pbnRlcm5hbC1yZXN0LWFwaS5maXh0dXJlLmpzb24nLCBKU09OLnN0cmluZ2lmeShTeW50aFV0aWxzLnRvQ2xvdWRGb3JtYXRpb24oc3RhY2ssIHt9KSwgbnVsbCwgMikpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBiZSB3b3JrIHdpdGggY3VzdG9tIGFwaSBvcHRpb25zJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBzdGFjayA9IG5ldyBTdGFjaygpO1xuICAgICAgICBjb25zdCB2cGMgPSBuZXcgVnBjKHN0YWNrLCAnVlBDJyk7XG5cbiAgICAgICAgY29uc3QgYXBpID0gbmV3IEludGVybmFsUmVzdEFwaShzdGFjaywgJ1Jlc3RBcGknLCB7XG4gICAgICAgICAgICB2cGMsXG4gICAgICAgICAgICBob3N0ZWRab25lOiBuZXcgSG9zdGVkWm9uZShzdGFjaywgJ0hvc3RlZFpvbmUnLCB7em9uZU5hbWU6ICdleGFtcGxlLmNvbSd9KSxcbiAgICAgICAgICAgIGRvbWFpbk5hbWU6ICdhcGkuZXhhbXBsZS5jb20nLFxuICAgICAgICAgICAgYXBpUHJvcHM6IHtcbiAgICAgICAgICAgICAgICBkZXBsb3lPcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dpbmdMZXZlbDogTWV0aG9kTG9nZ2luZ0xldmVsLklORk8sXG4gICAgICAgICAgICAgICAgICAgIHRyYWNpbmdFbmFibGVkOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgICAgYXBpLmFwaS5yb290LnJlc291cmNlRm9yUGF0aCgnL2Zvby9iYXInKS5hZGRNZXRob2QoJ0dFVCcpO1xuXG4gICAgICAgIGV4cGVjdChzdGFjaykudG9NYXRjaChKU09OLnBhcnNlKHJlYWRGaWxlU3luYyhqb2luKF9fZGlybmFtZSwgJ2ludGVybmFsLXJlc3QtYXBpLmZpeHR1cmUyLmpzb24nKSkudG9TdHJpbmcoJ3V0Zi04JykpKTtcbiAgICAgICAgLy8gd3JpdGVGaWxlU3luYygndHN0L3NlcnZlcmxlc3MvaW50ZXJuYWwtcmVzdC1hcGkuZml4dHVyZTIuanNvbicsIEpTT04uc3RyaW5naWZ5KFN5bnRoVXRpbHMudG9DbG91ZEZvcm1hdGlvbihzdGFjaywge30pLCBudWxsLCAyKSk7XG4gICAgfSk7XG5cbn0pO1xuIl19