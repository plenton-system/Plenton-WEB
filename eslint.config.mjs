import globals from 'globals';
import eslintJs from '@eslint/js';
import eslintTs from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import importPlugin from 'eslint-plugin-import';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import perfectionistPlugin from 'eslint-plugin-perfectionist';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';

// ----------------------------------------------------------------------

/**
 * Níveis de configuração do ESLint:
 * 
 * 0 - "off"       : Desativa completamente a regra
 * 1 - "warn"      : Mostra um aviso (warning) mas não falha a execução
 * 2 - "error"     : Mostra um erro e causa falha na execução (exit code 1)
 * 
 * Algumas regras aceitam configuração adicional através de array:
 * [nivel, opcoes] - Onde o primeiro elemento é o nível e o segundo são opções específicas
 * 
 * Exemplo:
 * 'regra-exemplo': [2, { opcao1: true, opcao2: 'valor' }]
 */

/**
 * @regras comuns  
 * de 'react', 'eslint-plugin-react-hooks'...
 */
const commonRules = () => ({
  ...reactHooksPlugin.configs.recommended.rules,
  'func-names': 1, // Avisa (nível 1) quando funções não têm nome
  'no-bitwise': 2, // Erro (nível 2) ao usar operadores bitwise (como &, |, etc)
  'no-unused-vars': 0, // Desliga a verificação de variáveis não usadas (o TypeScript cuida disso)
  'object-shorthand': 1, // Avisa quando poderia usar shorthand em objetos ({x} em vez de {x: x})
  'no-useless-rename': 1, // Avisa sobre renomeações desnecessárias em imports/exports
  'default-case-last': 2, // Erro se default case não for o último em switch
  'consistent-return': 2, // Erro se função tem returns inconsistentes (alguns com valor, outros sem)
  'no-constant-condition': 1, // Avisa sobre condições constantes (como if(true))
  'default-case': [2, { commentPattern: '^no default$' }], // Erro se switch não tem default case, exceto se tiver comentário "no default"
  'lines-around-directive': [2, { before: 'always', after: 'always' }], // Erro se não houver linhas em volta de 'use strict' etc
  'arrow-body-style': [2, 'as-needed', { requireReturnForObjectLiteral: false }], // Erro se arrow function tem corpo desnecessário
  // react
  'react/jsx-key': 0, // Desliga a necessidade de key em elementos de array JSX
  'react/prop-types': 0, // Desliga verificação de prop-types (usando TypeScript)
  'react/display-name': 0, // Desliga necessidade de displayName em componentes
  'react/no-children-prop': 0, // Desliga proibição de passar children como prop
  'react/jsx-boolean-value': 2, // Erro ao passar booleanos explicitamente (ex: true) em JSX
  'react/self-closing-comp': 2, // Erro se componentes sem children não forem auto-fechados
  'react/react-in-jsx-scope': 0, // Desliga necessidade de importar React em cada arquivo JSX
  'react/jsx-no-useless-fragment': [1, { allowExpressions: true }], // Avisa sobre Fragments desnecessários
  'react/jsx-curly-brace-presence': [2, { props: 'never', children: 'never' }], // Erro ao usar chaves desnecessárias em props/children
  // typescript
  '@typescript-eslint/no-shadow': 2, // Erro ao declarar variáveis que sombreiam outras
  '@typescript-eslint/no-explicit-any': 0, // Permite o uso de 'any' explicitamente
  '@typescript-eslint/no-empty-object-type': 0, // Permite tipos de objeto vazios
  '@typescript-eslint/consistent-type-imports': 1, // Avisa quando imports de tipo não usam 'import type'
  '@typescript-eslint/no-unused-vars': [1, { args: 'none' }], // Avisa sobre variáveis não usadas, exceto parâmetros
});

/**
 * @regras relacionadas a importações  
 * fornecidas pelo 'eslint-plugin-import'.
 */
const importRules = () => ({
  ...importPlugin.configs.recommended.rules,
  'import/named': 0, // 🔇 Desativa o erro ao importar um named export que não existe no arquivo exportador
  'import/export': 0, // 🔇 Desativa a checagem se um arquivo exporta corretamente o que declara (ex: `export { foo } from './x'` sendo que `foo` não existe em `x`)
  'import/default': 0, // 🔇 Desativa a validação de imports default inexistentes (ex: `import foo from './x'` quando `x` não tem `export default`)
  'import/namespace': 0, // 🔇 Desativa a validação de imports tipo `import * as ns from './x'` se `ns` estiver incorreto (ex: membro inexistente usado via `ns.foo`)
  'import/no-named-as-default': 0, // 🔇 Desativa o aviso se você importar um named export com o mesmo nome de um default export (causa confusão)
  'import/no-named-as-default-member': 0, // 🔇 Desativa o aviso ao acessar um membro de um named export que coincide com o default (ex: `Component.defaultProps`)
  'import/no-cycle': [
    0, // 🔇 Desativa a verificação de ciclos entre arquivos (ex: A importa B que importa A de volta)
    { maxDepth: '∞', ignoreExternal: false, allowUnsafeDynamicCyclicDependency: false },
  ],
});

