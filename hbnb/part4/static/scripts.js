// Ce fichier gère :
// - getCookie(name) Obtenir un cookie par son nom 
// - checkAuthStatus() Vérifie si l'utilisateur est authentifié via un token
// - checkAuthentication() Vérifie si l'utilisateur est authentifié
// - fetchPlaces() Récupère les places depuis l'API
// - displayPlaces(places) Affiche les places dans le DOM
// - setupPriceFilter() Configure le filtre de prix
// - showLoginLink() Affiche un lien vers la page de connexion si l'utilisateur n'est pas connecté
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
    const loginSection = document.getElementById('login-section');
    if (!loginLink || !loginSection) return;

    if (!token) {
        loginLink.style.display = 'block';
        loginSection.style.display = 'block';
    } else {
        loginLink.style.display = 'none';
        loginSection.style.display = 'none';
    }
}

//-------------------------------------------------------
// Fonction pour afficher les places dans le DOM
function fetchPlaces() {
    const token = getCookie('token');
    let headers = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    fetch('http://0.0.0.0:5000/api/v1/places', {
        method: 'GET',
        headers: headers,
    })
    .then(response => {
        if (!response.ok) throw new Error('Erreur API');
        return response.json();
    })
    .then(data => {
        allPlaces = data;
        displayPlaces(data);
    })
    .catch(err => {
      const placesList = document.getElementById('places-list');
      if (placesList) {
        placesList.innerHTML = '<p>Impossible de charger les places.</p>';
  }
});

//-------------------------------------------------------
// Fonction pour afficher les places dans le DOM
function displayPlaces(places) {
  const placesList = document.getElementById('places-list');
  if (!placesList) return; // arrêt si pas d'élément

  placesList.innerHTML = ''; // vide la liste avant le remplissage

  places.forEach(place => {
    // Adapte selon le format réel de ta réponse API
    const placeDiv = document.createElement('div');
    placeDiv.className = 'place-card';
    // place.price_by_night doit contenir le prix (adapter le nom au besoin)
    placeDiv.setAttribute('data-price', place.price_by_night || 0);
    // Remplis le contenu visuel
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
// Fonction pour configurer le filtre de prix
function setupPriceFilter() {
  const priceFilter = document.getElementById('price-filter');
  if (!priceFilter) return;

  priceFilter.addEventListener('change', (event) => {
    const value = event.target.value;

    let filtered = allPlaces;

    if (value !== 'all') {
      const maxPrice = parseInt(value, 10); // convertit la valeur en nombre entier
      filtered = allPlaces.filter(place => {
        // Vérifie que le prix est défini sinon met 0 par défaut
        const price = place.price_by_night || 0;
        return price <= maxPrice;
      });
    }

    // Affiche la liste filtrée
    displayPlaces(filtered);
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

// Applique un filtre de prix aux places (exemple, adapte selon besoins réels)
function applyPriceFilter() {
  console.log('applyPriceFilter appelée');
  // Implementation du filtre (à adapter)
}

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
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) {
      console.error('Erreur login:', response.status);
      return;
    }
    const data = await response.json();
    localStorage.setItem('access_token', data.access_token);
    console.log('Login réussi');
    await loadPlaces();
  } catch (error) {
    console.error('Erreur lors du login:', error);
  }
}

// --- Code d'initialisation et écouteurs d'événements --- 

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed');

  // Setup du filtre prix
  const priceFilter = document.getElementById('price-filter');
  if (priceFilter) {
    priceFilter.addEventListener('change', applyPriceFilter);
  } else {
    console.warn('Element #price-filter not found in DOM!');
  }

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
})}
