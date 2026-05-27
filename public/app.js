const API_URL = 'http://localhost:3000/api';

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const logoutButton = document.getElementById('logout-btn');
const registerEmail = document.getElementById('register-email');
const registerPassword = document.getElementById('register-password');
const registerUsername = document.getElementById('register-username');
let financialChartInstance = null;

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

function checkAuthState() {
    const token = localStorage.getItem('token');
    const currentURL = window.location.pathname;

    if (token) {
        if (currentURL === '/' || currentURL.endsWith('index.html') || currentURL.endsWith('register.html')) {
            window.location.href = 'dashboard.html';
            return;
        }
        if (currentURL.endsWith('dashboard.html')) {
            fetchSummary();
            fetchTransactions();
        }
    } else {
        if (currentURL.endsWith('dashboard.html')) {
            window.location.href = 'index.html';
        }
    }
}

async function fetchSummary() {
    try {
        const response = await fetch(`${API_URL}/transactions/summary`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        
        const summary = await response.json();
        if (!response.ok) throw new Error(summary.message || 'Failed to load dashboard data');

        const totIncome = summary.totalIncome || 0;
        const totExpense = summary.totalExpense || 0;
        const netBalance = summary.netbalance || 0;

        // Check if DOM target wrappers exist before injecting values
        const incEl = document.getElementById('summary-income');
        const expEl = document.getElementById('summary-expense');
        const balEl = document.getElementById('summary-balance');

        if (incEl) incEl.textContent = `$${totIncome.toFixed(2)}`;
        if (expEl) expEl.textContent = `$${totExpense.toFixed(2)}`;
        if (balEl) balEl.textContent = `$${netBalance.toFixed(2)}`;
        
        if (document.getElementById('financialChart')) {
            updateChart(totIncome, totExpense);
        }
    } catch (err) {
        console.error("Error loading dashboard math:", err.message);
    }
}

function runSlideshow() {
    const slides = document.querySelectorAll('.slide');
    if (slides.length === 0) return; 
    
    let currentSlideIndex = 0;
    setInterval(() => {
        slides[currentSlideIndex].classList.remove('active');
        currentSlideIndex = (currentSlideIndex + 1) % slides.length;
        slides[currentSlideIndex].classList.add('active');
    }, 4500);
}
runSlideshow();

function updateChart(income, expense) {
    const chartCanvas = document.getElementById('financialChart');
    if (!chartCanvas) return;

    const ctx = chartCanvas.getContext('2d');
    if (financialChartInstance) {
        financialChartInstance.destroy();
    }
    let chartData = [income, expense];
    let chartColors = ['#10B981', '#EF4444'];

    if (income === 0 && expense === 0) {
        chartData = [1, 1];
        chartColors = ['#E5E7EB', '#D1D5DB'];
    }

    financialChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Income', 'Expenses'],
            datasets: [{
                data: chartData,
                backgroundColor: chartColors,
                borderWidth: 2,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#374151',
                        font: { size: 14, weight: 'bold' }
                    }
                }
            }
        }
    });
}

async function fetchTransactions() {
    try {
        const response = await fetch(`${API_URL}/transactions`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        const transactions = await response.json();
        if (!response.ok) throw new Error(transactions.message || 'Failed to load transactions');            
        
        const transactionsList = document.getElementById('transaction-list');
        if (!transactionsList) return;
        
        transactionsList.innerHTML = '';
        if (transactions.length === 0) {
            transactionsList.innerHTML = '<p class="empty-msg">No transactions found. Start by adding some!</p>';
            return;
        }

        transactions.forEach(tx => {
            const txItem = document.createElement('li');
            txItem.className = `tx-item ${tx.Ttype}`;
            const rawDate = tx.date || tx.Date || Date.now();
            const formattedDate = new Date(rawDate).toLocaleDateString();
            
            txItem.innerHTML = `
                <div class="tx-header">
                    <h5>${tx.TCategory}</h5>
                    <span>${formattedDate}</span>
                </div>
                <div class="tx-amount-actions">
                    <span class="tx-amount ${tx.Ttype}">
                        ${tx.Ttype === 'Income' ? '+' : '-'}$${tx.Amount.toFixed(2)}
                    </span>
                    <button class="delete-tx-btn" onclick="deleteTransaction('${tx._id}')">x</button>
                </div>
            `;
            transactionsList.appendChild(txItem);
        });
    } catch (err) {
        console.error("Error loading transactions:", err.message);
    }
}

const transactionForm = document.getElementById('transaction-form');
if (transactionForm) {
    transactionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const Ttype = document.getElementById('tx-type').value;
        const TCategory = document.getElementById('tx-category').value;
        const Amount = parseFloat(document.getElementById('tx-amount').value);
        const TDescrpt = document.getElementById('tx-desc').value;
        const tagsInput = document.getElementById('tx-tags').value;
        const Tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()) : [];

        try {
            const response = await fetch(`${API_URL}/transactions`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ Ttype, TCategory, Amount, TDescrpt, Tags })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to add transaction');
            alert('Transaction added successfully');
            transactionForm.reset();
            fetchSummary();
            fetchTransactions();
        } catch (err) {
            alert(err.message);
        }
    });
}

window.deleteTransaction = async function(id) {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    try {
        const response = await fetch(`${API_URL}/transactions/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to delete transaction');
        alert('Transaction deleted successfully');
        fetchSummary();
        fetchTransactions();
    } catch (err) {
        alert(err.message);
    }
};

if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('token');
        checkAuthState();
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = loginEmail.value;
        const password = loginPassword.value;
        try {   
            const response = await fetch(`${API_URL}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }) 
            });    
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Login failed');        
            
            localStorage.setItem('token', data.token);
            loginForm.reset();
            checkAuthState(); // Triggers relocation redirect instantly
        } catch (err) {
            alert(err.message);
        }
    }); 
}

if (registerForm) {       
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = registerUsername.value;    
        const email = registerEmail.value;
        const password = registerPassword.value;
        try {   
            const response = await fetch(`${API_URL}/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }) 
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Registration failed');        
            
            alert('Registration successful! Please log in.');
            registerForm.reset();
            window.location.href = 'index.html'; // Direct back to secure login page
        } catch (err) {
            alert(err.message);
        }
    });
}

checkAuthState();