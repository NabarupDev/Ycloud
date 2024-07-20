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

const database = firebase.database();
const telegramBotToken = "7446183301:AAHnoeb8AfS8vX7x0cPdRRqQfWzyvAjRigQ";
const telegramChatID = "2047349310";

let currentUsername = 'N/A'; // Global variable to store username

document.addEventListener('DOMContentLoaded', function () {
    // Show loader
    document.getElementById('loaderContainer').style.display = 'flex';

    firebase.auth().onAuthStateChanged(function (user) {
        if (!user) {
            // Redirect to login page if user is not authenticated
            window.location.href = 'admin-login.html';
        } else {
            const userId = user.uid;

            // Fetch user data from Firebase Realtime Database
            firebase.database().ref('users/admin/' + userId).once('value').then(function(snapshot) {
                const userData = snapshot.val();
                currentUsername = userData.username || 'N/A'; // Store username in global variable
                document.getElementById('username-text').textContent = currentUsername;
                
                // Hide loader once data is available
                document.getElementById('loaderContainer').style.display = 'none';
            }).catch(error => {
                console.error('Error fetching user data:', error);
            });

            // Set user online status
            setUserOnlineStatus(userId, true);

            // Listen for window unload to update status
            window.addEventListener('beforeunload', function () {
                setUserOnlineStatus(userId, false);
            });
        }
    });

    // Back to Home button event listener
    document.getElementById('back-home-button').addEventListener('click', function() {
        window.location.href = 'admin.html'; // Redirect to home page
    });

    document.getElementById('report-form').addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent default form submission

        // Get form values
        const title = document.getElementById('report-title').value;
        const details = document.getElementById('report-details').value;

        // Get current user information
        firebase.auth().currentUser.getIdTokenResult().then(function (idTokenResult) {
            const user = firebase.auth().currentUser;
            const email = user.email || 'N/A'; // Email address

            // Prepare message to send to Telegram
            const message = `
                *New Report Submitted Ycloud Admin*
                
                *Title:* ${title}
                *Details:* ${details}
                *Username:* ${currentUsername}
                *Email:* ${email}
            `;

            sendToTelegram(message);
        }).catch(error => {
            console.error('Error fetching user token:', error);
        });
    });
});

function sendToTelegram(message) {
    const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
    const data = {
        chat_id: telegramChatID,
        text: message,
        parse_mode: 'Markdown'
    };

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.ok) {
            alert('Report submitted successfully!');
        } else {
            alert('Error sending report! Please try again after some time.');
            //console.error('Error sending report:', data);
        }
        resetForm(); // Reset the form after showing the alert
    })
    .catch(error => {
        alert('Error sending report! Please try again after some time.');
        //console.error('Error:', error);
        resetForm(); // Reset the form after showing the alert
    });
}

function resetForm() {
    document.getElementById('report-form').reset(); // Reset the form fields
}

// Function to set user online status
function setUserOnlineStatus(userId, isOnline) {
    const userRef = database.ref('users').child(userId);
    userRef.update({ isOnline: isOnline });
}
// Function to check internet connection
function checkInternetConnection() {
    const offlineOverlay = document.getElementById('offlineOverlay');

    if (navigator.onLine) {
        //console.log('User is connected to the internet');
        // Hide the offline message
        offlineOverlay.style.display = 'none';
        // Retrieve the stored page URL
        const storedPage = localStorage.getItem('lastPage');
        if (storedPage) {
            // Redirect to the stored page URL if available
            window.location.href = storedPage;
            // Clear the stored page URL after redirecting
            localStorage.removeItem('lastPage');
        }
    } else {
        //console.log('User is disconnected from the internet');
        // Show the offline message
        offlineOverlay.style.display = 'flex';
        // Store the current page URL to redirect back to it later
        localStorage.setItem('lastPage', window.location.href);
    }
}

// Initialize the internet check every second
setInterval(checkInternetConnection, 10);

