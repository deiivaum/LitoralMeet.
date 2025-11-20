const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/userModel');

const JWT_SECRET = 'chave-secretad';

class AuthController {

    static async register(req, res){
        try{
            const {nome, email, senha, cpf}  = req.body;
            if (!nome || !email || !senha || !cpf){
                return res.status(400).json({error: 'Todos os campos sao obrigatorios'});
            }
            const salt = bcrypt.genSaltSync(10);
            const senhaHash = bcrypt.hashSync(senha, 10);

            const novoUsario = await User.criar(nome, email, senhaHash, cpf);

            res.status(201).json({
                id: novoUsario.id,
                nome: novoUsario.nome,
                email: novoUsario.email,
                cpf: novoUsario.cpf,
            });
        }catch(error){
            res.status(500).json({error: 'Erro ao registrar novo usario '});
        }
        }



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
                { id: usario.id, email: usario.email}, JWT_SECRET, {expiresIn: '1h'}
                );     
            
            res.status(200).json({
                message: 'Login bem-sucedido!',
                token: token
            });
                
            }catch(error){
                res.status(500).json({error: 'Erro ao fazer login'});
            }
        }
    }

module.exports = AuthController;
    