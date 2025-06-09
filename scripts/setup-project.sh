#!/bin/bash
# Setup script to install npm dependencies

# Exit immediately if a command exits with a non-zero status
set -e

if [ ! -d node_modules ]; then
  echo "Installing dependencies..."
  npm install
else
  echo "node_modules already exists. Skipping npm install."
fi
