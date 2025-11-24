// Verifica o token JWT no navegador e retorna os dados do usuário
function checkLoginStatus() {
    const token = localStorage.getItem('jwtToken');
    if (!token) return null;

    try {
        const payloadBase64 = token.split('.')[1];
        const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
        const decodedPayload = JSON.parse(atob(base64));
        
        const expirationTime = decodedPayload.exp * 1000;
        if (Date.now() > expirationTime) {
            localStorage.removeItem('jwtToken');
            return null;
        }

        return decodedPayload;
    } catch {
        console.error("Token malformado ou inválido.");
        localStorage.removeItem('jwtToken');
        return null;
    }
}

document.addEventListener('DOMContentLoaded', () => {

    const userData = checkLoginStatus();
    const isLoggedIn = !!userData;
    
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const resultado = document.getElementById('resultado');

    const profileContainer = document.querySelector('.profile-container');
    const loggedInState = document.querySelector('.logged-in-state');
    const loggedOutState = document.querySelector('.logged-out-state');
    const profileButton = document.querySelector('.profile-btn');
    const dropdownContent = document.querySelector('.dropdown-content');
    
    const userNameElement = document.querySelector('.user-info span'); 
    
    const ratingContainer = document.getElementById('star-rating');
    const submitButton = document.getElementById('submit-rating');
    const token = localStorage.getItem('jwtToken');

    let selectedRating = 0;

    if (token) {
        if (submitButton) submitButton.disabled = false;

        if (ratingContainer) {
            ratingContainer.addEventListener('click', (e) => {
                const star = e.target.closest('i.fa-star');
                if (!star || !star.dataset.rating) return;

                selectedRating = parseInt(star.dataset.rating);

                document.querySelectorAll('.stars i').forEach(s => {
                    if (parseInt(s.dataset.rating) <= selectedRating) {
                        s.classList.remove('far');
                        s.classList.add('fas');
                    } else {
                        s.classList.remove('fas');
                        s.classList.add('far');
                    }
                });
            });

            ratingContainer.addEventListener('mouseover', (e) => {
                const hoverStar = e.target.closest('i[data-rating]');
                if (!hoverStar) return;
                const hoverRating = parseInt(hoverStar.dataset.rating);

                document.querySelectorAll('.stars i').forEach(s => {
                    if (parseInt(s.dataset.rating) <= hoverRating) {
                        s.style.color = 'gold';
                    } else if (parseInt(s.dataset.rating) > selectedRating) {
                        s.style.color = '#fff';
                    }
                });
            });

            ratingContainer.addEventListener('mouseout', () => {
                document.querySelectorAll('.stars i').forEach(s => {
                    const starRating = parseInt(s.dataset.rating);
                    s.style.color = (starRating <= selectedRating) ? 'gold' : '#ccc';
                });
            });
        }

        if (submitButton) {
            submitButton.addEventListener('click', async () => {
                if (selectedRating === 0) {
                    alert('Por favor, selecione uma avaliação.');
                    return;
                }

                try {
                    const response = await fetch('http://localhost:3000/api/auth/rate', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ rating: selectedRating })
                    });

                    if (response.ok) {
                        alert('Avaliação enviada com sucesso!');
                    } else if (response.status === 401) {
                        alert('Sessão expirada. Faça login novamente.');
                    } else {
                        const data = await response.json();
                        alert(`Erro ao enviar avaliação: ${data.error}`);
                    }
                } catch {
                    alert('Erro de conexão com o servidor.');
                }
            });
        }

    } else {
        const message = document.createElement('p');
        message.textContent = 'Faça login para poder avaliar.';
        if (ratingContainer) ratingContainer.insertAdjacentElement('beforebegin', message);
    }

    if (isLoggedIn) {
        if (loggedInState) loggedInState.style.display = 'block';
        if (loggedOutState) loggedOutState.style.display = 'none';

        if (userNameElement && userData.nome) userNameElement.textContent = userData.nome;

        if (submitButton) submitButton.disabled = false;

        if (ratingContainer) {
            ratingContainer.addEventListener('click', (e) => {
                const star = e.target.closest('i[data-rating]');
                if (!star) return;

                selectedRating = parseInt(star.dataset.rating);

                document.querySelectorAll('.stars i').forEach(s => {
                    if (parseInt(s.dataset.rating) <= selectedRating) {
                        s.classList.remove('far');
                        s.classList.add('fas');
                    } else {
                        s.classList.remove('fas');
                        s.classList.add('far');
                    }
                });
            });
        }

        if (submitButton) {
            submitButton.addEventListener('click', async () => {});
        }

    } else {
        if (loggedInState) loggedInState.style.display = 'none';
        if (loggedOutState) loggedOutState.style.display = 'flex';

        const message = document.createElement('p');
        message.textContent = 'Faça login para poder avaliar.';
        if (ratingContainer) {
            ratingContainer.insertAdjacentElement('beforebegin', message);
            submitButton.disabled = true;
        }
    }

    if (profileButton && dropdownContent) {
        profileButton.addEventListener('click', () => {
            dropdownContent.classList.toggle('show');
        });

        document.addEventListener('click', (event) => {
            if (!profileContainer.contains(event.target) && dropdownContent.classList.contains('show')) {
                dropdownContent.classList.remove('show');
            }
        });
    }

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
                    if (data.token) localStorage.setItem('jwtToken', data.token);

                    resultado.textContent = 'Login bem-sucedido! Redirecionando...';
                    window.location.href = 'index.html';
                    return;
                }

                resultado.textContent = `Login falhou: ${data.error || 'Credenciais Inválidas'}`;

            } catch (error) {
                resultado.textContent = 'Erro: ' + error.message;
            }
        });
    }
});

// Remove o token do usuário e recarrega a página
function handleLogoff() {
    localStorage.removeItem('jwtToken');
    window.location.href = 'index.html';
}

// Apaga a conta do usuário no servidor
async function apagaConta() {
    const userData = checkLoginStatus();
    
    if (!userData || !userData.id) {
        alert("Erro: Não foi possível identificar o usuário.");
        return;
    }
    
    const confirmDelete = confirm("Tem certeza que deseja apagar sua conta?");
    if (!confirmDelete) return;

    try {
        const response = await fetch(`http://localhost:3000/api/auth/perfil/${userData.id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.status === 200) {
            alert("Conta apagada com sucesso!");
            handleLogoff();
        } else {
            const errorData = await response.json();
            alert(`Erro ao apagar conta: ${errorData.error}`);
        }

    } catch (error) {
        console.error(error);
        alert("Erro de conexão ao tentar apagar a conta.");
    }
}
