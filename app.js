document.addEventListener('DOMContentLoaded', function () {
    const urlToken = getTokenFromUrl();
    const storedToken = sessionStorage.getItem("authToken");

    if (urlToken) {
        sessionStorage.setItem("authToken", urlToken);
        validateTokenAndProceed(urlToken);
    } else if (storedToken) {
        validateTokenAndProceed(storedToken);
    } else {
        redirectToLogin();
    }
});

function getTokenFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('token');
}

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Error parsing JWT: ", e);
        return null;
    }
}

function redirectToLogin() {
    window.location.href = 'https://bclmgm.com/';
}

function validateTokenAndProceed(token) {
    fetch('https://bclmgm.com/auth/validate-token', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    })
    .then(data => {
        const userDetails = parseJwt(token);
        console.log('Parsed user details:', userDetails);
        if (userDetails && userDetails.username) {
            sessionStorage.setItem("userEmail", userDetails.username);
            sessionStorage.setItem("userName", userDetails.name);
            console.log('User email set to:', userDetails.username);
            console.log('User name set to:', userDetails.name);
        } else {
            console.log('User details not found in token');
            redirectToLogin();
        }
    })
    .catch(error => {
        console.error('Error in validateTokenAndProceed:', error);
        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
            console.error('Network error: Could not connect to the server');
        }
        redirectToLogin();
    });
}

// Configuraciones de Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js';
import { getFirestore, collection, getDocs, query, orderBy } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

// Configuración de Firebase para FI - FT
const firebaseConfigFI_FT = {
    apiKey: "AIzaSyCwD-hcUn3fn7MYgPZ_AOb9lGTDUVd8Ju8",
    authDomain: "formulario-if---ft.firebaseapp.com",
    databaseURL: "https://formulario-if---ft-default-rtdb.firebaseio.com",
    projectId: "formulario-if---ft",
    storageBucket: "formulario-if---ft.appspot.com",
    messagingSenderId: "1058547807066",
    appId: "1:1058547807066:web:4c7a3f5e5effd7d2dcf963",
    measurementId: "G-LPNRPXMJLY"
};

// Configuración de Firebase para CosOdf
const firebaseConfigCosOdf = {
    apiKey: "AIzaSyCRndzh737YjjMmN4gjPo6-0ICRn86wxuM",
    authDomain: "formulario-cosodf.firebaseapp.com",
    projectId: "formulario-cosodf",
    storageBucket: "formulario-cosodf.appspot.com",
    messagingSenderId: "319251180381",
    appId: "1:319251180381:web:e7c9c2051c0da9efa256b4",
    measurementId: "G-K0PQPMWD6M"
};

// Configuración de Firebase para la nueva instancia
const firebaseConfigNueva = {
    apiKey: "API_KEY_NUEVA_INSTANCIA",
    authDomain: "formulario-nueva.firebaseapp.com",
    projectId: "formulario-nueva",
    storageBucket: "formulario-nueva.appspot.com",
    messagingSenderId: "NUEVO_SENDER_ID",
    appId: "NUEVO_APP_ID",
    measurementId: "NUEVO_MEASUREMENT_ID"
};

// Inicializar Firebase para FI - FT
const appFI_FT = initializeApp(firebaseConfigFI_FT, "FI-FT");
const dbFI_FT = getFirestore(appFI_FT);

// Inicializar Firebase para CosOdf
const appCosOdf = initializeApp(firebaseConfigCosOdf, "CosOdf");
const dbCosOdf = getFirestore(appCosOdf);

// Inicializar Firebase para la nueva instancia
const appNueva = initializeApp(firebaseConfigNueva, "NuevaInstancia");
const dbNueva = getFirestore(appNueva);

// Cargar formularios de todas las instancias
let allForms = [];
let currentPage = 1;

