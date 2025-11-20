const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const dotenv = require('dotenv'); // Para carregar a variável DATABASE_URL

// 2. CONFIGURAÇÃO E INSTANCIAÇÃO DO PRISMA (CORREÇÃO CRÍTICA)

// Carrega as variáveis de ambiente do .env
dotenv.config();

// 2a. Obtém a string de conexão (connectionString)
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("A variável DATABASE_URL não está definida no arquivo .env.");
}

// 2b. Instancia o adaptador
const adapter = new PrismaMariaDb(connectionString);

// 2c. Instancia o Prisma Client, passando o adaptador
const prisma = new PrismaClient({
    adapter: adapter,
    // Opcional: log: ['query'],
});

class Usuario{

    constructor(id, nome, email, senhaHash, cpf){
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.senhaHash = senhaHash;
        this.cpf = cpf;
    }

    static async criar(nome, email, senhaHash, cpf){
        return await prisma.user.create({
            data: {
                nome: nome, 
                email: email,
                senha: senhaHash, 
                cpf: cpf
            }
        });
    }

    static async findByEmail(email){
       return prisma.user.findUnique({
            where: {
                email: email,
            },
        });
    }

    static async findAll(){
        return prisma.user.findMany();
    }
}

module.exports = Usuario;