/**
 * @regras para remoção de imports não utilizados
 * fornecidas pelo 'eslint-plugin-unused-imports'.
 */
const unusedImportsRules = () => ({
  'unused-imports/no-unused-imports': 1,
  'unused-imports/no-unused-vars': [
    0,
    { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
  ],
});

/**
 * @regras de ordenação de imports e exports
 * fornecidas pelo 'eslint-plugin-perfectionist'.
 */
const sortImportsRules = () => {
  const customGroups = {
    mui: ['custom-mui'],
    auth: ['custom-auth'],
    hooks: ['custom-hooks'],
    utils: ['custom-utils'],
    types: ['custom-types'],
    routes: ['custom-routes'],
    sections: ['custom-sections'],
    contexts: ['custom-contexts'],
    components: ['custom-components'],
  };

  return {
    // Ordena os "named imports" (ex: import { A, B } from '...') por tamanho de linha e em ordem ascendente
    'perfectionist/sort-named-imports': [1, { type: 'line-length', order: 'asc' }],

    // Ordena os "named exports" (ex: export { A, B }) da mesma forma
    'perfectionist/sort-named-exports': [1, { type: 'line-length', order: 'asc' }],

    // Ordena os exports como um todo por tamanho de linha e ordem ascendente, agrupando valores antes de tipos
    'perfectionist/sort-exports': [
      1,
      {
        order: 'asc',
        type: 'line-length',
        groupKind: 'values-first',
      },
    ],

    // Ordena os imports com base em critérios bem definidos
    'perfectionist/sort-imports': [
      2, // nível 2 = erro (o lint falha se a ordem estiver errada)
      {
        order: 'asc',                 // Ordem alfabética
        ignoreCase: true,            // Ignora letras maiúsculas/minúsculas
        type: 'line-length',         // Ordena também por tamanho da linha
        environment: 'node',         // Ambiente de execução
        maxLineLength: undefined,    // Sem limite máximo de linha
        newlinesBetween: 'always',   // Adiciona uma linha em branco entre grupos
        internalPattern: ['^src/.+'], // Define o padrão para identificar imports internos
        groups: [  // Define a ordem dos grupos de importação
          'style',
          'side-effect',
          'type',
          ['builtin', 'external'],
          customGroups.mui,
          customGroups.routes,
          customGroups.hooks,
          customGroups.utils,
          'internal',
          customGroups.components,
          customGroups.sections,
          customGroups.contexts,
          customGroups.auth,
          customGroups.types,
          ['parent', 'sibling', 'index'],
          ['parent-type', 'sibling-type', 'index-type'],
          'object',
          'unknown',
        ],
        customGroups: {
          value: {
            [customGroups.mui]: ['^@mui/.+'],
            [customGroups.auth]: ['^src/auth/.+'],
            [customGroups.hooks]: ['^src/hooks/.+'],
            [customGroups.utils]: ['^src/utils/.+'],
            [customGroups.types]: ['^src/types/.+'],
            [customGroups.routes]: ['^src/routes/.+'],
            [customGroups.sections]: ['^src/sections/.+'],
            [customGroups.contexts]: ['^src/contexts/.+'],
            [customGroups.components]: ['^src/components/.+'],
          },
        },
      },
    ],
  };
};

/**
 * Custom ESLint configuration.
 */
export const customConfig = {
  plugins: {
    'react-hooks': reactHooksPlugin,
    'unused-imports': unusedImportsPlugin,
    perfectionist: perfectionistPlugin,
    import: importPlugin,
  },
  settings: {
    // https://www.npmjs.com/package/eslint-import-resolver-typescript
    ...importPlugin.configs.typescript.settings,
    'import/resolver': {
      ...importPlugin.configs.typescript.settings['import/resolver'],
      typescript: {
        project: './tsconfig.json',
      },
    },
  },
  rules: {
    ...commonRules(),
    ...importRules(),
    ...unusedImportsRules(),
    ...sortImportsRules(),
  },
};

// ----------------------------------------------------------------------

export default [
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  { ignores: ['*', '!src/', '!eslint.config.*'] },
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    settings: { react: { version: 'detect' } },
  },
  eslintJs.configs.recommended,
  ...eslintTs.configs.recommended,
  reactPlugin.configs.flat.recommended,
  customConfig,
];
