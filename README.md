# Testes Automatizados de Front-End — NEXDOM

Suíte de testes end-to-end com **Playwright + TypeScript**, usando o padrão
**Page Object Model (POM)**, cobrindo os 3 cenários solicitados no site
[https://nexdom.tec.br/](https://nexdom.tec.br/).

## Estrutura do projeto

```
nexdom-playwright-tests/
├── package.json
├── playwright.config.ts       # config dos testes de FRONT-END (nexdom.tec.br)
├── playwright.api.config.ts   # config dos testes de BACKEND (API do GitHub)
├── .env.example                # modelo de variável de ambiente (GITHUB_TOKEN)
├── docs/
│   ├── casos-de-teste.md      # Casos de teste detalhados (formato tabular: ID, passos, resultado esperado)
│   ├── arquitetura.md         # Explicação da arquitetura (elements → pages → modules → tests)
│   └── api-tests.md           # Como configurar e rodar os testes de backend (API do GitHub)
├── features/                  # Casos de teste em Gherkin (BDD) — cenários de front-end
│   ├── homepage.feature
│   ├── navigation.feature
│   └── contact-form.feature
├── elements/                  # "O que selecionar" — textos/labels usados como seletores (front-end)
│   ├── homeElements.ts
│   └── contactElements.ts
├── pages/                     # "Como interagir" — Page Objects com as ações de cada tela (front-end)
│   ├── HomePage.ts
│   └── ContactPage.ts
├── modules/                   # "Fluxo de negócio" — sequências reutilizáveis entre testes (front-end)
│   └── ContactModule.ts
├── tests/                     # Testes de FRONT-END
│   ├── homepage.spec.ts       # Cenário 1: elementos do menu na Home
│   ├── navigation.spec.ts     # Cenário 2: navegação até Soluções
│   └── contact-form.spec.ts   # Cenário 3: envio do formulário de contato
├── api/                        # "Page Object" da API — encapsula as chamadas HTTP (backend)
│   └── GitHubApiClient.ts
└── tests-api/                  # Testes de BACKEND
    └── github-repository-issue.spec.ts  # Criação/consulta/exclusão de repo + issue via API do GitHub
```

A arquitetura de front-end segue o padrão **elements → pages → modules → tests**,
detalhado em `docs/arquitetura.md`. Os testes de backend seguem a mesma ideia,
adaptada para API: `api/` (chamadas HTTP) → `tests-api/` (cenários).

## Testes de Backend (API do GitHub)

```bash
cp .env.example .env   # depois, cole seu GitHub token no arquivo .env
npm install
npm run test:api
npm run report:api
```

Veja `docs/api-tests.md` para o passo a passo completo de geração do token
e detalhes de cada uma das 6 etapas testadas (criação, consulta e exclusão
de repositório + criação e consulta de issue).

## Casos de teste em Gherkin

A pasta `features/` contém os casos de teste escritos em **Gherkin**
(Dado/Quando/Então), servindo como especificação legível por não-técnicos
e como base para os testes automatizados em `tests/`. Eles são arquivos de
documentação/BDD — para executá-los como testes automatizados de fato
(com `cucumber-js` ou `playwright-bdd`), seria necessário adicionar as
step definitions ligando cada frase Gherkin ao código Playwright
correspondente (posso montar isso também, se quiser evoluir o projeto
para BDD completo).

## Cenários implementados

| Cenário | Arquivo | O que valida |
|---|---|---|
| 1 | `tests/homepage.spec.ts` | Menu principal (Home, Sobre nós, Soluções, Parceiros, Carreiras, Contato) visível na Home |
| 2 | `tests/navigation.spec.ts` | Clique em "Soluções" abre o submenu e navega até uma página de solução |
| 3 | `tests/contact-form.spec.ts` | Preenchimento e envio do formulário de contato com os dados informados |

## Como instalar

```bash
npm install
npx playwright install --with-deps
```

## Como executar

```bash
# Rodar todos os testes (headless)
npm test

# Rodar com navegador visível
npm run test:headed

# Rodar em modo UI (interativo, ótimo para debug)
npm run test:ui

# Ver o relatório HTML após a execução
npm run report
```

## ⚠️ Observações importantes antes de rodar pela primeira vez

Não tive acesso a um navegador real para inspecionar o DOM ao vivo do site
(apenas ao conteúdo textual/estrutural da página), então alguns pontos
merecem atenção na primeira execução:

1. **Menu "Soluções"**: o site não tem uma única página `/solucoes/` — é um
   dropdown que abre um submenu com várias soluções (Gestão de planos de
   saúde, Autorização e Atendimento, etc). O teste do Cenário 2 clica em
   "Soluções" e depois no primeiro item do submenu (**Gestão de planos de
   saúde**) como representante da "página de Soluções". Se preferir validar
   apenas a *abertura do submenu* (sem navegar a uma página filha), ajuste
   `HomePage.navegarParaSolucoes()`.

2. **Formulário de contato**: os campos (Nome, E-mail, Empresa, Cargo,
   Telefone, Assunto) foram mapeados por `label`/`placeholder` via regex
   case-insensitive, que é a abordagem mais resiliente sem conhecer os
   `id`/`name` internos do plugin de formulário do WordPress. Se algum
   campo não for encontrado na execução, use o comando abaixo para gerar
   os seletores exatos automaticamente:

   ```bash
   npm run codegen
   ```

   Isso abre o Playwright Inspector navegando no site real — basta
   interagir com os campos e copiar os seletores gerados para dentro de
   `pages/ContactPage.ts`.

3. **Mensagem de sucesso do formulário**: o texto exato exibido após o
   envio (ex.: "Mensagem enviada com sucesso") não pôde ser confirmado
   sem executar o envio real. O teste procura por um conjunto de textos
   comuns (`mensagem enviada`, `obrigado`, `recebemos seu contato`,
   `sucesso`). Ajuste a regex em `contact-form.spec.ts` assim que
   confirmar a mensagem real exibida pelo site.

4. **Ambiente de teste**: como o formulário aponta para um site real de
   produção, o teste do Cenário 3 realmente envia os dados de teste
   informados. Avalie se o time de negócio permite isso ou se é
   necessário apontar para um ambiente de homologação/mock antes de
   rodar em CI.

## Próximos passos sugeridos

- Adicionar testes de campos obrigatórios (validação de erro ao enviar
  formulário vazio).
- Adicionar teste de e-mail inválido.
- Integrar a suíde em um pipeline de CI (GitHub Actions), publicando o
  relatório HTML como artefato.
