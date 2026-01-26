import transporter from "../config/email";

interface EmailOptions {
  email: string;
  subject: string;
  html: string;
}

/**
 * Send email safely - failures don't crash the API
 */
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    // Skip if no email configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log(`⏭️  Email skipped (not configured): ${options.email}`);
      return false;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: options.email,
      subject: options.subject,
      html: options.html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${options.email}`);
    return true;
  } catch (error: any) {
    console.error(`⚠️  Failed to send email to ${options.email}:`, error.message);
    // Don't throw error - email failures should not crash the API
    return false;
  }
};

/**
 * Welcome email template for new users
 */
export const sendWelcomeEmail = (name: string, email: string) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to Our Platform, ${name}!</h2>
      <p>Thank you for registering with us. We're excited to have you on board.</p>
      <p>Your account has been successfully created with the following email: <strong>${email}</strong></p>
      <p>You can now log in and start exploring our services.</p>
      <p>If you have any questions, feel free to contact our support team.</p>
      <br>
      <p>Best regards,<br>The Team</p>
    </div>
  `;

  return sendEmail({
    email,
    subject: "Welcome to Our Platform!",
    html,
  });
};

/**
 * Password reset email template
 */
export const sendPasswordResetEmail = (
  name: string,
  email: string,
  resetLink: string
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset Request</h2>
      <p>Hi ${name},</p>
      <p>We received a request to reset your password. Click the link below to proceed:</p>
      <p>
        <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
      </p>
      <p>This link will expire in 30 minutes.</p>
      <p><strong>Note:</strong> If you didn't request a password reset, please ignore this email.</p>
      <br>
      <p>Best regards,<br>The Team</p>
    </div>
  `;

  return sendEmail({
    email,
    subject: "Password Reset Request",
    html,
  });
};

/**
 * Password change confirmation email
 */
export const sendPasswordChangedEmail = (name: string, email: string) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Changed Successfully</h2>
      <p>Hi ${name},</p>
      <p>Your password has been successfully changed.</p>
      <p>If you didn't make this change, please contact our support team immediately.</p>
      <br>
      <p>Best regards,<br>The Team</p>
    </div>
  `;

  return sendEmail({
    email,
    subject: "Password Changed Successfully",
    html,
  });
};

/**
 * Order confirmation email
 */
export const sendOrderConfirmationEmail = (
  name: string,
  email: string,
  orderId: string,
  totalAmount: number,
  items: Array<{ name: string; quantity: number; price: number }>
) => {
  const itemsHtml = items
    .map(
      (item) =>
        `<tr style="border-bottom: 1px solid #ddd;">
           <td style="padding: 10px;">${item.name}</td>
           <td style="padding: 10px; text-align: center;">${item.quantity}</td>
           <td style="padding: 10px; text-align: right;">$${item.price.toFixed(2)}</td>
         </tr>`
    )
    .join("");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Order Confirmation</h2>
      <p>Hi ${name},</p>
      <p>Thank you for your order! Here are the details:</p>
      <p><strong>Order ID:</strong> ${orderId}</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead style="background-color: #f5f5f5;">
          <tr>
            <th style="padding: 10px; text-align: left;">Product</th>
            <th style="padding: 10px; text-align: center;">Quantity</th>
            <th style="padding: 10px; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      <p style="font-size: 18px; font-weight: bold;">Total: $${totalAmount.toFixed(2)}</p>
      <p>We will keep you updated on your order status.</p>
      <br>
      <p>Best regards,<br>The Team</p>
    </div>
  `;

  return sendEmail({
    email,
    subject: `Order Confirmation - Order #${orderId}`,
    html,
  });
};

/**
 * Order status update email
 */
export const sendOrderStatusUpdateEmail = (
  name: string,
  email: string,
  orderId: string,
  status: string,
  trackingInfo?: string
) => {
  const statusMessages: Record<string, string> = {
    confirmed: "Your order has been confirmed and is being prepared.",
    shipped: "Your order has been shipped! You can track it using the information below.",
    delivered: "Your order has been delivered. Thank you for your purchase!",
    cancelled: "Your order has been cancelled. If you have any questions, please contact us.",
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Order Status Update</h2>
      <p>Hi ${name},</p>
      <p><strong>Order ID:</strong> ${orderId}</p>
      <p><strong>Status:</strong> ${status.toUpperCase()}</p>
      <p>${statusMessages[status] || "Your order status has been updated."}</p>
      ${trackingInfo ? `<p><strong>Tracking Info:</strong> ${trackingInfo}</p>` : ""}
      <br>
      <p>Best regards,<br>The Team</p>
    </div>
  `;

  return sendEmail({
    email,
    subject: `Order Status Update - Order #${orderId}`,
    html,
  });
};
