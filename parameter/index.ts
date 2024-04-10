import * as cdk from "aws-cdk-lib";

export interface TieringPolicy {
  name: "AUTO" | "SNAPSHOT_ONLY" | "ALL" | "NONE";
  coolingPeriod?: number;
}
export interface ToTieringPolicy {
  tieringPolicy: TieringPolicy;
  scheduleExpression: string;
  scheduleExpressionTimezone?: string;
}

export interface SwitchTieringPolicyScheduler {
  targetVolumeIds: string[];
  toTieringPolicies: ToTieringPolicy[];
}

export interface SwitchTieringPolicySchedulerStackProperty {
  env?: cdk.Environment;
  props: SwitchTieringPolicyScheduler;
}

export const switchTieringPolicySchedulerStackProperty: SwitchTieringPolicySchedulerStackProperty =
  {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    },
    props: {
      targetVolumeIds: ["fsvol-03e71e794717763bc", "fsvol-0f00406c5736b6cb8"],
      toTieringPolicies: [
        {
          tieringPolicy: {
            name: "ALL",
          },
          scheduleExpression: "cron(5/10 * * * ? *)",
          scheduleExpressionTimezone: "Asia/Tokyo",
        },
        {
          tieringPolicy: {
            name: "AUTO",
            coolingPeriod: 5,
          },
          scheduleExpression: "cron(0/10 * * * ? *)",
          scheduleExpressionTimezone: "Asia/Tokyo",
        },
      ],
    },
  };
