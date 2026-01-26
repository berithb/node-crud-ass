# 📚 Complete Documentation Index

## Getting Started

Start here if you're new to the file upload and email features:

1. **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** ⭐ START HERE
   - Quick setup in 5 minutes
   - Gmail configuration
   - Feature testing
   - Common first-time issues

2. **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** 📋
   - What was added and why
   - Feature overview
   - File modifications list
   - Testing checklist

---

## Detailed Documentation

### For API Integration

3. **[API_REFERENCE.md](./API_REFERENCE.md)** 🔌
   - Complete endpoint documentation
   - All parameters explained
   - Response examples
   - Error codes reference
   - Authentication details

4. **[FILE_UPLOAD_EMAIL_GUIDE.md](./FILE_UPLOAD_EMAIL_GUIDE.md)** 📖
   - Deep dive into each feature
   - Step-by-step usage
   - Configuration options
   - Best practices
   - Future enhancements

### Understanding the System

5. **[ARCHITECTURE_DIAGRAMS.md](./ARCHITECTURE_DIAGRAMS.md)** 🏗️
   - System architecture overview
   - Data flow diagrams
   - Request/response cycles
   - Error handling flows
   - Database schema

### Troubleshooting

6. **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** 🔧
   - 19 common issues and solutions
   - Email configuration problems
   - File upload errors
   - Authentication issues
   - Debug mode setup

---

## Quick Reference

### Configuration Files

**.env.example** - Copy and customize:
```bash
cp .env.example .env
# Edit with your Gmail credentials
```

### Key Implementation Files

| File | Purpose |
|------|---------|
| `src/config/email.ts` | Email transporter setup |
| `src/utils/emailService.ts` | Email templates & functions |
| `src/config/multer.config.ts` | File upload validation |
| `src/controllers/auth.controller.ts` | Welcome email integration |
| `src/controllers/password.controller.ts` | Reset email integration |
| `src/controllers/order.controller.ts` | Order email integration |
| `src/controllers/user.controller.ts` | Profile image upload |
| `src/controllers/product.contoller.ts` | Product image upload |

---

## Feature Overview

### 📁 File Upload

**What it does:**
- Users upload profile pictures
- Vendors/Admins upload product images
- Files validated (1MB max, images only)
- Old files automatically deleted

**Files involved:**
- `src/config/multer.config.ts` - Configuration
- `src/controllers/user.controller.ts` - Profile upload
- `src/controllers/product.contoller.ts` - Product upload

**Endpoints:**
```
POST   /api/users/profile/image          - Upload profile picture
POST   /api/products/{id}/image          - Upload product image
DELETE /api/products/{id}/image          - Delete product image
```

### 📧 Email Notifications

**What it does:**
- Welcome email on registration
- Password reset email (30-min token)
- Password change confirmation
- Order confirmation with details
- Order status updates (4 statuses)

**Files involved:**
- `src/config/email.ts` - SMTP setup
- `src/utils/emailService.ts` - Email functions

**Triggers:**
```
POST   /api/auth/register                - Welcome email sent
POST   /api/password/forgot              - Reset email sent
POST   /api/password/reset               - Confirmation email sent
POST   /api/orders                       - Order email sent
PATCH  /api/orders/{id}/status           - Status email sent
```

---

## Common Tasks

### Task 1: Set Up Email (First Time)

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Enable Gmail 2FA
# Go to: https://myaccount.google.com/security

# 3. Generate App Password
# Go to: https://myaccount.google.com/app-passwords
# Select: Mail and Windows Computer
# Copy: 16-character password

# 4. Update .env
# EMAIL_PASSWORD=your_16_char_password

# 5. Start server
npm run dev
# Should show: "Email transporter ready to send emails"
```

See: [SETUP_GUIDE.md](./SETUP_GUIDE.md#gmail-setup-recommended)

---

### Task 2: Test File Upload

```bash
# Get authentication token
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}' \
  | jq -r '.token')

# Upload profile image
curl -X POST http://localhost:5000/api/users/profile/image \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@profile.jpg"

