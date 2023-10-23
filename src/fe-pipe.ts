import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as codecommit from "aws-cdk-lib/aws-codecommit";
import * as codepipeline from "aws-cdk-lib/aws-codepipeline";
import * as cpactions from "aws-cdk-lib/aws-codepipeline-actions";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam";

export class FrontEndPipeline extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    cdk.RemovalPolicy.DESTROY;

    const repo = new codecommit.Repository(this, "Repository", { repositoryName: "app.coelhor.dev" });
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
              commands: ["npm install"],
            },
            build: {
              commands: ["npm run build"],
            },
          },
          artifacts: {
            "base-directory": "www",
            files: ["**/*"],
          },
        }),
      }),
    });

    const deployAction = new cpactions.S3DeployAction({
      bucket: s3.Bucket.fromBucketArn(this, "Bucket", "arn:aws:s3:::app.coelhor.dev"),
      actionName: "Deploy",
      input: outputArtifact,
      runOrder: 1,
    });

    //Create cloudformation invalidation
    const invalidateCFProject = new codebuild.PipelineProject(this, `InvalidateProject`, {
      buildSpec: codebuild.BuildSpec.fromObject({
        version: "0.2",
        phases: {
          build: {
            commands: [
              'OUT=$(aws sts assume-role --role-arn arn:aws:iam::239828624774:role/CloudFrontRole --role-session-name AWSCLI); export AWS_ACCESS_KEY_ID=$(echo $OUT | jq -r ".Credentials"".AccessKeyId"); export AWS_SECRET_ACCESS_KEY=$(echo $OUT | jq -r ".Credentials"".SecretAccessKey"); export AWS_SESSION_TOKEN=$(echo $OUT | jq -r ".Credentials"".SessionToken");',
              'aws cloudfront create-invalidation --distribution-id ${CLOUDFRONT_ID} --paths "/*"',
              // Choose whatever files or paths you'd like, or all files as specified here
            ],
          },
        },
      }),
      environmentVariables: {
        CLOUDFRONT_ID: { value: "E1RPVVGVY21D32" },
      },
    });

    invalidateCFProject.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["sts:AssumeRole"],
        resources: ["arn:aws:iam::239828624774:role/CloudFrontRole"],
      }),
    );

    const invalidateCFAction = new cpactions.CodeBuildAction({
      actionName: "CloudFormation_Invalidation",
      project: invalidateCFProject,
      input: outputArtifact,
      runOrder: 2,
      environmentVariables: {
        CLOUDFRONT_ID: { value: "E1RPVVGVY21D32" },
      },
    });

    new codepipeline.Pipeline(this, "Pipeline", {
      stages: [
        {
          stageName: "Source",
          actions: [sourceAction],
        },
        {
          stageName: "Build",
          actions: [buildAction],
        },
        {
          stageName: "Deploy",
          actions: [deployAction, invalidateCFAction],
        },
      ],
    });
  }
}
