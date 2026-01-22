/**
 * Home Purchase Calculator
 * Core financial calculation functions for mortgage, equity, and investment analysis
 */

/**
 * Calculate monthly mortgage payment using PMT formula
 * @param {number} principal - Loan amount
 * @param {number} annualRate - Annual interest rate (as percentage, e.g., 6.5)
 * @param {number} years - Loan term in years
 * @returns {number} Monthly principal & interest payment
 */
function calculateMonthlyPayment(principal, annualRate, years) {
    if (principal <= 0 || years <= 0) return 0;

    const monthlyRate = annualRate / 100 / 12;
    const numPayments = years * 12;

    // Handle edge case of 0% interest
    if (monthlyRate === 0) {
        return principal / numPayments;
    }

    // PMT formula: M = P * [r(1 + r)^n] / [(1 + r)^n - 1]
    const payment = principal *
        (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
        (Math.pow(1 + monthlyRate, numPayments) - 1);

    return payment;
}

/**
 * Calculate monthly PMI (Private Mortgage Insurance)
 * @param {number} loanAmount - Loan amount
 * @param {number} purchasePrice - Purchase price of home
 * @param {number} downPaymentPercent - Down payment as percentage
 * @returns {number} Monthly PMI amount (0 if down payment >= 20%)
 */
function calculatePMI(loanAmount, purchasePrice, downPaymentPercent) {
    // PMI only required if down payment < 20%
    if (downPaymentPercent >= 20) return 0;

    // Typical PMI rate: 0.5% - 1.5% of loan amount annually
    // Using 0.75% as default
    const pmiRate = 0.0075;
    const monthlyPMI = (loanAmount * pmiRate) / 12;

    return monthlyPMI;
}

/**
 * Calculate total monthly payment with all components
 * @param {number} principal - Loan amount
 * @param {number} rate - Annual interest rate
 * @param {number} years - Loan term in years
 * @param {number} propertyTax - Monthly property tax
 * @param {number} insurance - Monthly homeowners insurance
 * @param {number} hoa - Monthly HOA/condo fees
 * @param {number} pmi - Monthly PMI
 * @returns {Object} Breakdown of monthly payment
 */
function calculateTotalMonthlyPayment(principal, rate, years, propertyTax, insurance, hoa, pmi) {
    const principalAndInterest = calculateMonthlyPayment(principal, rate, years);

    const breakdown = {
        principalAndInterest: principalAndInterest,
        pmi: pmi,
        propertyTax: propertyTax,
        insurance: insurance,
        hoa: hoa,
        totalPayment: principalAndInterest + pmi + propertyTax + insurance + hoa
    };

    return breakdown;
}

/**
 * Generate complete amortization schedule
 * @param {number} principal - Loan amount
 * @param {number} annualRate - Annual interest rate (percentage)
 * @param {number} years - Loan term in years
 * @returns {Array} Array of payment objects with details for each month
 */
function generateAmortizationSchedule(principal, annualRate, years) {
    const monthlyRate = annualRate / 100 / 12;
    const numPayments = years * 12;
    const monthlyPayment = calculateMonthlyPayment(principal, annualRate, years);

    const schedule = [];
    let balance = principal;

    for (let month = 1; month <= numPayments; month++) {
        const interestPayment = balance * monthlyRate;
        const principalPayment = monthlyPayment - interestPayment;
        balance -= principalPayment;

        // Handle rounding errors in final payment
        if (month === numPayments) {
            balance = 0;
        }

        schedule.push({
            month: month,
            payment: monthlyPayment,
            principal: principalPayment,
            interest: interestPayment,
            balance: Math.max(0, balance)
        });
    }

    return schedule;
}

/**
 * Calculate equity buildup over time
 * @param {number} purchasePrice - Home purchase price
 * @param {number} principal - Initial loan amount
 * @param {number} rate - Annual interest rate
 * @param {number} years - Loan term
 * @param {number} appreciationRate - Annual home appreciation rate (percentage)
 * @returns {Array} Yearly equity projections
 */
function calculateEquityOverTime(purchasePrice, principal, rate, years, appreciationRate) {
    const schedule = generateAmortizationSchedule(principal, rate, years);
    const equityData = [];

    const downPayment = purchasePrice - principal;
    const monthlyAppreciation = appreciationRate / 100 / 12;

    let homeValue = purchasePrice;

    for (let year = 1; year <= years; year++) {
        const monthIndex = year * 12 - 1;
        if (monthIndex >= schedule.length) break;

        const monthData = schedule[monthIndex];
        const loanBalance = monthData.balance;

        // Calculate appreciated home value
        homeValue = purchasePrice * Math.pow(1 + appreciationRate / 100, year);

        // Calculate cumulative principal paid
        const principalPaid = principal - loanBalance;

        // Equity = down payment + principal paid + appreciation
        const equity = downPayment + principalPaid + (homeValue - purchasePrice);

        equityData.push({
            year: year,
            homeValue: homeValue,
            loanBalance: loanBalance,
            principalPaid: principalPaid,
            equity: equity
        });
    }

    return equityData;
}

/**
 * Calculate investment growth over time with monthly contributions
 * @param {number} initialAmount - Initial investment amount
 * @param {number} monthlyContribution - Monthly contribution amount
 * @param {number} annualReturn - Expected annual return (percentage)
 * @param {number} years - Investment period in years
 * @returns {Array} Yearly investment value projections
 */
function calculateInvestmentGrowth(initialAmount, monthlyContribution, annualReturn, years) {
    const monthlyRate = annualReturn / 100 / 12;
    const investmentData = [];

    let totalValue = initialAmount;
    let totalInvested = initialAmount;

    for (let year = 1; year <= years; year++) {
        for (let month = 1; month <= 12; month++) {
            // Add monthly contribution
            totalValue += monthlyContribution;
            totalInvested += monthlyContribution;

            // Apply monthly return
            totalValue *= (1 + monthlyRate);
        }

        const gains = totalValue - totalInvested;

        investmentData.push({
            year: year,
            invested: totalInvested,
            value: totalValue,
            gains: gains
        });
    }

    return investmentData;
}

/**
 * Compare remaining portfolio vs. building home equity
 * @param {number} portfolioAmount - Starting portfolio amount (typically current portfolio - down payment)
 * @param {Array} equitySchedule - Equity buildup schedule
 * @param {number} investmentReturn - Expected annual investment return (percentage)
 * @returns {Object} Comparison data
 */
function compareInvestmentVsEquity(portfolioAmount, equitySchedule, investmentReturn) {
    const years = equitySchedule.length;
    const investmentGrowth = calculateInvestmentGrowth(portfolioAmount, 0, investmentReturn, years);

    const comparison = {
        equity: equitySchedule,
        investment: investmentGrowth,
        finalEquity: equitySchedule[years - 1]?.equity || 0,
        finalInvestment: investmentGrowth[years - 1]?.value || 0
    };

    // Find crossover point (if any)
    for (let i = 0; i < years; i++) {
        if (equitySchedule[i].equity > investmentGrowth[i].value) {
            comparison.crossoverYear = i + 1;
            break;
        }
    }

    return comparison;
}

/**
 * Compare buying expensive house vs. cheaper house + investing savings
 * @param {Object} expensiveHouse - {price, downPayment, rate, term, taxes, insurance, hoa}
 * @param {Object} cheaperHouse - {price, downPayment, rate, term, taxes, insurance, hoa}
 * @param {number} investmentReturn - Expected annual investment return (percentage)
 * @param {number} appreciationRate - Expected annual home appreciation (percentage)
 * @param {number} years - Analysis timeframe
 * @returns {Object} Comprehensive comparison data
 */
function compareHousePrices(expensiveHouse, cheaperHouse, investmentReturn, appreciationRate, years) {
    // Calculate loan amounts
    const expensiveLoan = expensiveHouse.price * (1 - expensiveHouse.downPayment / 100);
    const cheaperLoan = cheaperHouse.price * (1 - cheaperHouse.downPayment / 100);

    // Calculate monthly payments
    const expensivePayment = calculateMonthlyPayment(expensiveLoan, expensiveHouse.rate, expensiveHouse.term);
    const cheaperPayment = calculateMonthlyPayment(cheaperLoan, cheaperHouse.rate, cheaperHouse.term);

    // Calculate PMI for each
    const expensivePMI = calculatePMI(expensiveLoan, expensiveHouse.price, expensiveHouse.downPayment);
    const cheaperPMI = calculatePMI(cheaperLoan, cheaperHouse.price, cheaperHouse.downPayment);

    // Total monthly costs
    const expensiveMonthly = expensivePayment + expensivePMI + expensiveHouse.taxes + expensiveHouse.insurance + expensiveHouse.hoa;
    const cheaperMonthly = cheaperPayment + cheaperPMI + cheaperHouse.taxes + cheaperHouse.insurance + cheaperHouse.hoa;

    // Monthly savings from cheaper house
    const monthlySavings = expensiveMonthly - cheaperMonthly;

    // Calculate equity buildup for each house
    const expensiveEquity = calculateEquityOverTime(expensiveHouse.price, expensiveLoan, expensiveHouse.rate, Math.min(years, expensiveHouse.term), appreciationRate);
    const cheaperEquity = calculateEquityOverTime(cheaperHouse.price, cheaperLoan, cheaperHouse.rate, Math.min(years, cheaperHouse.term), appreciationRate);

    // Calculate investment growth from savings
    const downPaymentDiff = (expensiveHouse.price * expensiveHouse.downPayment / 100) - (cheaperHouse.price * cheaperHouse.downPayment / 100);
    const investmentFromSavings = calculateInvestmentGrowth(downPaymentDiff, monthlySavings, investmentReturn, years);

    // Combine cheaper house equity + investments
    const combinedWealth = [];
    for (let i = 0; i < years; i++) {
        const equity = cheaperEquity[i]?.equity || 0;
        const investment = investmentFromSavings[i]?.value || 0;
        combinedWealth.push({
            year: i + 1,
            equity: equity,
            investmentValue: investment,
            totalWealth: equity + investment
        });
    }

    // Find break-even year
    let breakEvenYear = null;
    for (let i = 0; i < years; i++) {
        const expensiveWealth = expensiveEquity[i]?.equity || 0;
        const cheaperWealth = combinedWealth[i]?.totalWealth || 0;

        if (cheaperWealth > expensiveWealth) {
            breakEvenYear = i + 1;
            break;
        }
    }

    // Determine winner at final year
    const finalExpensiveWealth = expensiveEquity[years - 1]?.equity || 0;
    const finalCheaperWealth = combinedWealth[years - 1]?.totalWealth || 0;

    return {
        expensiveHouseWealth: expensiveEquity,
        cheaperHouseWealth: combinedWealth,
        monthlySavings: monthlySavings,
        breakEvenYear: breakEvenYear,
        winner: finalCheaperWealth > finalExpensiveWealth ? 'cheaper' : 'expensive',
        finalExpensiveWealth: finalExpensiveWealth,
        finalCheaperWealth: finalCheaperWealth,
        wealthDifference: Math.abs(finalExpensiveWealth - finalCheaperWealth)
    };
}

/**
 * Calculate affordability ratios
 * @param {number} monthlyPayment - Total monthly housing payment
 * @param {number} monthlyIncome - Gross monthly income
 * @param {number} otherDebtPayments - Other monthly debt payments
 * @returns {Object} Affordability metrics
 */
function calculateAffordabilityRatios(monthlyPayment, monthlyIncome, otherDebtPayments) {
    // Front-end ratio (housing ratio): Should be <= 28%
    const housingRatio = (monthlyPayment / monthlyIncome) * 100;

    // Back-end ratio (debt-to-income): Should be <= 36% (sometimes 43%)
    const totalDebt = monthlyPayment + otherDebtPayments;
    const dtiRatio = (totalDebt / monthlyIncome) * 100;

    // Determine status
    let status = 'excellent';
    if (housingRatio > 40 || dtiRatio > 43) {
        status = 'warning';
    } else if (housingRatio > 33 || dtiRatio > 36) {
        status = 'caution';
    } else if (housingRatio > 28 || dtiRatio > 30) {
        status = 'good';
    }

    return {
        housingRatio: housingRatio,
        dtiRatio: dtiRatio,
        withinGuidelines: housingRatio <= 28 && dtiRatio <= 36,
        status: status
    };
}

/**
 * Calculate recommended home price based on income and affordability guidelines
 * @param {number} annualIncome - Annual gross income
 * @param {number} monthlyDebts - Monthly debt payments
 * @param {number} downPaymentPercent - Down payment percentage
 * @param {number} rate - Interest rate
 * @param {number} years - Loan term
 * @returns {number} Maximum recommended home price
 */
function calculateRecommendedPrice(annualIncome, monthlyDebts, downPaymentPercent, rate, years) {
    const monthlyIncome = annualIncome / 12;

    // Use 28% rule for max monthly payment
    const maxPayment = monthlyIncome * 0.28;

    // Subtract estimated property tax and insurance (rough estimate: 1.5% of home value annually)
    // This is iterative, so we'll use approximation
    const estimatedPayment = maxPayment * 0.85; // Leaves room for tax/insurance

    // Calculate max loan amount using PMT formula in reverse
    const monthlyRate = rate / 100 / 12;
    const numPayments = years * 12;

    let maxLoan;
    if (monthlyRate === 0) {
        maxLoan = estimatedPayment * numPayments;
    } else {
        maxLoan = estimatedPayment *
            (Math.pow(1 + monthlyRate, numPayments) - 1) /
            (monthlyRate * Math.pow(1 + monthlyRate, numPayments));
    }

    // Calculate max price based on down payment
    const maxPrice = maxLoan / (1 - downPaymentPercent / 100);

    return maxPrice;
}

/**
 * Format number as currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

/**
 * Format number as percentage
 * @param {number} decimal - Decimal value (e.g., 0.28 for 28%)
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
function formatPercent(decimal, decimals = 2) {
    return (decimal).toFixed(decimals) + '%';
}
