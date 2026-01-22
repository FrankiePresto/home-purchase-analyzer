# Home Purchase Analysis Tools

A comprehensive toolkit for analyzing home purchases, including financial calculations, visualizations, and scenario comparisons to help make informed decisions when buying a home.

## Overview

This project provides two complementary tools:
1. **Excel Tracker** - Spreadsheet for tracking and comparing multiple properties
2. **Web Application** - Interactive calculator with advanced visualizations and investment analysis

---

## Quick Start

### Web Application

1. Open `web-app/index.html` in your web browser
2. Enter property and income information in the Calculator tab
3. Click "Calculate" to see results and payment breakdown
4. Save scenarios to compare different properties
5. Use the Analysis tab for long-term projections and investment comparisons

**No installation required** - just open the HTML file in any modern web browser!

### Excel Tracker

See the `Excel_Tracker_Instructions.md` file for detailed instructions on creating the Excel tracker from the provided template.

---

## Features

### Web Application Features

#### Calculator Tab
- **Property Information Input**
  - Purchase price
  - Down payment percentage (with visual slider)
  - Interest rate
  - Loan term (10-30 years)
  - Monthly property tax
  - Homeowners insurance
  - HOA/condo fees
  - Estimated utilities and maintenance

- **Income & Investment Input**
  - Annual gross income
  - Current monthly debt payments
  - Expected investment return rate
  - Current investment portfolio value

- **Instant Results**
  - Monthly payment breakdown (P&I, PMI, taxes, insurance, HOA)
  - Total monthly cost including all expenses
  - Affordability assessment with color-coded indicators
  - Opportunity cost of down payment (if invested)
  - Interactive payment breakdown chart

#### Compare Tab
- Save multiple scenarios for different properties
- Side-by-side comparison table
- Visual comparison with stacked bar charts
- Export saved scenarios to JSON
- Load previous scenarios to modify

#### Analysis Tab
- **Equity Buildup Chart** - See how equity grows over time through principal paydown and appreciation
- **Investment vs Down Payment** - Compare home equity vs. investing the down payment
- **Net Worth Impact** - Total wealth projection over time
- **Cash Flow Analysis** - Annual housing costs visualization

- **House Price Comparison Tool**
  - Compare buying an expensive house vs. a cheaper house + investing the savings
  - Calculate monthly savings from choosing a less expensive home
  - Show break-even point where strategies equalize
  - Visualize total wealth over custom timeframes (1-40 years)
  - Adjustable appreciation and investment return rates

### Excel Tracker Features

- Track multiple properties simultaneously
- Automated mortgage payment calculations (PMT formula)
- PMI calculation (when down payment < 20%)
- Total monthly cost breakdown
- Conditional formatting to highlight best options
- Affordability guidelines reference sheet
- Amortization schedule template

---

## Calculations & Formulas

### Mortgage Payment (PMT Formula)
```
M = P × [i(1 + i)^n] / [(1 + i)^n - 1]

Where:
M = Monthly payment
P = Principal (loan amount)
i = Monthly interest rate (annual rate / 12)
n = Number of payments (years × 12)
```

### PMI (Private Mortgage Insurance)
- Only required when down payment < 20%
- Typical rate: 0.5% - 1.5% of loan amount annually
- Default used: 0.75% annually

### Equity Calculation
```
Equity = Down Payment + Principal Paid + Home Appreciation
```

### Investment Growth (Compound Interest)
```
A = P(1 + r)^t + PMT × [((1 + r)^t - 1) / r]

Where:
A = Future value
P = Initial principal
r = Rate per period
t = Number of periods
PMT = Periodic payment
```

### Affordability Ratios

**28% Rule (Housing Ratio)**
- Monthly housing payment ≤ 28% of gross monthly income
- Status indicators:
  - Green (0-28%): Excellent
  - Yellow (28-33%): Good
  - Orange (33-40%): Caution
  - Red (>40%): Warning

**36% Rule (Debt-to-Income Ratio)**
- All monthly debt payments ≤ 36% of gross monthly income
- Some lenders allow up to 43%

---

## Usage Tips

### Workflow Recommendation

1. **Initial Search (Excel Tracker)**
   - Track 5-10 properties you're considering
   - Compare basic metrics (price, monthly cost, location)
   - Quickly identify top candidates

2. **Deep Analysis (Web Application)**
   - Take your top 2-3 finalists to the web app
   - Run detailed calculations and projections
   - Analyze 10, 20, 30-year scenarios
   - Compare expensive vs. cheaper house strategies

3. **Decision Making**
   - Review both tools together
   - Consider short-term affordability (Excel)
   - Evaluate long-term wealth impact (Web app)
   - Factor in personal preferences and location

### Best Practices

