#!/usr/bin/env node

import * as fs from 'fs';

import { bundleAppCredentials } from './';

const args = process.argv;

const cert = args.find(arg => arg.startsWith('--cert='))?.substring('--cert='.length);
const appId = args.find(arg => arg.startsWith('--app-id='))?.substring('--app-id='.length);

if (!cert) {
  console.error('Missing --cert argument');
  process.exit(1);
}

if (!appId) {
  console.error('Missing --app-id argument');
  process.exit(1);
}

const privateKey = fs.readFileSync(cert, 'utf8');
const appIdNumber = parseInt(appId, 10);

if (isNaN(appIdNumber)) {
  console.error('App ID was not a number');
  process.exit(1);
}

console.log(bundleAppCredentials({
  appId,
  privateKey,
}));
