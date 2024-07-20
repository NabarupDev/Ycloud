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

// Variable to store previous user data
let previousUserData = {
    username: '',
    credits: ''
};

document.addEventListener('DOMContentLoaded', function () {
    // Show the loader
    document.getElementById('loaderContainer').style.display = 'flex';

    // Get the current user
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            const userId = user.uid;

            // Set user online status
            setUserOnlineStatus(userId, true);

            // Listen for window unload to update status
            window.addEventListener('beforeunload', function () {
                setUserOnlineStatus(userId, false);
            });

            // Check and update user details every second
            setInterval(checkAndUpdateUserDetails, 1000, userId);

            // Fetch and display SMS history
            fetchAndDisplayHistory(userId);
        } else {
            console.log('User is not signed in');
            window.location.href = 'index.html';
        }
    });
});

function updateAmount() {
    var recipientNumbers = document.getElementById('recipient-numbers').value;
    var amountInput = document.getElementById('amount');
    var commaCount = recipientNumbers.split(',').length - 1; // Count commas in input

    amountInput.value = commaCount + 1; // Set amount to number of commas + 1
}

function checkAndUpdateUserDetails(userId) {
    const userRef = database.ref('users').child(userId);

    userRef.once('value', function (snapshot) {
        if (snapshot.exists()) {
            const userData = snapshot.val();
            const username = userData.username;
            const credits = userData.credits;

            // Only update the UI if the data has changed
            if (username !== previousUserData.username || credits !== previousUserData.credits) {
                document.getElementById('username').textContent = `Welcome, ${userData.username}!`;
                document.getElementById('credits').innerHTML = `<strong>Credits: </strong> $${credits}`;
                document.getElementById('username-display').textContent = username; // Update the welcome message

                // Update the previous user data
                previousUserData = { username, credits };

                // Hide the loader once data is updated
                document.getElementById('loaderContainer').style.display = 'none';

                // Check if credits are less than 5
                if (credits < 5) {
                    window.location.href = 'home.html';
                }
            }
        } else {
            console.error('User data not found');
            window.location.href = 'index.html';
        }
    });
}

function setUserOnlineStatus(userId, isOnline) {
    const userRef = database.ref('users').child(userId);
    userRef.update({
        isOnline: isOnline
    });
}

function validateAndSendSMS() {
    const recipientNumbersInput = document.getElementById('recipient-numbers').value;
    const recipientNumbersArray = recipientNumbersInput.split(',');

    const amountInput = document.getElementById('amount');
    amountInput.value = recipientNumbersArray.length;

    if (recipientNumbersArray.length > 50) {
        alert('You can only send up to 50 SMS at a time.');
        return false;
    }
    return true;
}

function showTooltip() {
    document.getElementById('tooltipContent').style.display = 'block';
}

function hideTooltip() {
    document.getElementById('tooltipContent').style.display = 'none';
}

function fetchAndDisplayHistory(userId) {
    const historyRef = firebase.database().ref('history/' + userId).orderByChild('date').limitToLast(250);
    historyRef.on('value', function(snapshot) {
        const historyTableBody = document.getElementById('history-table-body');
        historyTableBody.innerHTML = ''; // Clear the table body

        let historyEntries = [];
        snapshot.forEach(function(childSnapshot) {
            historyEntries.push(childSnapshot.val());
        });

        // Reverse the order to display latest entries first
        historyEntries.reverse();

        historyEntries.forEach(function(historyData) {
            const row = document.createElement('tr');
            
            const dateCell = document.createElement('td');
            dateCell.textContent = historyData.date;
            row.appendChild(dateCell);
            
            const recipientCell = document.createElement('td');
            recipientCell.textContent = historyData.recipient;
            row.appendChild(recipientCell);
            
            const messageCell = document.createElement('td');
            const truncatedMessage = historyData.message.length > 30 ? historyData.message.substring(0, 30) + '...' : historyData.message;
            messageCell.textContent = truncatedMessage;
            messageCell.style.cursor = 'pointer';
            messageCell.addEventListener('click', function() {
                showMessageModal(historyData.message);
            });
            row.appendChild(messageCell);
            
            const statusCell = document.createElement('td');
            statusCell.textContent = historyData.status;
            row.appendChild(statusCell);
            
            historyTableBody.appendChild(row);
        });
    });
}

function showMessageModal(message) {
    const modal = document.getElementById('messageModal');
    const fullMessage = document.getElementById('fullMessage');
    fullMessage.textContent = message;
    modal.style.display = 'block';
}

document.getElementById('modalClose').addEventListener('click', function() {
    const modal = document.getElementById('messageModal');
    modal.style.display = 'none';
});
