// Firebase configuration
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

// Get a reference to the authentication service
const auth = firebase.auth();

// Check authentication state
auth.onAuthStateChanged(user => {
    if (user) {
        // User is signed in
        const username = user.displayName; // Assuming displayName is set when user signs up

        // Update [Username] placeholder in dashboard
        const welcomeMessage = document.querySelector('#dashboard h2');
        if (welcomeMessage) {
            welcomeMessage.textContent = `Welcome, ${username}!`;
        }
    } else {
        // User is signed out
        //console.log('User is signed out');
        // You may want to redirect to the login page or handle this state accordingly
    }
});

// Function to handle sign out
function signOut() {
    auth.signOut().then(() => {
        // Sign-out successful.
    }).catch((error) => {
        // An error happened.
        //console.error('Sign out error:', error);
    });
}

// Handle form submission
document.getElementById('login-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Sign in with Firebase Authentication
    auth.signInWithEmailAndPassword(username, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            //console.log('User signed in:', user);
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            //console.error('Sign in error:', errorMessage);
        });
});
