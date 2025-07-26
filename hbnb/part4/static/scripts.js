// Ce fichier gère :
// - obtenir un cookie par son nom
// - vérifie si l'utilisateur est authentifié
// - le filtre prix sur la page index
// - affiche les places dans le DOM
// - Tableau pour stocker toutes les places
// - Fonction applyPriceFilter() pour appliquer le filtre de prix
// - le chargement dynamique des places depuis le backend
// - le formulaire de connexion (login) avec gestion des erreurs affichées
// - la vérification du statut d'authentification
// - tout est executé après chargement complet du DOM

//-------------------------------------------------------
// Fonction utilitaire pour obtenir un cookie par son nom
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

//-------------------------------------------------------
// Fonction pour vérifier si l'utilisateur est authentifié
function checkAuthentication() {
  const token = getCookie('token');
  const loginLink = document.getElementById('login-link');
  if (!token) {
    loginLink.style.display = 'block';
  } else {
    loginLink.style.display = 'none';
    fetchPlaces(token);
  }
}

//-------------------------------------------------------
// Gestion du filtre prix côté client
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

//-------------------------------------------------------
// Fonction pour afficher les places dans le DOM
async function fetchPlaces(token) {
  try {
    const response = await fetch('http://localhost:5001/api/v1/places', {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    if (!response.ok) {
      throw new Error('Erreur lors du chargement des places');
    }
    const data = await response.json();
    displayPlaces(data);
  } catch (error) {
    alert('Impossible de charger les places. Détail : ' + error.message);
  }
}

//-------------------------------------------------------
// Tableau pour stocker toutes les places
let allPlaces = [];

function displayPlaces(places) {
  const placesList = document.getElementById('places-list');
  placesList.innerHTML = '';
  allPlaces = places;

  places.forEach((place) => {
    const placeDiv = document.createElement('div');
    placeDiv.classList.add('place-item');
    placeDiv.innerHTML = `
      <h2>${place.name}</h2>
      <p>${place.description || 'Pas de description'}</p>
      <p>Lieu : ${place.city || 'Inconnu'} (${place.country || ''})</p>
      <p>Prix : ${place.price_by_night} €</p>
    `;
    placeDiv.setAttribute('data-price', place.price_by_night || 0);
    placesList.appendChild(placeDiv);
  });

  applyPriceFilter(); // applique le filtre après affichage
}

//-------------------------------------------------------
// Fonction pour appliquer le filtre de prix
function applyPriceFilter() {
  const selected = document.getElementById('price-filter').value;
  const placesList = document.getElementById('places-list');
  const placeItems = placesList.querySelectorAll('.place-item');

  placeItems.forEach((item) => {
    const prix = parseInt(item.getAttribute('data-price'), 10);
    if (selected === 'all' || prix <= parseInt(selected, 10)) {
      item.style.display = '';
    } else {
      item.style.display = 'none';
    }
  });
}

//-------------------------------------------------------
// Chargement dynamique de la liste des places depuis backend
async function loadPlaces() {
  console.log('loadPlaces called');
  try {
    const response = await fetch('http://localhost:5000/api/v1/places/', {
      method: 'GET',
      credentials: 'include'  // Indispensable pour les cookies JWT
    });

    if (!response.ok) {
      console.error('Erreur lors du chargement des places:', response.status);
      return;
    }

    const places = await response.json();

    // Conteneur où on injecte la liste
    const placesContainer = document.getElementById('places-container');
    if (!placesContainer) {
      console.error('Element #places-container not found in DOM!');
      return;
    }
    placesContainer.innerHTML = '';  // Vide le contenu avant ajout des places

    places.forEach(place => {
      const placeDiv = document.createElement('div');
      placeDiv.classList.add('place-item');      // Classe css nécessaire au filtre
      placeDiv.dataset.price = place.price;      // data-price utilisé dans setupPriceFilter

      // Affichage complet des infos de la place (titre, description, lieu, propriétaire, prix)
      placeDiv.innerHTML = `
        <h3>${place.title || place.name || 'Titre non défini'}</h3>
        <p>${place.description || 'Pas de description disponible.'}</p>
        <p>Lieu : ${place.city_name || ''}</p>
        <p>Propriétaire : ${place.owner?.first_name || ''} ${place.owner?.last_name || ''}</p>
        <p>Prix : ${place.price} € / nuit</p>
      `;

      placesContainer.appendChild(placeDiv);
    });

    // Applique le filtre prix automatiquement une fois tout affiché
    const priceFilter = document.getElementById('price-filter');
    if (priceFilter) {
      priceFilter.dispatchEvent(new Event('change'));
    }

  } catch (error) {
    console.error('Erreur fetch loadPlaces:', error);
  }
}

//-------------------------------------------------------
// Gestion du formulaire de connexion utilisateur
async function loginUser(email, password) {
  const errorSpan = document.getElementById('login-error');
  if (errorSpan) errorSpan.textContent = '';  // Reset message erreur

  try {
    const response = await fetch('http://localhost:5000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });

    if (response.ok) {
      console.log('Login réussi');
      if (errorSpan) errorSpan.textContent = '';
      // Recharge la liste des places pour afficher l’utilisateur connecté
      await loadPlaces();
      // TODO : tu peux ici cacher le formulaire login ou faire une redirection avec window.location = ...
    } else {
      console.error('Login échoué :', response.status);
      if (errorSpan) errorSpan.textContent = 'Échec de connexion : identifiants invalides.';
      else alert('Échec de connexion : identifiants invalides.');
    }
  } catch (error) {
    console.error('Erreur lors du login:', error);
    if (errorSpan) errorSpan.textContent = 'Erreur réseau, impossible de contacter le serveur.';
    else alert('Erreur réseau, impossible de contacter le serveur.');
  }
}

//-------------------------------------------------------
// Vérification optionnelle du statut de connexion utilisateur
async function checkLoginStatus() {
  try {
    const response = await fetch('http://localhost:5000/api/v1/auth/status', {
      method: 'GET',
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Utilisateur connecté:', data);
      // TODO : Modifie ton DOM ici si tu veux afficher que l'utilisateur est connecté
    } else {
      console.log('Utilisateur non connecté:', response.status);
    }
  } catch (error) {
    console.error('Erreur vérification statut login:', error);
  }
}

//-------------------------------------------------------
// Initialisation de l’ensemble du script une fois le DOM chargé
document.addEventListener('DOMContentLoaded', () => {

  // Initialise le filtre prix sur la page
  setupPriceFilter();

  // Vérifie si un utilisateur est connecté puis charge les places
  checkLoginStatus().then(() => {
    loadPlaces();
  });

  // Gestion du formulaire login
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = loginForm.querySelector('input[name="email"]').value;
      const password = loginForm.querySelector('input[name="password"]').value;
      loginUser(email, password);
    });
  } else {
    console.warn('Formulaire login (#login-form) non trouvé dans le DOM');
  }

// Applique le filtre de prix au changement de sélection
document.getElementById('price-filter').addEventListener('change', applyPriceFilter);

// Appelle la fonction checkAuthentication() une fois que le DOM est chargé
window.addEventListener('DOMContentLoaded', checkAuthentication);
});
