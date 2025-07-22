document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorSpan = document.getElementById('login-error');

    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            // Récupérer les valeurs depuis le formulaire
            const email = document.querySelector('[name="email"]').value;
            const password = document.querySelector('[name="password"]').value;

            // Nettoyer le message d'erreur
            if (errorSpan) errorSpan.textContent = "";

            try {
                // Envoi de la requête POST au endpoint login
                const response = await fetch('http://127.0.0.1:5000/api/v1/auth/login/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email: email, password: password })
                });

                if (response.ok) {
                    const data = await response.json();

                    // Stocke le JWT dans un cookie (sans Secure pour local dev)
                    // Ajout SameSite=Strict pour un peu de sécurité
                    document.cookie = `token=${data.access_token}; path=/; SameSite=Strict;`;

                    console.log('Connexion réussie, token stocké.');

                    // Rediriger vers la page principale
                    window.location.href = 'index.html';
                } else {
                    const errorData = await response.json();
                    if (errorSpan) {
                        errorSpan.textContent = errorData.error || 'Erreur de connexion.';
                    } else {
                        alert(errorData.error || 'Erreur de connexion.');
                    }
                }
            } catch (err) {
                if (errorSpan) {
                    errorSpan.textContent = "Impossible de contacter le serveur.";
                } else {
                    alert("Impossible de contacter le serveur.");
                }
            }
        });
    }
});
