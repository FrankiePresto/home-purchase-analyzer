/**
 * Data Manager
 * Handles local storage, scenario management, and data persistence
 */

const STORAGE_KEYS = {
    SCENARIOS: 'home-purchase-scenarios',
    SETTINGS: 'home-purchase-settings'
};

/**
 * Scenario template structure
 */
const createScenarioTemplate = () => ({
    id: generateUUID(),
    name: '',
    timestamp: new Date().toISOString(),
    propertyInfo: {
        purchasePrice: 0,
        downPaymentPercent: 0,
        downPaymentAmount: 0,
        interestRate: 0,
        loanTerm: 30,
        propertyTax: 0,
        insurance: 0,
        hoa: 0,
        utilities: 0,
        maintenance: 0
    },
    incomeInfo: {
        annualIncome: 0,
        monthlyDebts: 0,
        investmentReturn: 0,
        currentPortfolio: 0
    },
    calculations: null
});

/**
 * Generate a simple UUID
 */
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Save a scenario to localStorage
 * @param {Object} scenario - Scenario object to save
 * @returns {boolean} Success status
 */
function saveScenario(scenario) {
    try {
        const scenarios = loadScenarios();

        // Check if scenario already exists (update) or is new
        const existingIndex = scenarios.findIndex(s => s.id === scenario.id);

        if (existingIndex >= 0) {
            // Update existing scenario
            scenario.timestamp = new Date().toISOString();
            scenarios[existingIndex] = scenario;
        } else {
            // Add new scenario
            if (!scenario.id) {
                scenario.id = generateUUID();
            }
            scenario.timestamp = new Date().toISOString();
            scenarios.push(scenario);
        }

        localStorage.setItem(STORAGE_KEYS.SCENARIOS, JSON.stringify(scenarios));
        return true;
    } catch (error) {
        console.error('Error saving scenario:', error);
        return false;
    }
}

/**
 * Load all scenarios from localStorage
 * @returns {Array} Array of scenario objects
 */
function loadScenarios() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.SCENARIOS);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error loading scenarios:', error);
        return [];
    }
}

/**
 * Get a specific scenario by ID
 * @param {string} id - Scenario ID
 * @returns {Object|null} Scenario object or null if not found
 */
function getScenario(id) {
    const scenarios = loadScenarios();
    return scenarios.find(s => s.id === id) || null;
}

/**
 * Delete a scenario by ID
 * @param {string} id - Scenario ID
 * @returns {boolean} Success status
 */
function deleteScenario(id) {
    try {
        const scenarios = loadScenarios();
        const filtered = scenarios.filter(s => s.id !== id);

        if (filtered.length === scenarios.length) {
            // ID not found
            return false;
        }

        localStorage.setItem(STORAGE_KEYS.SCENARIOS, JSON.stringify(filtered));
        return true;
    } catch (error) {
        console.error('Error deleting scenario:', error);
        return false;
    }
}

/**
 * Update an existing scenario
 * @param {string} id - Scenario ID
 * @param {Object} updates - Partial scenario object with updates
 * @returns {boolean} Success status
 */
function updateScenario(id, updates) {
    const scenario = getScenario(id);
    if (!scenario) return false;

    const updatedScenario = { ...scenario, ...updates };
    return saveScenario(updatedScenario);
}

/**
 * Export scenarios to JSON file
 * @param {Array} scenarios - Scenarios to export (optional, defaults to all)
 */
