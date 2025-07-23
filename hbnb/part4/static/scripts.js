document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorSpan = document.getElementById('login-error');

    // 1. Avertissement si éléments importants manquent
    if (!loginForm) console.warn('Warning: formulaire login introuvable (id="login-form").');
    if (!errorSpan) console.warn('Warning: span d’erreur login introuvable (id="login-error").');

    // 2. Fonction helper pour afficher les erreurs
    function displayError(message) {
        if (errorSpan) {
            errorSpan.textContent = message;
        } else {
            alert(message);
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            // Récupérer les valeurs depuis le formulaire
            const email = document.querySelector('[name="email"]').value;
            const password = document.querySelector('[name="password"]').value;

            // Nettoyer le message d'erreur
            displayError(''); // vide

            try {
                const response = await fetch('http://127.0.0.1:5000/api/v1/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({email, password}),
                    credentials: 'include'  // important pour cookies HttpOnly
                });

                if (response.ok) {
                    const data = await response.json();
                    // Token stocké en cookie HttpOnly côté backend donc pas besoin ici.

                    console.log('Connexion réussie, token stocké.');
                    window.location.href = 'index.html';
                } else {
                    const errorData = await response.json();
                    displayError(errorData.error || 'Erreur de connexion.');
                }
            } catch (err) {
                displayError("Impossible de contacter le serveur.");
            }
        });
    }

    // Fonction logout améliorée
    async function logout() {
        try {
            const response = await fetch('http://127.0.0.1:5000/api/v1/auth/logout', {
                method: 'POST',
                credentials: 'include',  // envoyer cookies
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                window.location.href = 'login.html';
            } else {
                alert('Erreur lors de la déconnexion. Veuillez réessayer.');
            }
        } catch (error) {
            alert('Erreur réseau lors de la déconnexion. Vérifiez votre connexion.');
            console.error('Erreur réseau lors de la déconnexion:', error);
        }
    }

    // Attacher logout au bouton si présent
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});
