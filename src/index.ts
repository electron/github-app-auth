import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from '@octokit/rest';

export interface RepoInfo {
  owner: string;
  name: string;
}

export interface AppCredentials {
  appId: string;
  privateKey: string;
}

export function appCredentialsFromString(str: string): AppCredentials {
  return JSON.parse(Buffer.from(str, 'base64').toString('utf-8')) as any as AppCredentials;
}

export async function getTokenForRepo(repo: RepoInfo, appCreds: AppCredentials) {
  const auth = createAppAuth({
    appId: appCreds.appId,
    privateKey: appCreds.privateKey,
  });
  const appAuth = await auth({
    type: 'app',
  });

  const octokit = new Octokit({
    auth: appAuth.token,
  });

  const installations = await octokit.apps.listInstallations();
  if (installations.data.length !== 1) return null;

  if (installations.data[0].account?.login !== repo.owner) return null;

  const installationAuth = await auth({
    type: 'installation',
    installationId: installations.data[0].id,
  });

  return installationAuth.token;
}