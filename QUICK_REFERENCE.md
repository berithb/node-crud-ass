# Quick Reference Card

Print this page for quick reference while developing!

---

## Setup (First Time)

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Add Gmail App Password to .env
EMAIL_PASSWORD=16_character_password_here

# 3. Install and run
npm install
npm run dev
```

---

## Environment Variables

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=app_specific_password
EMAIL_FROM=noreply@yourapp.com
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/node-crud-ass
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
```

---

## Key Endpoints

### File Upload
```
POST   /api/users/profile/image          Upload profile picture
POST   /api/products/{id}/image          Upload product image
DELETE /api/products/{id}/image          Delete product image
```

### Email Triggers
```
POST   /api/auth/register                Register → Welcome email
POST   /api/password/forgot              Forgot → Reset email
POST   /api/password/reset               Reset → Confirmation email
POST   /api/orders                       Order → Confirmation email
PATCH  /api/orders/{id}/status           Status → Status email
```

---

## Testing Commands

### Register User (Welcome Email)
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"John Doe",
    "email":"john@gmail.com",
    "password":"password123"
  }'
```

### Login (Get Token)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"john@gmail.com",
    "password":"password123"
  }'
# Copy the token from response
```

### Upload Profile Image
```bash
curl -X POST http://localhost:5000/api/users/profile/image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@profile.jpg"
```

### Upload Product Image
```bash
curl -X POST http://localhost:5000/api/products/PRODUCT_ID/image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@product.jpg"
```

### Request Password Reset (Reset Email)
```bash
curl -X POST http://localhost:5000/api/password/forgot \
  -H "Content-Type: application/json" \
  -d '{"email":"john@gmail.com"}'
```

### Reset Password (Confirmation Email)
```bash
curl -X POST http://localhost:5000/api/password/reset \
  -H "Content-Type: application/json" \
  -d '{
    "token":"TOKEN_FROM_FORGOT_RESPONSE",
    "newPassword":"newPassword123"
  }'
```

### Create Order (Order Email)
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Update Order Status (Status Email)
```bash
curl -X PATCH http://localhost:5000/api/orders/ORDER_ID/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"confirmed"}'
# Status: confirmed | shipped | delivered | cancelled
```

---

## Error Codes

| Code | Issue |
|------|-------|
| 400 | Bad input or no file |
| 401 | Missing/invalid token |
| 403 | Insufficient permissions |
| 404 | Resource not found |
| 413 | File too large (>1MB) |
| 500 | Server error |

---

## File Constraints

**File Size:** Max 1MB (1048576 bytes)
**File Types:** JPEG, PNG, GIF, WebP only
**Storage:** `/uploads` directory (local)

---

## Email Service

**Service:** Gmail SMTP
**Setup:** Enable 2FA → Generate App Password
**Link:** https://myaccount.google.com/app-passwords
**Delay:** 1-5 seconds to deliver

---

## Token Validity

**JWT Token:** 7 days
**Password Reset Token:** 30 minutes

---

## Common Issues & Fixes

| Problem | Solution |
|---------|----------|
| Email not sending | Check .env EMAIL variables |
| File too large | Compress to < 1MB |
| Unauthorized (401) | Get valid JWT token |
| File not found (404) | Check /uploads is served |
| Token expired | Request new one |
| Auth failed | Verify email/password |

---

## File Structure

```
src/
├── config/
│   ├── email.ts              ← Email setup
│   └── multer.config.ts      ← File upload
├── controllers/
│   ├── auth.controller.ts    ← Welcome email
│   ├── password.controller.ts ← Reset email
│   ├── order.controller.ts   ← Order email
│   ├── user.controller.ts    ← Profile upload
│   └── product.contoller.ts  ← Product upload
└── utils/
    └── emailService.ts       ← Email templates

uploads/                       ← Uploaded files
```

---

## Email Templates

**Welcome:** Name, account confirmation
**Reset:** 30-min validity link
**Confirmation:** Password changed notice
**Order:** Items list, total amount
**Status:** Status-specific message

---

## Authentication Header

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Format:** `Bearer {token}`
**No quotes:** Around token
**No prefix:** No "JWT" or other text

