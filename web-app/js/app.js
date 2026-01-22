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
    charts: {},
    incomeAdjustments: [],  // {year: number, income: number}
    lifeEvents: []  // {year: number, description: string, type: string, amount: number}
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

    // Scenario selectors for house comparison
    document.getElementById('scenario-a-select').addEventListener('change', function() {
        displayScenarioSummary('a', this.value);
    });

    document.getElementById('scenario-b-select').addEventListener('change', function() {
        displayScenarioSummary('b', this.value);
    });

    // Savings rate slider sync
    const savingsSlider = document.getElementById('savings-rate');
    const savingsNumber = document.getElementById('savings-rate-number');

    savingsSlider.addEventListener('input', function() {
        savingsNumber.value = this.value;
    });

    savingsNumber.addEventListener('input', function() {
        savingsSlider.value = this.value;
    });

    // Analysis savings rate slider sync
    const analysisSavingsSlider = document.getElementById('analysis-savings-rate');
    const analysisSavingsNumber = document.getElementById('analysis-savings-rate-number');

    analysisSavingsSlider.addEventListener('input', function() {
        analysisSavingsNumber.value = this.value;
    });

    analysisSavingsNumber.addEventListener('input', function() {
        analysisSavingsSlider.value = this.value;
    });

    // Income adjustment buttons
    document.getElementById('add-income-adjustment-btn').addEventListener('click', addIncomeAdjustment);

    // Life events buttons
    document.getElementById('add-life-event-btn').addEventListener('click', addLifeEvent);

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

            // Auto-update analysis if a scenario is selected
            const selectedScenario = document.getElementById('analysis-scenario-select').value;
            if (selectedScenario && appState.selectedTab === 'analysis') {
                handleUpdateAnalysis();
            }

            // Update house comparison winner display
            document.getElementById('winner-timeframe').textContent = years;
        });
    });

    // Timeframe input
    document.getElementById('timeframe').addEventListener('change', function() {
        appState.analysisTimeframe = parseInt(this.value);
        // Update preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.years) === appState.analysisTimeframe);
        });
        // Auto-update analysis if a scenario is selected
        const selectedScenario = document.getElementById('analysis-scenario-select').value;
        if (selectedScenario && appState.selectedTab === 'analysis') {
            handleUpdateAnalysis();
        }
        // Update house comparison winner display
        document.getElementById('winner-timeframe').textContent = this.value;
    });

    // Appreciation rate change - auto-update analysis
    document.getElementById('appreciation-rate').addEventListener('change', function() {
        const selectedScenario = document.getElementById('analysis-scenario-select').value;
        if (selectedScenario && appState.selectedTab === 'analysis') {
            handleUpdateAnalysis();
        }
    });

    document.getElementById('appreciation-rate-number').addEventListener('change', function() {
        const selectedScenario = document.getElementById('analysis-scenario-select').value;
        if (selectedScenario && appState.selectedTab === 'analysis') {
            handleUpdateAnalysis();
        }
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
    } else if (tabName === 'analysis') {
        populateAnalysisScenarioSelector();
        populateHouseComparisonSelectors();
        renderIncomeAdjustments();
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
        populateAnalysisScenarioSelector(); // Update analysis dropdown
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
            populateAnalysisScenarioSelector(); // Update analysis dropdown
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
 * Populate the analysis scenario selector dropdown
 */
function populateAnalysisScenarioSelector() {
    const selector = document.getElementById('analysis-scenario-select');
    const scenarios = loadScenarios();

    // Clear existing options except the first one
    selector.innerHTML = '<option value="">-- Select a saved scenario or use Calculator data --</option>';

    // Add current calculator scenario if available
    if (appState.currentScenario) {
        const option = document.createElement('option');
        option.value = 'current';
        option.textContent = 'Current Calculator Data';
        selector.appendChild(option);
    }

    // Add saved scenarios
    scenarios.forEach(scenario => {
        const option = document.createElement('option');
        option.value = scenario.id;
        option.textContent = `${scenario.name} (${formatCurrency(scenario.propertyInfo.purchasePrice)})`;
        selector.appendChild(option);
    });

    // Set up change listener
    selector.onchange = function() {
        if (this.value) {
            handleUpdateAnalysis();
        }
    };
}

/**
 * Add income adjustment row
 */
function addIncomeAdjustment() {
    const year = prompt('Enter year for income adjustment (1-40):');
    if (!year || isNaN(year) || year < 1 || year > 40) return;

    const income = prompt('Enter new annual income for that year:');
    if (!income || isNaN(income) || income < 0) return;

    appState.incomeAdjustments.push({
        year: parseInt(year),
        income: parseFloat(income)
    });

    appState.incomeAdjustments.sort((a, b) => a.year - b.year);
    renderIncomeAdjustments();
}

/**
 * Remove income adjustment
 */
function removeIncomeAdjustment(index) {
    appState.incomeAdjustments.splice(index, 1);
    renderIncomeAdjustments();
}

/**
 * Render income adjustments list
 */
function renderIncomeAdjustments() {
    const container = document.getElementById('income-adjustments-list');

    if (appState.incomeAdjustments.length === 0) {
        container.innerHTML = '<p style="color: var(--text-light); font-size: 0.875rem; margin-top: 0.5rem;">No adjustments added</p>';
        return;
    }

    container.innerHTML = appState.incomeAdjustments.map((adj, index) => `
        <div class="adjustment-item">
            <span>Year ${adj.year}: ${formatCurrency(adj.income)}</span>
            <button onclick="removeIncomeAdjustment(${index})">Remove</button>
        </div>
    `).join('');
}

/**
 * Add life event
 */
function addLifeEvent() {
    const tbody = document.getElementById('life-events-table').querySelector('tbody');
    const row = tbody.insertRow();
    const index = appState.lifeEvents.length;

    row.innerHTML = `
        <td><input type="number" id="event-year-${index}" min="1" max="40" value="5" style="width: 60px;"></td>
        <td><input type="text" id="event-desc-${index}" placeholder="e.g., Wedding, New car" value=""></td>
        <td>
            <select id="event-type-${index}">
                <option value="one-time">One-time expense</option>
                <option value="ongoing">Ongoing cost increase</option>
                <option value="income">Income change</option>
            </select>
        </td>
        <td><input type="number" id="event-amount-${index}" min="0" step="1000" value="10000"></td>
        <td><button onclick="removeLifeEvent(${index})">Remove</button></td>
    `;

    // Add to state with default values
    appState.lifeEvents.push({
        year: 5,
        description: '',
        type: 'one-time',
        amount: 10000
    });
}

/**
 * Remove life event
 */
function removeLifeEvent(index) {
    appState.lifeEvents.splice(index, 1);

    // Re-render table
    const tbody = document.getElementById('life-events-table').querySelector('tbody');
    tbody.innerHTML = '';

    appState.lifeEvents.forEach((event, i) => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td><input type="number" id="event-year-${i}" min="1" max="40" value="${event.year}" style="width: 60px;"></td>
            <td><input type="text" id="event-desc-${i}" placeholder="e.g., Wedding, New car" value="${event.description}"></td>
            <td>
                <select id="event-type-${i}">
                    <option value="one-time" ${event.type === 'one-time' ? 'selected' : ''}>One-time expense</option>
                    <option value="ongoing" ${event.type === 'ongoing' ? 'selected' : ''}>Ongoing cost increase</option>
                    <option value="income" ${event.type === 'income' ? 'selected' : ''}>Income change</option>
                </select>
            </td>
            <td><input type="number" id="event-amount-${i}" min="0" step="1000" value="${event.amount}"></td>
            <td><button onclick="removeLifeEvent(${i})">Remove</button></td>
        `;
    });
}

/**
 * Get life events from form
 */
function getLifeEventsFromForm() {
    return appState.lifeEvents.map((event, i) => {
        const yearInput = document.getElementById(`event-year-${i}`);
        const descInput = document.getElementById(`event-desc-${i}`);
        const typeInput = document.getElementById(`event-type-${i}`);
        const amountInput = document.getElementById(`event-amount-${i}`);

        return {
            year: yearInput ? parseInt(yearInput.value) : event.year,
            description: descInput ? descInput.value : event.description,
            type: typeInput ? typeInput.value : event.type,
            amount: amountInput ? parseFloat(amountInput.value) : event.amount
        };
    });
}

/**
 * Calculate year-by-year financials for buying scenario
 */
function calculateYearByYearFinancials(scenario, years, annualRaise, baseExpenses, savingsRate, lifeEvents, investmentReturn, appreciationRate) {
    const monthlyIncome = scenario.incomeInfo.annualIncome / 12;
    const monthlyHousing = scenario.calculations.totalMonthlyCost;
    const startingPortfolio = Math.max(0, scenario.incomeInfo.currentPortfolio - scenario.propertyInfo.downPaymentAmount);

    const yearlyData = [];
    let currentIncome = scenario.incomeInfo.annualIncome;
    let portfolio = startingPortfolio;
    let ongoingExpenseAdjustment = 0;

    // Calculate equity buildup
    const equityData = calculateEquityOverTime(
        scenario.propertyInfo.purchasePrice,
        scenario.calculations.loanAmount,
        scenario.propertyInfo.interestRate,
        Math.min(years, scenario.propertyInfo.loanTerm),
        appreciationRate
    );

    for (let year = 1; year <= years; year++) {
        // Apply annual raise
        currentIncome *= (1 + annualRaise / 100);

        // Check for income adjustments
        const incomeAdj = appState.incomeAdjustments.find(adj => adj.year === year);
        if (incomeAdj) {
            currentIncome = incomeAdj.income;
        }

        const monthlyIncomeThisYear = currentIncome / 12;

        // Calculate expenses for this year
        let monthlyExpenses = monthlyHousing + baseExpenses + ongoingExpenseAdjustment;
        let oneTimeExpense = 0;

        // Apply life events
        lifeEvents.forEach(event => {
            if (event.year === year) {
                if (event.type === 'one-time') {
                    oneTimeExpense += event.amount;
                } else if (event.type === 'ongoing') {
                    ongoingExpenseAdjustment += (event.amount / 12);
                } else if (event.type === 'income') {
                    currentIncome += event.amount;
                }
            }
        });

        // Recalculate monthly income if income event happened
        const finalMonthlyIncome = currentIncome / 12;

        // Calculate discretionary and savings
        const monthlyDiscretionary = finalMonthlyIncome - monthlyExpenses;
        const monthlySavings = monthlyDiscretionary > 0 ? (monthlyDiscretionary * savingsRate / 100) : 0;

        // Calculate portfolio growth for the year
        const monthlyRate = investmentReturn / 100 / 12;
        for (let month = 1; month <= 12; month++) {
            portfolio += monthlySavings;
            portfolio *= (1 + monthlyRate);
        }

        // Subtract one-time expenses from portfolio
        portfolio = Math.max(0, portfolio - oneTimeExpense);

        const equity = equityData[year - 1]?.equity || 0;

        yearlyData.push({
            year: year,
            annualIncome: currentIncome,
            monthlyIncome: finalMonthlyIncome,
            monthlyExpenses: monthlyExpenses,
            monthlyDiscretionary: monthlyDiscretionary,
            monthlySavings: monthlySavings,
            oneTimeExpense: oneTimeExpense,
            portfolio: portfolio,
            equity: equity,
            netWorth: portfolio + equity
        });
    }

    return {
        yearlyData: yearlyData,
        equityData: equityData
    };
}

/**
 * Calculate buy vs rent comparison
 */
function calculateBuyVsRent(scenario, initialRent, rentIncrease, years, annualRaise, baseExpenses, savingsRate, lifeEvents, investmentReturn, appreciationRate) {
    // Calculate buying scenario
    const buyScenario = calculateYearByYearFinancials(scenario, years, annualRaise, baseExpenses, savingsRate, lifeEvents, investmentReturn, appreciationRate);

    // Calculate renting scenario
    const rentScenario = [];
    let currentIncome = scenario.incomeInfo.annualIncome;
    let portfolio = scenario.incomeInfo.currentPortfolio; // Full portfolio (no down payment needed)
    let ongoingExpenseAdjustment = 0;
    let currentRent = initialRent;

    for (let year = 1; year <= years; year++) {
        // Apply annual raise
        currentIncome *= (1 + annualRaise / 100);

        // Apply rent increase
        currentRent *= (1 + rentIncrease / 100);

        // Check for income adjustments
        const incomeAdj = appState.incomeAdjustments.find(adj => adj.year === year);
        if (incomeAdj) {
            currentIncome = incomeAdj.income;
        }

        const monthlyIncomeThisYear = currentIncome / 12;

        // Calculate expenses for this year (rent instead of housing costs)
        let monthlyExpenses = currentRent + baseExpenses + ongoingExpenseAdjustment;
        let oneTimeExpense = 0;

        // Apply life events (same as buy scenario)
        lifeEvents.forEach(event => {
            if (event.year === year) {
                if (event.type === 'one-time') {
                    oneTimeExpense += event.amount;
                } else if (event.type === 'ongoing') {
                    ongoingExpenseAdjustment += (event.amount / 12);
                } else if (event.type === 'income') {
                    currentIncome += event.amount;
                }
            }
        });

        const finalMonthlyIncome = currentIncome / 12;

        // Calculate discretionary and savings
        const monthlyDiscretionary = finalMonthlyIncome - monthlyExpenses;
        const monthlySavings = monthlyDiscretionary > 0 ? (monthlyDiscretionary * savingsRate / 100) : 0;

        // Calculate portfolio growth for the year
        const monthlyRate = investmentReturn / 100 / 12;
        for (let month = 1; month <= 12; month++) {
            portfolio += monthlySavings;
            portfolio *= (1 + monthlyRate);
        }

        // Subtract one-time expenses from portfolio
        portfolio = Math.max(0, portfolio - oneTimeExpense);

        rentScenario.push({
            year: year,
            annualIncome: currentIncome,
            monthlyRent: currentRent,
            monthlyExpenses: monthlyExpenses,
            monthlyDiscretionary: monthlyDiscretionary,
            monthlySavings: monthlySavings,
            portfolio: portfolio,
            netWorth: portfolio // No home equity when renting
        });
    }

    return {
        buy: buyScenario.yearlyData,
        rent: rentScenario
    };
}

/**
 * Handle update analysis button click - REDESIGNED
 */
function handleUpdateAnalysis() {
    const selectedScenarioId = document.getElementById('analysis-scenario-select').value;

    let scenario;
    if (selectedScenarioId === 'current') {
        scenario = appState.currentScenario;
    } else if (selectedScenarioId) {
        scenario = getScenario(selectedScenarioId);
    } else {
        scenario = appState.currentScenario;
    }

    if (!scenario) {
        alert('Please either:\n1. Calculate a scenario in the Calculator tab, or\n2. Select a saved scenario from the dropdown above');
        return;
    }

    // Get all inputs
    const timeframe = parseInt(document.getElementById('timeframe').value) || 30;
    const appreciationRate = parseFloat(document.getElementById('appreciation-rate').value) || 3.0;
    const annualRaise = parseFloat(document.getElementById('annual-raise').value) || 3.0;
    const otherExpenses = parseFloat(document.getElementById('analysis-other-expenses').value) || 2500;
    const savingsRate = parseFloat(document.getElementById('analysis-savings-rate').value) || 50;
    const monthlyRent = parseFloat(document.getElementById('monthly-rent').value) || 2000;
    const rentIncrease = parseFloat(document.getElementById('rent-increase').value) || 3.0;

    const propertyInfo = scenario.propertyInfo;
    const incomeInfo = scenario.incomeInfo;
    const calculations = scenario.calculations;

    // Get life events from form
    const lifeEvents = getLifeEventsFromForm();

    // Calculate year-by-year financials
    const financialProjection = calculateYearByYearFinancials(
        scenario,
        timeframe,
        annualRaise,
        otherExpenses,
        savingsRate,
        lifeEvents,
        incomeInfo.investmentReturn,
        appreciationRate
    );

    // Calculate buy vs rent comparison
    const rentComparison = calculateBuyVsRent(
        scenario,
        monthlyRent,
        rentIncrease,
        timeframe,
        annualRaise,
        otherExpenses,
        savingsRate,
        lifeEvents,
        incomeInfo.investmentReturn,
        appreciationRate
    );

    // Render all charts
    renderCashFlowChart(financialProjection, timeframe);
    renderNetWorthChart(financialProjection, timeframe);
    renderRentComparisonChart(rentComparison, timeframe);
    renderEquityChart(financialProjection.equityData);
}

/**
 * Populate house comparison scenario selectors
 */
function populateHouseComparisonSelectors() {
    const scenarios = loadScenarios();
    const selectA = document.getElementById('scenario-a-select');
    const selectB = document.getElementById('scenario-b-select');

    // Clear and repopulate both selectors
    [selectA, selectB].forEach(select => {
        select.innerHTML = '<option value="">-- Select a scenario --</option>';
        scenarios.forEach(scenario => {
            const option = document.createElement('option');
            option.value = scenario.id;
            option.textContent = `${scenario.name} (${formatCurrency(scenario.propertyInfo.purchasePrice)})`;
            select.appendChild(option);
        });
    });
}

/**
 * Display scenario summary when selected
 */
function displayScenarioSummary(scenarioLetter, scenarioId) {
    const summaryDiv = document.getElementById(`scenario-${scenarioLetter}-summary`);

    if (!scenarioId) {
        summaryDiv.innerHTML = '<p class="empty">Select a scenario to see details</p>';
        summaryDiv.classList.add('empty');
        return;
    }

    const scenario = getScenario(scenarioId);
    if (!scenario) return;

    summaryDiv.classList.remove('empty');
    summaryDiv.innerHTML = `
        <p><strong>Price:</strong> ${formatCurrency(scenario.propertyInfo.purchasePrice)}</p>
        <p><strong>Down Payment:</strong> ${formatCurrency(scenario.propertyInfo.downPaymentAmount)} (${scenario.propertyInfo.downPaymentPercent}%)</p>
        <p><strong>Monthly Payment:</strong> ${formatCurrency(scenario.calculations.totalPayment)}</p>
        <p><strong>Total Monthly Cost:</strong> ${formatCurrency(scenario.calculations.totalMonthlyCost)}</p>
        <p><strong>Annual Income:</strong> ${formatCurrency(scenario.incomeInfo.annualIncome)}</p>
    `;
}

/**
 * Handle compare houses button click - COMPREHENSIVE VERSION
 */
function handleCompareHouses() {
    const scenarioAId = document.getElementById('scenario-a-select').value;
    const scenarioBId = document.getElementById('scenario-b-select').value;

    if (!scenarioAId || !scenarioBId) {
        alert('Please select both Scenario A and Scenario B to compare.');
        return;
    }

    const scenarioA = getScenario(scenarioAId);
    const scenarioB = getScenario(scenarioBId);

    if (!scenarioA || !scenarioB) {
        alert('Error loading scenarios.');
        return;
    }

    // Get additional inputs
    const monthlyOtherExpenses = parseFloat(document.getElementById('monthly-other-expenses').value) || 0;
    const savingsRate = parseFloat(document.getElementById('savings-rate').value) || 50;
    const currentAge = parseInt(document.getElementById('current-age').value) || 30;
    const retirementAge = parseInt(document.getElementById('retirement-age').value) || 65;
    const savingsMilestone = parseFloat(document.getElementById('savings-milestone').value) || 500000;
    const investmentReturn = parseFloat(document.getElementById('investment-return').value) || 8.0;
    const appreciationRate = parseFloat(document.getElementById('appreciation-rate').value) || 3.0;
    const timeframe = parseInt(document.getElementById('timeframe').value) || 30;

    // Perform comprehensive comparison
    const comparison = runComprehensiveComparison(
        scenarioA,
        scenarioB,
        monthlyOtherExpenses,
        savingsRate,
        currentAge,
        retirementAge,
        savingsMilestone,
        investmentReturn,
        appreciationRate,
        timeframe
    );

    // Display results
    displayComparisonResults(comparison, timeframe);

    // Show results section
    document.getElementById('comparison-results-section').style.display = 'block';
}

/**
 * Run comprehensive comparison between two scenarios
 */
function runComprehensiveComparison(scenarioA, scenarioB, otherExpenses, savingsRate, currentAge, retirementAge, savingsMilestone, investmentReturn, appreciationRate, timeframe) {
    // Calculate for Scenario A
    const resultsA = calculateScenarioFinancials(scenarioA, otherExpenses, savingsRate, currentAge, retirementAge, savingsMilestone, investmentReturn, appreciationRate, timeframe);

    // Calculate for Scenario B
    const resultsB = calculateScenarioFinancials(scenarioB, otherExpenses, savingsRate, currentAge, retirementAge, savingsMilestone, investmentReturn, appreciationRate, timeframe);

    // Compare results
    return {
        scenarioA: resultsA,
        scenarioB: resultsB,
        differences: calculateDifferences(resultsA, resultsB),
        winner: determineWinner(resultsA, resultsB, timeframe)
    };
}

/**
 * Calculate comprehensive financials for a scenario
 */
function calculateScenarioFinancials(scenario, otherExpenses, savingsRate, currentAge, retirementAge, savingsMilestone, investmentReturn, appreciationRate, timeframe) {
    const monthlyIncome = scenario.incomeInfo.annualIncome / 12;
    const monthlyHousingCost = scenario.calculations.totalMonthlyCost;
    const monthlyTotalExpenses = monthlyHousingCost + otherExpenses;
    const monthlyDiscretionary = monthlyIncome - monthlyTotalExpenses;
    const monthlyToInvestments = monthlyDiscretionary > 0 ? (monthlyDiscretionary * savingsRate) / 100 : 0;

    // Starting portfolio after down payment - CRITICAL FIX
    const startingPortfolio = Math.max(0, scenario.incomeInfo.currentPortfolio - scenario.propertyInfo.downPaymentAmount);

    // Calculate equity buildup
    const equityData = calculateEquityOverTime(
        scenario.propertyInfo.purchasePrice,
        scenario.calculations.loanAmount,
        scenario.propertyInfo.interestRate,
        Math.min(timeframe, scenario.propertyInfo.loanTerm),
        appreciationRate
    );

    // Calculate investment portfolio growth
    const portfolioData = calculateInvestmentGrowth(
        startingPortfolio > 0 ? startingPortfolio : 0,
        monthlyToInvestments > 0 ? monthlyToInvestments : 0,
        investmentReturn,
        timeframe
    );

    // Calculate retirement portfolio (years until retirement)
    const yearsToRetirement = retirementAge - currentAge;
    let retirementPortfolio = 0;
    if (yearsToRetirement > 0 && yearsToRetirement <= timeframe) {
        retirementPortfolio = portfolioData[yearsToRetirement - 1]?.value || 0;
    } else if (yearsToRetirement > timeframe) {
        // Extrapolate
        const lastValue = portfolioData[portfolioData.length - 1]?.value || 0;
        const remainingYears = yearsToRetirement - timeframe;
        retirementPortfolio = calculateInvestmentGrowth(lastValue, monthlyToInvestments, investmentReturn, remainingYears);
        retirementPortfolio = retirementPortfolio[retirementPortfolio.length - 1]?.value || 0;
    }

    // Calculate net worth over time
    const netWorthData = equityData.map((equity, index) => {
        const portfolio = portfolioData[index] || { value: 0 };
        return {
            year: equity.year,
            equity: equity.equity,
            portfolio: portfolio.value,
            totalNetWorth: equity.equity + portfolio.value
        };
    });

    // Financial freedom metrics
    const annualExpenses = monthlyTotalExpenses * 12;
    const financialIndependenceNumber = annualExpenses * 25; // 4% rule
    const yearsToFI = calculateYearsToGoal(startingPortfolio, monthlyToInvestments, investmentReturn, financialIndependenceNumber);

    // Custom milestone timeline
    const yearsToMilestone = calculateYearsToGoal(startingPortfolio, monthlyToInvestments, investmentReturn, savingsMilestone);

    return {
        scenario: scenario,
        annualHousingCost: monthlyHousingCost * 12,
        monthlyDiscretionary: monthlyDiscretionary,
        monthlyToInvestments: monthlyToInvestments,
        startingPortfolio: startingPortfolio,
        equityData: equityData,
        portfolioData: portfolioData,
        netWorthData: netWorthData,
        finalNetWorth: netWorthData[timeframe - 1]?.totalNetWorth || 0,
        retirementPortfolio: retirementPortfolio,
        yearsToFI: yearsToFI,
        yearsToMilestone: yearsToMilestone,
        milestoneAmount: savingsMilestone
    };
}

/**
 * Calculate years to reach a financial goal
 */
function calculateYearsToGoal(startingAmount, monthlyContribution, annualReturn, goalAmount) {
    if (startingAmount >= goalAmount) return 0;
    if (monthlyContribution <= 0 && startingAmount < goalAmount) return Infinity;

    const monthlyRate = annualReturn / 100 / 12;
    let balance = startingAmount;
    let months = 0;
    const maxMonths = 100 * 12; // Cap at 100 years

    while (balance < goalAmount && months < maxMonths) {
        balance += monthlyContribution;
        balance *= (1 + monthlyRate);
        months++;
    }

    return months >= maxMonths ? Infinity : Math.ceil(months / 12);
}

/**
 * Calculate differences between two scenarios
 */
function calculateDifferences(resultsA, resultsB) {
    return {
        annualCost: resultsA.annualHousingCost - resultsB.annualHousingCost,
        discretionary: resultsA.monthlyDiscretionary - resultsB.monthlyDiscretionary,
        investments: resultsA.monthlyToInvestments - resultsB.monthlyToInvestments,
        netWorth: resultsA.finalNetWorth - resultsB.finalNetWorth,
        retirementPortfolio: resultsA.retirementPortfolio - resultsB.retirementPortfolio,
        yearsToFI: resultsA.yearsToFI - resultsB.yearsToFI,
        yearsToMilestone: resultsA.yearsToMilestone - resultsB.yearsToMilestone
    };
}

/**
 * Determine winner and break-even
 */
function determineWinner(resultsA, resultsB, timeframe) {
    // Find break-even year
    let breakEvenYear = null;
    for (let i = 0; i < timeframe; i++) {
        const networthA = resultsA.netWorthData[i]?.totalNetWorth || 0;
        const networthB = resultsB.netWorthData[i]?.totalNetWorth || 0;

        if (i === 0) continue;

        const prevNetworthA = resultsA.netWorthData[i-1]?.totalNetWorth || 0;
        const prevNetworthB = resultsB.netWorthData[i-1]?.totalNetWorth || 0;

        // Check if they crossed over
        if ((prevNetworthA < prevNetworthB && networthA >= networthB) ||
            (prevNetworthA > prevNetworthB && networthA <= networthB)) {
            breakEvenYear = i + 1;
            break;
        }
    }

    const finalDiff = resultsA.finalNetWorth - resultsB.finalNetWorth;

    return {
        winner: finalDiff > 0 ? 'A' : 'B',
        difference: Math.abs(finalDiff),
        breakEvenYear: breakEvenYear
    };
}

/**
 * Display comprehensive comparison results
 */
function displayComparisonResults(comparison, timeframe) {
    const { scenarioA, scenarioB, differences, winner } = comparison;

    // Scenario names
    document.getElementById('scenario-a-name').textContent = scenarioA.scenario.name;
    document.getElementById('scenario-b-name').textContent = scenarioB.scenario.name;

    // Annual housing costs - show both actual values
    document.getElementById('annual-cost-a').textContent = formatCurrency(scenarioA.annualHousingCost);
    document.getElementById('annual-cost-b').textContent = formatCurrency(scenarioB.annualHousingCost);

    const costDiffAbs = Math.abs(differences.annualCost);
    const costWinner = differences.annualCost > 0 ? scenarioB.scenario.name : scenarioA.scenario.name;
    document.getElementById('annual-cost-diff').textContent = formatCurrency(costDiffAbs);
    document.getElementById('cost-diff-winner').textContent =
        `${costWinner} costs less`;

    // Monthly discretionary income - show both actual values
    document.getElementById('discretionary-a').textContent = formatCurrency(scenarioA.monthlyDiscretionary);
    document.getElementById('discretionary-b').textContent = formatCurrency(scenarioB.monthlyDiscretionary);

    const discDiffAbs = Math.abs(differences.discretionary);
    const discWinner = differences.discretionary > 0 ? scenarioA.scenario.name : scenarioB.scenario.name;
    document.getElementById('discretionary-diff').textContent = formatCurrency(discDiffAbs);
    document.getElementById('discretionary-winner').textContent = `${discWinner} has more`;

    // Monthly investment contributions - show both actual values
    document.getElementById('investment-contribution-a').textContent = formatCurrency(scenarioA.monthlyToInvestments);
    document.getElementById('investment-contribution-b').textContent = formatCurrency(scenarioB.monthlyToInvestments);

    const invDiffAbs = Math.abs(differences.investments);
    const invWinner = differences.investments > 0 ? scenarioA.scenario.name : scenarioB.scenario.name;
    document.getElementById('investment-contribution-diff').textContent = formatCurrency(invDiffAbs);
    document.getElementById('investment-winner').textContent = `${invWinner} invests more`;

    // Net worth winner
    document.getElementById('comparison-timeframe').textContent = timeframe;
    const networthWinner = winner.winner === 'A' ? scenarioA.scenario.name : scenarioB.scenario.name;
    document.getElementById('networth-winner').textContent = `${networthWinner} Wins`;
    document.getElementById('networth-diff').textContent = `${formatCurrency(winner.difference)} more wealth`;

    // Break-even
    document.getElementById('breakeven-year').textContent =
        winner.breakEvenYear ? `Year ${winner.breakEvenYear}` : 'No crossover';

    // Retirement portfolio
    const retDiffAbs = Math.abs(differences.retirementPortfolio);
    const retWinner = differences.retirementPortfolio > 0 ? scenarioA.scenario.name : scenarioB.scenario.name;
    document.getElementById('retirement-diff').textContent = formatCurrency(retDiffAbs);
    document.getElementById('retirement-detail').textContent =
        `${retWinner} has more at retirement`;

    // Financial freedom
    if (differences.yearsToFI !== Infinity && differences.yearsToFI !== -Infinity && !isNaN(differences.yearsToFI)) {
        const fiDiffAbs = Math.abs(differences.yearsToFI);
        const fiWinner = differences.yearsToFI > 0 ? scenarioB.scenario.name : scenarioA.scenario.name;
        document.getElementById('freedom-score-diff').textContent = `${fiDiffAbs.toFixed(1)} years`;
    } else {
        document.getElementById('freedom-score-diff').textContent = 'N/A';
    }

    // Custom milestone timeline
    if (differences.yearsToMilestone !== Infinity && differences.yearsToMilestone !== -Infinity && !isNaN(differences.yearsToMilestone)) {
        const milestoneDiff = Math.abs(differences.yearsToMilestone);
        const milestoneWinner = differences.yearsToMilestone > 0 ? scenarioB.scenario.name : scenarioA.scenario.name;
        document.getElementById('milestone-diff').textContent = `${milestoneDiff.toFixed(1)} years`;
        document.getElementById('milestone-detail').textContent =
            `${milestoneWinner} reaches ${formatCurrency(scenarioA.milestoneAmount)} sooner`;
    } else {
        document.getElementById('milestone-diff').textContent = 'N/A';
        document.getElementById('milestone-detail').textContent = 'Adjust savings parameters';
    }

    // Render comparison chart
    renderComprehensiveComparisonChart(scenarioA, scenarioB, timeframe);
}
