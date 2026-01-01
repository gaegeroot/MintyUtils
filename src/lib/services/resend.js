import { Resend } from 'resend';
import { RESEND_KEY } from '$env/static/private';

const resend = new Resend(RESEND_KEY);

export const emailService = {
    sendDepositInvoice: async ({ to, firstName, invoiceUrl, depositAmount, totalAmount }) => {
        return resend.emails.send({
            from: 'Minty Clean <hello@notifications.callminty.com>',
            to,
            subject: 'Your Cleaning Service Invoice',
            html: `
                <!DOCTYPE html>
                <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2>Hi ${firstName},</h2>
                        <p>Thank you for booking with Minty Clean! Your deposit invoice is ready.</p>
                        
                        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p><strong>Deposit Amount:</strong> $${depositAmount.toFixed(2)}</p>
                            <p><strong>Total Service Cost:</strong> $${totalAmount.toFixed(2)}</p>
                            <p style="font-size: 14px; color: #666;">Remaining balance will be charged after service completion.</p>
                        </div>
                        
                        <p style="text-align: center;">
                            <a href="${invoiceUrl}" 
                               style="display: inline-block; background: #635bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                                View & Pay Invoice
                            </a>
                        </p>
                        
                        <p>Questions? Just reply to this email!</p>
                        
                        <p>Thanks,<br>The Minty Clean Team</p>
                    </div>
                </body>
                </html>
            `,
        });
    },
};