# Troubleshooting Guide

## Common Issues & Solutions

---

## Email Configuration Issues

### Issue 1: "Email transporter verification failed"

**Symptoms:**
- Server starts with error: `Email transporter verification failed`
- Email sending fails silently

**Causes:**
1. Wrong email credentials in `.env`
2. Gmail account security settings
3. App password not generated correctly
4. Typo in environment variables

**Solution:**

```bash
# Step 1: Verify .env file
cat .env

# Should contain:
# EMAIL_SERVICE=gmail
# EMAIL_USER=your_email@gmail.com
# EMAIL_PASSWORD=16_char_app_password
# EMAIL_FROM=your_email@gmail.com
```

```bash
# Step 2: Regenerate Gmail App Password
# 1. Visit: https://myaccount.google.com/app-passwords
# 2. Select "Mail" and "Windows Computer"
# 3. Click "Generate"
# 4. Copy the 16-character password (remove spaces)
# 5. Update EMAIL_PASSWORD in .env
```

```bash
# Step 3: Restart Server
npm run dev
# Should show: "Email transporter ready to send emails"
```

---

### Issue 2: "Invalid login credentials" or "535-5.7.8 Authentication failed"

**Symptoms:**
- Email fails to send
- Console shows authentication error

**Causes:**
1. Using regular Gmail password instead of app password
2. App password not set in .env
3. 2FA not enabled
4. Wrong EMAIL_USER

**Solution:**

```bash
# Gmail requires App Password, not regular password

# WRONG:
EMAIL_PASSWORD=my_regular_gmail_password

# CORRECT:
EMAIL_PASSWORD=abcd efgh ijkl mnop  # 16 chars, app-specific
```

**Steps:**
1. Verify 2FA enabled: https://myaccount.google.com/security
2. Go to: https://myaccount.google.com/app-passwords
3. Generate new password
4. Use 16-character password (without spaces)
5. Update .env and restart

---

### Issue 3: Gmail Account Locked or "Account requires less secure apps"

**Symptoms:**
- Login attempts fail
- Gets logged out repeatedly
- Browser shows security warning

**Solution:**

Gmail now requires App Passwords instead of less secure apps. Follow Issue #2 solution.

---

### Issue 4: Emails Not Being Received

**Symptoms:**
- No error in server logs
- Email "sent successfully" logged
- But no email in inbox
- Console shows: "Email sent successfully to user@gmail.com"

**Causes:**
1. Email in spam folder
2. Email configuration issue
3. Wrong recipient email address
4. Email service blocking

**Solution:**

```bash
# Step 1: Check spam folder in Gmail
# Look in Promotions, Social, Spam tabs

# Step 2: Verify recipient email is correct
# Check database or registration form

# Step 3: Add sender to contacts
# This improves delivery

# Step 4: Test with console logging
# Edit emailService.ts to log more details
```

Add this to `src/utils/emailService.ts`:

```typescript
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: options.email,
      subject: options.subject,
      html: options.html,
    };

    console.log("📧 Sending email to:", options.email);
    console.log("📧 Subject:", options.subject);
    
    const result = await transporter.sendMail(mailOptions);
    
    console.log("✅ Email sent successfully:", result.response);
    return true;
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    return false;
  }
};
```

---

## File Upload Issues

### Issue 5: "File too large" Error (413)

**Symptoms:**
- Upload fails with 413 Payload Too Large
- File validation error

**Causes:**
1. File exceeds 1MB limit
2. Image is too high resolution

**Solution:**

```bash
# Step 1: Check file size
ls -lh image.jpg
# Shows: -rw-r--r--  1 user group 2.5M image.jpg

# Step 2: Compress image
# Option A: Use online tool (tinypng.com, compressor.io)
# Option B: Use ImageMagick
convert image.jpg -quality 80 -resize 1920x1080 compressed.jpg

# Option C: Use ffmpeg
ffmpeg -i image.jpg -q:v 5 compressed.jpg

# Step 3: Verify new size is < 1MB
ls -lh compressed.jpg
# Should be < 1024KB

# Step 4: Upload again
curl -X POST http://localhost:5000/api/users/profile/image \
  -H "Authorization: Bearer TOKEN" \
  -F "image=@compressed.jpg"
```