# Check response has profileImage path
```

See: [API_REFERENCE.md](./API_REFERENCE.md#1-upload-profile-picture)

---

### Task 3: Test Email Sending

```bash
# Register new user (welcome email sent)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test User",
    "email":"test123@gmail.com",
    "password":"test123"
  }'

# Check email inbox
# Look in Promotions/Social/Spam if not in Inbox
```

See: [SETUP_GUIDE.md](./SETUP_GUIDE.md#test-1-user-registration-welcome-email)

---

### Task 4: Customize Email Templates

Edit: `src/utils/emailService.ts`

```typescript
export const sendWelcomeEmail = (name: string, email: string) => {
  const html = `
    <div style="font-family: Arial; max-width: 600px;">
      <h2>Welcome, ${name}!</h2>
      <!-- Customize HTML here -->
      <p>Your custom message</p>
    </div>
  `;
  return sendEmail({
    email,
    subject: "Your Custom Subject",
    html,
  });
};
```

See: [FILE_UPLOAD_EMAIL_GUIDE.md](./FILE_UPLOAD_EMAIL_GUIDE.md#email-templates-customization)

---

### Task 5: Change File Size Limit

Edit: `src/config/multer.config.ts`

```typescript
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Change to 5MB
  },
  fileFilter,
});
```

See: [FILE_UPLOAD_EMAIL_GUIDE.md](./FILE_UPLOAD_EMAIL_GUIDE.md#file-upload-configuration)

---

### Task 6: Debug Email Issues

```bash
# 1. Check server logs during sending
npm run dev | grep -E "Email|Error"

# 2. Verify configuration
cat .env | grep EMAIL

# 3. Test specific email
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@gmail.com","password":"test123"}'

# 4. Check inbox (including spam)
```

See: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## Error Reference

### Common Status Codes

| Code | Meaning | Typical Cause |
|------|---------|---------------|
| 200 | Success | Request worked |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | No/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 413 | Payload Too Large | File > 1MB |
| 500 | Server Error | Server issue |

See: [API_REFERENCE.md](./API_REFERENCE.md#error-codes)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│  Express API                                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────┐      ┌───────────────────┐   │
│  │  File Upload     │      │  Email Service    │   │
│  │  (Multer)        │      │  (Nodemailer)     │   │
│  ├──────────────────┤      ├───────────────────┤   │
│  │ - Validation     │      │ - Welcome Email   │   │
│  │ - Storage        │      │ - Password Reset  │   │
│  │ - Size Limit     │      │ - Confirmations   │   │
│  │ - Type Check     │      │ - Order Emails    │   │
│  └──────────────────┘      └───────────────────┘   │
│           ↓                        ↓                │
│  ┌──────────────────┐      ┌───────────────────┐   │
│  │ /uploads folder  │      │ Gmail SMTP Server │   │
│  │ (Local Storage)  │      │ (Email Service)   │   │
│  └──────────────────┘      └───────────────────┘   │
│                                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │  MongoDB Database                            │   │
│  │  - User profiles with image paths            │   │
│  │  - Product images arrays                     │   │
│  │  - Order records                             │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

See: [ARCHITECTURE_DIAGRAMS.md](./ARCHITECTURE_DIAGRAMS.md)

---

## Environment Variables

All required variables for .env:

```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
EMAIL_FROM=noreply@yourapp.com

# Frontend (for password reset links)
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/node-crud-ass

# JWT
JWT_SECRET=your_jwt_secret_key_here

# Server
PORT=5000
NODE_ENV=development

# Optional: Cloudinary
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

See: [.env.example](./.env.example)

---

## Production Considerations

### Recommended Changes

1. **Email Service**
   - Switch from Gmail to SendGrid/Mailgun
   - Better reliability and deliverability
   - Higher sending limits

2. **File Storage**
   - Migrate to Cloudinary or AWS S3
   - Better scalability
   - CDN integration

3. **Email Queue**
   - Add Bull or RabbitMQ
   - Retry failed emails
   - Better reliability

4. **Security**
   - Use HTTPS for password reset links
   - Implement rate limiting
   - Add email verification

