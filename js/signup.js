// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBKMUT1Mvums9TZYQSvs2mwaRBg5qFuiz4",
    authDomain: "sms-sender-c293c.firebaseapp.com",
    projectId: "sms-sender-c293c",
    storageBucket: "sms-sender-c293c.appspot.com",
    messagingSenderId: "962610219948",
    appId: "1:962610219948:web:fade71761e059af1e68809"
};

firebase.initializeApp(firebaseConfig);

// Handle form submission
document.getElementById('signup-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const username = document.getElementById('username').value;
    const telegramId = document.getElementById('telegram-id').value;
    const password = document.getElementById('password').value;

    // Hash the password using CryptoJS (assuming CryptoJS is included in your project)
    const hashedPassword = CryptoJS.SHA256(password).toString();

    // Register the user in Firebase Authentication
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Save additional user info in Firebase Realtime Database
            const userId = userCredential.user.uid;
            const initialCredits = 0; 

            // Set user data in Firebase Realtime Database
            return firebase.database().ref('users/' + userId).set({
                email: email,
                username: username,
                telegramId: telegramId,
                hashedPassword: hashedPassword,
                credits: initialCredits
            });
        })
        .then(() => {
            // Redirect to home.html after successful signup
            window.location.href = 'home.html';
        })
        .catch((error) => {
            //console.error('Error signing up', error);
            alert('Error to signing up');
        });
});
