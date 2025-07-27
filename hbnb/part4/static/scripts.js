// Ce fichier gère :
// - getCookie(name) Obtenir un cookie par son nom 
// - checkAuthStatus() Vérifie si l'utilisateur est authentifié via un token
// - checkAuthentication() Vérifie si l'utilisateur est authentifié
// - fetchPlaces() Récupère les places depuis l'API
// - displayPlaces(places) Affiche les places dans le DOM
// - showLoginLink() Affiche un lien vers la page de connexion si l'utilisateur n'est pas connecté
// - applyPriceFilter(event) Applique un filtre de prix aux places
// - setupPriceFilter() Configure le filtre de prix
// - loadPlaces() Charge les places depuis l'API
// - checkLoginStatus() Vérifie le statut de connexion de l'utilisateur
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
  const token = getCookie('token');
  if (!token) return false;  // Pas de token = pas connecté

  try {
    const response = await fetch('http://localhost:5000/api/v1/auth/status', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'  // si nécessaire pour envoyer les cookies
    });
    return response.ok;
  } catch (error) {
    console.error('Erreur vérification auth:', error);
    return false;
  }
}

//-------------------------------------------------------
// Fonction pour vérifier si l'utilisateur est authentifié
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
// Fonction pour afficher les places dans le DOM
async function fetchPlaces() {
  const token = getCookie('token');
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const response = await fetch('http://0.0.0.0:5000/api/v1/places', {
      method: 'GET',
      headers: headers
    });

    if (!response.ok) throw new Error('Erreur API');

    const data = await response.json();
    allPlaces = data;           // stocke globalement pour filtre
    displayPlaces(data);
  } catch (err) {
    const placesList = document.getElementById('places-list');
    if (placesList) placesList.innerHTML = '<p>Impossible de charger les places.</p>';
    console.error('fetchPlaces error:', err);
  }
}

//-------------------------------------------------------
// Fonction pour afficher les places dans le DOM
function displayPlaces(places) {
  let placesList = document.getElementById('places-list');
  if (!placesList) {
    placesList = document.getElementById('places-container'); // fallback optionnel
  }
  if (!placesList) return; // aucun conteneur trouvé, on stop

  placesList.innerHTML = '';
  places.forEach(place => {
    const placeDiv = document.createElement('div');
    placeDiv.className = 'place-card';
    placeDiv.setAttribute('data-price', place.price_by_night || 0);
    placeDiv.innerHTML = `
      <h3>${place.name}</h3>
      <p>${place.description || ''}</p>
      <p><strong>Prix :</strong> ${place.price_by_night} €</p>
      <p><strong>Ville :</strong> ${place.city && place.city.name ? place.city.name : ''}</p>
    `;
    placesList.appendChild(placeDiv);
  });
}

//-------------------------------------------------------
// Affiche un lien vers la page login si utilisateur non connecté
// (fonction ajoutée pour éviter l'erreur showLoginLink undefined)
function showLoginLink() {
  console.log('showLoginLink appelée');
  // Ici on peux afficher un bouton ou un lien login dans ton UI
  // Par exemple, rendre visible un élément caché `#login-link`
  const loginLink = document.getElementById('login-link');
  if (loginLink) loginLink.style.display = 'block';
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
//Fonction de chargement des places (exemple)
async function loadPlaces() {
  const placesContainer = document.getElementById('places-container');
  if (!placesContainer) {
    console.error('Element #places-container not found in DOM!');
    return;
  }
  // Exemple fetch des places depuis API
  console.log('Chargement des places ...');
  // Ta logique ici ...
}

// Vérifie le statut de connexion utilisateur via le token JWT
async function checkLoginStatus() {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.log('Pas de token trouvé, utilisateur non connecté');
      showLoginLink();
      return;
    }

    const response = await fetch('/api/v1/auth/status', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.status === 401) {
      console.log('Token expiré ou non valide, déconnexion');
      localStorage.removeItem('access_token');
      showLoginLink();
    } else if (response.ok) {
      const data = await response.json();
      console.log('Statut login:', data);
      // ici tu peux gérer l'affichage d'éléments pour utilisateur connecté
      // ex : masquer lien login, afficher profil, etc.
    } else {
      console.error('Erreur inattendue lors du checkLoginStatus:', response.status);
      showLoginLink();
    }
  } catch (error) {
    console.error('Erreur vérification statut login:', error);
    showLoginLink();
  }
}

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
    // Stocker le token dans un cookie (path=/ pour être accessible partout)
    document.cookie = `token=${data.access_token}; path=/; SameSite=Lax`;

    // Retourne true pour indiquer succès
    return true;

  } catch (error) {
    // Propage l'erreur pour gestion dans l'appelant
    throw error;
  }
}

// --- Code d'initialisation et écouteurs d'événements --- 

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed');


  // Vérifie le status de connexion utilisateur au chargement
  checkLoginStatus();

  // S’assure que loadPlaces ne s’exécute que sur les pages possédant #places-container
  const placesContainer = document.getElementById('places-container');
  if (placesContainer) {
    loadPlaces();
  } else {
    console.warn('Element #places-container not found in DOM!');
  }

  // Exemple : écouteur sur formulaire login (adapter si tu as un formulaire login)
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      await loginUser(email, password);
      // Après login, tu peux éventuellement rediriger vers index.html
      window.location.href = '/templates/index.html';
    });
  }

    // Listener pour afficher le formulaire login au clic
  const loginLink = document.getElementById('login-link');
  if (loginLink) {
    loginLink.addEventListener('click', (e) => {
      e.preventDefault(); // empêche la navigation vers login.html
      const loginSection = document.getElementById('login-section');
      if (loginSection) loginSection.style.display = 'block'; // affiche le formulaire
    });
  }
});

  // Initialisation de l’ensemble du script une fois le DOM chargé
  document.addEventListener('DOMContentLoaded', async () => {
  const isAuthenticated = await checkAuthStatus();
  if (isAuthenticated) {
    checkAuthentication(); // montre/cache le login
    fetchPlaces(); // récupère et affiche
    setupPriceFilter(); // gère le filtre
  } else {
    // Pas authentifié, on affiche le formulaire/login
    const loginLink = document.getElementById('login-link');
    const loginSection = document.getElementById('login-section');
    if (loginLink) loginLink.style.display = 'block';
    if (loginSection) loginSection.style.display = 'block';
  }
});
