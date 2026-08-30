import { defineConfig } from '@playwright/test';
import 'dotenv/config';

/**
 * Configuração dedicada aos testes de BACKEND (API do GitHub).
 * Separada de `playwright.config.ts` (front-end) pois aqui não há
 * navegador — apenas chamadas HTTP via `request` fixture.
 *
 * Requer a variável de ambiente GITHUB_TOKEN (ver .env.example e
 * docs/api-tests.md para instruções de como gerar o token).
 */
export default defineConfig({
  testDir: './tests-api',
  timeout: 30_000,
  fullyParallel: false, // os testes têm dependência sequencial (repo -> issue -> exclusão)
  retries: 0,
  reporter: [['html', { outputFolder: 'playwright-report-api', open: 'never' }], ['list']],

  use: {
    baseURL: 'https://api.github.com',
    extraHTTPHeaders: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${process.env.GITHUB_TOKEN ?? ''}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  },
});
