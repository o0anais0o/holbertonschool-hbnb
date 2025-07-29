// Ce fichier gère :
// - getCookie(name) Obtenir un cookie par son nom 
// - checkAuthStatus() Vérifie si l'utilisateur est authentifié via un token
// - checkAuthentication() Vérifie si l'utilisateur est authentifié
// - fetchPlaces() Récupère les places depuis l'API
// - displayPlaces(places) Affiche les places dans le DOM
// - applyPriceFilter(event) Applique un filtre de prix aux places
// - setupPriceFilter() Configure le filtre de prix
// - loginUser(email, password) Gère la connexion de l'utilisateur
// - logoutUser() Gère la déconnexion de l'utilisateur
// - Initialisation du script une fois le DOM chargé

let allPlaces = []; // variable globale pour stocker toutes les places récupérées

//-------------------------------------------------------
// Fonction utilitaire pour obtenir un cookie par son nom
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

//-------------------------------------------------------
// Fonction pour vérifier le statut d'authentification de l'utilisateur
async function checkAuthStatus() {
  try {
    const response = await fetch('http://localhost:5000/api/v1/auth/status', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'    // Envoie automatiquement les cookies (notamment le JWT cookie)
    });
    return response.ok;
  } catch (error) {
    console.error('Erreur vérification auth:', error);
    return false;
  }
}

//-------------------------------------------------------
// Affiche ou masque le lien "Se connecter" selon la présence du token
function checkAuthentication() {
  const token = getCookie('token');
  const loginLink = document.getElementById('login-link');
  if (!loginLink) return;

  if (!token) {
    loginLink.style.display = 'block';
  } else {
    loginLink.style.display = 'none';
  }
}

//-------------------------------------------------------
// Fonction pour afficher les places dans le DOM / Backend
async function fetchPlaces() {
  // Sélectionne le conteneur où afficher les places
  const placesContainer = document.getElementById('places-container') || document.getElementById('places-list');

  if (!placesContainer) {
    console.error('Element #places-container ou #places-list not found in DOM!');
    return;
  }

  console.log('Chargement des places ...');

  const token = getCookie('token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch('http://0.0.0.0:5000/api/v1/places', {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) throw new Error(`Erreur API: ${response.status}`);

    const data = await response.json();

    // Affiche les places dans le conteneur trouvé
    displayPlaces(data);
  } catch (err) {
    console.error('Erreur lors du chargement des places:', err);
    placesContainer.innerHTML = '<p>Impossible de charger les places.</p>';
  }
}

//-------------------------------------------------------
// Fonction pour afficher les places dans le DOM
function displayPlaces(places) {
  const placesList = document.getElementById('places-list') || document.getElementById('places-container');
  if (!placesList) {
    console.warn('Container des places non trouvé');
    return;
  }

  placesList.innerHTML = '';

  places.forEach(place => {
    const placeDiv = document.createElement('div');
    placeDiv.className = 'place-card';
    placeDiv.setAttribute('data-price', place.price_by_night || 0);

    placeDiv.innerHTML = `
      <h3>${place.name}</h3>
      <p>${place.description || ''}</p>
      <p><strong>Prix :</strong> ${place.price_by_night} €</p>
      <p><strong>Ville :</strong> ${place.city && place.city.name ? place.city.name : ''}</p>
    `;

    placesList.appendChild(placeDiv);
  });
}

