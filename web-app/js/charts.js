/**
 * Chart.js Visualization Functions
 * Handles all chart rendering for the home purchase analyzer
 */

// Global chart instances storage
const chartInstances = {};

/**
 * Default chart configuration options
 */
const defaultChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                padding: 15,
                font: {
                    size: 12
                }
            }
        },
        tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: {
                size: 14
            },
            bodyFont: {
                size: 13
            },
            callbacks: {
                label: function(context) {
                    let label = context.dataset.label || '';
                    if (label) {
                        label += ': ';
                    }
                    if (context.parsed.y !== null) {
                        label += formatCurrency(context.parsed.y);
                    }
                    return label;
                }
            }
        }
    }
};

/**
 * Chart 1: Payment Breakdown (Doughnut Chart)
 * Shows breakdown of monthly housing payment
 */
function renderPaymentBreakdown(paymentData) {
    const ctx = document.getElementById('payment-breakdown-chart');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (chartInstances.paymentBreakdown) {
        chartInstances.paymentBreakdown.destroy();
    }

    const data = {
        labels: ['Principal & Interest', 'PMI', 'Property Tax', 'Insurance', 'HOA'],
        datasets: [{
            data: [
                paymentData.principalAndInterest,
                paymentData.pmi,
                paymentData.propertyTax,
                paymentData.insurance,
                paymentData.hoa
            ],
            backgroundColor: [
                '#2563eb', // Blue
                '#f59e0b', // Orange
                '#10b981', // Green
                '#8b5cf6', // Purple
                '#ec4899'  // Pink
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
        }]
    };

    const config = {
        type: 'doughnut',
        data: data,
        options: {
            ...defaultChartOptions,
            plugins: {
                ...defaultChartOptions.plugins,
                legend: {
                    position: 'right'
                },
                tooltip: {
                    ...defaultChartOptions.plugins.tooltip,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    };

    chartInstances.paymentBreakdown = new Chart(ctx, config);
}

/**
 * Chart 2: Scenario Comparison (Grouped Bar Chart)
 * Compare multiple saved properties side-by-side
 */
function renderScenarioComparison(scenarios) {
    const ctx = document.getElementById('comparison-chart');
    if (!ctx) return;

    if (chartInstances.scenarioComparison) {
        chartInstances.scenarioComparison.destroy();
    }

    const labels = scenarios.map(s => s.name);

    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Principal & Interest',
                data: scenarios.map(s => s.calculations.principalAndInterest),
                backgroundColor: '#2563eb'
            },
            {
                label: 'PMI',
                data: scenarios.map(s => s.calculations.pmi),
                backgroundColor: '#f59e0b'
            },
            {
                label: 'Property Tax',
                data: scenarios.map(s => s.propertyInfo.propertyTax),
                backgroundColor: '#10b981'
            },
            {
                label: 'Insurance',
                data: scenarios.map(s => s.propertyInfo.insurance),
                backgroundColor: '#8b5cf6'
            },
            {
                label: 'HOA',
                data: scenarios.map(s => s.propertyInfo.hoa),
                backgroundColor: '#ec4899'
            }
        ]
    };

    const config = {
        type: 'bar',
        data: data,
        options: {
            ...defaultChartOptions,
            scales: {
                x: {
                    stacked: true,
                    grid: {
                        display: false
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    };

    chartInstances.scenarioComparison = new Chart(ctx, config);
}

/**
 * Chart 3: Equity Buildup (Multi-line Chart)
 * Shows loan balance, home value, and equity over time
 */
function renderEquityChart(equityData) {
    const ctx = document.getElementById('equity-chart');
    if (!ctx) return;

    if (chartInstances.equity) {
        chartInstances.equity.destroy();
    }

    const labels = equityData.map(d => `Year ${d.year}`);

    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Home Value',
                data: equityData.map(d => d.homeValue),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4
            },
            {
                label: 'Loan Balance',
                data: equityData.map(d => d.loanBalance),
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: true,
                tension: 0.4
            },
            {
                label: 'Equity',
                data: equityData.map(d => d.equity),
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 3
            }
        ]
    };

    const config = {
        type: 'line',
        data: data,
        options: {
            ...defaultChartOptions,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    };

    chartInstances.equity = new Chart(ctx, config);
}

/**
 * Chart 4: Investment vs Home Equity (Line Chart)
 * Compare down payment invested vs. equity buildup
 */
function renderInvestmentChart(comparisonData) {
    const ctx = document.getElementById('investment-chart');
    if (!ctx) return;

    if (chartInstances.investment) {
        chartInstances.investment.destroy();
    }

    const years = comparisonData.equity.length;
    const labels = Array.from({length: years}, (_, i) => `Year ${i + 1}`);

    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Home Equity',
                data: comparisonData.equity.map(d => d.equity),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                fill: true,
                tension: 0.4,
                borderWidth: 3
            },
            {
                label: 'Investment Portfolio',
                data: comparisonData.investment.map(d => d.value),
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                fill: true,
                tension: 0.4,
                borderWidth: 3
            }
        ]
    };

    const config = {
        type: 'line',
        data: data,
        options: {
            ...defaultChartOptions,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            },
            plugins: {
                ...defaultChartOptions.plugins,
                annotation: comparisonData.crossoverYear ? {
                    annotations: {
                        crossover: {
                            type: 'line',
                            xMin: comparisonData.crossoverYear - 1,
                            xMax: comparisonData.crossoverYear - 1,
                            borderColor: '#ef4444',
                            borderWidth: 2,
                            borderDash: [5, 5],
                            label: {
                                content: `Crossover: Year ${comparisonData.crossoverYear}`,
                                enabled: true,
                                position: 'top'
                            }
                        }
                    }
                } : {}
            }
        }
    };

    chartInstances.investment = new Chart(ctx, config);
}

