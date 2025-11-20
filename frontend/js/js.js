document.addEventListener('DOMContentLoaded', () => {

    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const resultado = document.getElementById('resultado'); 


    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 
 
            
            const nome = document.getElementById('register-nome').value;
            const email = document.getElementById('register-email').value;
            const senha = document.getElementById('register-senha').value;
            const cpf = document.getElementById('register-cpf').value;

            try {
                const response = await fetch('http://localhost:3000/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome, email, senha, cpf }) 
                });

                const data = await response.json(); 
                resultado.textContent = JSON.stringify(data, null, 2); 

            } catch (error) {
                resultado.textContent = 'Erro de conexão: ' + error.message;
            }
        });
    }

    if (loginForm) { 
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            


            const email = document.getElementById('login-email').value;
            const senha = document.getElementById('login-senha').value;

            try {
                const response = await fetch('http://localhost:3000/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, senha })
                });

                const data = await response.json(); 

                if (response.status === 200) {
                    if (data.token) {
                        localStorage.setItem('jwtToken', data.token);
                    }
                    resultado.textContent = 'Login bem-sucedido! Redirecionando...';
                    window.location.href = 'index.html'; 
                    return;

                } else {
                    resultado.textContent = `Login falhou: ${data.error || 'Credenciais Inválidas'}`;
                }

            } catch (error) {
                resultado.textContent = 'Erro de conexão ou erro de resposta do servidor: ' + error.message;
            }
        });
    }
});