- **Update assumptions regularly** - Interest rates and property values change
- **Be conservative with appreciation** - Historical average is ~3%, but varies by location
- **Consider all costs** - Don't forget maintenance, repairs, and potential renovations
- **Save multiple scenarios** - Compare different down payment amounts, loan terms, etc.
- **Test sensitivity** - Try different investment returns and appreciation rates

---

## Assumptions & Defaults

| Parameter | Default Value | Typical Range | Notes |
|-----------|--------------|---------------|-------|
| Interest Rate | 6.5% | 2-15% | Varies by market conditions |
| Loan Term | 30 years | 10-30 years | Most common is 30 years |
| PMI Rate | 0.75% | 0.5-1.5% | Only when down < 20% |
| Home Appreciation | 3% | 0-10% | Historical average, varies by location |
| Investment Return | 8% | 4-12% | Historical stock market average |
| Maintenance Cost | 1% annually | 1-2% | Rule of thumb for upkeep |
| Property Tax | Varies | 0.5-2.5% | Highly location-dependent |

---

## Important Disclaimers

⚠️ **This tool provides estimates for educational purposes only**

- **Not Financial Advice** - Consult with financial advisors, mortgage professionals, and real estate experts for actual decisions
- **Actual Costs May Vary** - Interest rates, property taxes, insurance, and appreciation rates fluctuate
- **Location Matters** - Property taxes, appreciation, and costs vary significantly by location
- **Hidden Costs** - Does not include: closing costs, inspections, moving expenses, repairs, renovations, HOA special assessments
- **Tax Benefits** - Does not calculate mortgage interest deduction or property tax deduction
- **Insurance Variations** - Actual costs depend on coverage, deductibles, location, and risk factors
- **Market Risk** - Investment returns and home values are not guaranteed

---

## Technologies Used

### Web Application
- **HTML5** - Structure and semantics
- **CSS3** - Styling with Grid and Flexbox layouts
- **Vanilla JavaScript (ES6+)** - Application logic
- **Chart.js v4.x** - Data visualization
- **localStorage API** - Data persistence

### Excel Tracker
- **Microsoft Excel 2007+** (.xlsx format)
- Compatible with Google Sheets
- Uses built-in Excel formulas (PMT, IF, SUM)

---

## Browser Compatibility

**Supported Browsers:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Required Features:**
- ES6+ JavaScript support
- localStorage API
- HTML5 Canvas (for Chart.js)
- CSS Grid and Flexbox

---

## File Structure

```
home_purchase/
├── README.md                           # This file
├── Excel_Tracker_Instructions.md       # How to create Excel tracker
├── home-purchase-tracker-template.csv  # CSV template for Excel
└── web-app/                            # Web application
    ├── index.html                      # Main HTML file
    ├── css/
    │   └── styles.css                  # Styling
    ├── js/
    │   ├── calculator.js               # Financial calculations
    │   ├── charts.js                   # Chart visualizations
    │   ├── data-manager.js             # Data persistence
    │   └── app.js                      # Main application logic
    └── assets/
        └── favicon.ico                 # (Optional) Site icon
```

---

## Frequently Asked Questions

**Q: Can I use this on my phone or tablet?**
A: Yes! The web application is fully responsive and works on mobile devices.

**Q: Is my data secure?**
A: All data is stored locally in your browser using localStorage. Nothing is sent to any server.

**Q: Can I share my scenarios with others?**
A: Yes! Use the "Export Data" button to save scenarios as JSON, then share the file.

**Q: Why doesn't my PMI go away after 20% equity?**
A: The calculator currently assumes PMI for the loan duration if initial down payment < 20%. In reality, you can request PMI removal once you reach 20% equity.

**Q: Can I customize the formulas or assumptions?**
A: The web app uses fixed formulas, but you can adjust inputs like appreciation rate and investment return. The Excel tracker formulas can be modified directly.

**Q: How accurate are these calculations?**
A: The calculations use standard financial formulas and are mathematically accurate. However, real-world results depend on many factors and can vary significantly.

---

## Future Enhancements

Potential additions for future versions:
- Tax benefit calculations (mortgage interest deduction)
- Rent vs. buy comparison
- Refinancing scenario analysis
- FHA/VA loan specific calculations
- Integration with real estate APIs (Zillow, Redfin)
- PDF export of scenarios
- More chart customization options
- Mobile app version

---

## Support & Feedback

For issues, suggestions, or questions:
- Review the documentation in this README
- Check the Excel_Tracker_Instructions.md for Excel-specific help
- Test with different scenarios to understand the calculations

---

## License

This project is provided for educational purposes. Feel free to use, modify, and distribute as needed.

---

## Acknowledgments

- Chart.js for excellent visualization library
- Financial formulas based on standard mortgage industry calculations
- Affordability guidelines from typical lending standards

---

**Remember**: Buying a home is one of the biggest financial decisions you'll make. Use these tools to inform your decision, but always consult with qualified professionals before making final commitments.

**Happy home hunting!** 🏡
