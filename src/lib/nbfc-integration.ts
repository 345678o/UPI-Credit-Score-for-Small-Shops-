/**
 * Phase 4: Direct NBFC/Lender API Integration
 * 
 * This module handles integration with external Non-Banking Financial Companies (NBFCs)
 * and direct lenders for real-time loan processing, disbursement, and repayment tracking.
 */

export interface NBFCPartner {
  id: string;
  name: string;
  logo: string;
  interestRates: {
    min: number;
    max: number;
  };
  loanAmounts: {
    min: number;
    max: number;
  };
  tenures: number[];
  processingTime: string;
  approvalRate: number;
  specializingIn: string[];
}

export interface LoanApplication {
  id: string;
  userId: string;
  merchantId: string;
  nbfcPartner: string;
  loanType: 'working_capital' | 'term_loan' | 'emergency_credit' | 'inventory_financing';
  requestedAmount: number;
  tenure: number;
  purpose: string;
  creditScore: number;
  monthlyRevenue: number;
  businessAge: number;
  transactionVolume: number;
  expenseRatio: number;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed' | 'repayment';
  appliedAt: Date;
  decisionAt?: Date;
  disbursedAt?: Date;
  nbfcResponse?: any;
  repaymentSchedule?: RepaymentSchedule[];
}

export interface RepaymentSchedule {
  dueDate: Date;
  amount: number;
  principal: number;
  interest: number;
  status: 'pending' | 'paid' | 'overdue';
  paidAt?: Date;
}

export interface NBFCResponse {
  applicationId: string;
  status: 'approved' | 'rejected' | 'manual_review' | 'pending' | 'disbursed';
  approvedAmount?: number;
  interestRate?: number;
  tenure?: number;
  emi?: number;
  processingFee?: number;
  rejectionReason?: string;
  nextSteps?: string;
  turnaroundTime?: string;
}

// Mock NBFC Partners Data
const NBFC_PARTNERS: NBFCPartner[] = [
  {
    id: 'hdfc_nbfc',
    name: 'HDFC Business Loans',
    logo: '/logos/hdfc.png',
    interestRates: { min: 12, max: 18 },
    loanAmounts: { min: 50000, max: 5000000 },
    tenures: [12, 24, 36, 48],
    processingTime: '24-48 hours',
    approvalRate: 78,
    specializingIn: ['working_capital', 'term_loan', 'inventory_financing']
  },
  {
    id: 'bajaj_finserv',
    name: 'Bajaj Finserv',
    logo: '/logos/bajaj.png',
    interestRates: { min: 14, max: 22 },
    loanAmounts: { min: 75000, max: 3000000 },
    tenures: [6, 12, 18, 24, 30],
    processingTime: 'Same day',
    approvalRate: 82,
    specializingIn: ['working_capital', 'emergency_credit']
  },
  {
    id: 'tata_capital',
    name: 'Tata Capital',
    logo: '/logos/tata.png',
    interestRates: { min: 11, max: 16 },
    loanAmounts: { min: 100000, max: 10000000 },
    tenures: [12, 24, 36, 48, 60],
    processingTime: '2-3 business days',
    approvalRate: 75,
    specializingIn: ['term_loan', 'inventory_financing']
  },
  {
    id: 'indialand',
    name: 'IndiaLends',
    logo: '/logos/indialand.png',
    interestRates: { min: 13, max: 19 },
    loanAmounts: { min: 25000, max: 2000000 },
    tenures: [3, 6, 9, 12],
    processingTime: 'Instant approval',
    approvalRate: 85,
    specializingIn: ['emergency_credit', 'working_capital']
  }
];

/**
 * Get all available NBFC partners
 */
export function getNBFCPartners(): NBFCPartner[] {
  return NBFC_PARTNERS;
}

/**
 * Get NBFC partner by ID
 */
export function getNBFCPartner(id: string): NBFCPartner | undefined {
  return NBFC_PARTNERS.find(partner => partner.id === id);
}

/**
 * Submit loan application to NBFC partner
 */
export async function submitLoanApplication(
  application: Omit<LoanApplication, 'id' | 'appliedAt' | 'status'>
): Promise<{ success: boolean; applicationId?: string; error?: string }> {
  try {
    // Simulate API call to NBFC
    const response = await simulateNBFCAPICall(application);
    
    if (response.success) {
      return {
        success: true,
        applicationId: response.applicationId
      };
    } else {
      return {
        success: false,
        error: response.error
      };
    }
  } catch (error) {
    console.error('NBFC API Error:', error);
    return {
      success: false,
      error: 'Failed to connect to lender. Please try again.'
    };
  }
}

/**
 * Check application status with NBFC
 */
