import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as codecommit from "aws-cdk-lib/aws-codecommit";
import * as codepipeline from "aws-cdk-lib/aws-codepipeline";
import * as cpactions from "aws-cdk-lib/aws-codepipeline-actions";
import * as codebuild from "aws-cdk-lib/aws-codebuild";

export class BackEndPipeline extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const repo = codecommit.Repository.fromRepositoryName(this, "Repository", "lambdas");
    const sourceArtifact = new codepipeline.Artifact("SourceInput");
    const outputArtifact = new codepipeline.Artifact("BuildOutput");
    const sourceAction = new cpactions.CodeCommitSourceAction({
      actionName: "CodeCommit",
      repository: repo,
      branch: "main",
      output: sourceArtifact,
    });

    const buildAction = new cpactions.CodeBuildAction({
      actionName: "Build",
      input: sourceArtifact,
      outputs: [outputArtifact],
      project: new codebuild.PipelineProject(this, "Build", {
        environment: {
          buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
        },
        buildSpec: codebuild.BuildSpec.fromObject({
          version: "0.2",
          phases: {
            install: {
              "runtime-versions": {
                nodejs: "latest",
              },
              commands: ["npm install", "npm install -g serverless"],
            },
            build: {
              commands: ["serverless package --package PACKAGE_DIR", "ls -al"],
            },
          },
          artifacts: {
            "base-directory": "PACKAGE_DIR",
            files: ["**/*"],
          },
        }),
      }),
    });

    new codepipeline.Pipeline(this, "Pipeline", {
      pipelineName: "BackEndPipeline",
      stages: [
        {
          stageName: "Source",
          actions: [sourceAction],
        },
        {
          stageName: "Build",
          actions: [buildAction],
        },
      ],
    });
  }
}
