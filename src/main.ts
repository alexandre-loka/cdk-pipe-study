#!/usr/bin/env ts-node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { InfraBase } from "./stack";
import { FrontEndPipeline } from "./fe-pipe";
// import { CodePipelineStack } from "./pipeline/codepipeline";
import * as config from "./config";

const app = new cdk.App();

// Direct deployment
new InfraBase(app, "InfraBase", config.myConfig);
new FrontEndPipeline(app, "FrontEndPipeline", config.myConfig);

// Pipeline deployment
// new CodePipelineStack(app, "CodePipelineStack", {});
