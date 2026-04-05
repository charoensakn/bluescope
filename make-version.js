import fs from 'node:fs';
import path from 'node:path';

const appPath = path.join('package.json');
const mainPath = path.join('apps', 'main', 'package.json');
const rendererPath = path.join('apps', 'renderer', 'package.json');
const modulesPath = path.join('packages', 'modules', 'package.json');
const reposPath = path.join('packages', 'repos', 'package.json');
const skillsPath = path.join('packages', 'skills', 'package.json');
const agentsPath = path.join('packages', 'agents', 'package.json');

const appJson = JSON.parse(fs.readFileSync(appPath, 'utf-8'));
const mainJson = JSON.parse(fs.readFileSync(mainPath, 'utf-8'));
const rendererJson = JSON.parse(fs.readFileSync(rendererPath, 'utf-8'));
const modulesJson = JSON.parse(fs.readFileSync(modulesPath, 'utf-8'));
const reposJson = JSON.parse(fs.readFileSync(reposPath, 'utf-8'));
const skillsJson = JSON.parse(fs.readFileSync(skillsPath, 'utf-8'));
const agentsJson = JSON.parse(fs.readFileSync(agentsPath, 'utf-8'));

fs.writeFileSync(
  path.join('version.json'),
  JSON.stringify({
    bs_app: appJson.version,
    bs_main: mainJson.version,
    bs_renderer: rendererJson.version,
    bs_modules: modulesJson.version,
    bs_repos: reposJson.version,
    bs_skills: skillsJson.version,
    bs_agents: agentsJson.version,
  }),
  'utf-8',
);
