import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {} from "../../parameter/index";

export interface SwitchTieringPolicyProps {}

export class SwitchTieringPolicyConstruct extends Construct {
  readonly stateMachine: cdk.aws_stepfunctions.IStateMachine;

  constructor(scope: Construct, id: string, props?: SwitchTieringPolicyProps) {
    super(scope, id);

    const mapWithCoolingPeriod = new cdk.aws_stepfunctions.Map(
      this,
      "MapWithCoolingPeriod",
      {
        itemsPath: cdk.aws_stepfunctions.JsonPath.stringAt("$.targetVolumeIds"),
        itemSelector: {
          "VolumeId.$": "$$.Map.Item.Value",
        },
      }
    );

    const mapWithoutCoolingPeriod = new cdk.aws_stepfunctions.Map(
      this,
      "MapWithoutCoolingPeriod",
      {
        itemsPath: cdk.aws_stepfunctions.JsonPath.stringAt("$.targetVolumeIds"),
        itemSelector: {
          "VolumeId.$": "$$.Map.Item.Value",
        },
      }
    );

    const updateVolumeWithCoolingPeriod =
      new cdk.aws_stepfunctions_tasks.CallAwsService(
        this,
        "UpdateVolumeWithCoolingPeriod",
        {
          service: "fsx",
          action: "updateVolume",
          iamResources: ["*"],
          parameters: {
            VolumeId: cdk.aws_stepfunctions.JsonPath.stringAt("$.VolumeId"),
            OntapConfiguration: {
              TieringPolicy: {
                Name: cdk.aws_stepfunctions.JsonPath.stringAt(
                  "$$.Execution.Input.tieringPolicy.name"
                ),
                CoolingPeriod: cdk.aws_stepfunctions.JsonPath.numberAt(
                  "$$.Execution.Input.tieringPolicy.coolingPeriod"
                ),
              },
            },
          },
        }
      );

    const updateVolumeWithoutCoolingPeriod =
      new cdk.aws_stepfunctions_tasks.CallAwsService(
        this,
        "UpdateVolumeWithoutCoolingPeriod",
        {
          service: "fsx",
          action: "updateVolume",
          iamResources: ["*"],
          parameters: {
            VolumeId: cdk.aws_stepfunctions.JsonPath.stringAt("$.VolumeId"),
            OntapConfiguration: {
              TieringPolicy: {
                Name: cdk.aws_stepfunctions.JsonPath.stringAt(
                  "$$.Execution.Input.tieringPolicy.name"
                ),
              },
            },
          },
        }
      );

    const choice = new cdk.aws_stepfunctions.Choice(this, "Choice")
      .when(
        cdk.aws_stepfunctions.Condition.or(
          cdk.aws_stepfunctions.Condition.stringEquals(
            "$$.Execution.Input.tieringPolicy.name",
            "ALL"
          ),
          cdk.aws_stepfunctions.Condition.stringEquals(
            "$$.Execution.Input.tieringPolicy.name",
            "NONE"
          )
        ),
        mapWithoutCoolingPeriod.itemProcessor(updateVolumeWithoutCoolingPeriod)
      )
      .otherwise(
        mapWithCoolingPeriod.itemProcessor(updateVolumeWithCoolingPeriod)
      );

    this.stateMachine = new cdk.aws_stepfunctions.StateMachine(
      this,
      "Default",
      {
        definitionBody:
          cdk.aws_stepfunctions.DefinitionBody.fromChainable(choice),
        timeout: cdk.Duration.minutes(15),
      }
    );
  }
}
