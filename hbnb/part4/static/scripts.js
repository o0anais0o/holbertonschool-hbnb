/* script.js derniere version a tester
Explications du fichier  :
Gestion des cookies : récupération claire et fiable grâce à getCookie().
Authentification : vérification côté serveur via checkAuthStatus(), affichage dynamique du formulaire d’ajout d’avis selon la présence d’un token.
Récupération de l’ID place depuis l’URL via getPlaceIdFromURL().
Chargement des détails d’une place, gestion complète des erreurs, affichage des commodités et avis dans le DOM.
Gestion de la liste des places sur la page d’accueil avec gestion du filtre prix.
Login, logout, ouverture/fermeture de modale login avec gestion des états en fonction d’authentification.
Ajout d’avis sous authentification avec validation simple du formulaire.
Utilisation de credentials: 'include' pour envoyer les cookies automatiquement, indispensable pour JWT en cookie HttpOnly.*/


//-------------------------------------------------------
// Variable globale pour stocker toutes les places récupérées (optionnel, à utiliser selon besoin)
let allPlaces = [];

//-------------------------------------------------------
// Fonction utilitaire pour récupérer un cookie par son nom
function getCookie(name) {
    const cookieArr = document.cookie.split(';');
    for (const cookie of cookieArr) {
        const [key, value] = cookie.trim().split('=');
        if (key === name) return decodeURIComponent(value);
    }
    return null;
}


//-------------------------------------------------------
// Vérifie le statut d'authentification côté serveur (API) via cookie JWT HttpOnly 
async function checkAuthStatus() {
    try {
        const response = await fetch('http://localhost:5000/api/v1/auth/status', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'  // Important : envoie des cookies lors de la requête
        });
        return response.ok;
    } catch (error) {
        console.error('Erreur vérification auth:', error);
        return false;
    }
}


//-------------------------------------------------------
// Fonction pour récupérer l'ID d'une place depuis l'URL (paramètre 'id')
function getPlaceIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');  // On attend une URL comme /place.html?id=123abc
}


//-------------------------------------------------------
// Affiche les détails d'une place dans le DOM (nom, description, prix, commodités, avis)
function displayPlaceDetails(place) {
    const detailsSection = document.getElementById('place-details');
    if (!detailsSection) {
        console.error("L'élément #place-details est introuvable dans la page");
        return;
    }
    detailsSection.innerHTML = ''; // Réinitialise le contenu

    // Nom du logement
    const nameEl = document.createElement('h3');
    nameEl.textContent = place.name || 'Nom non disponible';
    detailsSection.appendChild(nameEl);

    // Description
    const descEl = document.createElement('p');
    descEl.textContent = place.description || 'Description non disponible';
    detailsSection.appendChild(descEl);

    // Prix par nuit
    const priceEl = document.createElement('p');
    priceEl.textContent = `Prix : ${place.price_by_night || 'N/A'} € / nuit`;
    detailsSection.appendChild(priceEl);

    // Commodités
    if (place.amenities && place.amenities.length > 0) {
        const amenitiesTitle = document.createElement('h4');
        amenitiesTitle.textContent = 'Commodités :';
        detailsSection.appendChild(amenitiesTitle);

        const ulAmenities = document.createElement('ul');
        place.amenities.forEach(amenity => {
            const li = document.createElement('li');
            li.textContent = amenity.name || 'Nom inconnu';
            ulAmenities.appendChild(li);
        });
        detailsSection.appendChild(ulAmenities);
    }

    // Section des avis
    const reviewsSection = document.getElementById('reviews');
    if (!reviewsSection) {
        console.warn("L'élément #reviews est introuvable. Impossible d'afficher les avis.");
    } else {
        reviewsSection.innerHTML = '<h2>Avis</h2>';

        if (place.reviews && place.reviews.length > 0) {
            place.reviews.forEach(review => {
                const reviewDiv = document.createElement('div');
                reviewDiv.className = 'review-card';

                // Auteur de l'avis
                const author = document.createElement('strong');
                author.textContent = review.user_name || review.user || 'Anonyme';

                // Date de création de l'avis
                const date = document.createElement('em');
                date.style.marginLeft = '10px';
                date.textContent = review.created_at ? new Date(review.created_at).toLocaleDateString() : '';

                // Contenu de l'avis
                const content = document.createElement('p');
                content.textContent = review.text || review.comment || '';

                // Assemblage
                reviewDiv.appendChild(author);
                reviewDiv.appendChild(date);
                reviewDiv.appendChild(content);

                reviewsSection.appendChild(reviewDiv);
            });
        } else {
            const noReviews = document.createElement('p');
            noReviews.textContent = 'Aucun avis pour cette place.';
            reviewsSection.appendChild(noReviews);
        }
    }
}


