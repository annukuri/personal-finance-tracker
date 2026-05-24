const API_URL = 'http://localhost:3000/api';
const authScreen = document.getElementById('auth-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginEmail =  document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const logoutButton = document.getElementById('logout-btn');
const registerEmail = document.getElementById('register-email');
const registerPassword = document.getElementById('register-password');
const registerUsername = document.getElementById('register-username');

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}
function checkAuthState() {
    const token = localStorage.getItem('token');
    if (token) {
        authScreen.classList.add('hidden');
        dashboardScreen.classList.remove('hidden');
        fetchSummary();
        fetchTransactions();
    } else {
        authScreen.classList.remove('hidden');
        dashboardScreen.classList.add('hidden');
    }
}
async function fetchSummary() {
    try {
        // 1. ADD THE MISSING AWAIT HERE:
        const response = await fetch(`${API_URL}/transactions/summary`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        
        const summary = await response.json();
        const totIncome = summary.totalIncome;
        const totExpense = summary.totalExpense;
        const netBalance = summary.netbalance;
        console.log('Summary data:', { totIncome, totExpense, netBalance });
        if (!response.ok) throw new Error(summary.message || 'Failed to load dashboard data');
        
        console.log(summary);

        // 2. MAP THE RECOVERED DATA TO YOUR VISUAL CARDS:
        document.getElementById('summary-income').textContent = `$${totIncome.toFixed(2)}`;
        document.getElementById('summary-expense').textContent = `$${totExpense.toFixed(2)}`;
        document.getElementById('summary-balance').textContent = `$${netBalance.toFixed(2)}`;

    } catch (err) {
        console.error("Error loading dashboard math:", err.message);
    }
}
async function fetchTransactions() 
{
    try{
        const response = await fetch(`${API_URL}/transactions`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        const transactions = await response.json();
        console.log('Fetched transactions:', transactions);
        if(!response.ok) throw new Error(transactions.message || 'Failed to load transactions');            
        const transactionsList = document.getElementById('transaction-list');
        transactionsList.innerHTML = '';
        if(transactions.length === 0){
            transactionsList.innerHTML = '<p>No transactions found. Start by adding some!</p>';
            return;
        }
        transactions.forEach(tx => {
            const txItem = document.createElement('li');
            txItem.className = `tx-item ${tx.Ttype}`;
            const formattedAmount = `$${tx.Amount.toFixed(2)}`;
            const rawDate = tx.date || tx.Date || Date.now();
            const formattedDate = new Date(rawDate).toLocaleDateString();
            txItem.innerHTML = `
            <div class="tx-header">
            <h5>${tx.TCategory}</h5>
            <span>${formattedDate}</span>
            <span>${tx.TCategory}</span>
            </div>
            <div class="tx-amount-actions">
            <span class="tx-amount ${tx.Ttype}">
            ${tx.Ttype === 'Income' ? '+' : '-'}${tx.Amount.toFixed(2)}
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
    transactionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const Ttype = document.getElementById('tx-type').value;
    const TCategory = document.getElementById('tx-category').value;
    const Amount = parseFloat(document.getElementById('tx-amount').value);
    const TDescrpt = document.getElementById('tx-desc').value;
    const tagsInput = document.getElementById('tx-tags').value;
    const Tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()) : [];
    // console.log('Adding transaction:', { Ttype: Ttype.value, TCategory: TCategory.value, Amount, TDescrpt: TDescrpt.value, Tags});
    //  });
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

checkAuthState();
logoutButton.addEventListener('click', () => {
    localStorage.removeItem('token');
    checkAuthState();
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginEmail.value;
    const password = loginPassword.value;
    console.log('Logging in user:', { email, password });
    try {   
        const response = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }) 
        });    
        const data = await response.json();
        if(!response.ok)throw new Error(data.message || 'Login failed');        
        localStorage.setItem('token', data.token);
        checkAuthState();
        loginForm.reset();
    } catch (err) {
        alert(err.message);
    }
});        
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = registerUsername.value;    
    const email = registerEmail.value;
    const password = registerPassword.value;
    console.log('Registering user:', { username, email, password });
    try {   
        const response = await fetch(`${API_URL}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }) 
        });
        const data = await response.json();
        if(!response.ok)throw new Error(data.message || 'Registration failed');        
        alert('Registration successful! Please log in.');
        registerForm.reset();
    } catch (err) {
        alert(err.message);
    }
});