export async function checkApplicationStatus(
  applicationId: string,
  nbfcPartnerId: string
): Promise<NBFCResponse | null> {
  try {
    // Simulate API call to check status
    const response = await simulateStatusCheck(applicationId, nbfcPartnerId);
    return response;
  } catch (error) {
    console.error('Status check error:', error);
    return null;
  }
}

/**
 * Get personalized loan offers based on merchant profile
 */
export function getPersonalizedOffers(
  creditScore: number,
  monthlyRevenue: number,
  businessAge: number,
  loanAmount: number
): Array<{ partner: NBFCPartner; offer: any }> {
  return NBFC_PARTNERS
    .filter(partner => {
      // Filter based on eligibility criteria
      return (
        creditScore >= 650 && // Minimum credit score
        monthlyRevenue >= 50000 && // Minimum monthly revenue
        businessAge >= 6 && // Minimum 6 months in business
        loanAmount >= partner.loanAmounts.min &&
        loanAmount <= partner.loanAmounts.max
      );
    })
    .map(partner => {
      // Calculate personalized offer
      const baseRate = partner.interestRates.min;
      const riskAdjustment = Math.max(0, (750 - creditScore) / 100 * 2); // Risk-based pricing
      const finalRate = Math.min(baseRate + riskAdjustment, partner.interestRates.max);
      
      const recommendedTenure = loanAmount <= 100000 ? 12 : loanAmount <= 500000 ? 24 : 36;
      const emi = calculateEMI(loanAmount, finalRate / 12 / 100, recommendedTenure);
      
      return {
        partner,
        offer: {
          interestRate: finalRate.toFixed(2),
          tenure: recommendedTenure,
          emi: Math.round(emi),
          processingFee: Math.round(loanAmount * 0.02), // 2% processing fee
          approvalProbability: Math.min(95, partner.approvalRate + (creditScore - 650) / 10),
          turnaroundTime: partner.processingTime
        }
      };
    })
    .sort((a, b) => parseFloat(a.offer.interestRate) - parseFloat(b.offer.interestRate));
}

/**
 * Calculate EMI
 */
function calculateEMI(principal: number, monthlyRate: number, tenure: number): number {
  if (monthlyRate === 0) return principal / tenure;
  
  const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenure) / 
              (Math.pow(1 + monthlyRate, tenure) - 1);
  
  return emi;
}

/**
 * Simulate NBFC API call (for development)
 */
async function simulateNBFCAPICall(application: any): Promise<any> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
  
  // Simulate approval logic
  const approvalProbability = calculateApprovalProbability(application);
  const isApproved = Math.random() * 100 < approvalProbability;
  
  if (isApproved) {
    return {
      success: true,
      applicationId: `NBFC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: 'Application submitted successfully'
    };
  } else {
    return {
      success: false,
      error: 'Application does not meet minimum eligibility criteria'
    };
  }
}

/**
 * Simulate status check
 */
async function simulateStatusCheck(applicationId: string, nbfcPartnerId: string): Promise<NBFCResponse> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate different statuses based on application age
  const applicationAge = Date.now() - (parseInt(applicationId.split('_')[1]) || 0);
  
  if (applicationAge < 60000) { // Less than 1 minute
    return {
      applicationId,
      status: 'pending',
      turnaroundTime: 'Under review'
    };
  } else if (applicationAge < 300000) { // Less than 5 minutes
    return {
      applicationId,
      status: 'approved',
      approvedAmount: 250000,
      interestRate: 14.5,
      tenure: 12,
      emi: 22486,
      processingFee: 5000,
      turnaroundTime: 'Ready for disbursement'
    };
  } else {
    return {
      applicationId,
      status: 'disbursed',
      approvedAmount: 250000,
      interestRate: 14.5,
      tenure: 12,
      emi: 22486,
      processingFee: 5000,
      turnaroundTime: 'Disbursed to bank account'
    };
  }
}

/**
 * Calculate approval probability based on application data
 */
function calculateApprovalProbability(application: any): number {
  let probability = 50; // Base probability
  
  // Credit score impact
  if (application.creditScore >= 750) probability += 25;
  else if (application.creditScore >= 700) probability += 15;
  else if (application.creditScore >= 650) probability += 5;
  else probability -= 10;
  
  // Revenue impact
  if (application.monthlyRevenue >= 200000) probability += 15;
  else if (application.monthlyRevenue >= 100000) probability += 10;
  else if (application.monthlyRevenue >= 50000) probability += 5;
  
  // Business age impact
  if (application.businessAge >= 24) probability += 10;
  else if (application.businessAge >= 12) probability += 5;
  
  // Expense ratio impact (lower is better)
  if (application.expenseRatio <= 0.3) probability += 10;
  else if (application.expenseRatio <= 0.5) probability += 5;
  else probability -= 5;
  
  return Math.max(10, Math.min(95, probability));
}
