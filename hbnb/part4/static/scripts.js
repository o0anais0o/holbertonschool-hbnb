// Ce fichier gère :
// - getCookie(name) Obtenir un cookie par son nom 
// - checkAuthStatus() Vérifie si l'utilisateur est authentifié via un token
// - checkAuthentication() Vérifie si l'utilisateur est authentifié
// - fetchPlaces() Récupère les places depuis l'API
// - displayPlaces(places) Affiche les places dans le DOM
// - applyPriceFilter(event) Applique un filtre de prix aux places
// - setupPriceFilter() Configure le filtre de prix
// - loginUser(email, password) Gère la connexion de l'utilisateur
// - applyPriceFilter() Applique un filtre de prix aux places
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
  } catch {
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
  try {
    const response = await fetch('http://localhost:5000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      // Essaye de récupérer un message d'erreur utile
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.msg || `Erreur login: statut ${response.status}`;
      throw new Error(message);
    }

    const data = await response.json();
    console.log('Login response data:', data);

    if (!data.access_token) {
      throw new Error('Pas de token dans la réponse');
    }

    // Stocker le token dans un cookie (path=/ pour être accessible partout)
    // Ajout de max-age=86400 (1 jour) et SameSite=Lax pour meilleure sécurité
    document.cookie = `token=${data.access_token}; path=/; max-age=86400; SameSite=Lax`;

    console.log('Login réussi, token stocké en cookie');

    // Retourne true pour indiquer succès
    return true;

  } catch (error) {
    console.error('Erreur loginUser:', error);
    // Propage l'erreur pour gestion dans l'appelant
    throw error;
  }
}

//-------------------------------------------------------
// --- Code d'initialisation et écouteurs d'événements --- 

document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM fully loaded and parsed');

  const loginForm = document.getElementById('login-form');
  const loginSection = document.getElementById('login-section');
  const loginLink = document.getElementById('login-link');
  const priceFilter = document.getElementById('price-filter');
  const placesContainer = document.getElementById('places-container') || document.getElementById('places-list');
  const closeBtn = document.getElementById('close-login-form'); // Bouton pour fermer le formulaire de connexion

  // Vérifie status auth (remplace checkLoginStatus)
  const isAuthenticated = await checkAuthStatus();

  if (isAuthenticated) {
    checkAuthentication(); // cache bouton login
    if (loginSection) loginSection.style.display = 'none';

    // Charge les places si conteneur existe
    if (placesContainer) {
      fetchPlaces(); // ou loadPlaces selon ton nom de fonction
    } else {
      console.warn('Element places container not found!');
    }
    // Active le filtre prix
    if (priceFilter) {
      setupPriceFilter();
    } else {
      console.warn('Element price-filter not found!');
    }
  } else {
    // Pas connecté : afficher bouton login et masquer/afficher formulaire selon besoin
    if (loginLink) loginLink.style.display = 'block';
    if (loginSection) loginSection.style.display = 'none';
  }

  if (!loginLink || !loginSection || !closeBtn) {
    console.error('Un ou plusieurs éléments pour le modal login sont manquants');
    return;
  }

  // Au départ : cacher la modale explicitement
  loginSection.style.display = 'none';

  loginLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginSection.style.display = 'flex'; // affiche modal
  });

  closeBtn.addEventListener('click', () => {
    loginSection.style.display = 'none'; // ferme modal
  });

  loginSection.addEventListener('click', (e) => {
    if (e.target === loginSection) { // clique sur overlay
      loginSection.style.display = 'none';
    }
  });

  // Listener soumission formulaire login
  if (loginForm) {
    loginForm.addEventListener('submit', async e => {
      e.preventDefault();
      const email = loginForm.querySelector('input[name="email"]').value;
      const password = loginForm.querySelector('input[name="password"]').value;
      const errorMsg = document.getElementById('login-error');

  try {
    const success = await loginUser(email, password);
    if (success) {
      window.location.href = 'index.html';
    }
  } catch (err) {
    if (errorMsg) {
      errorMsg.innerText = err.message;
    } else {
      console.error(err.message);
      alert(err.message); // ou un alert pour informer l’utilisateur
        }
      }
    });
  }
});
