// Ce fichier gère :
// - getCookie(name) Obtenir un cookie par son nom 
// - checkAuthStatus() Vérifie si l'utilisateur est authentifié via un token
// - checkAuthentication() Vérifie l'authentification et charge les détails du lieu
// - fetchPlaces() Récupère les places depuis l'API
// - displayPlaces(places) Affiche les places dans le DOM
// - fetchPlaceDetails(token, placeId) Récupère les détails d'une place spécifique
// - displayPlaceDetails(place) Affiche les détails d'une place dans le DOM
// - applyPriceFilter(event) Applique un filtre de prix aux places
// - setupPriceFilter() Configure le filtre de prix
// - loginUser(email, password) Gère la connexion de l'utilisateur
// - logoutUser() Gère la déconnexion de l'utilisateur
// - handleReviewFormSubmit(event) Gère la soumission du formulaire d’ajout d’avis
// - getPlaceIdFromURL() Récupère l'ID d'une place depuis l'URL
  
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
// Vérifie l'authentification et initialise la page
async function checkAuthentication() {
  const token = getCookie('token');
  const addReviewSection = document.getElementById('add-review');
  const loginLink = document.getElementById('login-link');
  const placeId = getPlaceIdFromURL();
  
  if (!placeId) {
    // Il n'y a pas de place_id dans l'URL, donc on ne lance pas la logique dédiée à place
    return;  // quitte la fonction sans afficher d'alerte
  }
  // Vérifie si l'utilisateur est authentifié
  if (loginLink) {
    loginLink.style.display = token ? 'none' : 'block';
  }

  if (!token) {
    // Non connecté, cacher formulaire
    addReviewSection.style.display = 'none';
    await fetchPlaceDetails(null, placeId);
  } else {
    // Connecté, montrer formulaire
    addReviewSection.style.display = 'block';
    await fetchPlaceDetails(token, placeId);
  }
}

//-------------------------------------------------------
// Fonction pour afficher les places dans le DOM / Backend
/* async function fetchPlaces() {
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
*/
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
// Fonction pour récupérer les détails du logement depuis l'API
async function fetchPlaceDetails(token, placeId) {
  try {
    const headers = {};
    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    }
    const response = await fetch(`http://localhost:5000/api/v1/places/${placeId}`, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des détails de la place');
    }

    const place = await response.json();
    displayPlaceDetails(place);
  } catch (error) {
    console.error(error);
    const detailsSection = document.getElementById('place-details');
    detailsSection.innerHTML = '<p>Impossible de charger les détails de la place.</p>';
    // Optionnel : vider la section des avis si une erreur se produit
    const reviewsSection = document.getElementById('reviews');
    reviewsSection.innerHTML = '';
  }
}

