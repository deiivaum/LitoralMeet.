const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/userModel');

const JWT_SECRET = 'chave-secretad';

class AuthController {

    // Registra um novo usuário
    static async register(req, res){
        try{
            const {nome, email, senha, cpf}  = req.body;
            if (!nome || !email || !senha || !cpf){
                return res.status(400).json({error: 'Todos os campos sao obrigatorios'});
            }

            const salt = bcrypt.genSaltSync(10);
            const senhaHash = bcrypt.hashSync(senha, salt);

            const novoUsario = await User.criar(nome, email, senhaHash, cpf);

            res.status(201).json({
                id: novoUsario.id,
                nome: novoUsario.nome,
                email: novoUsario.email,
                cpf: novoUsario.cpf,
            });
        } catch(error){
            res.status(500).json({error: 'Erro ao registrar novo usuario'});
        }
    }

    // Realiza login e gera um token JWT
    static async login(req, res){
        try { 
            const {email, senha} = req.body;
            const usario =  await User.findByEmail(email);

            if(!usario){
                return res.status(401).json({error: 'Credenciais Invalidas'});
            }

            const isPasswordValid = bcrypt.compareSync(senha, usario.senha);
            if(!isPasswordValid){
                return res.status(401).json({error: 'Credenciais invalidas'});
            }
            
            const token = jwt.sign(
                { id: usario.id, email: usario.email, nome: usario.nome },
                JWT_SECRET,
                {expiresIn: '1h'}
            );     
            
            res.status(200).json({
                message: 'Login bem-sucedido!',
                token: token
            });
                
        } catch(error){
            res.status(500).json({error: 'Erro ao fazer login'});
        }
    }

    // Atualiza dados do perfil do usuário
    static async attPerfil(req, res){
        const userId = parseInt(req.params.id); 
        const { nome, email, senha, cpf } = req.body;

        try {
            const usuarioExistente = await User.findById(userId);
            if (!usuarioExistente) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }

            const dadosToAtt = {};
            if (nome) dadosToAtt.nome = nome;
            if (email) dadosToAtt.email = email;
            if (cpf) dadosToAtt.cpf = cpf;

            if (senha) {
                const salt = bcrypt.genSaltSync(10);
                dadosToAtt.senha = bcrypt.hashSync(senha, salt); 
            }

            if (Object.keys(dadosToAtt).length === 0) {
                return res.status(400).json({ error: 'Nenhum dado válido para atualização fornecido.' });
            }
            
            const usuarioAtualizado = await User.atualizar(userId, dadosToAtt);
            
            return res.status(200).json({ 
                message: 'Perfil atualizado com sucesso!',
                user: { 
                    id: usuarioAtualizado.id,
                    email: usuarioAtualizado.email, 
                    nome: usuarioAtualizado.nome,
                    cpf: usuarioAtualizado.cpf
                } 
            });
            
        } catch(error){
            return res.status(500).json({ error: 'Erro interno ao atualizar perfil.' });
        }
    }

    // Apaga o perfil do usuário
    static async apagarPerfil(req, res) {
        const userId = parseInt(req.params.id); 

        try {
            const usuarioExistente = await User.findById(userId);

            if (!usuarioExistente) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }

            await User.apagar(userId);
            
            return res.status(200).json({ message: 'Perfil apagado com sucesso.' });

        } catch (error) {
            return res.status(500).json({ error: 'Erro interno ao apagar perfil.' });
        }
    }

    // Cria ou atualiza a avaliação do usuário
    static async createRating(req, res) {
        const userId = req.userId; 
        const { rating } = req.body; 

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Valor de avaliação inválido (deve ser entre 1 e 5).' });
        }

        try {
            const existingRating = await User.getRatingByUserId(userId); 
            
            if (existingRating) {
                const updatedRating = await User.attAvalia(userId, rating); 
                return res.status(200).json({ message: 'Avaliação atualizada com sucesso.', rating: updatedRating });
            } else {
                const newRating = await User.createRating(userId, rating); 
                return res.status(201).json({ message: 'Avaliação registrada com sucesso.', rating: newRating });
            }
        } catch (error) {
            if (error.code === 'P2002') {
                return res.status(409).json({ error: 'Você já enviou uma avaliação.' });
            }
            return res.status(500).json({ error: 'Erro interno ao processar a avaliação.' });
        }
    }
}

module.exports = AuthController;
