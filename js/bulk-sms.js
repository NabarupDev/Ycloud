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

// Variable to store previous user data
let previousUserData = {
    username: '',
    credits: ''
};

document.addEventListener('DOMContentLoaded', function () {
    // Reset the form
    resetForm();

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
            setInterval(() => checkAndUpdateUserDetails(userId), 1000);

            // Fetch and display SMS history
            fetchAndDisplayHistory(userId);

            // Initialize and fetch SMS history for chart
            initChart();
            fetchSmsHistory(userId);
        } else {
            console.log('User is not signed in');
            window.location.href = 'index.html';
        }
    });
});

function resetForm() {
    document.getElementById('sms-form').reset();
    document.getElementById('recipient-numbers').value = '';
    document.getElementById('file-upload').value = null;
    document.getElementById('amount').value = 0;
    console.log('Form has been reset');
}

function updateAmount() {
    var recipientNumbers = document.getElementById('recipient-numbers').value;
    var amountInput = document.getElementById('amount');
    var commaCount = recipientNumbers.split(',').length - 1; // Count commas in input

    amountInput.value = commaCount + 1; // Set amount to number of commas + 1
}

function formatNumbers() {
    const inputField = document.getElementById('recipient-numbers');
    let numbers = inputField.value;

    // Add a comma before each '+' if it's not the first character and not already preceded by a comma
    numbers = numbers.replace(/([^,])\+/, '$1,+');

    // Split the string by comma to validate each number
    let numbersArray = numbers.split(',');

    // Check if each number starts with '+'
    let valid = numbersArray.every(number => number.trim().startsWith('+'));

    if (!valid) {
        alert('Each number must start with a "+" sign.');
        return;
    }

    // Join the array back into a single string
    inputField.value = numbersArray.join(',');
    updateAmount();
}

function validateAndSendSMS() {
    formatNumbers();  // Ensure the numbers are correctly formatted before proceeding

    const recipientNumbersInput = document.getElementById('recipient-numbers').value;
    const recipientNumbersArray = recipientNumbersInput.split(',').filter(num => num.trim() !== '');

    const amountInput = document.getElementById('amount');
    amountInput.value = recipientNumbersArray.length;

    if (recipientNumbersArray.length > 500) {
        alert('You can only send up to 500 SMS at a time.');
        return false;
    }
    return true;
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

function showTooltip() {
    document.getElementById('tooltipContent').style.display = 'block';
}

function hideTooltip() {
    document.getElementById('tooltipContent').style.display = 'none';
}

document.getElementById('viewAllBtn').addEventListener('click', function () {
    window.location.href = 'all-sms.html';
});

function fetchAndDisplayHistory(userId) {
    const historyRef = firebase.database().ref('history/' + userId).orderByChild('date').limitToLast(100);
    historyRef.on('value', function (snapshot) {
        const historyTableBody = document.getElementById('history-table-body');
        historyTableBody.innerHTML = ''; // Clear the table body

        let historyEntries = [];
        snapshot.forEach(function (childSnapshot) {
            historyEntries.push(childSnapshot.val());
        });

        // Reverse the order to display latest entries first
        historyEntries.reverse();

        historyEntries.forEach(function (historyData) {
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
            messageCell.addEventListener('click', function () {
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

document.getElementById('modalClose').addEventListener('click', function () {
    const modal = document.getElementById('messageModal');
    modal.style.display = 'none';
});

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const content = e.target.result;
            const numbers = content.split(/\s*,\s*/).filter(number => number.length > 0);
            document.getElementById('recipient-numbers').value = numbers.join(',');
            updateAmount();
        };
        reader.readAsText(file);
    } else {
        alert('Failed to load file');
    }
}

// Initialize the chart
function initChart() {
    const ctx = document.getElementById('smsStatusChart').getContext('2d');
    
    // Set canvas dimensions if necessary (optional since it's set in HTML)
    ctx.canvas.width = 600;  // Width in pixels
    ctx.canvas.height = 600; // Height in pixels

    window.smsStatusChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Failed',
                    backgroundColor: 'rgba(255, 99, 132, 0.3)', // Transparent red
                    borderColor: 'rgba(255, 99, 132, 1)',     // Solid red
                    data: [],
                    fill: false,
                    tension: 0.1, // Smooth lines
                },
                {
                    label: 'Successful',
                    backgroundColor: 'rgba(75, 192, 192, 0.3)', // Transparent green
                    borderColor: 'rgba(75, 192, 192, 1)',     // Solid green
                    data: [],
                    fill: false,
                    tension: 0.1, // Smooth lines
                }
            ]
        },
        options: {
            responsive: false, // Disable responsiveness to maintain fixed size
            maintainAspectRatio: false, // Allow custom sizing
            scales: {
                x: {
                    ticks: {
                        color: '#ffffff' // White color for x-axis labels
                    },
                    grid: {
                        color: '#ffffff' // White color for x-axis grid lines
                    }
                },
                y: {
                    ticks: {
                        color: '#ffffff' // White color for y-axis labels
                    },
                    grid: {
                        color: '#ffffff' // White color for y-axis grid lines
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff' // White color for legend text
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return context.dataset.label + ': ' + context.raw;
                        }
                    }
                }
            }
        }
    });
}