//-------------------------------------------------------
// Fonction pour afficher les détails d'une place dans le DOM
function displayPlaceDetails(place) {
  const detailsSection = document.getElementById('place-details');
  detailsSection.innerHTML = ''; // reset
  // Affiche les détails de la place
  const nameEl = document.createElement('h3');
  nameEl.textContent = place.name;
  detailsSection.appendChild(nameEl);
  // Affiche l'image si disponible
  const descEl = document.createElement('p');
  descEl.textContent = place.description;
  detailsSection.appendChild(descEl);
  // Affiche la ville si disponible
  const priceEl = document.createElement('p');
  priceEl.textContent = `Prix : ${place.price_by_night}€ / nuit`;
  detailsSection.appendChild(priceEl);

  if (place.amenities && place.amenities.length > 0) {
    const amenitiesTitle = document.createElement('h4');
    amenitiesTitle.textContent = 'Commodités :';
    detailsSection.appendChild(amenitiesTitle);
    // Affiche les commodités
    const ulAmenities = document.createElement('ul');
    place.amenities.forEach(amenity => {
      const li = document.createElement('li');
      li.textContent = amenity.name;
      ulAmenities.appendChild(li);
    });
    detailsSection.appendChild(ulAmenities);
  }
  // Reviews section //
  const reviewsSection = document.getElementById('reviews');
  reviewsSection.innerHTML = '<h2>Avis</h2>';
  // Affiche les avis
  if (place.reviews && place.reviews.length > 0) {
    place.reviews.forEach(review => {
      const reviewDiv = document.createElement('div');
      reviewDiv.className = 'review-card';
      //  Affiche l'auteur et la date
      const author = document.createElement('strong');
      author.textContent = review.user_name || review.user || 'Anonyme';
      // Date de l'avis
      const date = document.createElement('em');
      date.style.marginLeft = '10px';
      if (review.created_at) {
        date.textContent = new Date(review.created_at).toLocaleDateString();
      } else {
        date.textContent = '';
      }
      // Contenu de l'avis
      const content = document.createElement('p');
      content.textContent = review.text || review.comment || '';
      // Assemble le tout
      reviewDiv.appendChild(author);
      reviewDiv.appendChild(date);
      reviewDiv.appendChild(content);
      // Ajoute la carte d'avis à la section des avis
      reviewsSection.appendChild(reviewDiv);
    });
  } else {
    const noReviews = document.createElement('p');
    noReviews.textContent = 'Aucun avis pour cette place.';
    reviewsSection.appendChild(noReviews);
  }
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
// Récupère l'ID d'une place depuis l'URL
function getPlaceIdFromURL() {
  // window.location.search donne la partie après le "?" dans l'URL, ex: "?place_id=123"
  const params = new URLSearchParams(window.location.search);
  return params.get('place_id'); // récupère la valeur du paramètre 'place_id'
}

//-------------------------------------------------------
// Gère la soumission du formulaire d’ajout d’avis
async function handleReviewFormSubmit(event) {
  event.preventDefault();

  const token = getCookie('token');
  if (!token) {
    alert('Vous devez être connecté pour ajouter un avis.');
    return;
  }

  const placeId = getPlaceIdFromURL();
  if (!placeId) {
    alert('ID de place manquant.');
    return;
  }

  const reviewText = document.getElementById('review-text').value.trim();
  const reviewRating = document.getElementById('review-rating').value;

  if (reviewText.length === 0 || reviewRating < 1 || reviewRating > 5) {
    alert('Veuillez saisir un texte d\'avis valide et une note entre 1 et 5.');
    return;
  }

  try {
    const response = await fetch(`http://localhost:5000/api/v1/places/${placeId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
      body: JSON.stringify({
        text: reviewText,
        rating: Number(reviewRating),
      }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l’envoi de l\'avis');
    }

    // Ré-initialiser le formulaire
    document.getElementById('review-form').reset();

    // Recharger les détails pour afficher le nouvel avis
    await fetchPlaceDetails(token, placeId);

  } catch (error) {
    alert('Erreur lors de l\'envoi de l\'avis, veuillez réessayer.');
    console.error(error);
  }
}

//-------------------------------------------------------
// Fonction pour ouvrir la modale de login
function openLoginModal() {
  const loginSection = document.getElementById('login-section');
  if (loginSection) {
    loginSection.style.display = 'flex';  // rend visible la modale et la centre grâce au CSS flex
  }
}

//-------------------------------------------------------
// Fonction pour fermer la modale de login
function closeLoginModal() {
  const loginSection = document.getElementById('login-section');
  if (loginSection) {
    loginSection.style.display = 'none'; // cache la modale
  }
}

//-------------------------------------------------------
// --- Code d'initialisation et écouteurs d'événements ---

document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM fully loaded and parsed');
  checkAuthentication();

  // Sélection des éléments du DOM
  const loginBtn = document.getElementById('loginBtn');      // lien/bouton connexion
  const logoutBtn = document.getElementById('logoutBtn');    // lien/bouton déconnexion
  const loginSection = document.getElementById('login-section'); // modale/formulaire de connexion
  const loginForm = document.getElementById('login-form');
  const closeBtn = document.getElementById('close-login-form');
  const priceFilter = document.getElementById('price-filter');
  const placesContainer = document.getElementById('places-container') || document.getElementById('places-list');
  const reviewForm = document.getElementById('review-form'); // Ajoute l'écouteur sur le formulaire d'avis

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

  // Ajoute l'écouteur sur le formulaire d'avis 
  if (reviewForm) {
    reviewForm.addEventListener('submit', handleReviewFormSubmit);
  }

  // Charger les places sur la page d'accueil pour tout le monde
  if (placesContainer) {
    fetchPlaces(); // ou loadPlaces(), selon ton code réel
  } else {
    console.warn('Element places container not found!');
  }

  // Activer le filtre prix pour tout le monde
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
