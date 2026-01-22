# Excel Home Purchase Tracker - Setup Instructions

This guide will help you create a comprehensive Excel spreadsheet to track and compare multiple properties.

---

## Overview

The Excel tracker consists of 3 sheets:
1. **Property Comparison** - Main tracking sheet for multiple properties
2. **Affordability Guidelines** - Reference sheet for income-based limits
3. **Amortization Template** - Optional detailed payment schedule

---

## Sheet 1: Property Comparison

### Step 1: Create Column Headers

Create a new Excel workbook and set up the following columns in Row 1:

| Column | Header | Type |
|--------|--------|------|
| A | Property Name | Text |
| B | Purchase Price | Currency |
| C | Down Payment % | Percentage |
| D | Down Payment $ | Currency (Formula) |
| E | Loan Amount | Currency (Formula) |
| F | Interest Rate | Percentage |
| G | Loan Term (Years) | Number |
| H | PMI % | Percentage |
| I | Monthly PMI | Currency (Formula) |
| J | Monthly P&I | Currency (Formula) |
| K | Monthly Property Tax | Currency |
| L | Monthly Insurance | Currency |
| M | Monthly HOA/Condo | Currency |
| N | Estimated Utilities | Currency |
| O | Estimated Maintenance | Currency |
| P | Total Monthly Payment | Currency (Formula) |
| Q | Total Monthly Cost | Currency (Formula) |
| R | Annual Cost | Currency (Formula) |
| S | Notes | Text |

### Step 2: Add Formulas (Starting in Row 2)

**Column D - Down Payment $ (D2)**
```excel
=B2*C2
```

**Column E - Loan Amount (E2)**
```excel
=B2-D2
```

**Column I - Monthly PMI (I2)**
```excel
=IF(C2<0.2, (E2*H2)/12, 0)
```
*This formula only applies PMI if down payment is less than 20%*

**Column J - Monthly P&I (J2)**
```excel
=PMT(F2/12, G2*12, -E2)
```
*The PMT function calculates the monthly principal and interest payment*

**Column P - Total Monthly Payment (P2)**
```excel
=J2+I2+K2+L2+M2
```
*Sum of P&I, PMI, property tax, insurance, and HOA*

**Column Q - Total Monthly Cost (Q2)**
```excel
=P2+N2+O2
```
*Adds utilities and maintenance to total payment*

**Column R - Annual Cost (R2)**
```excel
=Q2*12
```

### Step 3: Apply Formatting

1. **Header Row (Row 1)**
   - Select Row 1
   - Apply bold formatting
   - Fill with light blue background (or color of choice)
   - Freeze panes: View → Freeze Panes → Freeze Top Row

2. **Currency Columns (B, D, E, J-Q)**
   - Select columns
   - Format as Currency: `Ctrl+Shift+$` (Windows) or `Cmd+Shift+$` (Mac)
   - Or: Right-click → Format Cells → Currency → $

3. **Percentage Columns (C, F, H)**
   - Select columns
   - Format as Percentage: `Ctrl+Shift+%` (Windows) or `Cmd+Shift+%` (Mac)
   - Or: Right-click → Format Cells → Percentage → 2 decimal places

4. **Number Columns (G)**
   - Format as Number with 0 decimal places

### Step 4: Add Conditional Formatting

**Highlight Lowest Cost**
1. Select column Q (Total Monthly Cost) from Q2 down
2. Home → Conditional Formatting → New Rule
3. Select "Use a formula to determine which cells to format"
4. Enter formula: `=Q2=MIN(Q:Q)`
5. Format: Fill with light green

**Highlight Low Down Payment**
1. Select column C (Down Payment %) from C2 down
2. Conditional Formatting → New Rule
3. Select "Format cells that are less than"
4. Enter: 0.2 (which is 20%)
5. Format: Fill with light yellow

**Highlight High Housing Costs**
(Optional - requires affordability data)
1. Add a column for monthly income
2. Use conditional formatting to highlight when P/Income > 0.28

### Step 5: Add Data Validation

**Interest Rate (Column F)**
1. Select F2:F100
2. Data → Data Validation
3. Allow: Decimal
4. Between: 0 and 0.20 (0% to 20%)

**Down Payment % (Column C)**
1. Select C2:C100
2. Data Validation
3. Allow: Decimal
4. Between: 0 and 1 (0% to 100%)

**Loan Term (Column G)**
1. Select G2:G100
2. Data Validation
3. Allow: List
4. Source: 10,15,20,25,30

### Step 6: Add Sample Data (Optional)

Enter sample data in Row 2 to test your formulas:

| Column | Value |
|--------|-------|
| A | 123 Main Street |
| B | 400000 |
| C | 0.20 |
| F | 0.065 |
| G | 30 |
| H | 0.0075 |
| K | 400 |
| L | 150 |
| M | 0 |
| N | 200 |
| O | 333 |

All formulas should automatically calculate!

---

## Sheet 2: Affordability Guidelines

### Step 1: Create Reference Table

Create a new sheet named "Affordability Guidelines" with this structure:

| A | B | C |
|---|---|---|
| **Metric** | **Formula/Value** | **Guideline** |
| Monthly Gross Income | [User Input] | - |
| Max Housing (28% Rule) | =B2*0.28 | Payment ≤ 28% of income |
| Max Debt (36% Rule) | =B2*0.36 | All debt ≤ 36% of income |
| Recommended Emergency Fund | =B2*6 | 6 months of expenses |

### Step 2: Add Instructions

In cell A6, add:
```
Instructions: Enter your monthly gross income in cell B2.
The maximum housing payment and debt ratios will calculate automatically.
```

### Step 3: Format Table

