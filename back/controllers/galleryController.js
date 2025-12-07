const GalleryModel = require('../models/galleryModel');
const User = require('../models/userModel'); // Importe seu model de Usuário existente

class GalleryController {

    static async getAll(req, res) {
        try {
            const events = await GalleryModel.findAll();
            res.json(events);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar eventos' });
        }
    }

    // Dados do Dashboard
    static async dashboard(req, res) {
        try {
            const stats = await GalleryModel.getStats();
            res.json(stats);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao carregar dashboard' });
        }
    }

    // --- PRIVADO (Requer Login) ---

    // Criar Evento
    static async create(req, res) {
    console.log("--- TENTANDO CRIAR EVENTO ---");

    try {
        // Pegamos apenas o que importa
        const { title, image, category, city } = req.body;
        const authorId = req.userId; 

        // Validação básica
        if (!title || !city || !category) {
            return res.status(400).json({ error: 'Preencha título, cidade e categoria.' });
        }

        // Criação limpa (sem passar rating)
        const newEvent = await GalleryModel.create({ 
            title, 
            image, 
            category, 
            city, 
            authorId 
        });
        
        console.log("Sucesso:", newEvent);
        res.status(201).json(newEvent);

    } catch (error) {
        // ESSA É A PARTE MAIS IMPORTANTE AGORA:
        console.error("ERRO NO TERMINAL:", error); // <--- Isso vai mostrar o motivo real no VS Code
        res.status(500).json({ error: 'Erro interno. Olhe o terminal do VS Code.' });
    }
}

    // Editar Evento
    static async update(req, res) {
        const eventId = parseInt(req.params.id);
        const userId = req.userId;
        const data = req.body;

        try {
            const event = await GalleryModel.findById(eventId);
            if (!event) return res.status(404).json({ error: 'Evento não encontrado' });

            // Busca dados completos do usuário para ver a role
            const user = await User.findById(userId);

            // REGRA DE OURO: Só edita se for ADMIN ou DONO
            if (user.role !== 'admin' && event.authorId !== userId) {
                return res.status(403).json({ error: 'Você não tem permissão para editar este evento.' });
            }

            const updated = await GalleryModel.update(eventId, data);
            res.json({ message: 'Evento atualizado!', event: updated });

        } catch (error) {
            res.status(500).json({ error: 'Erro ao atualizar' });
        }
    }

    // Excluir Evento
    static async delete(req, res) {
        const eventId = parseInt(req.params.id);
        const userId = req.userId;

        try {
            const event = await GalleryModel.findById(eventId);
            if (!event) return res.status(404).json({ error: 'Evento não encontrado' });

            const user = await User.findById(userId);

            // REGRA DE OURO: Só deleta se for ADMIN ou DONO
            if (user.role !== 'admin' && event.authorId !== userId) {
                return res.status(403).json({ error: 'Você não tem permissão para excluir este evento.' });
            }

            await GalleryModel.delete(eventId);
            res.json({ message: 'Evento excluído com sucesso' });

        } catch (error) {
            res.status(500).json({ error: 'Erro ao excluir' });
        }
    }

    static async participate(req, res) {
        const eventId = parseInt(req.params.id);
        const userId = req.userId;

        try {
            await prisma.participation.create({
                data: { userId, eventId }
            });
            res.status(200).json({ message: 'Inscrição confirmada!' });
        } catch (error) {
            // Se der erro P2002, é pq já participa
            if (error.code === 'P2002') {
                return res.status(400).json({ error: 'Você já está participando deste evento.' });
            }
            res.status(500).json({ error: 'Erro ao participar.' });
        }
    }

    // Listar eventos que o usuário participa (Para o Perfil)
    static async myParticipations(req, res) {
        const userId = req.userId;
        try {
            const participations = await prisma.participation.findMany({
                where: { userId },
                include: { event: true } // Traz os dados do evento junto
            });
            
            // Limpa o retorno para enviar só a lista de eventos
            const events = participations.map(p => p.event);
            res.json(events);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar inscrições.' });
        }
    }
}


module.exports = GalleryController;