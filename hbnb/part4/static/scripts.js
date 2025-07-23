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
                const response = await fetch('http://127.0.0.1:5000/api/v1/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({email, password}),
                    credentials: 'include'  // <- important pour cookies
                });

                if (response.ok) {
                    const data = await response.json();

                    // Si on stockes le token côté backend HttpOnly, on n'as pas besoin de le stocker ici en JS
                    // Sinon, utiliser token côté JS, stocke ici
                    // Ici on suppose que le token est stocké dans cookie HttpOnly, donc on peut commenter ou supprimer la ligne suivante :
                    // document.cookie = `token=${data.access_token}; path=/; SameSite=Strict;`;

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

    // Fonction logout
    async function logout() {
        try {
            const response = await fetch('http://127.0.0.1:5000/api/v1/auth/logout', {
                method: 'POST',
                credentials: 'include',  // très important pour envoyer les cookies
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                // Rediriger vers la page de login
                window.location.href = 'login.html';
            } else {
                console.error('Erreur lors de la déconnexion');
            }
        } catch (error) {
            console.error('Erreur réseau lors de la déconnexion:', error);
        }
    }

    // Attachement au bouton logout si présent
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

  // Vérifie si utilisateur connecté via /auth/status
  // Ceci contrôle l’affichage du bouton logout et évite l’accès index si non connecté
  (async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/v1/auth/status', {
        method: 'GET',
        credentials: 'include'  // Envoi obligatoire du cookie JWT HttpOnly
      });

      if (response.ok) {
        // Connecté : affiche bouton déconnexion
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
      } else {
        // Non connecté : redirige vers login
        if (window.location.pathname.endsWith('index.html')) {
          window.location.href = 'login.html';
        }
      }
    } catch (err) {
      console.error('Erreur lors de la vérification du statut login:', err);
      // En cas d’erreur réseau, on part aussi sur login.html
      if (window.location.pathname.endsWith('index.html')) {
        window.location.href = 'login.html';
      }
    }
  })();
});
