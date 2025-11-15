const usersDB = [];
let currentId = 0;

class Usuario{

    constructor(id, nome, email, senhaHash){
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.senhaHash = senhaHash;
    }

    static criar(nome, email, senhaHash){
        currentId++;
        const novoUsario = new Usuario(currentId, nome, email, senhaHash);

        usersDB.push(novoUsario);
        return novoUsario;
    }

    static findByEmail(email){
        return usersDB.find(user => user.email == email);
    }

    static findAll(){
        return usersDB;
    }
}

module.exports = Usuario;