async function loadForms() {
    const collections = ['formulariosAutorizados', 'formulariosNoAutorizados', 'solicitudesPendientes'];

    // Cargar formularios de FI - FT
    for (const collectionName of collections) {
        const colRef = collection(dbFI_FT, collectionName);
        const q = query(colRef, orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(doc => {
            allForms.push({ ...doc.data(), id: doc.id, status: collectionName, source: 'FI-FT' });
        });
    }

    // Cargar formularios de CosOdf
    for (const collectionName of collections) {
        const colRef = collection(dbCosOdf, collectionName);
        const q = query(colRef, orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(doc => {
            allForms.push({ ...doc.data(), id: doc.id, status: collectionName, source: 'CosOdf' });
        });
    }

    // Cargar formularios de la nueva instancia
    for (const collectionName of collections) {
        const colRef = collection(dbNueva, collectionName);
        const q = query(colRef, orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(doc => {
            allForms.push({ ...doc.data(), id: doc.id, status: collectionName, source: 'NuevaInstancia' });
        });
    }

    applyFilters();
}

// Aplicar los filtros
function applyFilters() {
    const search = document.getElementById('searchBox').value.toLowerCase();
    const status = document.getElementById('statusFilter').value;
    const company = document.getElementById('companyFilter').value;
    const sortOrder = document.getElementById('sortFilter').value;
    const pageSize = parseInt(document.getElementById('pageSize').value, 10);
    const userEmail = sessionStorage.getItem("userEmail").toLowerCase();
    const userName = sessionStorage.getItem("userName").toLowerCase();

    const specialAccessUsers = [
        "cobranza@biancorelab.com",
        "talejo@biancorelab.com",
    ];
    const hasSpecialAccess = specialAccessUsers.includes(userEmail);

    let filteredForms = allForms.filter(form => {
        const matchesSearch = form.applicant.toLowerCase().includes(search) ||
            form.area.toLowerCase().includes(search) ||
            form.budgetItem.toLowerCase().includes(search) ||
            form.date.toLowerCase().includes(search) ||
            form.Mount.toString().toLowerCase().includes(search);

        // Filtrar por empresa, incluyendo casos especiales para Biancorelab
        const matchesCompany = (company === 'all' || 
                                (company === 'Biancorelab' && !form.company) || 
                                form.company === company);

        const matchesStatus = (status === 'all' || form.status === status);
        const isCurrentUser = hasSpecialAccess || 
            form.applicant.toLowerCase() === userEmail || 
            form.applicant.toLowerCase().includes(userName);

        return matchesSearch && matchesStatus && matchesCompany && isCurrentUser;
    });

    filteredForms.forEach(form => {
        const [day, month, year] = form.date.split('/').map(Number);
        form.dateObject = new Date(year, month - 1, day);
    });

    if (sortOrder === 'dateDesc') {
        filteredForms.sort((a, b) => b.dateObject - a.dateObject);
    } else {
        filteredForms.sort((a, b) => a.dateObject - b.dateObject);
    }

    filteredForms.forEach(form => {
        const day = form.dateObject.getDate().toString().padStart(2, '0');
        const month = (form.dateObject.getMonth() + 1).toString().padStart(2, '0');
        const year = form.dateObject.getFullYear();
        form.date = `${day}/${month}/${year}`;
    });

    displayForms(filteredForms, pageSize, currentPage);
    setupPagination(filteredForms.length, pageSize, currentPage);
}

// Mostrar los formularios filtrados
function displayForms(forms, pageSize, page) {
    const start = (page - 1) * pageSize;
    const selectedForms = forms.slice(start, start + pageSize);
    const list = document.getElementById('formsList');
    list.innerHTML = `
        <li class="headers">
            <div class="header-item fecha">Fecha</div>
            <div class="header-item solicitante">Solicitante</div>
            <div class="header-item area">Área</div>
            <div class="header-item partida">Partida Presupuestaria</div>
            <div class="header-item monto">Monto</div>
        </li>
    `;
    list.innerHTML += selectedForms.map(form => `
        <li class="${form.status}">
            <div class="list-item fecha">${form.date}</div>
            <div class="list-item solicitante">${form.applicant}</div>
            <div class="list-item area">${form.area}</div>
            <div class="list-item partida">${form.budgetItem}</div>
            <div class="list-item monto">$ ${parseFloat(form.Mount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </li>
    `).join('');
}

// Configurar la paginación
function setupPagination(totalItems, pageSize, page) {
    const pageCount = Math.ceil(totalItems / pageSize);
    const pagination = document.querySelector('.pagination');
    pagination.innerHTML = '';

    const maxVisiblePages = 5;
    const currentGroup = Math.ceil(page / maxVisiblePages);
    const startPage = (currentGroup - 1) * maxVisiblePages + 1;
    const endPage = Math.min(currentGroup * maxVisiblePages, pageCount);

    if (currentGroup > 1) {
        const prevButton = document.createElement('span');
        prevButton.className = 'page-arrow';
        prevButton.innerHTML = '&laquo;';
        prevButton.addEventListener('click', () => {
            currentPage = startPage - maxVisiblePages;
            applyFilters();
        });
        pagination.appendChild(prevButton);
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageNumber = document.createElement('span');
        pageNumber.className = `page-number ${i === page ? 'active' : ''}`;
        pageNumber.textContent = i;
        pageNumber.addEventListener('click', () => {
            currentPage = i;
            applyFilters();
        });
        pagination.appendChild(pageNumber);
    }

    if (endPage < pageCount) {
        const nextButton = document.createElement('span');
        nextButton.className = 'page-arrow';
        nextButton.innerHTML = '&raquo;';
        nextButton.addEventListener('click', () => {
            currentPage = endPage + 1;
            applyFilters();
        });
        pagination.appendChild(nextButton);
    }
}

// Eventos para aplicar los filtros
document.getElementById('searchBox').addEventListener('keyup', applyFilters);
document.getElementById('statusFilter').addEventListener('change', applyFilters);
document.getElementById('sortFilter').addEventListener('change', applyFilters);
document.getElementById('companyFilter').addEventListener('change', applyFilters);
document.getElementById('pageSize').addEventListener('change', () => {
    currentPage = 1;
    applyFilters();
});

// Cargar los formularios
loadForms();
