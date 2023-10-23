import { Stack, StackProps, Tags } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as route53Targets from "aws-cdk-lib/aws-route53-targets";
import * as iam from "aws-cdk-lib/aws-iam";

export class InfraBase extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    cdk.RemovalPolicy.DESTROY;

    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, "HostedZone", {
      hostedZoneId: "Z0595012323F7RI1KVDD2",
      zoneName: "coelhor.dev",
    });

    const cert = new acm.Certificate(this, "Certificate", {
      domainName: "coelhor.dev",
      validation: acm.CertificateValidation.fromDns(hostedZone),
      subjectAlternativeNames: ["*.coelhor.dev"],
      certificateName: "coelhor.dev",
    });

    const s3Bucket = new s3.Bucket(this, "s3Bucket", {
      bucketName: "app.coelhor.dev",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    s3Bucket.grantReadWrite(new iam.AccountPrincipal("417546237235"));

    const cdnDistribution = new cloudfront.Distribution(this, "cdnAppDistribuition", {
      defaultRootObject: "index.html",
      defaultBehavior: {
        origin: new origins.S3Origin(s3Bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      domainNames: ["app.coelhor.dev"],
      certificate: cert,
    });

    new iam.Role(this, "Role", {
      assumedBy: new iam.AccountPrincipal("417546237235"),
      roleName: "CloudFrontRole",
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName("CloudFrontFullAccess")],
    });

    cdnDistribution.grantCreateInvalidation(new iam.AccountPrincipal("417546237235"));

    const distribuitionAppID = new ssm.StringParameter(this, "DistribuitionAppID", {
      parameterName: `/cloudfront/distributionApp-id`,
      stringValue: cdnDistribution.distributionId,
    });

    distribuitionAppID.grantRead(new iam.AccountPrincipal("417546237235"));

    new route53.ARecord(this, "AliasRecord", {
      zone: hostedZone,
      recordName: "app.coelhor.dev",
      target: route53.RecordTarget.fromAlias(new route53Targets.CloudFrontTarget(cdnDistribution)),
    });

    // Please configure the proper tags for this project
    Tags.of(this).add("Project", "Study project");
    Tags.of(this).add("Team", "Alexandre Ramos");
  }
}
