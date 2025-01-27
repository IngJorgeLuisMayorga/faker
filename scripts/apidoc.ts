import { resolve } from 'path';
import { faker } from '../src';
import {
  writeApiPagesIndex,
  writeApiSearchIndex,
} from './apidoc/apiDocsWriter';
import { processModuleMethods } from './apidoc/moduleMethods';
import { initMarkdownRenderer } from './apidoc/signature';
import { newTypeDocApp, patchProject } from './apidoc/typedoc';
import type { PageIndex } from './apidoc/utils';
import { pathOutputDir } from './apidoc/utils';

const pathOutputJson = resolve(pathOutputDir, 'typedoc.json');

async function build(): Promise<void> {
  await initMarkdownRenderer();
  faker.setDefaultRefDate(Date.UTC(2023, 0, 1));

  const app = newTypeDocApp();

  app.bootstrap({
    entryPoints: ['src/index.ts'],
    pretty: true,
    cleanOutputDir: true,
  });

  const project = app.convert();

  if (!project) {
    throw new Error('Failed to convert project');
  }

  // Useful for manually analyzing the content
  await app.generateJson(project, pathOutputJson);

  patchProject(project);

  const modulesPages: PageIndex = [];
  modulesPages.push(...processModuleMethods(project));
  writeApiPagesIndex(modulesPages);

  writeApiSearchIndex(project);
}

build().catch(console.error);
