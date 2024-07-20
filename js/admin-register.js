const firebaseConfig = {
    apiKey: "AIzaSyBKMUT1Mvums9TZYQSvs2mwaRBg5qFuiz4",
    authDomain: "sms-sender-c293c.firebaseapp.com",
    projectId: "sms-sender-c293c",
    storageBucket: "sms-sender-c293c.appspot.com",
    messagingSenderId: "962610219948",
    appId: "1:962610219948:web:fade71761e059af1e68809"
};

firebase.initializeApp(firebaseConfig);

document.getElementById('register-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const activationCode = document.getElementById('activation-code').value.trim();
    const expectedActivationCode = "4e2d8a1c9f6b";

    // Validate email, password, and activation code
    if (!validateEmail(email)) {
        alert('Please enter a valid email address.');
        return;
    }

    if (password.length < 6) {
        alert('Password should be at least 6 characters long.');
        return;
    }

    if (activationCode !== expectedActivationCode) {
        alert('Invalid activation code.');
        return;
    }

    // Register the new admin
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;

            return firebase.database().ref('users/admin/' + user.uid ).set({
                username: username,
                email: email
            })
            .then(() => {
                alert('Admin registered successfully!');
                window.location.href = 'admin-login.html';
            });
        })
        .catch((error) => {
            console.error('Error registering admin:', error);
            document.getElementById('error-message').textContent = 'Something went wrong';
            document.getElementById('error-message').style.display = 'block';
        });
});

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}