//-------------------------------------------------------
// Fonction pour afficher la liste des logements (places) dans le DOM
function displayPlaces(places) {
    // Récupérer le conteneur (id #places-container ou #places-list)
    const container = document.getElementById('places-container') || document.getElementById('places-list');

    if (!container) {
        console.error('Aucun conteneur #places-container ni #places-list trouvé dans le DOM');
        return;
    }

    container.innerHTML = ''; // Reset

    if (!places || places.length === 0) {
        container.innerHTML = '<p>Aucun logement disponible.</p>';
        return;
    }

    places.forEach(place => {
        // Création de la carte de place
        const card = document.createElement('article');
        card.className = 'place-card';
        card.dataset.price = place.price_by_night; // Pour filtre prix

        // Exemple simple de contenu
        card.innerHTML = `
            <h3>${place.name || 'Sans nom'}</h3>
            <p>${place.description ? place.description.substring(0, 100) + '...' : 'Pas de description'}</p>
            <p><strong>Prix :</strong> ${place.price_by_night || 'N/A'} € / nuit</p>
            <a href="place.html?id=${place.id}">Voir les détails</a>
        `;

        container.appendChild(card);
    });
}

//-------------------------------------------------------
// Récupère les détails du logement via API, avec gestion de l'authentification, erreurs, etc.
async function fetchPlaceDetails(token, placeId) {
    if (!placeId) {
        console.error("ID du logement manquant pour fetchPlaceDetails.");
        return;
    }

    try {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`http://localhost:5000/api/v1/places/${placeId}`, {
            method: 'GET',
            headers: headers,
            credentials: 'include'  // Pour envoyer les cookies même si token est présent dans les headers
        });

        if (response.status === 401) {
            console.warn('Non autorisé (401) lors de la récupération des détails, utilisateur non connecté ou token invalide.');
            const detailsSection = document.getElementById('place-details');
            if (detailsSection) detailsSection.innerHTML = '<p>Vous devez être connecté pour voir ces détails.</p>';
            return;
        }

        if (!response.ok) {
            throw new Error(`Erreur HTTP ${response.status}`);
        }

        const place = await response.json();
        displayPlaceDetails(place);

    } catch (error) {
        console.error('Erreur lors de la récupération des détails du logement :', error);
        const detailsSection = document.getElementById('place-details');
        if (detailsSection) {
            detailsSection.innerHTML = '<p>Impossible de charger les détails de la place.</p>';
        }
        const reviewsSection = document.getElementById('reviews');
        if (reviewsSection) reviewsSection.innerHTML = '';
    }
}


//-------------------------------------------------------
// Vérifie si un utilisateur est authentifié et ajuste l'affichage de la page (formulaire, liens, etc.)
async function checkAuthentication() {
    const token = getCookie('token');
    const addReviewSection = document.getElementById('add-review');
    const loginLink = document.getElementById('login-link');
    const placeId = getPlaceIdFromURL();

    if (!placeId) {
        // Pas de placeId, aucune action spécifique
        return;
    }

    // Affiche ou cache le lien login selon que le token est présent
    if (loginLink) loginLink.style.display = token ? 'none' : 'block';

    // Affiche ou cache la section formulaire d'avis
    if (addReviewSection) addReviewSection.style.display = token ? 'block' : 'none';

    // Charge les détails de la place appropriés (avec ou sans token)
    await fetchPlaceDetails(token, placeId);
}


//-------------------------------------------------------
// Récupère la liste des places pour affichage (ex: page d'accueil)
async function fetchPlacesList() {
    const placesContainer = document.getElementById('places-container') || document.getElementById('places-list');

    if (!placesContainer) {
        console.error('Element #places-container ou #places-list introuvable dans le DOM.');
        return;
    }

    console.log('Chargement des places ...');

    const token = getCookie('token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
        const response = await fetch('http://localhost:5000/api/v1/places', {
            method: 'GET',
            headers: headers,
            credentials: 'include'
        });

        if (!response.ok) throw new Error(`Erreur API: ${response.status}`);

        const data = await response.json();
        allPlaces = data; // stocker globalement si besoin

        displayPlaces(data);

    } catch (err) {
        console.error('Erreur lors du chargement des places:', err);
        placesContainer.innerHTML = '<p>Impossible de charger les places.</p>';
    }
}

// NOTE : Tu dois implémenter ou vérifier la fonction displayPlaces(data) qui affiche les housings dans ta page


//-------------------------------------------------------
// Applique un filtre de prix sur la liste des places affichées
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

// Configuration du listener sur l'input/select du filtre prix
function setupPriceFilter() {
    const priceFilter = document.getElementById('price-filter');
    if (priceFilter) {
        priceFilter.addEventListener('change', applyPriceFilter);
    }
}


