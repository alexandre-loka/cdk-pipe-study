#!/usr/bin/env ts-node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { InfraBase } from "./stack";
import { FrontEndPipeline } from "./fe-pipe";
// import { CodePipelineStack } from "./pipeline/codepipeline";
import * as config from "./config";

const app = new cdk.App();

// Direct deployment
new InfraBase(app, "InfraBase", config.mainConfig);
new FrontEndPipeline(app, "FrontEndPipeline", config.devConfig);

// Pipeline deployment
// new CodePipelineStack(app, "CodePipelineStack", {});
