// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCwD-hcUn3fn7MYgPZ_AOb9lGTDUVd8Ju8",
    authDomain: "formulario-if---ft.firebaseapp.com",
    databaseURL: "https://formulario-if---ft-default-rtdb.firebaseio.com",
    projectId: "formulario-if---ft",
    storageBucket: "formulario-if---ft.appspot.com",
    messagingSenderId: "1058547807066",
    appId: "1:1058547807066:web:4c7a3f5e5effd7d2dcf963",
    measurementId: "G-LPNRPXMJLY"
  };

// Inicialización de Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

function loadForms() {
    db.collection("formulariosAutorizados").orderBy("date").get().then((querySnapshot) => {
        const container = document.getElementById('forms-list-authorized');
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            container.innerHTML += `<li>${data.applicant} - ${data.budgetItem} - ${data.date}</li>`;
        });
    }).catch(error => console.error("Error al cargar formularios autorizados:", error));

    db.collection("formulariosNoAutorizados").orderBy("date").get().then((querySnapshot) => {
        const container = document.getElementById('forms-list-unauthorized');
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            container.innerHTML += `<li>${data.applicant} - ${data.budgetItem} - ${data.date}</li>`;
        });
    }).catch(error => console.error("Error al cargar formularios no autorizados:", error));

    db.collection("solicitudesPendientes").orderBy("date").get().then((querySnapshot) => {
        const container = document.getElementById('forms-list-pending');
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            container.innerHTML += `<li>${data.applicant} - ${data.budgetItem} - ${data.date}</li>`;
        });
    }).catch(error => console.error("Error al cargar solicitudes pendientes:", error));
}

document.addEventListener('DOMContentLoaded', loadForms);
