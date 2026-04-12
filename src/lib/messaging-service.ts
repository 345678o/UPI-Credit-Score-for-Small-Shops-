/**
 * CrediPay Unified Messaging Service
 * Handles Email, SMS, and WhatsApp notifications.
 */

import { EmailService, EmailPayload } from "./email-service";

export interface MessagePayload {
  to: string; // Phone number or Email
  channel: 'email' | 'sms' | 'whatsapp';
  content: string;
  metadata?: Record<string, any>;
}

export const MessagingService = {
  /**
   * Send a notification via the preferred channel
   */
  send: async (payload: MessagePayload): Promise<{ success: boolean; id: string }> => {
    console.log(`[Messaging] Sending to ${payload.to} via ${payload.channel}`);
    
    switch (payload.channel) {
      case 'email':
        const emailRes = await EmailService.send({
          to: payload.to,
          subject: payload.metadata?.subject || "CrediPay Alert",
          body: payload.content,
          template: payload.metadata?.template
        });
        return { success: emailRes.success, id: emailRes.messageId };

      case 'sms':
        // SIMULATION: In production, integrate with Twilio/Msg91
        console.log(`[SMS SIM] ${payload.to}: ${payload.content}`);
        return { success: true, id: `sms_${Date.now()}` };

      case 'whatsapp':
        // SIMULATION: In production, use WhatsApp Business API (Interakt, Twilio)
        console.log(`[WA SIM] ${payload.to}: ${payload.content}`);
        // For web demo, we often generate a wa.me link
        return { success: true, id: `wa_${Date.now()}` };
      
      default:
        return { success: false, id: '' };
    }
  },

  /**
   * Generates a WhatsApp deep link for manual sharing
   */
  generateWhatsAppLink: (phone: string, text: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    return `https://wa.me/${cleanPhone}/?text=${encodeURIComponent(text)}`;
  },

  /**
   * Standardized Alert Templates
   */
  alerts: {
    sendReceipt: async (phone: string, merchantName: string, amount: number, txId: string) => {
      const text = `🎉 Receipt from ${merchantName}\nAmount: ₹${amount.toLocaleString()}\nTx ID: ${txId}\n\nPowered by CrediPay — Building trust for small businesses.`;
      return MessagingService.send({ to: phone, channel: 'whatsapp', content: text });
    },

    sendCriticalAlert: async (phone: string, code: string) => {
      const text = `⚠️ Security Alert: Attempted login to your CrediPay hub from a new device. Use code ${code} to authorize OR change your password immediately.`;
      return MessagingService.send({ to: phone, channel: 'sms', content: text });
    },

    sendLoanDisbursal: async (phone: string, amount: number, partner: string) => {
      const text = `💰 Capital Infusion: ₹${amount.toLocaleString()} has been disbursed to your CrediPay ledger by ${partner}. Check your dashboard for the repayment schedule.`;
      return MessagingService.send({ to: phone, channel: 'sms', content: text });
    }
  }
};
