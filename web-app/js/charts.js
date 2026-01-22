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
 * Chart 5: Net Worth Impact (Area Chart)
 * Total assets minus debt over time
 */
function renderNetWorthChart(equityData, investmentData) {
    const ctx = document.getElementById('networth-chart');
    if (!ctx) return;

    if (chartInstances.netWorth) {
        chartInstances.netWorth.destroy();
    }

    const years = Math.min(equityData.length, investmentData.length);
    const labels = Array.from({length: years}, (_, i) => `Year ${i + 1}`);

    // Calculate net worth: home equity - loan balance
    const netWorthData = equityData.slice(0, years).map((d, i) => {
        return d.equity + (investmentData[i]?.value || 0);
    });

    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Net Worth',
                data: netWorthData,
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.3)',
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

    chartInstances.netWorth = new Chart(ctx, config);
}

/**
 * Chart 6: Cash Flow Analysis (Bar Chart)
 * Annual cash outflows
 */
function renderCashFlowChart(paymentData, years) {
    const ctx = document.getElementById('cashflow-chart');
    if (!ctx) return;

    if (chartInstances.cashFlow) {
        chartInstances.cashFlow.destroy();
    }

    const annualCost = paymentData.totalPayment * 12;
    const labels = Array.from({length: years}, (_, i) => `Year ${i + 1}`);
    const cashFlowData = Array(years).fill(-annualCost);

    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Annual Housing Cost',
                data: cashFlowData,
                backgroundColor: '#ef4444',
                borderColor: '#dc2626',
                borderWidth: 2
            }
        ]
    };

    const config = {
        type: 'bar',
        data: data,
        options: {
            ...defaultChartOptions,
            scales: {
                y: {
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
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
