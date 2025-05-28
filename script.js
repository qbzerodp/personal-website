document.addEventListener('DOMContentLoaded', async () => {
    // Initialize API endpoints
    const API_BASE = 'http://localhost:5000/api';

    // Toast Queue
    const toastQueue = [];
    const toastTimeouts = new Map();
    const defaultDurations = {
        error: 5000,
        success: 3000,
        warning: 4000,
        info: 3500,
        loading: 0, // Will be cleared manually
        confirmation: 0 // Will be cleared manually
    };

    // Toast Counter
    let toastCount = 0;
    const updateToastCounter = () => {
        const counter = document.getElementById('toast-count');
        if (counter) {
            counter.textContent = toastCount;
            const counterElement = document.getElementById('toast-counter');
            if (counterElement) {
                counterElement.classList.toggle('show', toastCount > 0);
            }
        }
    };

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Close all toasts
            toastQueue.forEach(toast => {
                closeToast(toast.id);
            });
            toastQueue.length = 0;
            toastCount = 0;
            updateToastCounter();
        } else if (e.key === 'Enter' && toastQueue.length > 0) {
            // Show next toast immediately
            processToastQueue();
        }
    });

    // Click handler for toast counter
    document.getElementById('toast-counter').addEventListener('click', () => {
        // Close all toasts
        toastQueue.forEach(toast => {
            closeToast(toast.id);
        });
        toastQueue.length = 0;
        toastCount = 0;
        updateToastCounter();
    });

    // Toast functionality
    const showToast = (message, type = 'error', duration = defaultDurations[type]) => {
        const toastId = `${type}-toast`;
        const toast = document.getElementById(toastId);
        const messageElement = document.getElementById(`${type}-message`);
        
        if (!toast) {
            console.error(`Toast container for type ${type} not found`);
            return;
        }

        // Clear existing timeout if any
        if (toastTimeouts.has(toastId)) {
            clearTimeout(toastTimeouts.get(toastId));
        }

        // Add to queue
        toastQueue.push({
            id: toastId,
            message: message,
            duration: duration
        });

        // Increment toast count
        toastCount++;
        updateToastCounter();

        // Process queue
        processToastQueue();
    };

    const processToastQueue = () => {
        if (toastQueue.length === 0) return;

        const current = toastQueue[0];
        const toast = document.getElementById(current.id);
        const messageElement = document.getElementById(`${current.id.replace('-toast', '')}-message`);

        if (toast) {
            messageElement.textContent = current.message;
            toast.classList.remove('hidden');

            // Set timeout to remove toast
            const timeout = setTimeout(() => {
                closeToast(current.id);
                toastQueue.shift();
                toastCount--;
                updateToastCounter();
                processToastQueue();
            }, current.duration);

            toastTimeouts.set(current.id, timeout);
        }
    };

    const closeToast = (toastId) => {
        const toast = document.getElementById(toastId);
        if (toast) {
            // Clear timeout if any
            if (toastTimeouts.has(toastId)) {
                clearTimeout(toastTimeouts.get(toastId));
                toastTimeouts.delete(toastId);
            }

            // Remove from queue
            const index = toastQueue.findIndex(t => t.id === toastId);
            if (index > -1) {
                toastQueue.splice(index, 1);
                toastCount--;
                updateToastCounter();
            }

            // Hide toast
            toast.classList.add('hidden');
        }
    };

    // Confirmation toast functionality
    let confirmCallback = null;
    const showConfirmation = (message, onConfirm) => {
        confirmCallback = onConfirm;
        showToast(message, 'confirmation');
    };

    const confirmAction = () => {
        if (confirmCallback) {
            confirmCallback();
        }
        closeToast('confirmation-toast');
    };

    // Loading toast functionality
    const showLoading = (message) => {
        showToast(message, 'loading');
    };

    const hideLoading = () => {
        closeToast('loading-toast');
    };

    // Helper function for API calls with error handling
    const apiCall = async (endpoint, options = {}) => {
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, options);
            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(error.error || `HTTP error! status: ${response.status}`);
            }
            return response.json();
        } catch (error) {
            console.error('API Error:', error);
            showToast(error.message || 'An error occurred. Please try again.');
            throw error;
        }
    };

    // Theme toggle functionality
    const themeToggle = document.querySelector('.theme-toggle');
    const body = document.body;

    // Get initial theme from backend
    try {
        const theme = await apiCall('/theme');
        body.setAttribute('data-theme', theme.mode || 'light');
        themeToggle.innerHTML = theme.mode === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    } catch (error) {
        console.error('Error fetching theme:', error);
        body.setAttribute('data-theme', 'light');
    }

    themeToggle.addEventListener('click', async () => {
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        try {
            await apiCall('/update-theme', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ mode: newTheme })
            });
            
            body.setAttribute('data-theme', newTheme);
            themeToggle.innerHTML = newTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', newTheme);
        } catch (error) {
            console.error('Error updating theme:', error);
            alert('Failed to update theme. Please try again.');
        }
    });

    themeToggle.addEventListener('click', () => {
        const newTheme = body.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggle.innerHTML = newTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });

    // Typing animation
    const typingText = document.querySelector('.typing-text');
    const phrases = ['Send and receive Bitcoin', 'Secure transactions', 'Fast and reliable'];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeEffect() {
        const currentPhrase = phrases[phraseIndex];
        if (isDeleting) {
            typingText.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingText.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
        }

        if (!isDeleting && charIndex === currentPhrase.length) {
            isDeleting = true;
            setTimeout(typeEffect, 1000);
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            setTimeout(typeEffect, 500);
        } else {
            setTimeout(typeEffect, isDeleting ? 50 : 150);
        }
    }

    // Start typing animation
    typeEffect();

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            target.scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Bitcoin transaction handling
    const sendForm = document.getElementById('send-form');
    const transactionsList = document.getElementById('transactions-list');

    // Get initial configuration
    try {
        const config = await apiCall('/config');
        console.log('Website config:', config);
    } catch (error) {
        console.error('Error fetching config:', error);
    }

    if (sendForm) {
        sendForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const recipient = document.getElementById('recipient').value;
            const amount = parseFloat(document.getElementById('amount').value);
            const memo = document.getElementById('memo').value;

            // Validate inputs
            if (!recipient || !amount || amount <= 0) {
                alert('Please provide a valid recipient and amount');
                return;
            }

            // Create transaction object
            const transaction = {
                recipient,
                amount,
                memo,
                timestamp: new Date().toISOString(),
                status: 'pending'
            };

            // Add transaction to list
            addTransactionToUI(transaction);

            // Here you would typically:
            // 1. Connect to a Bitcoin node
            // 2. Create a raw transaction
            // 3. Sign the transaction
            // 4. Broadcast to the network
            // For this demo, we'll just simulate the process

            // Simulate transaction processing
            setTimeout(() => {
                transaction.status = 'success';
                updateTransactionStatus(transaction);
                alert('Transaction successful!');
            }, 2000);
        });
    }

    // Add transaction to UI
    function addTransactionToUI(transaction) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(transaction.timestamp).toLocaleString()}</td>
            <td>Send</td>
            <td>${transaction.amount} BTC</td>
            <td><span class="status ${transaction.status}">${transaction.status}</span></td>
        `;
        transactionsList.appendChild(row);
    }

    // Update transaction status
    function updateTransactionStatus(transaction) {
        const rows = transactionsList.getElementsByTagName('tr');
        for (const row of rows) {
            const cells = row.getElementsByTagName('td');
            if (cells[0].textContent === new Date(transaction.timestamp).toLocaleString()) {
                const statusCell = cells[3];
                statusCell.innerHTML = `<span class="status ${transaction.status}">${transaction.status}</span>`;
            }
        }
    }

    // Initialize demo transactions
    const demoTransactions = [
        {
            recipient: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
            amount: 0.001,
            memo: 'Test transaction',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            status: 'success'
        },
        {
            recipient: '1HB5XMLmzFVj8ALj6mfBsbifRoD4miY36v',
            amount: 0.002,
            memo: 'Donation',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            status: 'success'
        }
    ];

    // Add demo transactions to UI
    demoTransactions.forEach(addTransactionToUI);
});
