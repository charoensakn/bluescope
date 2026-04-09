import { Octokit } from 'octokit';

const octokit = new Octokit();

export type LatestReleaseInfo = {
  tagName: string;
  name: string;
  browserDownloadUrl: string;
};

export async function getLatestVersion(): Promise<LatestReleaseInfo | null> {
  try {
    const result = await octokit.request('GET /repos/charoensakn/bluescope/releases/latest', {
      owner: 'charoensakn',
      repo: 'bluescope',
      headers: {
        'X-GitHub-Api-Version': '2026-03-10',
      },
    });
    if (result.status === 200) {
      const tagName = result.data.tag_name;
      const name = result.data.name;
      if (typeof tagName === 'string' && typeof name === 'string' && Array.isArray(result.data?.assets)) {
        for (const asset of result.data.assets) {
          const assetName = asset.name;
          const browserDownloadUrl = asset.browser_download_url;
          if (
            typeof assetName === 'string' &&
            typeof browserDownloadUrl === 'string' &&
            assetName.includes(process.platform)
          ) {
            return {
              tagName,
              name,
              browserDownloadUrl,
            };
          }
        }
      }
    }
  } catch {
    // Ignore errors and return null
  }
  return null;
}