// Fetch SMS history for chart
function fetchSmsHistory(userId) {
    const historyRef = firebase.database().ref('history/' + userId)
        .orderByChild('date')
        .limitToLast(100);

    historyRef.once('value', function (snapshot) {
        let data = {
            labels: [],
            failedData: [],
            successfulData: [],
            dateLabels: {}
        };

        snapshot.forEach(function (childSnapshot) {
            const historyData = childSnapshot.val();
            const date = new Date(historyData.date);
            const formattedDate = date.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
            const status = historyData.status;

            if (!data.dateLabels[formattedDate]) {
                data.dateLabels[formattedDate] = { failed: 0, successful: 0 };
                data.labels.push(formattedDate);
            }

            if (status === 'failed') {
                data.dateLabels[formattedDate].failed++;
            } else if (status === 'success') {
                data.dateLabels[formattedDate].successful++;
            }
        });

        // Populate dataset arrays
        data.labels.forEach(date => {
            data.failedData.push(data.dateLabels[date].failed || 0);
            data.successfulData.push(data.dateLabels[date].successful || 0);
        });

        // Ensure data covers the last 7 days
        const today = new Date();
        const pastDate = new Date(today);
        pastDate.setDate(today.getDate() - 6); // 7 days including today

        let labelsWithData = [];
        let failedDataWithData = [];
        let successfulDataWithData = [];

        for (let i = 0; i < 7; i++) {
            const labelDate = new Date(pastDate);
            labelDate.setDate(pastDate.getDate() + i);
            const label = labelDate.toISOString().split('T')[0];
            labelsWithData.push(label);

            const index = data.labels.indexOf(label);
            failedDataWithData.push(index !== -1 ? data.failedData[index] : 0);
            successfulDataWithData.push(index !== -1 ? data.successfulData[index] : 0);
        }

        // Update the chart with data
        window.smsStatusChart.data.labels = labelsWithData;
        window.smsStatusChart.data.datasets[0].data = failedDataWithData;
        window.smsStatusChart.data.datasets[1].data = successfulDataWithData;
        window.smsStatusChart.update();
    });
}
// Function to check internet connection
function checkInternetConnection() {
    const offlineOverlay = document.getElementById('offlineOverlay');

    if (navigator.onLine) {
        console.log('User is connected to the internet');
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
        console.log('User is disconnected from the internet');
        // Show the offline message
        offlineOverlay.style.display = 'flex';
        // Store the current page URL to redirect back to it later
        localStorage.setItem('lastPage', window.location.href);
    }
}

// Initialize the internet check every second
setInterval(checkInternetConnection, 10);

// Additional functions and event listeners
document.getElementById('logoutBtn').addEventListener('click', function () {
    firebase.auth().signOut().then(function () {
        window.location.href = 'index.html';
    }).catch(function (error) {
        //console.error('Error signing out');
    });
});