#!/usr/bin/env node

import * as fs from 'fs';

import {
  appCredentialsFromString,
  bundleAppCredentials,
  getTokenForOrg,
  getTokenForRepo,
} from './';

const args = process.argv;

function getArg(name: string) {
  const prefix = `--${name}=`;
  return args.find((arg) => arg.startsWith(prefix))?.substring(prefix.length);
}

// For getting a token
const creds = getArg('creds');
const org = getArg('org');
const owner = getArg('owner');
const repo = getArg('repo');
const repoArgs = owner && repo;

// For generating a creds bundle
const cert = getArg('cert');
const appId = getArg('app-id');

if (creds && ((org && !repoArgs) || (repoArgs && !org))) {
  const appCreds = appCredentialsFromString(creds);

  (org ? getTokenForOrg(org, appCreds) : getTokenForRepo({ owner: owner!, name: repo! }, appCreds))
    .then((token) => {
      if (token) {
        console.log(token);
      } else {
        console.error('Could not generate token');
        process.exit(1);
      }
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
} else if (cert && appId) {
  const privateKey = fs.readFileSync(cert, 'utf8');
  const appIdNumber = parseInt(appId, 10);

  if (isNaN(appIdNumber)) {
    console.error('App ID was not a number');
    process.exit(1);
  }

  console.log(
    bundleAppCredentials({
      appId,
      privateKey,
    }),
  );
} else {
  console.error(`Invalid Usage:
github-app-auth --cert=private.key --app-id=12345
github-app-auth --creds=CREDS_BUNDLE --org=electron
github-app-auth --creds=CREDS_BUNDLE --owner=electron --repo=electron`);
  process.exit(1);
}
