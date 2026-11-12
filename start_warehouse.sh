#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"

export ROS_DOMAIN_ID=188

exec ./run.sh "$@"
