import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js';
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDHYEkn7yZt40C7bEHDlAfA2DxsdluL8Q4",
    authDomain: "cad2425-project.firebaseapp.com",
    projectId: "cad2425-project",
    storageBucket: "cad2425-project.firebasestorage.app",
    messagingSenderId: "129558952305",
    appId: "1:129558952305:web:935680fcb82f0701bb9ed0",
    databaseURL: "https://cad2425-project-default-rtdb.europe-west1.firebasedatabase.app" // @todo double-check link 
    //databaseURL: "https://cad2425-2232624.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const database = getDatabase(app);

export { database };

console.log('[DispUtilizador/js/firebase.js] Firebase initialized');

