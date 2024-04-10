import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { SwitchTieringPolicyScheduler } from "../../parameter/index";

export interface SchedulerProps extends SwitchTieringPolicyScheduler {
  stateMachineArn: string;
}

export class SchedulerConstruct extends Construct {
  constructor(scope: Construct, id: string, props: SchedulerProps) {
    super(scope, id);

    const role = new cdk.aws_iam.Role(this, "Role", {
      assumedBy: new cdk.aws_iam.ServicePrincipal("scheduler.amazonaws.com"),
      managedPolicies: [
        new cdk.aws_iam.ManagedPolicy(this, "StartExecution", {
          statements: [
            new cdk.aws_iam.PolicyStatement({
              effect: cdk.aws_iam.Effect.ALLOW,
              resources: [props.stateMachineArn],
              actions: ["states:StartExecution"],
            }),
          ],
        }),
      ],
    });

    props.toTieringPolicies.forEach((toTieringPolicy) => {
      new cdk.aws_scheduler.CfnSchedule(
        this,
        `SchedulerToTieringPolicy_${toTieringPolicy.tieringPolicy.name}`,
        {
          flexibleTimeWindow: {
            mode: "OFF",
          },
          scheduleExpression: toTieringPolicy.scheduleExpression,
          target: {
            arn: props.stateMachineArn,
            roleArn: role.roleArn,
            input: JSON.stringify({
              tieringPolicy: toTieringPolicy.tieringPolicy,
              targetVolumeIds: props.targetVolumeIds,
            }),
            retryPolicy: {
              maximumEventAgeInSeconds: 60,
              maximumRetryAttempts: 0,
            },
          },
          name: `to-tiering-policy-${toTieringPolicy.tieringPolicy.name}`,
          scheduleExpressionTimezone:
            toTieringPolicy.scheduleExpressionTimezone,
          state: "ENABLED",
        }
      );
    });
  }
}
