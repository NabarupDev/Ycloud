// Your Firebase configuration
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

document.addEventListener('DOMContentLoaded', function () {
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

            // Fetch and display all SMS history
            fetchAndDisplayAllHistory(userId);
        } else {
            window.location.href = 'index.html';
        }
    });
});

function setUserOnlineStatus(userId, isOnline) {
    const userRef = database.ref('users').child(userId);
    userRef.update({
        isOnline: isOnline
    });
}

function fetchAndDisplayAllHistory(userId) {
    // Show the loader
    const loaderContainer = document.getElementById('loaderContainer');
    loaderContainer.style.display = 'flex';

    const historyRef = firebase.database().ref('history/' + userId).orderByChild('date');
    historyRef.on('value', function(snapshot) {
        const historyTableBody = document.getElementById('all-history-table-body');
        historyTableBody.innerHTML = ''; // Clear the table body

        // Create an array to store the history entries
        const historyEntries = [];

        snapshot.forEach(function(childSnapshot) {
            const historyData = childSnapshot.val();
            historyEntries.push(historyData);
        });

        // Sort the history entries in descending order by date
        historyEntries.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Display the sorted history entries
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

        // Hide the loader after data is fetched
        loaderContainer.style.display = 'none';
    });
}

function showMessageModal(message) {
    const modal = document.getElementById('messageModal');
    const fullMessage = document.getElementById('fullMessage');
    if (modal && fullMessage) {  // Check if elements exist
        fullMessage.textContent = message;
        modal.style.display = 'block';
    } else {
        console.error('Modal elements not found');
    }
}

document.getElementById('modalClose').addEventListener('click', function() {
    const modal = document.getElementById('messageModal');
    if (modal) {
        modal.style.display = 'none';
    }
});