function exportToJSON(scenarios = null) {
    const data = scenarios || loadScenarios();
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `home-purchase-scenarios-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Import scenarios from JSON file
 * @param {string} jsonString - JSON string containing scenarios
 * @returns {Object} Result with success status and message
 */
function importFromJSON(jsonString) {
    try {
        const importedScenarios = JSON.parse(jsonString);

        if (!Array.isArray(importedScenarios)) {
            return {
                success: false,
                message: 'Invalid JSON format: expected an array of scenarios'
            };
        }

        // Validate each scenario
        for (const scenario of importedScenarios) {
            if (!validateScenario(scenario).valid) {
                return {
                    success: false,
                    message: 'Invalid scenario data in import file'
                };
            }
        }

        // Load existing scenarios
        const existingScenarios = loadScenarios();

        // Merge scenarios (avoid duplicates based on ID)
        const mergedScenarios = [...existingScenarios];
        let newCount = 0;
        let updatedCount = 0;

        for (const imported of importedScenarios) {
            const existingIndex = mergedScenarios.findIndex(s => s.id === imported.id);

            if (existingIndex >= 0) {
                // Update existing
                mergedScenarios[existingIndex] = imported;
                updatedCount++;
            } else {
                // Add new
                mergedScenarios.push(imported);
                newCount++;
            }
        }

        localStorage.setItem(STORAGE_KEYS.SCENARIOS, JSON.stringify(mergedScenarios));

        return {
            success: true,
            message: `Import successful: ${newCount} new scenarios added, ${updatedCount} updated`,
            newCount,
            updatedCount
        };
    } catch (error) {
        return {
            success: false,
            message: `Error importing scenarios: ${error.message}`
        };
    }
}

/**
 * Export scenario to CSV format
 * @param {Object} scenario - Scenario to export
 * @returns {string} CSV string
 */
function exportToCSV(scenario) {
    const headers = [
        'Property Name',
        'Purchase Price',
        'Down Payment %',
        'Interest Rate',
        'Loan Term',
        'Property Tax',
        'Insurance',
        'HOA',
        'Utilities',
        'Maintenance',
        'Annual Income',
        'Monthly Debts',
        'Investment Return',
        'Timestamp'
    ];

    const row = [
        scenario.name,
        scenario.propertyInfo.purchasePrice,
        scenario.propertyInfo.downPaymentPercent,
        scenario.propertyInfo.interestRate,
        scenario.propertyInfo.loanTerm,
        scenario.propertyInfo.propertyTax,
        scenario.propertyInfo.insurance,
        scenario.propertyInfo.hoa,
        scenario.propertyInfo.utilities,
        scenario.propertyInfo.maintenance,
        scenario.incomeInfo.annualIncome,
        scenario.incomeInfo.monthlyDebts,
        scenario.incomeInfo.investmentReturn,
        scenario.timestamp
    ];

    const csv = [headers.join(','), row.join(',')].join('\n');
    return csv;
}

/**
 * Validate scenario data
 * @param {Object} scenario - Scenario to validate
 * @returns {Object} Validation result with valid flag and errors array
 */
function validateScenario(scenario) {
    const errors = [];

    if (!scenario.name || scenario.name.trim() === '') {
        errors.push('Scenario name is required');
    }

    if (!scenario.propertyInfo) {
        errors.push('Property information is missing');
    } else {
        if (scenario.propertyInfo.purchasePrice <= 0) {
            errors.push('Purchase price must be greater than 0');
        }
        if (scenario.propertyInfo.downPaymentPercent < 0 || scenario.propertyInfo.downPaymentPercent > 100) {
            errors.push('Down payment percent must be between 0 and 100');
        }
        if (scenario.propertyInfo.interestRate < 0) {
            errors.push('Interest rate cannot be negative');
        }
        if (scenario.propertyInfo.loanTerm <= 0) {
            errors.push('Loan term must be greater than 0');
        }
    }

    if (!scenario.incomeInfo) {
        errors.push('Income information is missing');
    } else {
        if (scenario.incomeInfo.annualIncome <= 0) {
            errors.push('Annual income must be greater than 0');
        }
    }

    return {
        valid: errors.length === 0,
        errors: errors
    };
}

/**
 * Get localStorage usage information
 * @returns {Object} Storage usage stats
 */
function getStorageUsage() {
    try {
        const scenarios = loadScenarios();
        const scenariosSize = new Blob([JSON.stringify(scenarios)]).size;
        const totalSize = new Blob([JSON.stringify(localStorage)]).size;

        // localStorage typically has a 5-10MB limit
        const estimatedLimit = 5 * 1024 * 1024; // 5MB

        return {
            scenariosCount: scenarios.length,
            scenariosSize: scenariosSize,
            totalSize: totalSize,
            percentUsed: (totalSize / estimatedLimit) * 100,
            nearLimit: (totalSize / estimatedLimit) > 0.8
        };
    } catch (error) {
        console.error('Error getting storage usage:', error);
        return null;
    }
}

/**
 * Clear all scenarios (with confirmation)
 * @returns {boolean} Success status
 */
function clearAllData() {
    try {
        localStorage.removeItem(STORAGE_KEYS.SCENARIOS);
        return true;
    } catch (error) {
        console.error('Error clearing data:', error);
        return false;
    }
}

/**
 * Save app settings
 * @param {Object} settings - Settings object
 */
function saveSettings(settings) {
    try {
        const currentSettings = loadSettings();
        const mergedSettings = { ...currentSettings, ...settings };
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(mergedSettings));
        return true;
    } catch (error) {
        console.error('Error saving settings:', error);
        return false;
    }
}

/**
 * Load app settings
 * @returns {Object} Settings object
 */
function loadSettings() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        return data ? JSON.parse(data) : getDefaultSettings();
    } catch (error) {
        console.error('Error loading settings:', error);
        return getDefaultSettings();
    }
}

/**
 * Get default settings
 * @returns {Object} Default settings
 */
function getDefaultSettings() {
    return {
        defaultInvestmentReturn: 8.0,
        defaultAppreciation: 3.0,
        defaultLoanTerm: 30,
        defaultDownPayment: 20,
        theme: 'light'
    };
}