1. Bold headers (Row 1)
2. Format B2 as Currency
3. Format B3:B5 as Currency (these contain formulas)
4. Add borders to the table

---

## Sheet 3: Amortization Template

### Step 1: Create Column Headers

Create a new sheet named "Amortization Template":

| Column | Header |
|--------|--------|
| A | Payment # |
| B | Payment Date |
| C | Beginning Balance |
| D | Payment |
| E | Principal |
| F | Interest |
| G | Ending Balance |

### Step 2: Add Formulas (Example for a $320,000 loan at 6.5% for 30 years)

**Setup Area (above the table)**
- Cell B1: Loan Amount: $320,000
- Cell B2: Annual Rate: 6.5%
- Cell B3: Monthly Rate: =B2/12
- Cell B4: Number of Payments: 360
- Cell B5: Monthly Payment: =PMT(B3, B4, -B1)

**Amortization Table (Starting Row 7)**

**Payment # (A7):**
```excel
=1
```
Then in A8: `=A7+1` and copy down

**Payment Date (B7):**
```excel
=DATE(2024,1,1)
```
Then in B8: `=EDATE(B7,1)` and copy down

**Beginning Balance (C7):**
```excel
=$B$1
```

**Payment (D7):**
```excel
=$B$5
```

**Interest (F7):**
```excel
=C7*$B$3
```

**Principal (E7):**
```excel
=D7-F7
```

**Ending Balance (G7):**
```excel
=C7-E7
```

**Next Row Beginning Balance (C8):**
```excel
=G7
```

### Step 3: Copy Formulas Down

1. Select row 7 (A7:G7)
2. Copy the row
3. Select rows 8-366 (for 360 payments)
4. Paste

The amortization schedule will automatically calculate!

---

## Tips & Tricks

### Tip 1: Auto-Calculate Maintenance
Instead of manually entering maintenance costs, use a formula in column O:
```excel
=(B2*0.01)/12
```
This calculates 1% of home value annually, divided by 12 months.

### Tip 2: Color-Code Properties
Use different fill colors for each row to easily distinguish properties when comparing.

### Tip 3: Add a Summary Section
Above your main table, create a summary:
- Lowest Monthly Cost: `=MIN(Q:Q)`
- Highest Monthly Cost: `=MAX(Q:Q)`
- Average Monthly Cost: `=AVERAGE(Q2:Q100)`

### Tip 4: Create a Chart
1. Select columns A, P, and Q (Property Name, Total Payment, Total Cost)
2. Insert → Column Chart
3. This creates a visual comparison of all properties

### Tip 5: Protect Formulas
After setting up:
1. Select all cells with formulas
2. Right-click → Format Cells → Protection → Locked
3. Review → Protect Sheet
4. This prevents accidental formula changes

### Tip 6: Use Named Ranges
For easier formula reading:
1. Select B2 → Name Box → Type "PurchasePrice"
2. Now you can use =PurchasePrice*0.01 instead of =B2*0.01

---

## Common Issues & Solutions

**Problem: PMT formula returns #NUM error**
- Solution: Check that interest rate is entered as decimal (6.5%, not 6.5)
- Solution: Ensure loan amount is negative in PMT formula: `=PMT(F2/12, G2*12, -E2)`

**Problem: Percentages showing as decimals**
- Solution: Format cells as Percentage (Ctrl+Shift+%)

**Problem: Currency showing without $ sign**
- Solution: Format as Currency, not just Number

**Problem: Formulas not calculating**
- Solution: Check that Calculation Options is set to "Automatic"
- File → Options → Formulas → Automatic

---

## Formula Reference

### PMT Function
```excel
=PMT(rate, nper, pv, [fv], [type])
```
- rate: Interest rate per period (annual rate / 12)
- nper: Total number of payments (years * 12)
- pv: Present value (loan amount) - use negative value
- fv: Future value (optional, usually 0)
- type: 0 = end of period, 1 = beginning (optional)

**Example:**
```excel
=PMT(0.065/12, 30*12, -320000)
```
Returns monthly payment for $320k at 6.5% for 30 years

### IF Function for Conditional PMI
```excel
=IF(condition, value_if_true, value_if_false)
```

**Example:**
```excel
=IF(C2<0.2, (E2*H2)/12, 0)
```
If down payment % < 20%, calculate PMI, otherwise 0

---

## Advanced Features

### Add a Dashboard Sheet

Create a visual summary sheet:

1. **Property Count:** `=COUNTA('Property Comparison'!A:A)-1`
2. **Average Price:** `=AVERAGE('Property Comparison'!B:B)`
3. **Price Range:** `=MAX('Property Comparison'!B:B)-MIN('Property Comparison'!B:B)`
4. **Best Value:** Use INDEX/MATCH to find property with lowest cost

### Link to Web Application

Add a hyperlink to your web application:
1. Insert → Hyperlink
2. Link to: file:///path/to/web-app/index.html
3. This allows quick switching between Excel and web app

### Export to Google Sheets

1. File → Save As → Change format to .xlsx
2. Upload to Google Drive
3. Open with Google Sheets
4. Most formulas will work identically

---

## Google Sheets Specific Instructions

If using Google Sheets instead of Excel:

**Same formulas work**, but conditional formatting access:
- Format → Conditional formatting

**Data validation:**
- Data → Data validation

**Freeze rows:**
- View → Freeze → 1 row

**Everything else is nearly identical!**

---

## Need Help?

- Test formulas with sample data first
- Use Excel's "Trace Precedents" feature to debug formula errors
- Check the README.md for calculation explanations
- Compare your results with the web application to verify accuracy

---

**You're now ready to track your home purchase options! Good luck with your home search!** 🏡
