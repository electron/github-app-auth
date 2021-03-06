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

export function bundleAppCredentials(appCreds: AppCredentials): string {
  return Buffer.from(JSON.stringify(appCreds), 'utf-8').toString('base64');
}

export async function getTokenForRepo(repo: RepoInfo, appCreds: AppCredentials) {
  const authOptions = await getAuthOptionsForRepo(repo, appCreds);
  if (!authOptions) return null;

  const { token } = await authOptions.authStrategy(authOptions.auth)(authOptions.auth);
  return token as string;
}

interface OctokitAuthOptions {
  auth: object;
  authStrategy: Function;
}

export async function getAuthOptionsForRepo(
  repo: RepoInfo,
  appCreds: AppCredentials,
): Promise<OctokitAuthOptions | null> {
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

  try {
    const installation = await octokit.apps.getRepoInstallation({
      owner: repo.owner,
      repo: repo.name,
    });

    return {
      auth: {
        type: 'installation',
        appId: appCreds.appId,
        privateKey: appCreds.privateKey,
        installationId: installation.data.id,
      },
      authStrategy: createAppAuth,
    };
  } catch (err: any) {
    if (err.status !== 404) throw err;
    return null;
  }
}