See: [FILE_UPLOAD_EMAIL_GUIDE.md](./FILE_UPLOAD_EMAIL_GUIDE.md#future-enhancements)

---

## Support Resources

### Files to Read (in order)

1. **New to the system?** → [SETUP_GUIDE.md](./SETUP_GUIDE.md)
2. **Need API details?** → [API_REFERENCE.md](./API_REFERENCE.md)
3. **Integrating code?** → [FILE_UPLOAD_EMAIL_GUIDE.md](./FILE_UPLOAD_EMAIL_GUIDE.md)
4. **Understanding flows?** → [ARCHITECTURE_DIAGRAMS.md](./ARCHITECTURE_DIAGRAMS.md)
5. **Something broken?** → [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

### Quick Links

- Email Configuration: [SETUP_GUIDE.md#gmail-setup](./SETUP_GUIDE.md#gmail-setup-recommended)
- File Upload Details: [FILE_UPLOAD_EMAIL_GUIDE.md#part-a](./FILE_UPLOAD_EMAIL_GUIDE.md#part-a-file-handling-uploads--storage)
- Email Details: [FILE_UPLOAD_EMAIL_GUIDE.md#part-b](./FILE_UPLOAD_EMAIL_GUIDE.md#part-b-email-notifications)
- API Examples: [API_REFERENCE.md#testing-commands](./API_REFERENCE.md#testing-commands)

---

## Checklist for Getting Started

- [ ] Read [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- [ ] Copy and edit `.env.example` to `.env`
- [ ] Set up Gmail 2FA and app password
- [ ] Run `npm install`
- [ ] Start server: `npm run dev`
- [ ] Test registration (welcome email)
- [ ] Test file upload (profile picture)
- [ ] Test password reset (reset email)
- [ ] Read [API_REFERENCE.md](./API_REFERENCE.md)
- [ ] Test all endpoints with curl
- [ ] Bookmark troubleshooting guide

---

## File Modifications Summary

**New Files Created:**
- ✅ `src/config/email.ts` - Email configuration
- ✅ `src/utils/emailService.ts` - Email templates
- ✅ `.env.example` - Environment template
- ✅ `SETUP_GUIDE.md` - Quick start
- ✅ `FILE_UPLOAD_EMAIL_GUIDE.md` - Feature guide
- ✅ `API_REFERENCE.md` - API documentation
- ✅ `IMPLEMENTATION_SUMMARY.md` - What was added
- ✅ `ARCHITECTURE_DIAGRAMS.md` - System design
- ✅ `TROUBLESHOOTING.md` - Common issues
- ✅ `README.md` - This file

**Modified Files:**
- ✅ `src/config/multer.config.ts` - 1MB limit, images only
- ✅ `src/controllers/auth.controller.ts` - Welcome email
- ✅ `src/controllers/password.controller.ts` - Reset & confirmation emails
- ✅ `src/controllers/order.controller.ts` - Order & status emails
- ✅ `src/controllers/user.controller.ts` - Profile image upload
- ✅ `src/controllers/product.contoller.ts` - Product image upload
- ✅ `src/routes/products.router.ts` - Delete image endpoint

---

## Status

✅ **All Features Implemented**
- File upload (profile & product images)
- Email notifications (5 types)
- Error handling (non-blocking)
- Documentation (9 guides)
- Testing (verified working)

✅ **Ready for:**
- Local testing
- Staging deployment
- Production deployment (with .env setup)

---

## Quick Commands

```bash
# Setup
cp .env.example .env
npm install

# Run
npm run dev

# Build
npm run build

# Test
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@gmail.com","password":"test123"}'
```

---

## Version

**Implementation Date:** January 20, 2026
**Version:** 1.0
**Status:** ✅ Complete and Documented

---

## Next Steps

1. **Immediate:** Follow [SETUP_GUIDE.md](./SETUP_GUIDE.md) to configure
2. **Short-term:** Test all features with provided curl commands
3. **Medium-term:** Integrate into your frontend
4. **Long-term:** Consider production email service migration

---

**Happy Coding! 🚀**

For questions or issues, check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) first.
