import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";

import { InfraBase } from "../src/stack";
import { CodePipelineStack } from "../src/pipeline/codepipeline";
import { FrontEndPipeline } from "../src/fe-pipe";
import { BackEndPipeline } from "../src/be-pipe";
import { InfraDev } from "../src/stack-dev";

// Test for single stack
test("snapshot for InfraBase matches previous state", () => {
  const app = new cdk.App();
  const stack = new InfraBase(app, "MyTestStack");

  const template = Template.fromStack(stack);
  expect(template.toJSON()).toMatchSnapshot();
});

// Test for InfraDev stack
test("snapshot for FrontEndPipeline matches previous state", () => {
  const app = new cdk.App();
  const stack = new InfraDev(app, "MyTestStack");

  const template = Template.fromStack(stack);
  expect(template.toJSON()).toMatchSnapshot();
});

// Test for FopntEndPipeline stack
test("snapshot for FrontEndPipeline matches previous state", () => {
  const app = new cdk.App();
  const stack = new FrontEndPipeline(app, "MyTestStack");

  const template = Template.fromStack(stack);
  expect(template.toJSON()).toMatchSnapshot();
});

test("snapshot for FrontEndPipeline matches previous state", () => {
  const app = new cdk.App();
  const stack = new BackEndPipeline(app, "MyTestStack");

  const template = Template.fromStack(stack);
  expect(template.toJSON()).toMatchSnapshot();
});

// Test for pipeline stack
test("snapshot for CodePipelineStack matches previous state", () => {
  const app = new cdk.App();
  const stack = new CodePipelineStack(app, "MyCodePipelineStack");

  const template = Template.fromStack(stack);
  expect(template.toJSON()).toMatchSnapshot();
});
