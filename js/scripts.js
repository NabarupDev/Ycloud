// Firebase configuration (replace with your own config)
const firebaseConfig = {
    apiKey: "AIzaSyBKMUT1Mvums9TZYQSvs2mwaRBg5qFuiz4",
    authDomain: "sms-sender-c293c.firebaseapp.com",
    projectId: "sms-sender-c293c",
    storageBucket: "sms-sender-c293c.appspot.com",
    messagingSenderId: "962610219948",
    appId: "1:962610219948:web:fade71761e059af1e68809"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Check if user is already signed in
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        // User is signed in
        window.location.href = 'home.html';
    }
});

// Handle form submission
document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim(); // Ensure no leading/trailing spaces
    const password = document.getElementById('password').value.trim(); // Ensure no leading/trailing spaces

    // Sign in user with Firebase Authentication
    firebase.auth().signInWithEmailAndPassword(username, password)
        .then((userCredential) => {
            // Signed in successfully
            window.location.href = 'home.html';
        })
        .catch((error) => {
            // console.error('Error signing in', error);
            showErrorMessage('Error signing in');
        });
});

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', function () {
    firebase.auth().signOut().then(function () {
        // Sign-out successful, reload page to clear any cached state
        window.location.reload();
    }).catch(function (error) {
        //console.error('Error signing out:', error);
    });
});

function showErrorMessage(message) {
    const errorMessageElement = document.getElementById('error-message');
    errorMessageElement.textContent = message;
    errorMessageElement.style.display = 'block';
}