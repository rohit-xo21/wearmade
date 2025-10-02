const nodemailer = require('nodemailer');

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (options) => {
  const message = {
    from: `WearMade <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html || options.message,
  };

  const info = await transporter.sendMail(message);
  console.log('Message sent: %s', info.messageId);
  return info;
};

// Email templates
const emailTemplates = {
  welcome: (name) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome to WearMade!</h2>
      <p>Hi ${name},</p>
      <p>Thank you for joining WearMade, your premier custom tailoring platform.</p>
      <p>Get started by exploring our talented tailors or creating your first order.</p>
      <p>Best regards,<br>The WearMade Team</p>
    </div>
  `,
  
  emailVerification: (name, verificationUrl) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Verify Your Email</h2>
      <p>Hi ${name},</p>
      <p>Please click the button below to verify your email address:</p>
      <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Verify Email</a>
      <p>If the button doesn't work, copy and paste this link: ${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
      <p>Best regards,<br>The WearMade Team</p>
    </div>
  `,
  
  resetPassword: (name, resetUrl) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Reset Your Password</h2>
      <p>Hi ${name},</p>
      <p>You requested a password reset. Click the button below to set a new password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
      <p>If the button doesn't work, copy and paste this link: ${resetUrl}</p>
      <p>This link will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Best regards,<br>The WearMade Team</p>
    </div>
  `,
  
  newOrder: (tailorName, customerName, orderTitle) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">New Order Request</h2>
      <p>Hi ${tailorName},</p>
      <p>You have received a new order request from ${customerName}.</p>
      <p><strong>Order:</strong> ${orderTitle}</p>
      <p>Please log in to your dashboard to view the details and submit your estimate.</p>
      <a href="${process.env.CLIENT_URL}/tailor/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">View Order</a>
      <p>Best regards,<br>The WearMade Team</p>
    </div>
  `,
  
  estimateReceived: (customerName, tailorName, orderTitle, price) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Estimate Received</h2>
      <p>Hi ${customerName},</p>
      <p>${tailorName} has submitted an estimate for your order "${orderTitle}".</p>
      <p><strong>Estimated Price:</strong> ₹${price}</p>
      <p>Please log in to your dashboard to review and respond to the estimate.</p>
      <a href="${process.env.CLIENT_URL}/customer/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">View Estimate</a>
      <p>Best regards,<br>The WearMade Team</p>
    </div>
  `,
  
  orderAccepted: (tailorName, customerName, orderTitle) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Order Accepted!</h2>
      <p>Hi ${tailorName},</p>
      <p>Great news! ${customerName} has accepted your estimate for "${orderTitle}".</p>
      <p>You can now start working on the order. Please update the progress regularly in your dashboard.</p>
      <a href="${process.env.CLIENT_URL}/tailor/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Start Working</a>
      <p>Best regards,<br>The WearMade Team</p>
    </div>
  `,
  
  paymentConfirmation: (customerName, amount, orderTitle, receiptNumber) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Payment Confirmation</h2>
      <p>Hi ${customerName},</p>
      <p>Your payment has been successfully processed!</p>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Order:</strong> ${orderTitle}</p>
        <p><strong>Amount Paid:</strong> ₹${amount}</p>
        <p><strong>Receipt Number:</strong> ${receiptNumber}</p>
      </div>
      <p>You can track your order progress in your dashboard.</p>
      <a href="${process.env.CLIENT_URL}/customer/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Track Order</a>
      <p>Best regards,<br>The WearMade Team</p>
    </div>
  `
};

module.exports = {
  sendEmail,
  emailTemplates
};