---

## Customization

### Change File Size
Edit: `src/config/multer.config.ts`
```typescript
fileSize: 5 * 1024 * 1024  // 5MB
```

### Customize Email Template
Edit: `src/utils/emailService.ts`
```typescript
const html = `<div>Your custom HTML</div>`;
```

### Change Frontend URL
Edit: `.env`
```env
FRONTEND_URL=https://yoursite.com
```

---

## Debugging

```bash
# View logs with filtering
npm run dev | grep -E "Email|Error"

# Test specific operation
curl -X POST ... 2>&1 | jq .

# Check file exists
ls -la uploads/

# Verify config
cat .env | grep EMAIL
```

---

## Response Format

### Success (200/201)
```json
{
  "message": "Operation successful",
  "user": {...},
  "token": "...",
  "product": {...}
}
```

### Error (4xx/5xx)
```json
{
  "message": "Error description",
  "error": "Additional details"
}
```

---

## Documentation Links

- **Setup:** See SETUP_GUIDE.md
- **API Docs:** See API_REFERENCE.md
- **Features:** See FILE_UPLOAD_EMAIL_GUIDE.md
- **Issues:** See TROUBLESHOOTING.md
- **Architecture:** See ARCHITECTURE_DIAGRAMS.md

---

## Checklist for Deployment

- [ ] .env configured with Gmail credentials
- [ ] 2FA enabled on Gmail account
- [ ] App password generated and set
- [ ] npm install completed
- [ ] npm run dev starts without errors
- [ ] Welcome email sends on registration
- [ ] Profile image uploads successfully
- [ ] Order confirmation emails send
- [ ] All endpoints tested

---

## Server Startup

```bash
npm run dev

# Expected output:
# Email transporter ready to send emails
# Connected to MongoDB
# Server running on port 5000
```

---

## Quick Bash Script for Testing

```bash
#!/bin/bash

# Save as test.sh
# Run with: bash test.sh

BASE_URL="http://localhost:5000/api"

# 1. Register
echo "🔐 Registering user..."
RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test User",
    "email":"test@gmail.com",
    "password":"test123"
  }')

TOKEN=$(echo $RESPONSE | jq -r '.token')
echo "✅ Token: $TOKEN"

# 2. Upload image
echo "📁 Uploading image..."
curl -s -X POST $BASE_URL/users/profile/image \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@profile.jpg" | jq .

# 3. Check email
echo "📧 Check email inbox for welcome message"
```

---

## Production Checklist

- [ ] Use SendGrid/Mailgun instead of Gmail
- [ ] Switch to AWS S3 for file storage
- [ ] Enable HTTPS for all endpoints
- [ ] Implement rate limiting
- [ ] Add request validation middleware
- [ ] Set up email queuing (Bull/RabbitMQ)
- [ ] Configure error monitoring (Sentry)
- [ ] Set up log aggregation (CloudWatch)
- [ ] Test with production database
- [ ] Enable CORS properly
- [ ] Set secure headers

---

## Support

**Problem?** → Check TROUBLESHOOTING.md
**API question?** → Check API_REFERENCE.md
**Setup issue?** → Check SETUP_GUIDE.md
**Architecture?** → Check ARCHITECTURE_DIAGRAMS.md

---

**Last Updated:** January 20, 2026
**Quick Reference Version:** 1.0

---

## One-Page Summary

```
FILE UPLOAD:
- Max 1MB, images only (JPEG/PNG/GIF/WebP)
- POST /api/users/profile/image (auth required)
- POST /api/products/{id}/image (admin/vendor)
- DELETE /api/products/{id}/image (admin/vendor)

EMAIL NOTIFICATIONS:
- Register → Welcome email (async)
- Forgot password → Reset email with link (30 min)
- Reset password → Confirmation email
- Create order → Confirmation with items
- Update status → Status update email

ERROR HANDLING:
- Email failures don't crash API
- File validation prevents uploads
- All errors logged to console

SETUP:
- cp .env.example .env
- Add Gmail App Password
- npm install && npm run dev
```

---

Print this page! 📄
