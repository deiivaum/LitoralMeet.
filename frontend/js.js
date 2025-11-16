// frontend/app.js

// O PORQUÊ: Isso garante que o script só rode DEPOIS
// que o HTML (os botões e forms) já carregou.
document.addEventListener('DOMContentLoaded', () => {

    // 1. "Pegar" os elementos do HTML
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const resultado = document.getElementById('resultado'); // A caixa de resposta

    // --- LÓGICA DO CADASTRO ---
    registerForm.addEventListener('submit', async (e) => {
        // Impede o formulário de recarregar a página
        e.preventDefault(); 

        // Pega os valores dos campos de cadastro
        const nome = document.getElementById('register-nome').value;
        const email = document.getElementById('register-email').value;
        const senha = document.getElementById('register-senha').value;

        // O "link" com o backend
        try {
            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nome, email, senha }) 
            });

            const data = await response.json(); // Pega a resposta (JSON)
            resultado.textContent = JSON.stringify(data, null, 2); // Mostra na tela

        } catch (error) {
            resultado.textContent = 'Erro de conexão: ' + error.message;
        }
    });

    // --- LÓGICA DO LOGIN ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Pega os valores dos campos de login
        const email = document.getElementById('login-email').value;
        const senha = document.getElementById('login-senha').value;

        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, senha })
            });

            const data = await response.json();
            resultado.textContent = JSON.stringify(data, null, 2);

            // (NÃO vamos salvar o token, para manter simples)

        } catch (error) {
            resultado.textContent = 'Erro de conexão: ' + error.message;
        }
    });
});