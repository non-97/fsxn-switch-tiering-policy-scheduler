import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { SwitchTieringPolicyConstruct } from "./construct/switch-tiering-policy-construct";
import { SchedulerConstruct } from "./construct/scheduler-construct";
import { SwitchTieringPolicyScheduler } from "../parameter/index";

export interface SwitchTieringPolicySchedulerStackProps
  extends cdk.StackProps,
    SwitchTieringPolicyScheduler {}

export class SwitchTieringPolicySchedulerStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: SwitchTieringPolicySchedulerStackProps
  ) {
    super(scope, id, props);

    const switchTieringPolicyConstruct = new SwitchTieringPolicyConstruct(
      this,
      "SwitchTieringPolicyConstruct"
    );

    const schedulerConstruct = new SchedulerConstruct(
      this,
      "SchedulerConstruct",
      {
        targetVolumeIds: props.targetVolumeIds,
        toTieringPolicies: props.toTieringPolicies,
        stateMachineArn:
          switchTieringPolicyConstruct.stateMachine.stateMachineArn,
      }
    );
  }
}