//-------------------------------------------------------
// Soumission du formulaire d’ajout d’avis
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
            credentials: 'include',
            body: JSON.stringify({
                text: reviewText,
                rating: Number(reviewRating),
            }),
        });

        if (!response.ok) {
            throw new Error('Erreur lors de l’envoi de l\'avis');
        }

        // Réinitialiser le formulaire
        document.getElementById('review-form').reset();

        // Rafraîchir la place avec le nouvel avis
        await fetchPlaceDetails(token, placeId);

    } catch (error) {
        alert('Erreur lors de l\'envoi de l\'avis, veuillez réessayer.');
        console.error(error);
    }
}


//-------------------------------------------------------
// Ouvre la modale de login (affiche le bloc contenant le formulaire)
function openLoginModal() {
    const loginSection = document.getElementById('login-section');
    if (loginSection) {
        loginSection.style.display = 'flex'; // Affiche la modale en flexbox centré
    }
}


//-------------------------------------------------------
// Ferme la modale de login (cache le bloc)
function closeLoginModal() {
    const loginSection = document.getElementById('login-section');
    if (loginSection) {
        loginSection.style.display = 'none';
    }
}


//-------------------------------------------------------
// Fonction pour envoyer la requête de login (POST) et gérer le cookie JWT HttpOnly
async function loginUser(email, password) {
    const response = await fetch('http://localhost:5000/api/v1/auth/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify({email, password})
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.error || `Erreur login: statut ${response.status}`;
        throw new Error(message);
    }

    const data = await response.json();
    console.log('Login response data:', data);

    if (data.login !== true) {
        throw new Error('Connexion refusée');
    }

    // Le token est stocké automatiquement dans cookie HttpOnly par le serveur
    return true;
}


//-------------------------------------------------------
// Fonction pour déconnecter l'utilisateur côté serveur
async function logoutUser() {
    const response = await fetch('http://localhost:5000/api/v1/auth/logout', {
        method: 'POST',
        credentials: 'include'
    });

    if (!response.ok) {
        alert('Erreur lors de la déconnexion');
        return false;
    }
    return true;
}


//-------------------------------------------------------
// --- Initialisation et écoutes d'événements au chargement du DOM ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM entièrement chargé');

    // Vérifie si l'utilisateur est connecté côté serveur
    const isAuthenticated = await checkAuthStatus();

    // Affiche/Cache boutons login/logout et modale login selon statut
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginSection = document.getElementById('login-section');

    if (isAuthenticated) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'block';
        if (loginSection) loginSection.style.display = 'none';
    } else {
        if (loginBtn) loginBtn.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (loginSection) loginSection.style.display = 'none';
    }

    // Ajout des listeners pour ouverture/fermeture modale login
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (loginSection) loginSection.style.display = 'flex';
        });
    }
    const closeBtn = document.getElementById('close-login-form');
    if (closeBtn && loginSection) {
        closeBtn.addEventListener('click', e => {
            e.preventDefault();
            loginSection.style.display = 'none';
        });
    }
    // Fermer modale au clic en dehors du formulaire
    const loginForm = document.getElementById('login-form');
    if (loginSection && loginForm) {
        loginSection.addEventListener('click', e => {
            if (!loginForm.contains(e.target)) {
                loginSection.style.display = 'none';
            }
        });
    }

    // Listener bouton déconnexion
    const logoutBtnElem = logoutBtn;
    if (logoutBtnElem) {
        logoutBtnElem.addEventListener('click', async e => {
            e.preventDefault();
            const success = await logoutUser();
            if (success) {
                if (loginBtn) loginBtn.style.display = 'block';
                if (logoutBtn) logoutBtn.style.display = 'none';
            }
        });
    }

    // Listener formulaire login
    if (loginForm) {
        loginForm.addEventListener('submit', async e => {
            e.preventDefault();
            const email = loginForm.querySelector('input[name="email"]').value;
            const password = loginForm.querySelector('input[name="password"]').value;
            const errorMsg = document.getElementById('login-error');
            try {
                const success = await loginUser(email, password);
                if (success) {
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

    // Ajout listener formulaire d'avis
    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', handleReviewFormSubmit);
    }

    // Charger les places sur la page d'accueil (si elem présent)
    const placesContainer = document.getElementById('places-container') || document.getElementById('places-list');
    if (placesContainer) {
        fetchPlacesList();
    } else {
        console.warn('Conteneur des places introuvable dans la page.');
    }

    // Configurer filtre prix si présent
    setupPriceFilter();

    // Check et adapte affichage/formulaire avis selon auth et placeId
    await checkAuthentication();
});
