# File Upload & Email Notification Implementation Guide

## Overview
This document describes the new file upload and email notification features added to the Node CRUD API.

---

## Part A: File Upload Capabilities

### 1. **File Upload Configuration**

#### Location: `src/config/multer.config.ts`

**Features:**
- Maximum file size: **1MB** (enforced)
- Allowed formats: **JPEG, PNG, GIF, WebP** (images only)
- Files stored in `/uploads` directory
- Automatic unique filename generation

#### Upload Limits
```typescript
// Maximum file size: 1 MB
limits: {
  fileSize: 1 * 1024 * 1024, // 1MB
}
```

#### Supported File Types
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

---

### 2. **Profile Picture Upload**

#### Endpoint
```
POST /api/users/profile/image
```

#### Authentication
- **Required:** Yes (JWT Token)
- **Roles:** Any authenticated user

#### Request
```bash
curl -X POST http://localhost:5000/api/users/profile/image \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@/path/to/image.jpg"
```

#### Response
```json
{
  "message": "Profile image uploaded successfully",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "profileImage": "/uploads/profile-1705747200000-123456789.jpg",
    "role": "user"
  }
}
```

#### Error Handling
- No file provided: `400 Bad Request`
- File too large (>1MB): `413 Payload Too Large`
- Invalid file type: `400 Bad Request`
- User not found: `404 Not Found`

---

### 3. **Product Image Upload**

#### Endpoint
```
POST /api/products/{productId}/image
```

#### Authentication
- **Required:** Yes (JWT Token)
- **Allowed Roles:** `admin`, `vendor`

#### Request
```bash
curl -X POST http://localhost:5000/api/products/64f1a9e2b3c4d5e6f7890123/image \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@/path/to/product.jpg"
```

#### Response
```json
{
  "message": "Product image uploaded successfully",
  "product": {
    "_id": "product_id",
    "name": "iPhone 15 Pro",
    "price": 1299.99,
    "images": [
      "/uploads/product-1705747200000-123456789.jpg",
      "/uploads/product-1705747300000-987654321.jpg"
    ],
    "categoryId": "category_id"
  }
}
```

#### Features
- Multiple images per product supported
- Old images NOT automatically deleted
- File storage in `/uploads` directory

---

### 4. **Product Image Deletion**

#### Endpoint
```
DELETE /api/products/{productId}/image
```

#### Authentication
- **Required:** Yes (JWT Token)
- **Allowed Roles:** `admin`, `vendor`

#### Request
```bash
curl -X DELETE http://localhost:5000/api/products/64f1a9e2b3c4d5e6f7890123/image \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "/uploads/product-1705747200000-123456789.jpg"
  }'
```

#### Response
```json
{
  "message": "Product image deleted successfully",
  "product": {
    "_id": "product_id",
    "name": "iPhone 15 Pro",
    "images": [
      "/uploads/product-1705747300000-987654321.jpg"
    ]
  }
}
```

#### Features
- Removes image from product's images array
- Deletes file from `/uploads` directory
- Only removes the specified image

---

## Part B: Email Notification System

### 1. **Email Configuration**

#### Location: `src/config/email.ts`

**Setup Instructions:**
1. Install Nodemailer (already installed: `npm install nodemailer`)
2. Configure environment variables in `.env`:

```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
EMAIL_FROM=noreply@yourapp.com
```

#### Using Gmail
1. Enable "Less secure app access" or use an **App Password**:
   - Go to https://myaccount.google.com/app-passwords
   - Select Mail and Windows Computer
   - Copy the generated 16-character password
   - Use this as `EMAIL_PASSWORD` in `.env`

#### Error Handling
- Email failures **do NOT crash the API**
- Failed emails are logged to console
- API responses not affected by email sending failures

---

### 2. **Welcome Email (User Registration)**

**Triggered:** When a new user registers

#### Endpoint
```
POST /api/auth/register
```

#### Event Details
- **When:** User successfully creates account
- **To:** New user's email address
- **Contains:** Welcome message, account confirmation

#### Email Template
```
Subject: Welcome to Our Platform!

Message:
- Welcome greeting with user's name
- Account creation confirmation
- User's registered email address
- Call to action to log in
- Support contact information
```

---

### 3. **Password Reset Email (Forgot Password)**

**Triggered:** When user requests password reset

#### Endpoint
```
POST /api/password/forgot
```

#### Request
```json
{
  "email": "user@example.com"
}
```

#### Response
```json
{
  "message": "Password reset email sent successfully",
  "resetToken": "a1b2c3d4e5f6..."
}
```

#### Email Template
```
Subject: Password Reset Request

Message:
- Password reset request confirmation
- Reset link (valid for 30 minutes)
- Instructions to reset password
- Security warning for suspicious activity
```

