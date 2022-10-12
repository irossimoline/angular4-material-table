#!/bin/bash
# Get to the root project
if [[ "_" == "_${PROJECT_DIR}" ]]; then
  SCRIPT_DIR=$(dirname $0)
  PROJECT_DIR=$(cd "${SCRIPT_DIR}/.." && pwd)
  export PROJECT_DIR
fi;

cd ${PROJECT_DIR}

# Read parameters
version=$1
release_description=$2

# Check parameters
if [[ ! $version =~ ^[0-9]+.[0-9]+.[0-9]+(-(alpha|beta|rc)[0-9]+)?$ ]]; then
  echo "Wrong version format"
  echo "Usage:"
  echo " > $0 <version> <release_description>"
  echo "with:"
  echo " - version: x.y.z"
  echo " - release_description: a comment on release"
  exit 1
fi

### Get current version (package.json)
current=`grep -oP "version\": \"\d+.\d+.\d+(-(alpha|beta|rc)[0-9]+)?" package.json | grep -m 1 -oP "\d+.\d+.\d+(-(alpha|beta|rc)[0-9]+)?"`
if [[ "_$current" == "_" ]]; then
  echo ">> Unable to read the current version in 'package.json'. Please check version format is: x.y.z (x and y should be an integer)."
  exit 1;
fi
echo "Current version: $current"

echo "**********************************"
echo "* Starting release..."
echo "**********************************"
echo "* current version: $current"
echo "*     new version: $version"
echo "**********************************"

# Change the version in files: 'package.json' and 'config.xml'
sed -i "s/version\": \"$current\"/version\": \"$version\"/g" package.json
[[ $? -ne 0 ]] && exit 1

## Prepare dependencies
npm install

## Publish
npm run publish
[[ $? -ne 0 ]] && exit 1
