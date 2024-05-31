# ByteBank CLI

ByteBank é um sistema de banco simples que roda no terminal, permitindo que os usuários criem contas, façam login e realizem operações bancárias básicas como consultar saldo, depositar e sacar dinheiro.

## Funcionalidades

- Criar uma nova conta.
- Entrar em uma conta existente.
- Consultar saldo da conta.
- Depositar dinheiro na conta.
- Sacar dinheiro da conta.
- Sair do banco.

## Tecnologias Utilizadas

- Node.js
- Inquirer.js para interação com o usuário via terminal.
- Chalk.js para estilização de texto no terminal.
- bcrypt.js para criptografia de senhas.
- fs (File System) para manipulação de arquivos.

## Instalação

1. Clone o repositório:
    ```sh
    git clone https://github.com/carlos-heins/bytebank-cli.git
    cd bytebank-cli
    ```

2. Instale as dependências:
    ```sh
    npm install
    ```

## Uso

Execute o aplicativo usando o comando:
```
npm start
```
Você será apresentado com um menu inicial onde pode escolher criar uma nova conta ou entrar em uma conta existente.

- Criar Conta
- Escolha "Criar conta" no menu.
- Digite um nome para sua nova conta.
- Digite uma senha para sua conta.
- Entrar na Conta
- Escolha "Entrar na sua conta" no menu.
- Digite o nome da sua conta.
- Digite a senha da sua conta.
- Operações Bancárias

## Após entrar na conta, você poderá:

- Consultar saldo.
- Depositar dinheiro.
- Sacar dinheiro.
- Sair da conta.
