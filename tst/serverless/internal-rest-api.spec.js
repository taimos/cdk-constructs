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
        core_1.Tag.remove(vpc, 'Name', { includeResourceTypes: ['AWS::EC2::EIP'] });
        const api = new lib_1.InternalRestApi(stack, 'RestApi', {
            vpc,
            hostedZone: new aws_route53_1.HostedZone(stack, 'HostedZone', { zoneName: 'example.com' }),
            domainName: 'api.example.com',
        });
        api.api.root.resourceForPath('/foo/bar').addMethod('GET');
        assert_1.expect(stack).toMatch(JSON.parse(fs_1.readFileSync(path_1.join(__dirname, 'internal-rest-api.fixture.json')).toString('utf-8')));
        // writeFileSync('tst/serverless/internal-rest-api.fixture.json', JSON.stringify(SynthUtils.toCloudFormation(stack, {}), null, 2));
    });
    it('should be working with custom api options', () => {
        const stack = new core_1.Stack();
        const vpc = new aws_ec2_1.Vpc(stack, 'VPC');
        core_1.Tag.remove(vpc, 'Name', { includeResourceTypes: ['AWS::EC2::EIP'] });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJuYWwtcmVzdC1hcGkuc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImludGVybmFsLXJlc3QtYXBpLnNwZWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw0Q0FBeUM7QUFDekMsNERBQTZEO0FBQzdELDhDQUF1QztBQUN2QyxzREFBa0Q7QUFDbEQsd0NBQTJDO0FBQzNDLDJCQUFrQztBQUNsQywrQkFBNEI7QUFDNUIsbUNBQTRDO0FBRTVDLFFBQVEsQ0FBQyxtQkFBbUIsRUFBRSxHQUFHLEVBQUU7SUFFL0IsRUFBRSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsRUFBRTtRQUN2QixNQUFNLEtBQUssR0FBRyxJQUFJLFlBQUssRUFBRSxDQUFDO1FBQzFCLE1BQU0sR0FBRyxHQUFHLElBQUksYUFBRyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNsQyxVQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsRUFBRSxvQkFBb0IsRUFBRSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUVyRSxNQUFNLEdBQUcsR0FBRyxJQUFJLHFCQUFlLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRTtZQUM5QyxHQUFHO1lBQ0gsVUFBVSxFQUFFLElBQUksd0JBQVUsQ0FBQyxLQUFLLEVBQUUsWUFBWSxFQUFFLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBRSxDQUFDO1lBQzVFLFVBQVUsRUFBRSxpQkFBaUI7U0FDaEMsQ0FBQyxDQUFDO1FBQ0gsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUUxRCxlQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsaUJBQVksQ0FBQyxXQUFJLENBQUMsU0FBUyxFQUFFLGdDQUFnQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JILG1JQUFtSTtJQUN2SSxDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQywyQ0FBMkMsRUFBRSxHQUFHLEVBQUU7UUFDakQsTUFBTSxLQUFLLEdBQUcsSUFBSSxZQUFLLEVBQUUsQ0FBQztRQUMxQixNQUFNLEdBQUcsR0FBRyxJQUFJLGFBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDbEMsVUFBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLEVBQUUsb0JBQW9CLEVBQUUsQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFckUsTUFBTSxHQUFHLEdBQUcsSUFBSSxxQkFBZSxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUU7WUFDOUMsR0FBRztZQUNILFVBQVUsRUFBRSxJQUFJLHdCQUFVLENBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxFQUFFLFFBQVEsRUFBRSxhQUFhLEVBQUUsQ0FBQztZQUM1RSxVQUFVLEVBQUUsaUJBQWlCO1lBQzdCLFFBQVEsRUFBRTtnQkFDTixhQUFhLEVBQUU7b0JBQ1gsWUFBWSxFQUFFLG1DQUFrQixDQUFDLElBQUk7b0JBQ3JDLGNBQWMsRUFBRSxJQUFJO2lCQUN2QjthQUNKO1NBQ0osQ0FBQyxDQUFDO1FBQ0gsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUUxRCxlQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsaUJBQVksQ0FBQyxXQUFJLENBQUMsU0FBUyxFQUFFLGlDQUFpQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RILG9JQUFvSTtJQUN4SSxDQUFDLENBQUMsQ0FBQztBQUVQLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZXhwZWN0IH0gZnJvbSAnQGF3cy1jZGsvYXNzZXJ0JztcbmltcG9ydCB7IE1ldGhvZExvZ2dpbmdMZXZlbCB9IGZyb20gJ0Bhd3MtY2RrL2F3cy1hcGlnYXRld2F5JztcbmltcG9ydCB7IFZwYyB9IGZyb20gJ0Bhd3MtY2RrL2F3cy1lYzInO1xuaW1wb3J0IHsgSG9zdGVkWm9uZSB9IGZyb20gJ0Bhd3MtY2RrL2F3cy1yb3V0ZTUzJztcbmltcG9ydCB7IFN0YWNrLCBUYWcgfSBmcm9tICdAYXdzLWNkay9jb3JlJztcbmltcG9ydCB7IHJlYWRGaWxlU3luYyB9IGZyb20gJ2ZzJztcbmltcG9ydCB7IGpvaW4gfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IEludGVybmFsUmVzdEFwaSB9IGZyb20gJy4uLy4uL2xpYic7XG5cbmRlc2NyaWJlKCdJbnRlcm5hbCBSRVNUIEFQSScsICgpID0+IHtcblxuICAgIGl0KCdzaG91bGQgYmUgdmFsaWQnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0YWNrID0gbmV3IFN0YWNrKCk7XG4gICAgICAgIGNvbnN0IHZwYyA9IG5ldyBWcGMoc3RhY2ssICdWUEMnKTtcbiAgICAgICAgVGFnLnJlbW92ZSh2cGMsICdOYW1lJywgeyBpbmNsdWRlUmVzb3VyY2VUeXBlczogWydBV1M6OkVDMjo6RUlQJ10gfSk7XG5cbiAgICAgICAgY29uc3QgYXBpID0gbmV3IEludGVybmFsUmVzdEFwaShzdGFjaywgJ1Jlc3RBcGknLCB7XG4gICAgICAgICAgICB2cGMsXG4gICAgICAgICAgICBob3N0ZWRab25lOiBuZXcgSG9zdGVkWm9uZShzdGFjaywgJ0hvc3RlZFpvbmUnLCB7IHpvbmVOYW1lOiAnZXhhbXBsZS5jb20nIH0pLFxuICAgICAgICAgICAgZG9tYWluTmFtZTogJ2FwaS5leGFtcGxlLmNvbScsXG4gICAgICAgIH0pO1xuICAgICAgICBhcGkuYXBpLnJvb3QucmVzb3VyY2VGb3JQYXRoKCcvZm9vL2JhcicpLmFkZE1ldGhvZCgnR0VUJyk7XG5cbiAgICAgICAgZXhwZWN0KHN0YWNrKS50b01hdGNoKEpTT04ucGFyc2UocmVhZEZpbGVTeW5jKGpvaW4oX19kaXJuYW1lLCAnaW50ZXJuYWwtcmVzdC1hcGkuZml4dHVyZS5qc29uJykpLnRvU3RyaW5nKCd1dGYtOCcpKSk7XG4gICAgICAgIC8vIHdyaXRlRmlsZVN5bmMoJ3RzdC9zZXJ2ZXJsZXNzL2ludGVybmFsLXJlc3QtYXBpLmZpeHR1cmUuanNvbicsIEpTT04uc3RyaW5naWZ5KFN5bnRoVXRpbHMudG9DbG91ZEZvcm1hdGlvbihzdGFjaywge30pLCBudWxsLCAyKSk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGJlIHdvcmtpbmcgd2l0aCBjdXN0b20gYXBpIG9wdGlvbnMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0YWNrID0gbmV3IFN0YWNrKCk7XG4gICAgICAgIGNvbnN0IHZwYyA9IG5ldyBWcGMoc3RhY2ssICdWUEMnKTtcbiAgICAgICAgVGFnLnJlbW92ZSh2cGMsICdOYW1lJywgeyBpbmNsdWRlUmVzb3VyY2VUeXBlczogWydBV1M6OkVDMjo6RUlQJ10gfSk7XG5cbiAgICAgICAgY29uc3QgYXBpID0gbmV3IEludGVybmFsUmVzdEFwaShzdGFjaywgJ1Jlc3RBcGknLCB7XG4gICAgICAgICAgICB2cGMsXG4gICAgICAgICAgICBob3N0ZWRab25lOiBuZXcgSG9zdGVkWm9uZShzdGFjaywgJ0hvc3RlZFpvbmUnLCB7IHpvbmVOYW1lOiAnZXhhbXBsZS5jb20nIH0pLFxuICAgICAgICAgICAgZG9tYWluTmFtZTogJ2FwaS5leGFtcGxlLmNvbScsXG4gICAgICAgICAgICBhcGlQcm9wczoge1xuICAgICAgICAgICAgICAgIGRlcGxveU9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2luZ0xldmVsOiBNZXRob2RMb2dnaW5nTGV2ZWwuSU5GTyxcbiAgICAgICAgICAgICAgICAgICAgdHJhY2luZ0VuYWJsZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgICAgICBhcGkuYXBpLnJvb3QucmVzb3VyY2VGb3JQYXRoKCcvZm9vL2JhcicpLmFkZE1ldGhvZCgnR0VUJyk7XG5cbiAgICAgICAgZXhwZWN0KHN0YWNrKS50b01hdGNoKEpTT04ucGFyc2UocmVhZEZpbGVTeW5jKGpvaW4oX19kaXJuYW1lLCAnaW50ZXJuYWwtcmVzdC1hcGkuZml4dHVyZTIuanNvbicpKS50b1N0cmluZygndXRmLTgnKSkpO1xuICAgICAgICAvLyB3cml0ZUZpbGVTeW5jKCd0c3Qvc2VydmVybGVzcy9pbnRlcm5hbC1yZXN0LWFwaS5maXh0dXJlMi5qc29uJywgSlNPTi5zdHJpbmdpZnkoU3ludGhVdGlscy50b0Nsb3VkRm9ybWF0aW9uKHN0YWNrLCB7fSksIG51bGwsIDIpKTtcbiAgICB9KTtcblxufSk7XG4iXX0=