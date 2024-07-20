class AdminDashboard {
    constructor() {
        this.database = firebase.database();
        this.auth = firebase.auth();
        this.init();
    }

    init() {
        document.getElementById('logout-button').addEventListener('click', () => this.logout());
        document.getElementById('search-input').addEventListener('input', () => this.loadUsers());

        this.auth.onAuthStateChanged(user => {
            if (user) {
                this.loadAdminUsername(user.uid);
                this.loadUsers();
                this.monitorUserStatus();
            } else {
                window.location.href = 'admin-login.html';
            }
        });
    }

    showLoader() {
        document.getElementById('loader-container').style.display = 'flex';
    }

    hideLoader() {
        document.getElementById('loader-container').style.display = 'none';
    }

    showToast(message) {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.classList.add('toast');
        toast.textContent = message;

        toastContainer.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    loadAdminUsername(adminId) {
        this.database.ref(`users/admin/${adminId}`).once('value').then(snapshot => {
            const adminData = snapshot.val();
            document.getElementById('admin-username-span').textContent = adminData.username;
        });
    }

    loadUsers() {
        this.showLoader();
        this.database.ref('users').once('value').then(snapshot => {
            const users = snapshot.val();
            this.populateUserTable(users);
        }).catch(error => {
            console.error('Error loading users:', error);
            this.showToast('Error loading users');
        }).finally(() => {
            this.hideLoader();
        });
    }

    populateUserTable(users) {
        const userTableBody = document.getElementById('user-table').getElementsByTagName('tbody')[0];
        userTableBody.innerHTML = '';
    
        const sortedUsers = Object.keys(users)
            .filter(userId => !userId.startsWith('admin') && users[userId].email)  // Ensure email exists
            .map(userId => ({ userId, ...users[userId] }))
            .sort((a, b) => a.email.localeCompare(b.email));
    
        const searchQuery = document.getElementById('search-input').value.toLowerCase();
    
        sortedUsers.forEach(user => {
            if (user.email.toLowerCase().includes(searchQuery) || user.username.toLowerCase().includes(searchQuery)) {
                const row = userTableBody.insertRow();
                row.insertCell(0).textContent = user.email;
    
                const usernameCell = row.insertCell(1);
                const usernameLink = document.createElement('a');
                usernameLink.textContent = user.username;
                usernameLink.href = `details.html?userId=${user.userId}`;
                usernameLink.classList.add('username-link');
                usernameCell.appendChild(usernameLink);
    
                const statusIndicator = document.createElement('span');
                statusIndicator.className = user.isOnline ? 'online-status' : 'offline-status';
                statusIndicator.id = `status-${user.userId}`;
                usernameCell.appendChild(statusIndicator);
    
                const creditsCell = row.insertCell(2);
                creditsCell.textContent = user.credits;
    
                const actionsCell = row.insertCell(3);
                const editButton = document.createElement('button');
                editButton.textContent = 'Edit';
                editButton.setAttribute('data-user-id', user.userId);
                editButton.setAttribute('data-credits', user.credits);
                editButton.classList.add('edit-button');
                editButton.addEventListener('click', (e) => this.openEditCredits(e));
                actionsCell.appendChild(editButton);
    
                const editContainer = this.createEditContainer(user.userId, user.credits);
                actionsCell.appendChild(editContainer);
            }
        });
    }
    

    createEditContainer(userId, oldCredits) {
        const editContainer = document.createElement('div');
        editContainer.classList.add('edit-container');
        editContainer.style.display = 'none';

        const creditsInput = document.createElement('input');
        creditsInput.type = 'number';
        creditsInput.value = oldCredits;
        creditsInput.classList.add('credits-input');
        editContainer.appendChild(creditsInput);

        const updateButton = document.createElement('button');
        updateButton.textContent = 'Update';
        updateButton.classList.add('update-button');
        updateButton.addEventListener('click', (e) => this.updateCredits(e, userId, oldCredits, creditsInput));
        editContainer.appendChild(updateButton);

        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.classList.add('cancel-button');
        cancelButton.addEventListener('click', (e) => this.cancelEdit(e));
        editContainer.appendChild(cancelButton);

        return editContainer;
    }

    openEditCredits(event) {
        const editContainer = event.target.nextElementSibling;
        event.target.style.display = 'none';
        editContainer.style.display = 'flex';
    }

    updateCredits(event, userId, oldCredits, creditsInput) {
        const newCredits = parseInt(creditsInput.value);
    
        if (isNaN(newCredits) || newCredits < 0) {
            this.showToast('Credits cannot be negative or empty');
            return;
        }
    
        if (newCredits === oldCredits) {
            this.cancelEdit(event);
            return;
        }
    
        this.database.ref(`users/${userId}`).update({ credits: newCredits })
            .then(() => {
                this.showToast('Credits updated successfully');
                this.cancelEdit(event);
    
                this.database.ref(`users/${userId}`).once('value').then(snapshot => {
                    const userData = snapshot.val();
                    sendEmail(userData.email, userData.username, oldCredits, newCredits, this.showToast);
                });
    
                this.loadUsers();
            })
            .catch(error => {
                this.showToast('Error updating credits');
                console.error('Error updating credits:', error);
            });
    }
    

    cancelEdit(event) {
        const editContainer = event.target.parentElement;
        const editButton = editContainer.previousElementSibling;
        editButton.style.display = 'inline';
        editContainer.style.display = 'none';
    }

    monitorUserStatus() {
        this.database.ref('users').on('child_changed', snapshot => {
            const userId = snapshot.key;
            const user = snapshot.val();
            const statusIndicator = document.getElementById(`status-${userId}`);
            if (statusIndicator) {
                statusIndicator.className = user.isOnline ? 'online-status' : 'offline-status';
            }
        });
    }

    logout() {
        this.auth.signOut().then(() => {
            this.showToast('Logged out successfully');
            window.location.href = 'admin-login.html';
        }).catch(error => {
            this.showToast('Error logging out');
            console.error('Error logging out:', error);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const adminDashboard = new AdminDashboard();
});

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
document.getElementById('report-button').addEventListener('click', () => {
    window.location.href = 'admin-report.html';
});
