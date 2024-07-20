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
        showLoader();
        checkAdmin(user.uid);
    }
});

// Handle form submission
document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const email = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    // Show loader
    showLoader();

    // Sign in user with Firebase Authentication
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in successfully, check if user is admin
            const user = userCredential.user;
            checkAdmin(user.uid);
        })
        .catch((error) => {
            //console.error('Error signing in', error);
            showErrorMessage('Error signing in.');
            hideLoader();
        });
});

function checkAdmin(uid) {
    firebase.database().ref('users/admin/' + uid).once('value')
        .then((snapshot) => {
            if (snapshot.exists()) {
                // User is admin, redirect to admin.html
                window.location.href = 'admin.html';
            } else {
                // User is not admin, show error message and sign out
                showErrorMessage('Access denied. You are not an admin.');
                firebase.auth().signOut();
                hideLoader();
            }
        })
        .catch((error) => {
            //console.error('Error checking admin status', error);
            showErrorMessage('Error finding admin.');
            hideLoader();
        });
}

function showErrorMessage(message) {
    const errorMessageElement = document.getElementById('error-message');
    errorMessageElement.textContent = message;
    errorMessageElement.style.display = 'block';
}

function showLoader() {
    document.getElementById('loader').style.display = 'flex';
}

function hideLoader() {
    document.getElementById('loader').style.display = 'none';
}
