#!/bin/bash
# Load environment variables from dev.env and run serverless offline

cd "$(dirname "$0")/.."

# Export variables from dev.env (remove quotes, comments, and empty lines)
export $(grep -v '^#' dev.env | grep -v '^$' | sed 's/"//g' | xargs)

# Run serverless offline
npx serverless offline "$@"

