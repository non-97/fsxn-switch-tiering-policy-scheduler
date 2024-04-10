#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { SwitchTieringPolicySchedulerStack } from "../lib/switch-tiering-policy-scheduler-stack";
import { switchTieringPolicySchedulerStackProperty } from "../parameter/index";

const app = new cdk.App();
new SwitchTieringPolicySchedulerStack(
  app,
  "TieringPolicySwitchSchedulerStack",
  {
    env: switchTieringPolicySchedulerStackProperty.env,
    ...switchTieringPolicySchedulerStackProperty.props,
  }
);
