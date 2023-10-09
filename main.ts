import { Construct } from "constructs";
import { App, TerraformStack, CloudBackend, NamedCloudWorkspace, TerraformOutput, TerraformVariable } from "cdktf";
import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
import { Instance } from '@cdktf/provider-aws/lib/instance';
import { DataAwsKeyPair } from '@cdktf/provider-aws/lib/data-aws-key-pair';

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // define resources here
    const accessKeyId = new TerraformVariable(this, "AWS_ACCESS_KEY_ID", {})
    const secretAccessKey = new TerraformVariable(this, "AWS_SECRET_ACCESS_KEY", {})

    new AwsProvider(this, "AWS", {
      region: "ap-northeast-1",
      accessKey: accessKeyId.value,
      secretKey: secretAccessKey.value,
    })

    const keyPair = new DataAwsKeyPair(this, "aws_linux", {
      keyName: "aws_linux",
    })

    const ec2Instance = new Instance(this, "compute", {
      ami: "ami-08a706ba5ea257141",
      instanceType: "t2.micro",
      keyName: keyPair.keyName,

      tags: {
        Name: "deploy-success",
      }
    })
    
    new TerraformOutput(this, "public_ip", {
      value: ec2Instance.publicIp,
    })
  }
}

const app = new App();
const stack = new MyStack(app, "aloha-hp-infra");
new CloudBackend(stack, {
  hostname: "app.terraform.io",
  organization: "aloha-hp",
  workspaces: new NamedCloudWorkspace("aloha-hp-infra")
});
app.synth();