---

### Issue 6: "Invalid file type" Error (400)

**Symptoms:**
- File upload fails even though it looks like an image
- Error: "Only image files (JPEG, PNG, GIF, WebP) are allowed"

**Causes:**
1. File extension doesn't match MIME type
2. File is actually different type with image extension
3. Corrupted image file

**Solution:**

```bash
# Step 1: Check file type
file image.jpg
# Shows: image.jpg: JPEG image data, JFIF standard 1.01

# Step 2: If wrong type, convert it
convert old-format.png -format jpg new-format.jpg

# Step 3: Verify MIME type matches extension
# JPEG: image/jpeg
# PNG: image/png
# GIF: image/gif
# WebP: image/webp

# Step 4: Try with correct extension
mv image.xyz image.jpg
curl -X POST .../api/users/profile/image \
  -F "image=@image.jpg"
```

---

### Issue 7: "No file uploaded" Error (400)

**Symptoms:**
- Upload fails immediately
- "No file uploaded" message

**Causes:**
1. Missing `-F "image=@file"` in curl command
2. Wrong form field name
3. Missing multipart/form-data header

**Solution:**

```bash
# WRONG - no file parameter
curl -X POST http://localhost:5000/api/users/profile/image \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"image": "base64data"}'

# CORRECT - with file upload
curl -X POST http://localhost:5000/api/users/profile/image \
  -H "Authorization: Bearer TOKEN" \
  -F "image=@/path/to/file.jpg"

# CORRECT - specify file path
curl -X POST http://localhost:5000/api/users/profile/image \
  -H "Authorization: Bearer TOKEN" \
  -F "image=@./profile.jpg"  # Current directory
```

---

### Issue 8: Files Stored But Path Broken

**Symptoms:**
- File upload succeeds
- profileImage stored in database
- But image shows 404 when accessed

**Causes:**
1. `/uploads` directory not served statically
2. File permissions issue
3. Path stored incorrectly in database

**Solution:**

**Step 1: Verify `/uploads` is served statically in `src/index.ts`:**

```typescript
import express from 'express';
import path from 'path';

const app = express();

// Serve uploads directory statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Other middleware...
```

**Step 2: Check file exists:**

```bash
ls -la uploads/
# Should show files like:
# profile-1705747200000-123456789.jpg
```

**Step 3: Verify permissions:**

```bash
chmod 755 uploads/
chmod 644 uploads/*.jpg
```

**Step 4: Test access:**

```bash
curl http://localhost:5000/uploads/profile-1705747200000-123456789.jpg
# Should download file, not 404
```

---

## Authentication Issues

### Issue 9: "Unauthorized" Error (401)

**Symptoms:**
- Upload/email endpoints return 401
- "Unauthorized" message

**Causes:**
1. Missing Authorization header
2. Invalid JWT token
3. Token expired (7 days)
4. Malformed token

**Solution:**

```bash
# Step 1: Get valid token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Response:
{
  "user": {...},
  "token": "eyJhbGciOiJIUzI1NiIs..."
}

# Step 2: Use token in Authorization header
TOKEN="eyJhbGciOiJIUzI1NiIs..."

curl -X POST http://localhost:5000/api/users/profile/image \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@image.jpg"

# Step 3: Verify token format
# Format: Authorization: Bearer {token}
# NO quotes around token
# NO "JWT" prefix, just "Bearer"
```

---

### Issue 10: "Forbidden" Error (403)

**Symptoms:**
- Upload works but returns 403
- "Forbidden" or "Admin only" message

**Causes:**
1. User doesn't have required role
2. Trying to upload product image as regular user

**Solution:**

```bash
# Product image upload requires admin or vendor role
# Check user role

curl -X POST http://localhost:5000/api/products/123/image \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@image.jpg"

# If fails with 403:
# 1. Check user role in database
# 2. Create admin/vendor user
# 3. Get token with admin/vendor account
# 4. Try again with admin token
```

