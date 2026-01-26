# Setup Guide: File Upload & Email Notifications

## Quick Start

### 1. Environment Configuration

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Email Configuration (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password     # Use Gmail App Password, not regular password
EMAIL_FROM=noreply@yourapp.com

# Frontend URL (for password reset links)
FRONTEND_URL=http://localhost:3000

# Other required variables
MONGODB_URI=mongodb://localhost:27017/node-crud-ass
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
NODE_ENV=development
```

### 2. Gmail Setup (Recommended)

#### Step 1: Enable 2-Factor Authentication
1. Go to https://myaccount.google.com
2. Click "Security" in the left sidebar
3. Enable "2-Step Verification"

#### Step 2: Generate App Password
1. Go to https://myaccount.google.com/app-passwords
2. Select "Mail" and "Windows Computer" (or your device)
3. Click "Generate"
4. Copy the 16-character password
5. Use this in `.env` as `EMAIL_PASSWORD`

**Note:** Do NOT use your regular Gmail password for `EMAIL_PASSWORD`

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Server

```bash
npm run dev
```

Expected output:
```
Email transporter ready to send emails
Connected to MongoDB
Server running on port 5000
```

---

## Feature Testing

### Test 1: User Registration (Welcome Email)

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "your-test-email@gmail.com",
    "password": "password123"
  }'
```

✅ You should receive a welcome email

### Test 2: Upload Profile Picture

```bash
# First, get a JWT token from login response
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-test-email@gmail.com",
    "password": "password123"
  }'

# Use the token from response, then upload image
curl -X POST http://localhost:5000/api/users/profile/image \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@/path/to/your/image.jpg"
```

✅ Profile image uploaded successfully

### Test 3: Password Reset (Reset Email)

```bash
curl -X POST http://localhost:5000/api/password/forgot \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-test-email@gmail.com"
  }'
```

✅ You should receive a password reset email

### Test 4: Create Order (Order Confirmation Email)

```bash
# Assuming you have products in cart
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

✅ You should receive an order confirmation email

---

## Troubleshooting

### Email Not Sending?

1. **Check Server Logs**
   - Look for errors starting with "Failed to send email"
   - Check for "Email transporter verification failed"

2. **Verify .env Configuration**
   ```bash
   # Make sure these are set:
   - EMAIL_SERVICE=gmail
   - EMAIL_USER=your_email@gmail.com
   - EMAIL_PASSWORD=your_app_password (NOT regular password)
   - EMAIL_FROM=your_email@gmail.com (or noreply@domain.com)
   ```

3. **Test Gmail App Password**
   - Try logging into Gmail via https://mail.google.com
   - Use: `yourEmail@gmail.com` as username
   - Use: `your_app_password` (16 chars without spaces) as password

4. **Restart Server**
   ```bash
   # Press Ctrl+C to stop
   npm run dev
   ```

### File Upload Failing?

1. **Check File Size**
   - Maximum: 1MB (1048576 bytes)
   - Reduce image size if too large

2. **Check File Type**
   - Allowed: JPEG, PNG, GIF, WebP only
   - Convert unsupported formats first

3. **Check Permissions**
   - Ensure `/uploads` folder exists and is writable
   - The folder is created automatically if missing

---

## File Structure

```
src/
├── config/
│   ├── email.ts              # Email configuration
│   ├── multer.config.ts      # File upload configuration
│   └── ...
├── controllers/
│   ├── auth.controller.ts    # Now sends welcome email
│   ├── password.controller.ts # Now sends reset email
│   ├── order.controller.ts   # Now sends order emails
│   ├── user.controller.ts    # Profile image upload
│   ├── product.contoller.ts  # Product image upload
│   └── ...
├── utils/
│   └── emailService.ts       # Email templates and functions
└── ...

uploads/                       # Generated folder for uploaded files
```

---

## Email Templates Customization

Edit `src/utils/emailService.ts` to customize email templates:

```typescript
export const sendWelcomeEmail = (name: string, email: string) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to Our Platform, ${name}!</h2>
      <!-- Edit HTML here -->
    </div>
  `;
  return sendEmail({
    email,
    subject: "Welcome to Our Platform!",
    html,
  });
};
```

---

## Production Deployment

### Important Changes for Production

1. **Use SendGrid, Mailgun, or AWS SES**
   - Gmail has limits (~500 emails/day)
   - Better reliability and deliverability

2. **Configure Email Service**
   ```env
   EMAIL_SERVICE=sendgrid  # or mailgun, ses
   EMAIL_USER=your_api_key
   EMAIL_PASSWORD=your_secret
   ```

3. **Use Cloud Storage**
   - Migrate to Cloudinary or AWS S3
   - Update `src/config/multer.config.ts`

4. **Add Email Queue**
   - Use Bull or RabbitMQ
   - Retry failed emails

5. **Enable HTTPS**
   - Update `FRONTEND_URL` to use https
   - Password reset links should be HTTPS

---

## Support

For issues or questions:
1. Check the detailed guide: [FILE_UPLOAD_EMAIL_GUIDE.md](./FILE_UPLOAD_EMAIL_GUIDE.md)
2. Review error logs in console
3. Verify `.env` configuration

Happy coding! 🚀
