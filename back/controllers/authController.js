const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'chave-secretad'; 

class AuthController {
//cadastro
    static async register(req, res) {
        try {
            const { nome, email, senha, cpf } = req.body;
            if (!nome || !email || !senha || !cpf) {
                return res.status(400).json({ error: 'Todos os campos sao obrigatorios' });
            }
            const salt = bcrypt.genSaltSync(10);
            const senhaHash = bcrypt.hashSync(senha, salt);
            const novoUsario = await User.criar(nome, email, senhaHash, cpf);
            res.status(201).json(novoUsario);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao registrar' });
        }
    }
//login
    static async login(req, res){

        try { 
            const {email, senha} = req.body;
            const usario = await User.findByEmail(email);
            if(!usario) return res.status(401).json({error: 'Credenciais Invalidas'});
            
            const isPasswordValid = bcrypt.compareSync(senha, usario.senha);
            if(!isPasswordValid) return res.status(401).json({error: 'Credenciais invalidas'});
            
            const token = jwt.sign(
                { id: usario.id, email: usario.email, nome: usario.nome, role: usario.role || 'user' },
                JWT_SECRET,
                {expiresIn: '1h'}
            );     
            
            res.status(200).json({ message: 'Login sucesso', token });
        } catch(error){
            res.status(500).json({error: 'Erro login'});
        }
    }

//busca dados do usua
    static async getPerfil(req, res) {
        const userId = req.userId; 
        try {
            const usuario = await User.findById(userId);
            if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' });

            // Retorna os dados para o Front
            res.status(200).json({
                nome: usuario.nome,
                email: usuario.email,
                cpf: usuario.cpf
            });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar perfil' });
        }
    }

 //editar perfil
    static async attPerfil(req, res) {
        const userId = req.userId;
        const { nome, email, senha } = req.body;

        try {
            const dadosToAtt = {};
            if (nome) dadosToAtt.nome = nome;
            if (email) dadosToAtt.email = email;
            if (senha) {
                const salt = bcrypt.genSaltSync(10);
                dadosToAtt.senha = bcrypt.hashSync(senha, salt);
            }

            await User.atualizar(userId, dadosToAtt);
            res.status(200).json({ message: 'Perfil atualizado!' });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao atualizar' });
        }
    }

//apagar perfil
    static async apagarPerfil(req, res) {
        const userId = req.userId; 

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
}

module.exports = AuthController;