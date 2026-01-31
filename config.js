// config.js
const firebaseConfig = {
    apiKey: "AIzaSyDQmerSSs0qhO01xNnFWpquZYseDThWxP0",
    authDomain: "lichtruc-e3f82.firebaseapp.com",
    projectId: "lichtruc-e3f82",
    storageBucket: "lichtruc-e3f82.firebasestorage.app",
    messagingSenderId: "476557236437",
    appId: "1:476557236437:web:dfb1cb5848642daecdaa5c"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
