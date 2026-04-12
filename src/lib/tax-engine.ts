export interface TaxSlab {
  rate: number;
  label: string;
}

export const GST_SLABS: Record<string, number> = {
  "Electronics": 18,
  "Essentials": 5,
  "Luxury": 28,
  "Services": 12,
  "Default": 18
};

export interface TaxCalculation {
  taxableAmount: number;
  taxAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalAmount: number;
  rate: number;
}

/**
 * Calculate tax breakdown from a total (inclusive) amount
 */
export function calculateTaxFromTotal(totalAmount: number, rate: number = 18, isInterState: boolean = false): TaxCalculation {
  const taxableAmount = totalAmount / (1 + (rate / 100));
  const taxAmount = totalAmount - taxableAmount;
  
  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (isInterState) {
    igst = taxAmount;
  } else {
    cgst = taxAmount / 2;
    sgst = taxAmount / 2;
  }

  return {
    taxableAmount: Math.round(taxableAmount * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    cgst: Math.round(cgst * 100) / 100,
    sgst: Math.round(sgst * 100) / 100,
    igst: Math.round(igst * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
    rate
  };
}

/**
 * Summarize tax liability from a list of transactions
 */
export function summarizeTaxLiability(transactions: any[]) {
  return transactions.reduce((acc, tx) => {
    const rate = GST_SLABS[tx.category] || GST_SLABS["Default"];
    const calc = calculateTaxFromTotal(tx.amount || 0, rate);

    if (tx.type === 'credit') {
      // Output Tax (Collect from customers)
      acc.outputTax += calc.taxAmount;
      acc.cgstOutput += calc.cgst;
      acc.sgstOutput += calc.sgst;
      acc.totalSales += calc.taxableAmount;
    } else {
      // Input Tax Credit (Paid to suppliers)
      acc.inputTaxCredit += calc.taxAmount;
      acc.cgstInput += calc.cgst;
      acc.sgstInput += calc.sgst;
      acc.totalPurchases += calc.taxableAmount;
    }

    return acc;
  }, {
    outputTax: 0,
    inputTaxCredit: 0,
    cgstOutput: 0,
    sgstOutput: 0,
    cgstInput: 0,
    sgstInput: 0,
    totalSales: 0,
    totalPurchases: 0,
    liability: 0
  });
}
