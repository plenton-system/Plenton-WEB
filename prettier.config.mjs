/**
 * Configuração do Prettier - Formatador de código
 * 
 * Estas opções controlam como o Prettier irá formatar automaticamente o código
 * Documentação completa: https://prettier.io/docs/en/options.html
 */

/**
 * @tipo {import("prettier").Config}
 * Precisa reiniciar a IDE ao alterar a configuração
 * Abra a paleta de comandos (Ctrl + Shift + P) e execute o comando > Recarregar Janela.
 */
const config = {
  semi: true, // Usar ponto e vírgula no final das linhas
  tabWidth: 2, // Largura do tab (indentação) em espaços
  endOfLine: 'lf', // Tipo de quebra de linha (lf = Line Feed \n, padrão Unix)
  printWidth: 100, // Largura máxima da linha antes de quebrar
  singleQuote: true, // Usar aspas simples em vez de aspas duplas
  trailingComma: 'es5', // Adicionar vírgulas no final de objetos e arrays seguindo o padrão ES5
};

export default config;
