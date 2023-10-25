import { Stack, StackProps, Tags } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as codecommit from "aws-cdk-lib/aws-codecommit";

export class InfraDev extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new codecommit.Repository(this, "AppRepo", { repositoryName: "app.coelhor.dev" });
    new codecommit.Repository(this, "LambdasRepo", { repositoryName: "lambdas" });

    Tags.of(this).add("Project", "Study project");
    Tags.of(this).add("Team", "Alexandre Ramos");
  }
}
