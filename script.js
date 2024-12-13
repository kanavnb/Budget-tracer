const form = document.getElementById('transaction-form');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const transactionList = document.getElementById('transaction-list');
const filterCategory = document.getElementById('filter-category');
const totalBalanceElem = document.getElementById('total-balance');
const totalIncomeElem = document.getElementById('total-income');
const totalExpensesElem = document.getElementById('total-expenses');
const monthlyReportElem = document.getElementById('monthly-report');
const incomeExpenseChartElem = document.getElementById('income-expense-chart');

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

function saveToLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function deleteTransaction(index) {
    transactions.splice(index, 1);
    saveToLocalStorage();
    updateUI();
    createCharts();
}

function updateUI(filter = '') {
    const filteredTransactions = filter
        ? transactions.filter(t => t.category === filter)
        : transactions;

    transactionList.innerHTML = '';
    filteredTransactions.forEach((transaction, index) => {
        const item = document.createElement('div');
        item.className = 'transaction';
        item.innerHTML = `
      <span>${transaction.description} (${transaction.category})</span>
      <span>${transaction.amount > 0 ? '+' : ''}${transaction.amount}</span>
      <button class="delete-btn" onclick="deleteTransaction(${index})">Удалить</button>
    `;
        transactionList.appendChild(item);
    });

    const income = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const totalBalance = income - expenses;

    totalBalanceElem.textContent = `$${totalBalance}`;
    totalIncomeElem.textContent = `$${income}`;
    totalExpensesElem.textContent = `$${expenses}`;
}

function createCharts() {
    const income = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const ctx = incomeExpenseChartElem.getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Доход', 'Расходы'],
            datasets: [{
                data: [income, expenses],
                backgroundColor: ['#2ecc71', '#e74c3c']
            }]
        },
        options: { responsive: true }
    });
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const description = descriptionInput.value;
    const amount = parseFloat(amountInput.value);
    const category = categoryInput.value;

    if (description && !isNaN(amount) && category) {
        const newTransaction = { description, amount, category, date: new Date().toISOString() };
        transactions.push(newTransaction);

        saveToLocalStorage();
        descriptionInput.value = '';
        amountInput.value = '';
        categoryInput.value = '';

        updateUI();
        createCharts();
    } else {
        alert('Введите корректные данные.');
    }
});

// Фильтр
filterCategory.addEventListener('change', (e) => {
    updateUI(e.target.value);
});

// Инициализация
updateUI();
