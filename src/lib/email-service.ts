/**
 * CrediPay Email Service
 * Sends real emails via /api/send-email (Resend backend).
 * Falls back to simulation log if RESEND_API_KEY is not configured.
 */

export interface EmailPayload {
  to: string;
  subject: string;
  body: string;
  template?: 'transaction' | 'security' | 'reward';
}

export const EmailService = {
  /**
   * Sends a real email via the /api/send-email server route.
   */
  send: async (payload: EmailPayload): Promise<{ success: boolean; messageId: string }> => {
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error('[EmailService] API error:', err);
        return { success: false, messageId: '' };
      }

      const data = await res.json();
      console.log(`[EmailService] Email sent! messageId=${data.messageId}`);
      return { success: true, messageId: data.messageId };
    } catch (err) {
      console.error('[EmailService] Network error:', err);
      return { success: false, messageId: '' };
    }
  },

  /**
   * Triggers a specific alert based on business events.
   */
  triggerAlert: async (
    type: 'high_value' | 'new_login' | 'referral_success',
    data: any
  ) => {
    let subject = '';
    let body = '';
    let template: EmailPayload['template'] = 'transaction';

    switch (type) {
      case 'high_value':
        subject = `⚠️ High Value Transaction Alert: ₹${data.amount}`;
        body = `A transaction of ₹${data.amount} was recorded at your store on ${new Date().toLocaleString('en-IN')}. If this wasn't you, please secure your terminal immediately.`;
        template = 'transaction';
        break;
      case 'new_login':
        subject = `🔒 New Security Login Detected`;
        body = `Your CrediPay account was accessed from a new device at ${new Date().toLocaleString('en-IN')}. If this wasn't you, please change your password immediately.`;
        template = 'security';
        break;
      case 'referral_success':
        subject = `🎉 Referral Bonus Credited!`;
        body = `A new merchant joined CrediPay using your referral code. ₹500 has been added to your credit eligibility. Keep sharing to earn more rewards!`;
        template = 'reward';
        break;
    }

    return await EmailService.send({
      to: data.email || 'merchant@example.com',
      subject,
      body,
      template,
    });
  },

  /**
   * Sends a test email — useful for verifying setup.
   */
  sendTest: async (to: string) => {
    return await EmailService.send({
      to,
      subject: '✅ CrediPay Email Service — Test Successful',
      body: `This is a test email from your CrediPay merchant dashboard. Your email notifications are configured correctly and working! You will receive real-time alerts for transactions, security events, and referral rewards.`,
      template: 'transaction',
    });
  },
};