/**
 * Chart: Net Worth Growth (Stacked Area Chart)
 * Home equity + Investment portfolio with correct monthly contributions
 */
function renderNetWorthChart(financialProjection, years) {
    const ctx = document.getElementById('networth-chart');
    if (!ctx) return;

    if (chartInstances.netWorth) {
        chartInstances.netWorth.destroy();
    }

    const yearlyData = financialProjection.yearlyData;
    const labels = yearlyData.map(d => `Year ${d.year}`);

    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Home Equity',
                data: yearlyData.map(d => d.equity),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.4)',
                fill: true,
                tension: 0.4,
                borderWidth: 2
            },
            {
                label: 'Investment Portfolio',
                data: yearlyData.map(d => d.portfolio),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.4)',
                fill: true,
                tension: 0.4,
                borderWidth: 2
            },
            {
                label: 'Total Net Worth',
                data: yearlyData.map(d => d.netWorth),
                borderColor: '#8b5cf6',
                backgroundColor: 'transparent',
                fill: false,
                tension: 0.4,
                borderWidth: 3,
                borderDash: [5, 5]
            }
        ]
    };

    const config = {
        type: 'line',
        data: data,
        options: {
            ...defaultChartOptions,
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: {
                y: {
                    stacked: false,
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    };

    chartInstances.netWorth = new Chart(ctx, config);
}

/**
 * Chart: Income vs Expenses Over Time (Mixed Chart)
 * Shows income growth, expenses, and net cash flow with life events
 */
function renderCashFlowChart(financialProjection, years) {
    const ctx = document.getElementById('cashflow-chart');
    if (!ctx) return;

    if (chartInstances.cashFlow) {
        chartInstances.cashFlow.destroy();
    }

    const yearlyData = financialProjection.yearlyData;
    const labels = yearlyData.map(d => `Year ${d.year}`);

    const data = {
        labels: labels,
        datasets: [
            {
                type: 'line',
                label: 'Monthly Income',
                data: yearlyData.map(d => d.monthlyIncome),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: false,
                tension: 0.4,
                borderWidth: 3,
                yAxisID: 'y'
            },
            {
                type: 'line',
                label: 'Monthly Expenses',
                data: yearlyData.map(d => d.monthlyExpenses),
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: false,
                tension: 0.4,
                borderWidth: 3,
                yAxisID: 'y'
            },
            {
                type: 'bar',
                label: 'Monthly Discretionary',
                data: yearlyData.map(d => d.monthlyDiscretionary),
                backgroundColor: yearlyData.map(d => d.monthlyDiscretionary >= 0 ? 'rgba(16, 185, 129, 0.6)' : 'rgba(239, 68, 68, 0.6)'),
                borderColor: yearlyData.map(d => d.monthlyDiscretionary >= 0 ? '#10b981' : '#ef4444'),
                borderWidth: 2,
                yAxisID: 'y'
            }
        ]
    };

    const config = {
        type: 'bar',
        data: data,
        options: {
            ...defaultChartOptions,
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    },
                    title: {
                        display: true,
                        text: 'Monthly Amount ($)'
                    }
                }
            },
            plugins: {
                ...defaultChartOptions.plugins,
                tooltip: {
                    ...defaultChartOptions.plugins.tooltip,
                    callbacks: {
                        afterBody: function(context) {
                            if (context[0].dataIndex < yearlyData.length) {
                                const data = yearlyData[context[0].dataIndex];
                                if (data.oneTimeExpense > 0) {
                                    return `One-time expense: ${formatCurrency(data.oneTimeExpense)}`;
                                }
                            }
                            return '';
                        }
                    }
                }
            }
        }
    };

    chartInstances.cashFlow = new Chart(ctx, config);
}

