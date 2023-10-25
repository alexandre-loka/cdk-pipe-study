#!/usr/bin/env ts-node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { InfraBase } from "./stack";
import { FrontEndPipeline } from "./fe-pipe";
import { InfraDev } from "./stack-dev";
// import { CodePipelineStack } from "./pipeline/codepipeline";
import * as config from "./config";
import { BackEndPipeline } from "./be-pipe";

const app = new cdk.App();

// Direct deployment
new InfraBase(app, "InfraBase", config.mainConfig);

new InfraDev(app, "InfraDev", config.devConfig);
new FrontEndPipeline(app, "FrontEndPipeline", config.devConfig);
new BackEndPipeline(app, "BackEndPipeline", config.devConfig);

// Pipeline deployment
// new CodePipelineStack(app, "CodePipelineStack", {});
