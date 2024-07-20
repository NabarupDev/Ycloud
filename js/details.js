document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');

    if (userId) {
        loadUserDetails(userId);
        fetchAndMonitorSmsHistory(userId);
    } else {
        console.error('No userId found in the URL');
    }
});

function loadUserDetails(userId) {
    const database = firebase.database();
    const userRef = database.ref(`users/${userId}`);

    userRef.once('value').then(snapshot => {
        const userData = snapshot.val();
        if (userData) {
            displayUserDetails(userData);
        } else {
            console.error('User not found');
        }
    }).catch(error => {
        console.error('Error fetching user details:', error);
    });
}

function displayUserDetails(userData) {
    const userDetailsContainer = document.getElementById('user-details-container');
    userDetailsContainer.innerHTML = `
        <p><strong>Email:</strong> ${userData.email}</p>
        <p><strong>Username:</strong> ${userData.username}</p>
        <p><strong>Credits:</strong> ${userData.credits}</p>
        <p><strong>Status:</strong> ${userData.isOnline ? 'Online' : 'Offline'}</p>
    `;
}

function goBack() {
    window.history.back();
}

function fetchAndMonitorSmsHistory(userId) {
    const database = firebase.database();
    const historyRef = database.ref('history/' + userId);

    const data = {
        labels: [],
        failedData: [],
        successfulData: [],
        dateLabels: {}
    };

    function updateChart(snapshot) {
        const today = new Date();
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(today.getDate() - 60);

        const historyTableBody = document.getElementById('history-table-body');
        historyTableBody.innerHTML = '';

        data.labels = [];
        data.failedData = [];
        data.successfulData = [];
        data.dateLabels = {};

        let hasData = false;

        snapshot.forEach(childSnapshot => {
            hasData = true;
            const historyData = childSnapshot.val();
            const date = new Date(historyData.date);

            if (date >= sixtyDaysAgo && date <= today) {
                const formattedDate = date.toISOString().split('T')[0];
                const status = historyData.status;

                const row = historyTableBody.insertRow(0);
                row.insertCell(0).textContent = date.toLocaleString();
                row.insertCell(1).textContent = historyData.recipient;
                row.insertCell(2).textContent = historyData.message;
                row.insertCell(3).textContent = status;

                if (!data.dateLabels[formattedDate]) {
                    data.dateLabels[formattedDate] = { failed: 0, successful: 0 };
                    data.labels.push(formattedDate);
                }

                if (status === 'failed') {
                    data.dateLabels[formattedDate].failed++;
                } else if (status === 'success') {
                    data.dateLabels[formattedDate].successful++;
                }
            }
        });

        if (!hasData) {
            const row = historyTableBody.insertRow(0);
            row.insertCell(0).textContent = 'N/A';
            row.insertCell(1).textContent = 'N/A';
            row.insertCell(2).textContent = 'N/A';
            row.insertCell(3).textContent = 'N/A';
        } else {
            let labelsWithData = [];
            let failedDataWithData = [];
            let successfulDataWithData = [];

            data.labels.forEach(date => {
                labelsWithData.push(date);
                failedDataWithData.push(data.dateLabels[date].failed || 0);
                successfulDataWithData.push(data.dateLabels[date].successful || 0);
            });

            labelsWithData.unshift('');
            failedDataWithData.unshift(0);
            successfulDataWithData.unshift(0);

            const ctx = document.getElementById('smsStatusChart').getContext('2d');
            if (window.smsStatusChart && typeof window.smsStatusChart.destroy === 'function') {
                window.smsStatusChart.destroy();
            }
            window.smsStatusChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labelsWithData,
                    datasets: [{
                        label: 'Failed',
                        data: failedDataWithData,
                        borderColor: 'red',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.1,
                        pointRadius: 2
                    }, {
                        label: 'Successful',
                        data: successfulDataWithData,
                        borderColor: 'green',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.1,
                        pointRadius: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            display: true,
                            title: {
                                display: true,
                                text: 'Date'
                            },
                            ticks: {
                                color: 'black'
                            },
                            grid: {
                                color: '#cccccc'
                            }
                        },
                        y: {
                            display: true,
                            title: {
                                display: true,
                                text: 'Number of Messages'
                            },
                            ticks: {
                                color: 'black',
                                beginAtZero: true
                            },
                            grid: {
                                color: '#cccccc'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            labels: {
                                color: 'black'
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
    }

    historyRef.once('value').then(updateChart).catch(error => {
        console.error('Error fetching SMS history:', error);
    });

    historyRef.on('child_added', updateChart);
    historyRef.on('child_changed', updateChart);
    historyRef.on('child_removed', updateChart);
}
