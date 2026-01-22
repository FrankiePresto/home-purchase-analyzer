/**
 * Home Purchase Analyzer - Main Application
 * Orchestrates UI, calculations, and data management
 */

// Global application state
const appState = {
    currentScenario: null,
    savedScenarios: [],
    selectedTab: 'calculator',
    comparisonSelection: [],
    analysisTimeframe: 30,
    charts: {}
};

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

/**
 * Initialize the application
 */
function initApp() {
    console.log('Initializing Home Purchase Analyzer...');

    // Load saved scenarios
    appState.savedScenarios = loadScenarios();

    // Set up event listeners
    setupEventListeners();

    // Initialize with default values
    updateDownPaymentAmount();

    // Restore last state if available
    const settings = loadSettings();
    if (settings) {
        document.getElementById('investment-return').value = settings.defaultInvestmentReturn || 8.0;
        document.getElementById('appreciation-rate').value = settings.defaultAppreciation || 3.0;
        document.getElementById('appreciation-rate-number').value = settings.defaultAppreciation || 3.0;
    }

    console.log('Application initialized successfully');
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });

    // Down payment slider sync
    const downPaymentSlider = document.getElementById('down-payment-percent');
    const downPaymentNumber = document.getElementById('down-payment-percent-number');

    downPaymentSlider.addEventListener('input', function() {
        downPaymentNumber.value = this.value;
        updateDownPaymentAmount();
    });

    downPaymentNumber.addEventListener('input', function() {
        downPaymentSlider.value = this.value;
        updateDownPaymentAmount();
    });

    // Purchase price change
    document.getElementById('purchase-price').addEventListener('input', updateDownPaymentAmount);

    // Appreciation rate slider sync
    const appreciationSlider = document.getElementById('appreciation-rate');
    const appreciationNumber = document.getElementById('appreciation-rate-number');

    appreciationSlider.addEventListener('input', function() {
        appreciationNumber.value = this.value;
    });

    appreciationNumber.addEventListener('input', function() {
        appreciationSlider.value = this.value;
    });

    // Calculate button
    document.getElementById('calculate-btn').addEventListener('click', handleCalculate);

    // Save scenario button
    document.getElementById('save-scenario-btn').addEventListener('click', handleSaveScenario);

    // Compare scenarios button
    document.getElementById('compare-scenarios-btn').addEventListener('click', handleCompareScenarios);

    // Export scenarios button
    document.getElementById('export-scenarios-btn').addEventListener('click', function() {
        exportToJSON();
    });

    // Update analysis button
    document.getElementById('update-analysis-btn').addEventListener('click', handleUpdateAnalysis);

    // Compare houses button
    document.getElementById('compare-houses-btn').addEventListener('click', handleCompareHouses);

    // Preset timeframe buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active state
            document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Update timeframe input
            const years = parseInt(this.dataset.years);
            document.getElementById('timeframe').value = years;
            appState.analysisTimeframe = years;
        });
    });

    // Timeframe input
    document.getElementById('timeframe').addEventListener('change', function() {
        appState.analysisTimeframe = parseInt(this.value);
        // Update preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.years) === appState.analysisTimeframe);
        });
    });
}