---

## Database Issues

### Issue 11: "User not found" or "Product not found"

**Symptoms:**
- Profile upload fails: "User not found"
- Product upload fails: "Product not found"

**Causes:**
1. User/Product ID doesn't exist
2. Deleted user/product
3. Wrong ID format

**Solution:**

```bash
# Step 1: Verify user/product exists
curl -X GET http://localhost:5000/api/users/64f1a9e2b3c4d5e6f7890123 \
  -H "Authorization: Bearer $TOKEN"

# Step 2: Get correct ID
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer $TOKEN"

# Step 3: Use correct ID
curl -X POST http://localhost:5000/api/users/profile/image \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@image.jpg"
```

---

## Order & Email Issues

### Issue 12: Order Confirmation Email Not Sent

**Symptoms:**
- Order created successfully
- No confirmation email received
- No error in console

**Causes:**
1. User email incorrect
2. Email service not configured
3. Email in spam
4. User not found

**Solution:**

```bash
# Step 1: Check user email in database
curl -X GET http://localhost:5000/api/users/64f1a9e2b3c4d5e6f7890123 \
  -H "Authorization: Bearer $TOKEN"

# Step 2: Verify email configuration
# Check .env has EMAIL_SERVICE, EMAIL_USER, EMAIL_PASSWORD

# Step 3: Check server logs
# Look for "Email sent successfully" or "Failed to send email"

# Step 4: Check email address
# Ensure it's valid format: user@domain.com

# Step 5: Check spam folder
# Gmail: Check Promotions, Social, Spam tabs
```

---

### Issue 13: Order Status Email Not Sent

**Symptoms:**
- Admin updates order status
- Order updated but no email to customer

**Causes:**
1. Order userId doesn't have email
2. User deleted after order creation
3. Email configuration issue

**Solution:**

```bash
# Step 1: Check order in database
curl -X GET http://localhost:5000/api/orders/64f1a9e2b3c4d5e6f7890123 \
  -H "Authorization: Bearer $TOKEN"

# Step 2: Verify user email exists
curl -X GET http://localhost:5000/api/users/{userId} \
  -H "Authorization: Bearer $TOKEN"

# Step 3: Check email logs
# Server should show: "Email sent successfully to user@email.com"

# Step 4: Try again
curl -X PATCH http://localhost:5000/api/orders/64f1a9e2b3c4d5e6f7890123/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "confirmed"}'
```

---

## Password Reset Issues

### Issue 14: "Invalid or expired token"

**Symptoms:**
- Password reset fails with invalid token error
- Token was just generated

**Causes:**
1. Token expired (30 minutes)
2. Token used already
3. Wrong token format
4. Server restarted (in-memory tokens lost)

**Solution:**

```bash
# Step 1: Request new password reset
curl -X POST http://localhost:5000/api/password/forgot \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'

# Response includes new token
# {
#   "message": "Password reset email sent successfully",
#   "resetToken": "a1b2c3d4..."
# }

# Step 2: Use token immediately
curl -X POST http://localhost:5000/api/password/reset \
  -H "Content-Type: application/json" \
  -d '{
    "token": "a1b2c3d4...",
    "newPassword": "newPassword123"
  }'

# Step 3: If still fails, check:
# - Token is correct (copy/paste carefully)
# - Not more than 30 minutes old
# - Server not restarted (starts fresh, tokens lost)
```

---

### Issue 15: Password Reset Email Not Received

**Symptoms:**
- Forgot password request succeeds
- No reset email received

**Causes:**
1. Email configuration issue
2. Email in spam folder
3. User email incorrect
4. Email service down

**Solution:**

```bash
# Step 1: Verify email configuration (same as Issue #4)
# Check .env has all EMAIL_* variables

# Step 2: Check for errors in logs
# Server logs should show: "Email sent successfully"

# Step 3: Check email folder
# Look in Promotions, Social, Spam

# Step 4: Verify reset token was returned
curl -X POST http://localhost:5000/api/password/forgot \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'

# Should return: {"message": "...", "resetToken": "..."}
# If resetToken present, email was sent
```

