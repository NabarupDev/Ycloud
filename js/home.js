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

const database = firebase.database();

function fetchAndDisplayUserInfo() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            const userId = user.uid;
            const userRef = database.ref('users').child(userId);

            // Fetch user data
            userRef.once('value', function (snapshot) {
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    displayUserInfo(userData);
                    displayUserCredits(userData);

                    // Start polling for credit changes
                    startCreditPolling(userId);

                    // Hide loader once data is available
                    document.getElementById('loaderContainer').style.display = 'none';

                    // Set user online status
                    setUserOnlineStatus(userId, true);

                    // Listen for window unload to update status
                    window.addEventListener('beforeunload', function () {
                        setUserOnlineStatus(userId, false);
                    });
                } else {
                    // User data not found
                    window.location.href = 'index.html';
                }
            });
        } else {
            // User is not signed in
            window.location.href = 'index.html';
        }
    });
}

// Function to display user information
function displayUserInfo(userData) {
    const userInfoContainer = document.getElementById('user-info-container');

    const userInfoElement = document.createElement('div');
    userInfoElement.classList.add('user-info');
    userInfoElement.innerHTML = `
        <strong>Welcome,</strong> ${userData.username}!
    `;

    userInfoContainer.innerHTML = '';
    userInfoContainer.appendChild(userInfoElement);
}

// Function to display user credits
function displayUserCredits(userData) {
    const userCreditsContainer = document.getElementById('user-credits-container');

    const userCreditsElement = document.createElement('div');
    userCreditsElement.classList.add('user-credits');
    userCreditsElement.innerHTML = `
        <strong>Credits:</strong> $${userData.credits}
    `;

    userCreditsContainer.innerHTML = '';
    userCreditsContainer.appendChild(userCreditsElement);
}

function startCreditPolling(userId) {
    setInterval(() => {
        const userRef = database.ref('users').child(userId);
        userRef.once('value', function (snapshot) {
            if (snapshot.exists()) {
                const userData = snapshot.val();
                const userCreditsContainer = document.querySelector('.user-credits');
                userCreditsContainer.innerHTML = `
                    <strong>Credits:</strong> $${userData.credits}
                `;
            }
        });
    }, 1000); 
}

function setUserOnlineStatus(userId, isOnline) {
    const userRef = database.ref('users').child(userId);
    userRef.update({
        isOnline: isOnline
    });
}

document.getElementById('logoutBtn').addEventListener('click', function () {
    firebase.auth().signOut().then(function () {
        window.location.href = 'index.html';
    }).catch(function (error) {
        console.error('Error signing out');
    });
});

document.getElementById('sendBtn').addEventListener('click', function () {
    const userCreditsContainer = document.querySelector('.user-credits');
    const creditsText = userCreditsContainer.textContent;
    const credits = parseFloat(creditsText.replace('Credits: $', ''));

    if (credits > 5) {
        // Redirect to sms.html
        window.location.href = 'bulk-sms.html';
    } else {
        // Show low credits dialog
        document.getElementById('lowCreditsDialog').showModal();
    }
});

document.getElementById('pricingLink').addEventListener('click', function (event) {
    event.preventDefault();  
    document.getElementById('pricingDialog').showModal();
});

document.getElementById('closeDialogBtn').addEventListener('click', function () {
    document.getElementById('pricingDialog').close();
});

document.getElementById('telegramLink').addEventListener('click', function (event) {
    event.preventDefault();
    window.open('https://t.me/nabarup_dev', '_blank');
});

document.getElementById('closeLowCreditsDialogBtn').addEventListener('click', function () {
    document.getElementById('lowCreditsDialog').close();
});

document.getElementById('contactAdminBtn').addEventListener('click', function () {
    window.open('https://t.me/nabarup_dev', '_blank');
});

document.getElementById('loaderContainer').style.display = 'flex';

fetchAndDisplayUserInfo();

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
setInterval(checkInternetConnection, 1000);

// Additional functions and event listeners
document.getElementById('logoutBtn').addEventListener('click', function () {
    firebase.auth().signOut().then(function () {
        window.location.href = 'index.html';
    }).catch(function (error) {
        //console.error('Error signing out');
    });
});