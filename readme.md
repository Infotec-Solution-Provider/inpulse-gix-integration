# Tutorial de Rotina de Importação

## Descrição

Esta rotina é responsável por importar dados de clientes e notas fiscais de um serviço externo, garantindo que os dados não sejam importados duplicadamente. A rotina utiliza arquivos JSON para registrar os dias já importados e evitar duplicações.

## Configuração Inicial

### Instale as Dependências

1. Abra um terminal no diretório do projeto.
2. Execute o comando:
   npm install

### Configure o Arquivo `.env`

1. Crie um arquivo `.env` na raiz do projeto.
2. Adicione as seguintes variáveis ao arquivo `.env`:

   ```env
   IMPORT_DAYS_INTERVAL=30
   GIX_API_URL=https://api.exemplo.com
   GIX_API_USER=seu_usuario
   GIX_API_PASSWORD=sua_senha
   INPULSE_DB_HOST=localhost
   INPULSE_DB_USER=seu_usuario
   INPULSE_DB_PASSWORD=sua_senha
   INPULSE_DB_NAME=seu_banco_de_dados
   ```

## Executando a Rotina de Importação

### Executando a Rotina de Clientes

1. Abra um terminal no diretório do projeto.
2. Execute o comando:
   npm run importar:clientes

### Executando a Rotina de Notas Fiscais

1. Abra um terminal no diretório do projeto.
2. Execute o comando:
   npm run importar:notas

### Executando a Rotina de Clientes e Notas Fiscais em Paralelo

1. Abra um terminal no diretório do projeto.
2. Execute o comando:
   npm run start

## Ajustando Período da Importação

1. Abra o arquivo `.env`.
2. Altere o valor `IMPORT_DAYS_INTERVAL` para a quantidade de dias que você quer importar.
3. Salve o arquivo.

## Explicação do Funcionamento da Aplicação

### Carregamento dos Dias Importados

- A aplicação carrega os dias já importados de arquivos JSON (`importedCustomers.json` e `importedInvoices.json`) para garantir que não haja duplicações.

### Importação de Clientes e Notas Fiscais

- A aplicação importa dados de clientes e notas fiscais de um serviço externo, começando de ontem e voltando até a quantidade de dias especificada na variável `IMPORT_DAYS_INTERVAL`.
- Para cada dia, a aplicação verifica se os dados já foram importados. Se não, realiza a importação e registra o dia no arquivo JSON correspondente.

### Registro de Logs

- A aplicação registra logs detalhados de informações e erros para facilitar o monitoramento e a depuração.

## Conclusão

Com essas instruções, você terá um guia completo para configurar e executar a aplicação de importação de dados. Certifique-se de seguir cada passo cuidadosamente para garantir que a rotina funcione corretamente e evite duplicações de dados.