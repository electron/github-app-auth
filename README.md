# @electron/github-app-auth

> Gets an auth token for a repo via a GitHub app installation

[![CircleCI](https://circleci.com/gh/electron/github-app-auth.svg?style=svg)](https://circleci.com/gh/electron/github-app-auth)

## Usage

### Generating Credentials

In order to simply credential management `@electron/github-app-auth` contains
a CLI tool to generate a "credential bundle" that contains the requisite
information to generate tokens.  You need both a private key for your
application and the application ID.

```bash
npx @electron/github-app-auth --cert=my-private.key.pem --app-id=12345
```

This command will output a base64 encoded blob which you should store in your
services secret storage (normally accessed via an environment variable).  Below
we will use `MY_GITHUB_APP_CREDS` as the environment variable.

### With `@octokit/rest`

```typescript
import { appCredentialsFromString, getAuthOptionsForRepo } from '@electron/github-app-auth';
import { Octokit } from '@octokit/rest';

const creds = appCredentialsFromString(process.env.MY_GITHUB_APP_CREDS);
const authOpts = await getAuthOptionsForRepo({
  owner: 'electron',
  name: 'electron'
}, creds)
const octo = new Octokit({
  ...authOpts,
});

// octo is now a valid octokit instance
```

### With raw tokens

```typescript
import { appCredentialsFromString, getTokenForRepo } from '@electron/github-app-auth';
import { Octokit } from '@octokit/rest';

const creds = appCredentialsFromString(process.env.MY_GITHUB_APP_CREDS);
const token = await getTokenForRepo({
  owner: 'electron',
  name: 'electron'
}, creds)

// token is now a valid github auth token
```

#### With raw tokens on the CLI

```bash
gh_token=$(npx @electron/github-app-auth --creds=$MY_GITHUB_APP_CREDS --owner=electron --repo=electron)
```
