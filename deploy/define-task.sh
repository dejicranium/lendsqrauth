#!/usr/bin/env bash
if [ "$BITBUCKET_BRANCH" == "master" ]; then export MODE=live; fi
if [ "$BITBUCKET_BRANCH" == "staging" ]; then export MODE=staging; fi
if [ "$BITBUCKET_BRANCH" == "develop" ]; then export MODE=development; fi
export IMAGE_NAME="${ECS_SERVICE_NAME}:$MODE-${BITBUCKET_BUILD_NUMBER}"
export ECR_IMAGE_NAME="${ECR_URI}/${IMAGE_NAME}"
export IMAGE_PLACEHOLDER="<IMAGE_VERSION>"
export ECS_TASK_NAME_PLACEHOLDER="<ECS_TASK_NAME>"
export AWS_DEFAULT_REGION_PLACEHOLDER="us-east-2"
export ECS_CLUSTER_NAME_PLACEHOLDER="<ECS_CLUSTER_NAME>"
export ECS_TASK_ROLE_PLACEHOLDER="<ECS_TASK_ROLE_PLACEHOLDER>"
export ECS_SERVICE_PLACEHOLDER="<ECS_SERVICE_NAME>"
export ECS_TASK_NAME="${ECS_CLUSTER_NAME}-${ECS_SERVICE_NAME}"
export TASK_DEFINITION_FILE=$(cat ./deploy/ecs-task-definition.json)
export TASK_DEFINITION="${TASK_DEFINITION_FILE//$IMAGE_PLACEHOLDER/$ECR_IMAGE_NAME}"
export TASK_DEFINITION="${TASK_DEFINITION//$ECS_SERVICE_PLACEHOLDER/$ECS_SERVICE_NAME}"
export TASK_DEFINITION="${TASK_DEFINITION//$ECS_TASK_NAME_PLACEHOLDER/$ECS_TASK_NAME}"
export TASK_DEFINITION="${TASK_DEFINITION//$ECS_CLUSTER_NAME_PLACEHOLDER/$ECS_CLUSTER_NAME}"
export TASK_DEFINITION="${TASK_DEFINITION//$AWS_DEFAULT_REGION_PLACEHOLDER/$AWS_DEFAULT_REGION}"
export TASK_DEFINITION="${TASK_DEFINITION//$ECS_TASK_ROLE_PLACEHOLDER/$AWS_ECS_ROLE}"
export TASK_VERSION=$(aws ecs register-task-definition --family "${ECS_TASK_NAME}" --execution-role-arn ${AWS_ECS_ROLE} --cli-input-json "${TASK_DEFINITION}" | jq --raw-output '.taskDefinition.revision')
echo "Registered ECS Task Definition:" "${TASK_VERSION}"
echo "${ECS_TASK_NAME}:${TASK_VERSION}" > ./ecr_task_version.txt


