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
                const response = await fetch('http://localhost:5000/api/v1/auth/login', {
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
            const response = await fetch('http://localhost:5000/api/v1/auth/logout', {
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
      const response = await fetch('http://localhost:5000/api/v1/auth/status', {
        method: 'GET',
        credentials: 'include'  // Envoi obligatoire du cookie JWT HttpOnly
      });
      if (response.ok) {
        // Connecté : affiche bouton déconnexion
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
      } else {
        // Non connecté : redirige vers login
        if (window.location.pathname.endsWith('index.html')) {
          window.location.href = 'login.html';
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut login:', error);
      // En cas d’erreur réseau, on part aussi sur login.html
      if (window.location.pathname.endsWith('index.html')) {
        window.location.href = 'login.html';
      }
    }
  })();
});

// Variable globale pour garder la liste complète des places
let allPlaces = [];

// Fonction pour récupérer et afficher la liste des places depuis l'API
async function loadPlaces() {
  const placesList = document.getElementById('places-list');
  try {
    const response = await fetch('http://localhost:5000/api/v1/places/', {
      method: 'GET',
      credentials: 'include'  // Important pour envoyer cookie de session
    });
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des places');
    }
    const places = await response.json();
    allPlaces = places;
    displayPlaces(allPlaces);
  } catch (error) {
    placesList.innerHTML = `<p>Erreur lors du chargement des logements.</p>`;
    console.error(error);
  }
}

// Fonction pour afficher les places dans le DOM
function displayPlaces(places) {
  const placesList = document.getElementById('places-list');
  placesList.innerHTML = '';

  places.forEach(place => {
    const placeDiv = document.createElement('div');
    placeDiv.className = 'place-item';
    placeDiv.dataset.price = place.price;

    placeDiv.innerHTML = `
      <h3>${place.title}</h3>
      <p>${place.description}</p>
      <p>Lieu : ${place.city_name || ''}</p>
      <p>Propriétaire : ${place.owner.first_name} ${place.owner.last_name}</p>
      <p>Prix : ${place.price}€ / nuit</p>
    `;
    placesList.appendChild(placeDiv);
  });
}

// Gestion du filtre prix côté client
document.addEventListener('DOMContentLoaded', function() {
  // Tout ce code ici s'exécute uniquement quand le DOM est prêt

  // Définition de la fonction setupPriceFilter
  function setupPriceFilter() {
    const priceFilter = document.getElementById('price-filter');
    if (!priceFilter) {
      console.error('Element #price-filter not found in DOM!');
      return;
    }

    priceFilter.addEventListener('change', () => {
      const selectedValue = priceFilter.value;
      const placeElements = document.querySelectorAll('.place-item');
      placeElements.forEach(el => {
        const price = parseFloat(el.dataset.price);
        if (selectedValue === 'All' || price <= parseFloat(selectedValue)) {
          el.style.display = 'block';
        } else {
          el.style.display = 'none';
        }
      });
    });
  }

// Fonction pour gérer le filtre prix
function setupPriceFilter() {
  console.log('setupPriceFilter called');
  const priceFilter = document.getElementById('price-filter');
  if (!priceFilter) {
    console.error('Element #price-filter not found in DOM!');
    return;
  }

  priceFilter.addEventListener('change', () => {
    const selectedValue = priceFilter.value;
    console.log(`Price filter changed to: ${selectedValue}`);

    const placeElements = document.querySelectorAll('.place-item');
    placeElements.forEach(el => {
      const priceAttr = el.dataset.price;
      const price = parseFloat(priceAttr);

      if (isNaN(price)) {
        el.style.display = 'block';
        return;
      }

      if (selectedValue === 'All' || price <= parseFloat(selectedValue)) {
        el.style.display = 'block';
      } else {
        el.style.display = 'none';
      }
    });
  });
}

  // Et charger les places (fonction que tu as dans ton code)
  loadPlaces();

});