---

## Server Issues

### Issue 16: Server Won't Start

**Symptoms:**
- npm run dev fails
- TypeScript compilation error
- Module not found

**Solution:**

```bash
# Step 1: Check Node version
node --version
# Should be v16+ or v18+

# Step 2: Check npm installation
npm --version

# Step 3: Reinstall dependencies
rm -rf node_modules
rm package-lock.json
npm install

# Step 4: Check TypeScript errors
npm run build

# Step 5: Start again
npm run dev
```

---

### Issue 17: "Cannot find module" errors

**Symptoms:**
- Error: "Cannot find module '@.../emailService'"
- Import errors after changes

**Solution:**

```bash
# Step 1: Verify file exists
ls src/utils/emailService.ts
# Should show the file

# Step 2: Check import path
# In auth.controller.ts:
import { sendWelcomeEmail } from "../utils/emailService";
// ^ correct path from src/controllers/

# Step 3: Check file extension
# Should be .ts, not .tsx

# Step 4: Rebuild TypeScript
npm run build

# Step 5: Clear cache and restart
npm run dev
```

---

## Testing & Verification

### Quick Test Checklist

```bash
# 1. Check server is running
curl http://localhost:5000/api/health
# Or any GET endpoint

# 2. Test authentication
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# 3. Test file upload
curl -X POST http://localhost:5000/api/users/profile/image \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@test.jpg"

# 4. Test email (register new user)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test",
    "email":"newtest@gmail.com",
    "password":"test123"
  }'

# 5. Check server logs
# Look for: "Email sent successfully" or errors

# 6. Test email (check inbox)
# Go to newtest@gmail.com inbox
# Look for welcome email
```

---

## Debug Mode

Enable detailed logging:

```typescript
// In src/config/email.ts
import transporter from "../config/email";

// Enable debug
transporter.set('logger', true);
transporter.set('debug', true);
```

Check logs:

```bash
# Watch server logs in real-time
npm run dev | grep -E "Email|Error|Failed"
```

---

## Performance Issues

### Issue 18: Slow Email Sending

**Symptoms:**
- API responses slow when sending email
- Server appears frozen

**Note:** This should NOT happen because emails are sent asynchronously.

**Solution:**

```typescript
// Verify emails are truly async in controllers:
// ✅ CORRECT - Don't await
sendWelcomeEmail(name, email);  // No await

// ✅ CORRECT - Fire and forget
sendEmail(...).catch(err => console.error(err));

// ❌ WRONG - This blocks the response
await sendWelcomeEmail(name, email);
```

---

## Production Deployment Issues

### Issue 19: Gmail limits exceeded

**Symptoms:**
- Emails stop sending after certain number
- "Rate limit exceeded" error

**Solution:**

Use production email service:
1. **SendGrid** (best for transactional)
2. **Mailgun**
3. **AWS SES**
4. **Postmark**

```bash
# Update .env
EMAIL_SERVICE=sendgrid
EMAIL_USER=your_api_key
EMAIL_PASSWORD=your_secret
```

---

## Getting Help

If issue persists:

1. **Check logs carefully**
   - Look for actual error message
   - Copy full error text

2. **Verify configuration**
   - Check .env variables
   - Verify credentials are correct

3. **Test independently**
   - Test email with Nodemailer directly
   - Test file upload with Multer directly

4. **Check documentation**
   - [SETUP_GUIDE.md](./SETUP_GUIDE.md)
   - [FILE_UPLOAD_EMAIL_GUIDE.md](./FILE_UPLOAD_EMAIL_GUIDE.md)
   - [API_REFERENCE.md](./API_REFERENCE.md)

---

## Summary

| Issue | Quick Fix |
|-------|-----------|
| Email not sending | Check .env, enable 2FA, generate app password |
| File too large | Compress to < 1MB |
| Unauthorized | Get valid JWT token |
| User not found | Verify ID exists in database |
| Token expired | Request new one (30 min validity) |
| 404 Not Found | Check /uploads is served statically |

---

**Last Updated:** January 20, 2026
**Version:** 1.0