/**
 * Chart 7: Comprehensive House Comparison (Multi-line Chart)
 * Compare total net worth between two scenarios over time
 */
function renderComprehensiveComparisonChart(scenarioA, scenarioB, timeframe) {
    const ctx = document.getElementById('house-comparison-chart');
    if (!ctx) return;

    if (chartInstances.houseComparison) {
        chartInstances.houseComparison.destroy();
    }

    const years = Math.min(timeframe, scenarioA.netWorthData.length, scenarioB.netWorthData.length);
    const labels = Array.from({length: years}, (_, i) => `Year ${i + 1}`);

    const datasets = [
        {
            label: `${scenarioA.scenario.name} - Home Equity`,
            data: scenarioA.netWorthData.slice(0, years).map(d => d.equity),
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: false,
            tension: 0.4,
            borderWidth: 2,
            borderDash: [5, 5]
        },
        {
            label: `${scenarioA.scenario.name} - Investment Portfolio`,
            data: scenarioA.netWorthData.slice(0, years).map(d => d.portfolio),
            borderColor: '#f97316',
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
            fill: false,
            tension: 0.4,
            borderWidth: 2,
            borderDash: [5, 5]
        },
        {
            label: `${scenarioA.scenario.name} - Total Net Worth`,
            data: scenarioA.netWorthData.slice(0, years).map(d => d.totalNetWorth),
            borderColor: '#dc2626',
            backgroundColor: 'rgba(220, 38, 38, 0.2)',
            fill: true,
            tension: 0.4,
            borderWidth: 3
        },
        {
            label: `${scenarioB.scenario.name} - Home Equity`,
            data: scenarioB.netWorthData.slice(0, years).map(d => d.equity),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: false,
            tension: 0.4,
            borderWidth: 2,
            borderDash: [5, 5]
        },
        {
            label: `${scenarioB.scenario.name} - Investment Portfolio`,
            data: scenarioB.netWorthData.slice(0, years).map(d => d.portfolio),
            borderColor: '#14b8a6',
            backgroundColor: 'rgba(20, 184, 166, 0.1)',
            fill: false,
            tension: 0.4,
            borderWidth: 2,
            borderDash: [5, 5]
        },
        {
            label: `${scenarioB.scenario.name} - Total Net Worth`,
            data: scenarioB.netWorthData.slice(0, years).map(d => d.totalNetWorth),
            borderColor: '#059669',
            backgroundColor: 'rgba(5, 150, 105, 0.2)',
            fill: true,
            tension: 0.4,
            borderWidth: 3
        }
    ];

    const data = {
        labels: labels,
        datasets: datasets
    };

    const config = {
        type: 'line',
        data: data,
        options: {
            ...defaultChartOptions,
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            },
            plugins: {
                ...defaultChartOptions.plugins,
                title: {
                    display: false
                }
            }
        }
    };

    chartInstances.houseComparison = new Chart(ctx, config);
}

/**
 * Chart 7 (Old): House Price Comparison (Multi-line/Stacked Area Chart)
 * Compare total wealth: expensive house vs cheaper house + investments
 * DEPRECATED - kept for backwards compatibility
 */
