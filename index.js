import inquirer from 'inquirer';
import chalk from 'chalk';
import bcrypt from 'bcrypt';
import fs from 'fs';

const saltRounds = 5;
let loggedUser = null;

operation();

function operation() {
    const choices = loggedUser
        ? [
            { name: 'Consultar saldo', value: 'getAccountBalance' },
            { name: 'Depositar', value: 'deposit' },
            { name: 'Sacar', value: 'withdraw' },
            { name: 'Sair', value: 'exit' }
        ]
        : [
            { name: 'Criar conta', value: 'createAccount' },
            { name: 'Entrar na sua conta', value: 'enterAccount' },
            { name: 'Sair do Banco', value: 'exit' }
        ];

    inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: 'O que você deseja fazer?',
        choices
    }])
    .then((answer) => {
        const action = answer['action'];
        if (loggedUser) {
            funcoesBanco[action]();
        } else {
            funcoesAutenticacao[action]();
        }
    })
    .catch((err) => console.log(err));
}

const funcoesAutenticacao = {
    enterAccount: async function () {
        try {
            const answer = await inquirer.prompt([{
                type: 'input',
                name: 'accountName',
                message: 'Digite o nome da sua conta:'
            }]);

            const accountName = answer['accountName'];

            if (!fs.existsSync(`accounts/${accountName}.json`)) {
                console.log(chalk.bgRed.black('A conta informada não existe'));
                return funcoesAutenticacao.enterAccount();
            }

            const accountData = getAccount(accountName);
            const passwordInput = await getPasswordFromClient();
            const result = await authenticateUser(passwordInput, accountData.password);

            if (result) {
                loggedUser = accountData;
                console.log(chalk.green('Autenticação bem-sucedida!'));
            } else {
                console.log(chalk.bgRed.black('Senha incorreta, tente novamente.'));
                return funcoesAutenticacao.enterAccount();
            }

            operation();
        } catch (err) {
            console.log(err);
        }
    },
    createAccount: async function () {
        console.log(chalk.bgGreen.black('Parabéns por escolher o nosso banco!'));
        console.log(chalk.green('Defina as opções da sua conta a seguir'));
        await buildAccount();
    },
    exit: function () {
        console.log(chalk.bgBlue.black('Obrigado por Usar o ByteBank!'));
        process.exit();
    }
};

const funcoesBanco = {
    getAccountBalance: function () {
        if (loggedUser) {
            console.log(chalk.bgBlue.black(`Olá, o saldo da sua conta é de R$ ${loggedUser.balance}`));
        } else {
            console.log(chalk.bgRed.black("Você não está autenticado."));
        }
        operation();
    },
    deposit: async function () {
        const answer = await inquirer.prompt([{
            type: 'input',
            name: 'amount',
            message: 'Quanto você deseja depositar?'
        }]);

        const amount = parseFloat(answer['amount']);
        if (isNaN(amount) || amount <= 0) {
            console.log(chalk.bgRed.black('Valor inválido, tente novamente.'));
            return funcoesBanco.deposit();
        }

        loggedUser.balance += amount;
        saveAccount(loggedUser);
        console.log(chalk.green(`Depósito de R$ ${amount} concluído com sucesso!`));
        operation();
    },
    withdraw: async function () {
        const answer = await inquirer.prompt([{
            type: 'input',
            name: 'amount',
            message: 'Quanto você deseja sacar?'
        }]);

        const amount = parseFloat(answer['amount']);
        if (isNaN(amount) || amount <= 0) {
            console.log(chalk.bgRed.black('Valor inválido, tente novamente.'));
            return funcoesBanco.withdraw();
        }

        if (loggedUser.balance < amount) {
            console.log(chalk.bgRed.black('Saldo insuficiente.'));
            return funcoesBanco.withdraw();
        }

        loggedUser.balance -= amount;
        saveAccount(loggedUser);
        console.log(chalk.green(`Saque de R$ ${amount} realizado com sucesso!`));
        operation();
    },
    exit: function () {
        loggedUser = null;
        console.log(chalk.bgBlue.black('Você saiu da conta.'));
        operation();
    }
};

async function buildAccount() {
    try {
        const answer = await inquirer.prompt([{
            type: 'input',
            name: 'accountName',
            message: 'Digite um nome para sua nova conta:'
        }]);

        const accountName = answer['accountName'];

        if (!fs.existsSync('accounts')) {
            fs.mkdirSync('accounts');
        }

        if (fs.existsSync(`accounts/${accountName}.json`)) {
            console.log(chalk.bgRed.black('Já existe uma conta com esse nome, escolha outro.'));
            return buildAccount();
        }

        const password = await getPasswordFromClient();
        const encryptedPassword = await encryptPassword(password);

        const newAccount = {
            balance: 0,
            password: encryptedPassword,
            name: accountName
        };

        fs.writeFileSync(
            `accounts/${accountName}.json`,
            JSON.stringify(newAccount, null, 2)
        );

        console.log(chalk.green("Conta criada com sucesso!"));
        operation();
    } catch (err) {
        console.log(err);
    }
}

async function getPasswordFromClient() {
    const answer = await inquirer.prompt([{
        type: 'input',
        name: 'password',
        message: 'Digite a senha:'
    }]);
    return answer['password'];
}

function getAccount(accountName) {
    const accountJson = fs.readFileSync(`accounts/${accountName}.json`, {
        encoding: 'utf-8',
        flag: 'r'
    });
    return JSON.parse(accountJson);
}

function saveAccount(accountData) {
    fs.writeFileSync(
        `accounts/${accountData.name}.json`,
        JSON.stringify(accountData, null, 2)
    );
}

async function encryptPassword(password) {
    try {
        const hash = await bcrypt.hash(password, saltRounds);
        return hash;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

async function authenticateUser(password, storedHash) {
    try {
        const result = await bcrypt.compare(password, storedHash);
        return result;
    } catch (err) {
        console.log(err);
        throw err;
    }
}