/**
 * Switch between tabs
 */
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-tab`);
    });

    appState.selectedTab = tabName;

    // Load tab-specific data
    if (tabName === 'compare') {
        displayScenarioList();
    }
}

/**
 * Update down payment amount based on price and percentage
 */
function updateDownPaymentAmount() {
    const price = parseFloat(document.getElementById('purchase-price').value) || 0;
    const percent = parseFloat(document.getElementById('down-payment-percent').value) || 0;
    const amount = price * (percent / 100);

    document.getElementById('down-payment-amount').value = amount.toFixed(0);
}

/**
 * Handle calculate button click
 */
function handleCalculate() {
    // Gather all form inputs
    const propertyInfo = {
        purchasePrice: parseFloat(document.getElementById('purchase-price').value) || 0,
        downPaymentPercent: parseFloat(document.getElementById('down-payment-percent').value) || 0,
        downPaymentAmount: parseFloat(document.getElementById('down-payment-amount').value) || 0,
        interestRate: parseFloat(document.getElementById('interest-rate').value) || 0,
        loanTerm: parseInt(document.getElementById('loan-term').value) || 30,
        propertyTax: parseFloat(document.getElementById('property-tax').value) || 0,
        insurance: parseFloat(document.getElementById('insurance').value) || 0,
        hoa: parseFloat(document.getElementById('hoa').value) || 0,
        utilities: parseFloat(document.getElementById('utilities').value) || 0,
        maintenance: parseFloat(document.getElementById('maintenance').value) || 0
    };

    const incomeInfo = {
        annualIncome: parseFloat(document.getElementById('annual-income').value) || 0,
        monthlyDebts: parseFloat(document.getElementById('monthly-debts').value) || 0,
        investmentReturn: parseFloat(document.getElementById('investment-return').value) || 8.0,
        currentPortfolio: parseFloat(document.getElementById('current-portfolio').value) || 0
    };

    // Calculate loan amount
    const loanAmount = propertyInfo.purchasePrice - propertyInfo.downPaymentAmount;

    // Calculate PMI
    const pmi = calculatePMI(loanAmount, propertyInfo.purchasePrice, propertyInfo.downPaymentPercent);

    // Calculate monthly payment breakdown
    const paymentBreakdown = calculateTotalMonthlyPayment(
        loanAmount,
        propertyInfo.interestRate,
        propertyInfo.loanTerm,
        propertyInfo.propertyTax,
        propertyInfo.insurance,
        propertyInfo.hoa,
        pmi
    );

    // Calculate total monthly cost (including utilities and maintenance)
    const totalMonthlyCost = paymentBreakdown.totalPayment + propertyInfo.utilities + propertyInfo.maintenance;

    // Calculate affordability ratios
    const monthlyIncome = incomeInfo.annualIncome / 12;
    const affordability = calculateAffordabilityRatios(
        paymentBreakdown.totalPayment,
        monthlyIncome,
        incomeInfo.monthlyDebts
    );

    // Calculate opportunity cost (down payment invested for 10 years)
    const opportunityCost = calculateInvestmentGrowth(
        propertyInfo.downPaymentAmount,
        0,
        incomeInfo.investmentReturn,
        10
    );

    // Store calculations
    const calculations = {
        ...paymentBreakdown,
        loanAmount,
        totalMonthlyCost,
        affordability,
        opportunityCost: opportunityCost[opportunityCost.length - 1]
    };

    // Update current scenario
    appState.currentScenario = {
        propertyInfo,
        incomeInfo,
        calculations
    };

    // Display results
    displayResults(calculations, propertyInfo, incomeInfo);
}

/**
 * Display calculation results
 */
function displayResults(calculations, propertyInfo, incomeInfo) {
    // Update summary cards
    document.getElementById('monthly-payment').textContent = formatCurrency(calculations.totalPayment);
    document.getElementById('monthly-payment-detail').textContent =
        `P&I: ${formatCurrency(calculations.principalAndInterest)}${calculations.pmi > 0 ? ` + PMI: ${formatCurrency(calculations.pmi)}` : ''}`;

    document.getElementById('total-monthly-cost').textContent = formatCurrency(calculations.totalMonthlyCost);

    document.getElementById('affordability-ratio').textContent = formatPercent(calculations.affordability.housingRatio, 1);
    document.getElementById('affordability-status').textContent = getAffordabilityStatusText(calculations.affordability.status);

    // Update progress bar
    const progressBar = document.getElementById('affordability-progress');
    const progressPercent = Math.min(calculations.affordability.housingRatio, 100);
    progressBar.style.width = `${progressPercent}%`;
    progressBar.className = `progress-fill ${calculations.affordability.status}`;

    document.getElementById('opportunity-cost').textContent = formatCurrency(calculations.opportunityCost.value);

    // Render payment breakdown chart
    renderPaymentBreakdown(calculations);
}

/**
 * Get affordability status text
 */
function getAffordabilityStatusText(status) {
    const statusMap = {
        'excellent': 'Excellent - Well within guidelines',
        'good': 'Good - Within acceptable range',
        'caution': 'Caution - Approaching limits',
        'warning': 'Warning - Exceeds typical guidelines'
    };
    return statusMap[status] || status;
}

/**
 * Handle save scenario button click
 */
function handleSaveScenario() {
    if (!appState.currentScenario) {
        alert('Please calculate a scenario first before saving.');
        return;
    }

    const name = prompt('Enter a name for this scenario:');
    if (!name || name.trim() === '') {
        return;
    }

    const scenario = createScenarioTemplate();
    scenario.name = name.trim();
    scenario.propertyInfo = appState.currentScenario.propertyInfo;
    scenario.incomeInfo = appState.currentScenario.incomeInfo;
    scenario.calculations = appState.currentScenario.calculations;

    const success = saveScenario(scenario);

    if (success) {
        alert(`Scenario "${name}" saved successfully!`);
        appState.savedScenarios = loadScenarios();
        displayScenarioList();
    } else {
        alert('Error saving scenario. Please try again.');
    }
}

/**
 * Display saved scenarios list
 */
function displayScenarioList() {
    const listContainer = document.getElementById('scenario-list');
    const scenarios = loadScenarios();

    if (scenarios.length === 0) {
        listContainer.innerHTML = '<p class="empty-state">No saved scenarios yet. Calculate and save a scenario to get started.</p>';
        return;
    }

    listContainer.innerHTML = '';

    scenarios.forEach(scenario => {
        const item = document.createElement('div');
        item.className = 'scenario-item';
        item.innerHTML = `
            <input type="checkbox" id="scenario-${scenario.id}" value="${scenario.id}">
            <div class="scenario-info">
                <div class="scenario-name">${scenario.name}</div>
                <div class="scenario-details">
                    ${formatCurrency(scenario.propertyInfo.purchasePrice)} •
                    ${scenario.propertyInfo.downPaymentPercent}% down •
                    ${formatCurrency(scenario.calculations?.totalPayment || 0)}/mo
                </div>
            </div>
            <div class="scenario-actions">
                <button onclick="loadScenarioToForm('${scenario.id}')">Load</button>
                <button class="delete" onclick="handleDeleteScenario('${scenario.id}')">Delete</button>
            </div>
        `;
        listContainer.appendChild(item);
    });
}

/**
 * Load scenario into form
 */
function loadScenarioToForm(id) {
    const scenario = getScenario(id);
    if (!scenario) return;

    // Populate form fields
    document.getElementById('purchase-price').value = scenario.propertyInfo.purchasePrice;
    document.getElementById('down-payment-percent').value = scenario.propertyInfo.downPaymentPercent;
    document.getElementById('down-payment-percent-number').value = scenario.propertyInfo.downPaymentPercent;
    document.getElementById('interest-rate').value = scenario.propertyInfo.interestRate;
    document.getElementById('loan-term').value = scenario.propertyInfo.loanTerm;
    document.getElementById('property-tax').value = scenario.propertyInfo.propertyTax;
    document.getElementById('insurance').value = scenario.propertyInfo.insurance;
    document.getElementById('hoa').value = scenario.propertyInfo.hoa;
    document.getElementById('utilities').value = scenario.propertyInfo.utilities;
    document.getElementById('maintenance').value = scenario.propertyInfo.maintenance;

    document.getElementById('annual-income').value = scenario.incomeInfo.annualIncome;
    document.getElementById('monthly-debts').value = scenario.incomeInfo.monthlyDebts;
    document.getElementById('investment-return').value = scenario.incomeInfo.investmentReturn;
    document.getElementById('current-portfolio').value = scenario.incomeInfo.currentPortfolio;

    updateDownPaymentAmount();

    // Switch to calculator tab and recalculate
    switchTab('calculator');
    handleCalculate();

    alert(`Loaded scenario: ${scenario.name}`);
}

/**
 * Delete scenario
 */
function handleDeleteScenario(id) {
    const scenario = getScenario(id);
    if (!scenario) return;

    if (confirm(`Are you sure you want to delete "${scenario.name}"?`)) {
        const success = deleteScenario(id);
        if (success) {
            appState.savedScenarios = loadScenarios();
            displayScenarioList();
        } else {
            alert('Error deleting scenario.');
        }
    }
}

/**
 * Handle compare scenarios button click
 */
function handleCompareScenarios() {
    // Get selected scenarios
    const checkboxes = document.querySelectorAll('#scenario-list input[type="checkbox"]:checked');
    const selectedIds = Array.from(checkboxes).map(cb => cb.value);

    if (selectedIds.length < 2) {
        alert('Please select at least 2 scenarios to compare.');
        return;
    }

    const scenarios = selectedIds.map(id => getScenario(id)).filter(s => s !== null);

    // Display comparison
    displayComparison(scenarios);
}

/**
 * Display scenario comparison
 */
function displayComparison(scenarios) {
    const resultsSection = document.getElementById('comparison-results');
    resultsSection.style.display = 'block';

    // Generate comparison table
    const table = document.getElementById('comparison-table');
    table.innerHTML = '';

    // Create header row
    const headerRow = table.insertRow();
    headerRow.insertCell().innerHTML = '<th>Metric</th>';
    scenarios.forEach(s => {
        const th = document.createElement('th');
        th.textContent = s.name;
        headerRow.appendChild(th);
    });

    // Add rows for each metric
    const metrics = [
        { label: 'Purchase Price', key: 'purchasePrice', path: 'propertyInfo', format: 'currency' },
        { label: 'Down Payment', key: 'downPaymentPercent', path: 'propertyInfo', format: 'percent' },
        { label: 'Interest Rate', key: 'interestRate', path: 'propertyInfo', format: 'percent' },
        { label: 'Monthly Payment', key: 'totalPayment', path: 'calculations', format: 'currency' },
        { label: 'Total Monthly Cost', key: 'totalMonthlyCost', path: 'calculations', format: 'currency' },
        { label: 'Housing Ratio', key: 'housingRatio', path: 'calculations.affordability', format: 'percent' }
    ];

    metrics.forEach(metric => {
        const row = table.insertRow();
        row.insertCell().innerHTML = `<th>${metric.label}</th>`;

        const values = scenarios.map(s => {
            let value;
            if (metric.path.includes('.')) {
                const parts = metric.path.split('.');
                value = s[parts[0]][parts[1]][metric.key];
            } else {
                value = s[metric.path][metric.key];
            }
            return value;
        });

        const minValue = Math.min(...values);

        values.forEach(value => {
            const cell = row.insertCell();
            if (metric.format === 'currency') {
                cell.textContent = formatCurrency(value);
            } else if (metric.format === 'percent') {
                cell.textContent = formatPercent(value, 2);
            } else {
                cell.textContent = value;
            }

            // Highlight best value
            if (value === minValue && (metric.key === 'totalPayment' || metric.key === 'totalMonthlyCost' || metric.key === 'housingRatio')) {
                cell.classList.add('winner');
            }
        });
    });

    // Render comparison chart
    renderScenarioComparison(scenarios);
}

/**
 * Handle update analysis button click
 */
function handleUpdateAnalysis() {
    if (!appState.currentScenario) {
        alert('Please calculate a scenario in the Calculator tab first.');
        return;
    }

    const timeframe = parseInt(document.getElementById('timeframe').value) || 30;
    const appreciationRate = parseFloat(document.getElementById('appreciation-rate').value) || 3.0;

    const propertyInfo = appState.currentScenario.propertyInfo;
    const incomeInfo = appState.currentScenario.incomeInfo;
    const calculations = appState.currentScenario.calculations;

    // Calculate equity buildup
    const equityData = calculateEquityOverTime(
        propertyInfo.purchasePrice,
        calculations.loanAmount,
        propertyInfo.interestRate,
        Math.min(timeframe, propertyInfo.loanTerm),
        appreciationRate
    );

    // Calculate investment vs equity
    const investmentComparison = compareInvestmentVsEquity(
        propertyInfo.downPaymentAmount,
        equityData,
        incomeInfo.investmentReturn
    );

    // Render charts
    renderEquityChart(equityData);
    renderInvestmentChart(investmentComparison);
    renderNetWorthChart(equityData, investmentComparison.investment);
    renderCashFlowChart(calculations, timeframe);
}

/**
 * Handle compare houses button click
 */
function handleCompareHouses() {
    // Get house A data
    const houseA = {
        price: parseFloat(document.getElementById('house-a-price').value) || 0,
        downPayment: parseFloat(document.getElementById('house-a-down').value) || 20,
        rate: parseFloat(document.getElementById('house-a-rate').value) || 6.5,
        term: 30,
        taxes: parseFloat(document.getElementById('house-a-tax').value) || 0,
        insurance: 150,
        hoa: 0
    };

    // Get house B data
    const houseB = {
        price: parseFloat(document.getElementById('house-b-price').value) || 0,
        downPayment: parseFloat(document.getElementById('house-b-down').value) || 20,
        rate: parseFloat(document.getElementById('house-b-rate').value) || 6.5,
        term: 30,
        taxes: parseFloat(document.getElementById('house-b-tax').value) || 0,
        insurance: 150,
        hoa: 0
    };

    const investmentReturn = parseFloat(document.getElementById('investment-return').value) || 8.0;
    const appreciationRate = parseFloat(document.getElementById('appreciation-rate').value) || 3.0;
    const timeframe = parseInt(document.getElementById('timeframe').value) || 30;

    // Perform comparison
    const comparison = compareHousePrices(houseA, houseB, investmentReturn, appreciationRate, timeframe);

    // Update summary cards
    document.getElementById('monthly-savings').textContent = formatCurrency(comparison.monthlySavings);
    document.getElementById('breakeven-year').textContent = comparison.breakEvenYear ?
        `Year ${comparison.breakEvenYear}` : 'Never';

    document.getElementById('winner-timeframe').textContent = timeframe;
    document.getElementById('winner-strategy').textContent = comparison.winner === 'cheaper' ?
        'Cheaper House + Invest' : 'Expensive House';
    document.getElementById('winner-amount').textContent =
        `${formatCurrency(comparison.wealthDifference)} more wealth`;

    // Render chart
    renderHousePriceComparisonChart(comparison, timeframe);
}