//-------------------------------------------------------
// Applique un filtre de prix aux places
function applyPriceFilter(event) {
  const maxPrice = event.target.value;
  const placeCards = document.querySelectorAll('.place-card');
  placeCards.forEach(card => {
    const price = parseInt(card.dataset.price, 10);
    if (maxPrice === 'all' || price <= maxPrice) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
}

//-------------------------------------------------------
  // Setup du filtre prix
function setupPriceFilter() {
  const priceFilter = document.getElementById('price-filter');
  if (priceFilter) {
    priceFilter.addEventListener('change', applyPriceFilter);
  }
}

//-------------------------------------------------------
// Fonction appelant loadPlaces après login réussi
async function loginUser(email, password) {
  const response = await fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    credentials: 'include',  // Très important pour cookie HttpOnly
    body: JSON.stringify({email, password})
  });

  if (!response.ok) {
    // Tu peux récupérer un message d'erreur plus précis comme avant, si tu veux
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.error || `Erreur login: statut ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();
  console.log('Login response data:', data);

  if (data.login !== true) {
    throw new Error('Connexion refusée');
  }

  // Pas besoin de token ici, il est géré automatiquement dans le cookie HttpOnly

  return true;
}

// Fonction pour se déconnecter
async function logoutUser() {
  // Appelle ton endpoint backend /logout pour supprimer le cookie côté serveur
  const response = await fetch('http://localhost:5000/api/v1/auth/logout', {
    method: 'POST',
    credentials: 'include' // IMPORTANT pour envoyer le cookie access_token_cookie
  });

  if (!response.ok) {
    alert('Erreur lors de la déconnexion');
    return false;
  }
  return true;
}

//-------------------------------------------------------
// --- Code d'initialisation et écouteurs d'événements ---

document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM fully loaded and parsed');

  // Sélection des éléments du DOM
  const loginBtn = document.getElementById('loginBtn');      // lien/bouton connexion
  const logoutBtn = document.getElementById('logoutBtn');    // lien/bouton déconnexion
  const loginSection = document.getElementById('login-section'); // modale/formulaire de connexion
  const loginForm = document.getElementById('login-form');
  const closeBtn = document.getElementById('close-login-form');
  const priceFilter = document.getElementById('price-filter');
  const placesContainer = document.getElementById('places-container') || document.getElementById('places-list');

  // Vérifie statut authentification
  const isAuthenticated = await checkAuthStatus();

  // Affichage boutons login/logout & modale/formulaire
  if (isAuthenticated) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'block';
    if (loginSection) loginSection.style.display = 'none'; // cache la modale si besoin
  } else {
    if (loginBtn) loginBtn.style.display = 'block';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (loginSection) loginSection.style.display = 'none';
  }

  // Gestion ouverture modale login
  if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (loginSection) loginSection.style.display = 'flex';
    });
  }

  // Gestion fermeture modale (croix)
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (loginSection) loginSection.style.display = 'none';
    });
  }

  // Fermeture modale au clic sur overlay (en dehors du form)
  if (loginSection && loginForm) {
    loginSection.addEventListener('click', (e) => {
      if (!loginForm.contains(e.target)) {
        loginSection.style.display = 'none';
      }
    });
  }

  // Listener Déconnexion
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await logoutUser();
      // Rafraîchit l'affichage login/logout sans redirection
      if (loginBtn) loginBtn.style.display = 'block';
      if (logoutBtn) logoutBtn.style.display = 'none';
    });
  }

  // Listener formulaire login
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = loginForm.querySelector('input[name="email"]').value;
      const password = loginForm.querySelector('input[name="password"]').value;
      const errorMsg = document.getElementById('login-error');
      try {
        const success = await loginUser(email, password);
        if (success) {
          // Mets à jour l'affichage login/logout
          if (loginBtn) loginBtn.style.display = 'none';
          if (logoutBtn) logoutBtn.style.display = 'block';
          if (loginSection) loginSection.style.display = 'none';
        }
      } catch (err) {
        if (errorMsg) {
          errorMsg.innerText = err.message;
        } else {
          console.error(err.message);
          alert(err.message);
        }
      }
    });
  }

  // ➜ Toujours charger les places sur la page d'accueil pour tout le monde
  if (placesContainer) {
    fetchPlaces(); // ou loadPlaces(), selon ton code réel
  } else {
    console.warn('Element places container not found!');
  }

  // ➜ Toujours activer le filtre prix pour tout le monde
  if (priceFilter) {
    setupPriceFilter();
  } else {
    console.warn('Element price-filter not found!');
  }

  // Vérification présence des éléments critiques (tu peux garder ce bloc pour debug)
  if (!loginBtn || !logoutBtn || !loginSection || !closeBtn) {
    console.error('Un ou plusieurs éléments login/logout ou modale sont manquants');
    // (Évite d'utiliser loginLink si tu ne l'as plus dans l'HTML)
    // return; // à mettre seulement si tu veux stopper l'exécution
  }

});
