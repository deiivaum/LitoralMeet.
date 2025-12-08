const prisma = require('../prismaClient'); 
class Usuario {
    constructor(id, nome, email, senhaHash, cpf){
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.senhaHash = senhaHash;
        this.cpf = cpf;
    }

    static async criar(nome, email, senhaHash, cpf){
        return await prisma.user.create({
            data: { nome, email, senha: senhaHash, cpf }
        });
    }

    static async findByEmail(email){
       return prisma.user.findUnique({ where: { email } });
    }

    static async findAll(){
        return prisma.user.findMany();
    }
    
    static async atualizar(id, dados){
        return await prisma.user.update({
            where: { id: parseInt(id) },
            data: dados,
        });
    }

    static async findById(id){
        return await prisma.user.findUnique({ where: {id: parseInt(id)} });
    }
    
    static async apagar(id) {
        return await prisma.$transaction([
            // Apaga as inscrições desse usuário
            prisma.participation.deleteMany({
                where: { userId: parseInt(id) }
            }),

            prisma.event.deleteMany({
                where: { authorId: parseInt(id) }
            }),

            //apaga o usuário
            prisma.user.delete({
                where: { id: parseInt(id) }
            })
        ]);
    }

    static async getRatingByUserId(userId){
       return await prisma.rating.findUnique({ where: {userId: parseInt(userId)} });
    }

    static async createRating(userId, rating){
        return await prisma.rating.create({
            data: { userId: parseInt(userId), rating: rating }
        });
    }

    static async attAvalia(userId, rating){
        return await prisma.rating.update({
            where: { userId: parseInt(userId)},
            data: { rating: rating },
        });
    }
} 

module.exports = Usuario;