#### Link Format
```
{FRONTEND_URL}/reset-password?token={resetToken}
```

#### Environment Variable
```env
FRONTEND_URL=http://localhost:3000
```

---

### 4. **Password Changed Confirmation Email**

**Triggered:** When user successfully resets password

#### Endpoint
```
POST /api/password/reset
```

#### Request
```json
{
  "token": "a1b2c3d4e5f6...",
  "newPassword": "newPassword123"
}
```

#### Email Template
```
Subject: Password Changed Successfully

Message:
- Confirmation that password was changed
- Timestamp of change
- Security alert: Contact support if not authorized
- Support contact information
```

---

### 5. **Order Confirmation Email**

**Triggered:** When user creates order from cart

#### Endpoint
```
POST /api/orders
```

#### Email Template
```
Subject: Order Confirmation - Order #{orderId}

Message:
- Order ID
- Item details table (product name, quantity, price)
- Total amount
- Order status update notification
- Support contact information
```

#### Example Email Content
```
Order ID: 64f2a1c9b8e9a1f234567890
Items:
  - iPhone 15 Pro (Qty: 1) - $1,299.99
  - USB-C Cable (Qty: 2) - $29.98
Total: $1,329.97

We will keep you updated on your order status.
```

---

### 6. **Order Status Update Emails**

**Triggered:** When admin updates order status

#### Endpoint
```
PATCH /api/orders/{orderId}/status
```

#### Request
```json
{
  "status": "confirmed | shipped | delivered | cancelled"
}
```

#### Status Messages

**Confirmed:**
```
Subject: Order Status Update - Order #{orderId}
Message: Your order has been confirmed and is being prepared.
```

**Shipped:**
```
Subject: Order Status Update - Order #{orderId}
Message: Your order has been shipped! You can track it using the information below.
```

**Delivered:**
```
Subject: Order Status Update - Order #{orderId}
Message: Your order has been delivered. Thank you for your purchase!
```

**Cancelled:**
```
Subject: Order Status Update - Order #{orderId}
Message: Your order has been cancelled. If you have any questions, please contact us.
```

---

## Error Handling

### File Upload Errors

| Error | Status | Cause |
|-------|--------|-------|
| No file uploaded | 400 | Missing file in request |
| File too large | 413 | File exceeds 1MB limit |
| Invalid file type | 400 | File is not an image |
| User not found | 404 | User ID doesn't exist |
| Product not found | 404 | Product ID doesn't exist |

### Email Sending Errors

- **Logged to console** but **does not crash API**
- **User receives response** regardless of email status
- **Check server logs** for email delivery issues
- **Verify .env** email configuration

### Email Configuration Issues

```bash
# Test email configuration
NODE_ENV=development npm run dev

# Check console output for:
# ✓ "Email transporter ready to send emails"
# ✗ "Email transporter verification failed"
```

---

## Testing

### Manual Testing

#### Test File Upload
```bash
# Test profile image upload
curl -X POST http://localhost:5000/api/users/profile/image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@./test-image.jpg"

# Test product image upload
curl -X POST http://localhost:5000/api/products/PRODUCT_ID/image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@./test-image.jpg"
```

#### Test Email Sending
```bash
# Register new user (triggers welcome email)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'

# Request password reset (triggers reset email)
curl -X POST http://localhost:5000/api/password/forgot \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

---

## Environment Variables Required

```env
# Email
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
EMAIL_FROM=noreply@yourapp.com

# Frontend
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/node-crud-ass

# JWT
JWT_SECRET=your_jwt_secret_key_here

# Server
PORT=5000
NODE_ENV=development
```

---

## Database

No new database tables required. Email system uses existing:
- `users` collection
- `orders` collection

---

## Troubleshooting

### "Email transporter verification failed"
- Check Gmail app password is correct
- Enable "Less secure app access" if using regular password
- Verify `EMAIL_SERVICE`, `EMAIL_USER`, `EMAIL_PASSWORD` in `.env`

### "File size limit exceeded"
- Compress image before upload
- Maximum size is 1MB (1048576 bytes)
- Use tools like ImageMagick or online tools

### "Invalid file type"
- Only JPEG, PNG, GIF, WebP supported
- Convert your file using an online converter
- Check file MIME type

### Emails not sending but no error
- Check `.env` EMAIL variables are set
- Verify email service credentials
- Check server logs for error messages
- Test email configuration

---

## Future Enhancements

1. **Async Email Queue** - Use Bull or RabbitMQ for better reliability
2. **Email Templates** - Use Handlebars or EJS for dynamic templates
3. **Image Optimization** - Compress images before storing
4. **Cloud Storage** - Migrate to Cloudinary or AWS S3
5. **Email History** - Store email logs in database
6. **Retry Logic** - Automatic retry for failed emails
