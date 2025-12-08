const prisma = require('../prismaClient'); 

class GalleryModel {
    
    // Cria um novo evento
    static async create(data) {
        return await prisma.event.create({
            data: {
                title: data.title,
                image: data.image,
                category: data.category,
                rating: data.rating,
                city: data.city,
                rating: "0",
                authorId: parseInt(data.authorId) 
            }
        });
    }

    // Busca todos os eventos
    static async findAll() {
        return await prisma.event.findMany({
            include: {
                author: {
                    select: { nome: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    // Busca evento por ID
    static async findById(id) {
        return await prisma.event.findUnique({
            where: { id: parseInt(id) },
            include: { author: true }
        });
    }

    // Atualiza evento
    static async update(id, data) {
        return await prisma.event.update({
            where: { id: parseInt(id) },
            data: data
        });
    }

    // Deleta evento
    static async delete(id) {
        return await prisma.event.delete({
            where: { id: parseInt(id) }
        });
    }
    
    // Estatísticas para o Dashboard
    static async getStats() {
        const total = await prisma.event.count();
        
        const byCity = await prisma.event.groupBy({
            by: ['city'],
            _count: { city: true }
        });
        
        const byCategory = await prisma.event.groupBy({
            by: ['category'],
            _count: { category: true }
        });
        
        return { total, byCity, byCategory };
    }
}

module.exports = GalleryModel;