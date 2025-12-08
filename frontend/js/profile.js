const API_BASE = 'http://localhost:3000/api';

function getToken() {
    return localStorage.getItem('token');
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log("Script profile.js carregado.");
    
    const token = getToken();
    
    //VERIFICAÇÃO DE SEGURANÇA
    if (!token) {
        alert("Você precisa estar logado.");
        window.location.href = '/login.html';
        return;
    }

    //CARREGAR DADOS

    try {
        const response = await fetch(`${API_BASE}/users/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, // Envia o token
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
           
            if(document.getElementById('nome')) document.getElementById('nome').value = data.nome || '';
            if(document.getElementById('email')) document.getElementById('email').value = data.email || '';
            if(document.getElementById('cpf')) document.getElementById('cpf').value = data.cpf || '';
        } else {
            console.warn("Erro ao buscar dados (pode ser token expirado)");
        }
    } catch (error) {
        console.error("Erro de conexão (GET):", error);
    }
});

//ATUALIZAR DADOS
const form = document.getElementById('profile-form');

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log("Botão Salvar clicado...");

        const token = getToken();
        const nome = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;

        const payload = { nome, email };
    
        if (senha) {
            payload.senha = senha;
        }

        try {
            const response = await fetch(`${API_BASE}/users/me`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            const result = await response.json();

            if (response.ok) {
                alert("Perfil atualizado com sucesso!");
                document.getElementById('senha').value = '';
            } else {
                alert("Erro ao atualizar: " + (result.error || "Tente novamente."));
            }

        } catch (error) {
            console.error("Erro no PUT:", error);
            alert("Erro de conexão com o servidor.");
        }
    });
}

//DELETE
const deleteBtn = document.getElementById('btn-delete-account');

if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
        if (!confirm("Tem certeza? Essa ação não tem volta!")) return;

        const token = getToken();
        try {
            const response = await fetch(`${API_BASE}/users/me`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                alert("Conta excluída.");
                localStorage.removeItem('token');
                window.location.href = '/login.html';
            } else {
                const result = await response.json();
                alert("Erro: " + (result.error || "Falha ao excluir"));
            }
        } catch (error) {
            console.error(error);
            alert("Erro de conexão ao excluir.");
        }
    });
}