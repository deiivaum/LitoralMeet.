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
const prisma = new PrismaClient({
    adapter: adapter,

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
    
    //editar o perfil e apagar

    static async atualizar(id, dados){
        const idNumero = parseInt(id);
        return await prisma.user.update({
            where: { id: parseInt(id) },
            data: dados,
        });
    }

    static async findById(id){
        return await prisma.user.findUnique({
            where: {id: id},
        });
    }
    
    static async apagar(id){
        return await prisma.user.delete({
            where: {id: parseInt(id)},
        });
    }


    static async getRatingByUserId(userId){
       return await prisma.Rating.findUnique({
            where: {userId: userId},
        });
    }

    static async createRating(userId, rating){
        return await prisma.Rating.create({
            data: {
                userId: userId,
                rating: rating,
            }
        });
    }

    static async attAvalia(userId, rating){
        return await prisma.Rating.update({
            where: { userId: userId},
            data: { rating: rating },
        });
    }



} 
module.exports = Usuario;