function renderHousePriceComparisonChart(comparisonData, timeframe) {
    const ctx = document.getElementById('house-comparison-chart');
    if (!ctx) return;

    if (chartInstances.houseComparison) {
        chartInstances.houseComparison.destroy();
    }

    const years = Math.min(timeframe, comparisonData.expensiveHouseWealth.length, comparisonData.cheaperHouseWealth.length);
    const labels = Array.from({length: years}, (_, i) => `Year ${i + 1}`);

    const datasets = [
        {
            label: 'Expensive House - Total Equity',
            data: comparisonData.expensiveHouseWealth.slice(0, years).map(d => d.equity),
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            fill: true,
            tension: 0.4,
            borderWidth: 3
        },
        {
            label: 'Cheaper House - Home Equity',
            data: comparisonData.cheaperHouseWealth.slice(0, years).map(d => d.equity),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.3)',
            fill: true,
            tension: 0.4,
            borderWidth: 2
        },
        {
            label: 'Cheaper House - Investment Portfolio',
            data: comparisonData.cheaperHouseWealth.slice(0, years).map(d => d.investmentValue),
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.3)',
            fill: true,
            tension: 0.4,
            borderWidth: 2
        },
        {
            label: 'Cheaper House - Total Wealth',
            data: comparisonData.cheaperHouseWealth.slice(0, years).map(d => d.totalWealth),
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            fill: false,
            tension: 0.4,
            borderWidth: 3,
            borderDash: [5, 5]
        }
    ];

    const data = {
        labels: labels,
        datasets: datasets
    };

    const annotations = {};
    if (comparisonData.breakEvenYear && comparisonData.breakEvenYear <= years) {
        annotations.breakeven = {
            type: 'line',
            xMin: comparisonData.breakEvenYear - 1,
            xMax: comparisonData.breakEvenYear - 1,
            borderColor: '#8b5cf6',
            borderWidth: 3,
            borderDash: [10, 5],
            label: {
                content: `Break-even: Year ${comparisonData.breakEvenYear}`,
                enabled: true,
                position: 'start',
                backgroundColor: '#8b5cf6',
                color: 'white',
                font: {
                    weight: 'bold'
                }
            }
        };
    }

    const config = {
        type: 'line',
        data: data,
        options: {
            ...defaultChartOptions,
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            },
            plugins: {
                ...defaultChartOptions.plugins,
                title: {
                    display: false
                },
                annotation: Object.keys(annotations).length > 0 ? { annotations } : undefined
            }
        }
    };

    chartInstances.houseComparison = new Chart(ctx, config);
}

/**
 * Chart: Buy vs Rent Comparison (Multi-line Chart)
 * Total net worth: buying this house vs. continuing to rent
 */
function renderRentComparisonChart(comparison, years) {
    const ctx = document.getElementById('rent-comparison-chart');
    if (!ctx) return;

    if (chartInstances.rentComparison) {
        chartInstances.rentComparison.destroy();
    }

    const buyData = comparison.buy;
    const rentData = comparison.rent;
    const labels = buyData.map(d => `Year ${d.year}`);

    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Buy House - Total Net Worth',
                data: buyData.map(d => d.netWorth),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                fill: true,
                tension: 0.4,
                borderWidth: 3
            },
            {
                label: 'Buy House - Home Equity',
                data: buyData.map(d => d.equity),
                borderColor: '#059669',
                backgroundColor: 'transparent',
                fill: false,
                tension: 0.4,
                borderWidth: 2,
                borderDash: [5, 5]
            },
            {
                label: 'Buy House - Investment Portfolio',
                data: buyData.map(d => d.portfolio),
                borderColor: '#34d399',
                backgroundColor: 'transparent',
                fill: false,
                tension: 0.4,
                borderWidth: 2,
                borderDash: [5, 5]
            },
            {
                label: 'Keep Renting - Total Net Worth',
                data: rentData.map(d => d.netWorth),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                fill: true,
                tension: 0.4,
                borderWidth: 3
            }
        ]
    };

    // Find crossover point
    let crossoverYear = null;
    for (let i = 0; i < buyData.length; i++) {
        if (i === 0) continue;
        const buyNW = buyData[i].netWorth;
        const rentNW = rentData[i].netWorth;
        const prevBuyNW = buyData[i-1].netWorth;
        const prevRentNW = rentData[i-1].netWorth;

        if ((prevBuyNW < prevRentNW && buyNW >= rentNW) || (prevBuyNW > prevRentNW && buyNW <= rentNW)) {
            crossoverYear = i;
            break;
        }
    }

    const annotations = {};
    if (crossoverYear !== null) {
        annotations.crossover = {
            type: 'line',
            xMin: crossoverYear,
            xMax: crossoverYear,
            borderColor: '#8b5cf6',
            borderWidth: 2,
            borderDash: [10, 5],
            label: {
                content: `Break-even: Year ${crossoverYear + 1}`,
                enabled: true,
                position: 'start',
                backgroundColor: '#8b5cf6',
                color: 'white',
                font: {
                    weight: 'bold'
                }
            }
        };
    }

    const config = {
        type: 'line',
        data: data,
        options: {
            ...defaultChartOptions,
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            },
            plugins: {
                ...defaultChartOptions.plugins,
                annotation: Object.keys(annotations).length > 0 ? { annotations } : undefined
            }
        }
    };

    chartInstances.rentComparison = new Chart(ctx, config);
}

/**
 * Destroy all chart instances
 */
function destroyAllCharts() {
    Object.values(chartInstances).forEach(chart => {
        if (chart) chart.destroy();
    });
}

/**
 * Update a specific chart with new data
 */
function updateChart(chartName, newData) {
    const chart = chartInstances[chartName];
    if (chart) {
        chart.data = newData;
        chart.update();
    }
}
