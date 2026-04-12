/**
 * High-Fidelity Email Simulation Service for CrediPay.
 * In a production environment, this would integrate with SendGrid/AWS SES.
 */

export interface EmailPayload {
  to: string;
  subject: string;
  body: string;
  template?: 'transaction' | 'security' | 'reward';
}

export const EmailService = {
  /**
   * Simulates sending an email with a 3D overlay/toast feedback.
   */
  send: async (payload: EmailPayload): Promise<{ success: boolean; messageId: string }> => {
    console.log(`[EmailService] Simulation: Sending email to ${payload.to}...`);
    console.log(`[EmailService] Subject: ${payload.subject}`);
    
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const messageId = `cp-${Math.random().toString(36).substring(2, 11)}`;
    
    return { 
      success: true, 
      messageId 
    };
  },

  /**
   * Triggers a specific alert based on business events.
   */
  triggerAlert: async (type: 'high_value' | 'new_login' | 'referral_success', data: any) => {
    let subject = "";
    let body = "";

    switch (type) {
      case 'high_value':
        subject = `⚠️ High Value Transaction Alert: ₹${data.amount}`;
        body = `A transaction of ₹${data.amount} was recorded at your store. If this wasn't you, please secure your terminal.`;
        break;
      case 'new_login':
        subject = `🔒 New Security Login Detected`;
        body = `Your CrediPay account was accessed from a new device.`;
        break;
      case 'referral_success':
        subject = `🎉 Referral Bonus Credited!`;
        body = `A new merchant joined using your code. ₹500 has been added to your credit eligibility.`;
        break;
    }

    return await EmailService.send({
      to: data.email || 'merchant@example.com',
      subject,
      body,
      template: 'transaction'
    });
  }
};
