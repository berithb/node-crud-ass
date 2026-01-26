# Architecture & Flow Diagrams

## File Upload Flow

```
User Request (POST /api/users/profile/image)
         ↓
   Multer Middleware
         ↓
   File Size Check (< 1MB)
         ↓
   File Type Check (Images only)
         ↓
   Error? → 400 Bad Request Response
         ↓
   Create Unique Filename
         ↓
   Store to /uploads directory
         ↓
   Get User from Database
         ↓
   Delete Old Profile Image (if exists)
         ↓
   Update User profileImage Path
         ↓
   Save to Database
         ↓
   Return 200 Success Response
```

## Email Notification Flow

### User Registration → Welcome Email

```
User Registers
     ↓
POST /api/auth/register
     ↓
Validate Input
     ↓
Check Email Exists
     ↓
Create User Document
     ↓
Save to Database
     ↓
Generate JWT Token
     ↓
Return User + Token (ASYNC)
     ├─→ sendWelcomeEmail(name, email)
     │        ↓
     │   Compose HTML Template
     │        ↓
     │   Send via Nodemailer
     │        ↓
     │   Success → Log "Email sent"
     │   Failure → Log error (NO CRASH)
     └─→ Continue with Response
```

### Forgot Password → Reset Email

```
User Forgot Password
     ↓
POST /api/password/forgot
     ↓
Find User by Email
     ↓
User Not Found? → 404 Response
     ↓
Generate Reset Token
     ↓
Store Token + Expiration (30 min)
     ↓
Generate Reset Link
     ↓
Return Response (ASYNC)
     ├─→ sendPasswordResetEmail(name, email, link)
     │        ↓
     │   Compose HTML with Reset Link
     │        ↓
     │   Send via Nodemailer
     │        ↓
     │   Success → Log "Email sent"
     │   Failure → Log error (NO CRASH)
     └─→ Response includes resetToken
```

### Reset Password → Confirmation Email

```
User Resets Password
     ↓
POST /api/password/reset
     ↓
Validate Token
     ↓
Check Token Expiration
     ↓
Expired? → 400 Bad Request
     ↓
Find User
     ↓
Hash New Password
     ↓
Update Database
     ↓
Delete Token
     ↓
Return Response (ASYNC)
     ├─→ sendPasswordChangedEmail(name, email)
     │        ↓
     │   Compose HTML Template
     │        ↓
     │   Send via Nodemailer
     │        ↓
     │   Success → Log "Email sent"
     │   Failure → Log error (NO CRASH)
     └─→ Response: "Password reset successfully"
```

### Create Order → Order Confirmation Email

```
User Creates Order
     ↓
POST /api/orders
     ↓
Verify Authenticated
     ↓
Get User's Cart
     ↓
Cart Empty? → 400 Bad Request
     ↓
Calculate Total Amount
     ↓
Create Order Document
     ↓
Clear Cart Items
     ↓
Save to Database
     ↓
Return Response (ASYNC)
     ├─→ Get User Details
     │   ├─→ sendOrderConfirmationEmail(
     │        name, email, orderId, total, items)
     │        ↓
     │   Compose HTML with Order Table
     │        ↓
     │   Send via Nodemailer
     │        ↓
     │   Success → Log "Email sent"
     │   Failure → Log error (NO CRASH)
     └─→ Response: Order Details
```

### Update Order Status → Status Email

```
Admin Updates Order
     ↓
PATCH /api/orders/{id}/status
     ↓
Verify Admin Role
     ↓
Validate Status
     ↓
Find Order + User
     ↓
Check Order Not Delivered
     ↓
Update Order Status
     ↓
Save to Database
     ↓
Return Response (ASYNC)
     ├─→ sendOrderStatusUpdateEmail(
     │    name, email, orderId, status)
     │        ↓
     │   Select Template by Status
     │   (confirmed/shipped/delivered/cancelled)
     │        ↓
     │   Compose HTML Template
     │        ↓
     │   Send via Nodemailer
     │        ↓
     │   Success → Log "Email sent"
     │   Failure → Log error (NO CRASH)
     └─→ Response: Updated Order
```

## Error Handling Flow

### File Upload Error

```
Multer Middleware
     ↓
Validate File
     ├─ No File → 400 Response
     ├─ Too Large (>1MB) → 413 Response
     ├─ Invalid Type → 400 Response
     ├─ Permission Error → 500 Response
     └─ Success → Continue
          ↓
       Store File
          ↓
       If Error → Delete File + Return 500
          ↓
       Success → Return 200
```

### Email Error (Non-Blocking)

```
sendEmail(options)
     ↓
Try to Send Email
     ├─ Success → Return true + Log success
     └─ Error
          ↓
       Catch Exception
          ↓
       Log Error Message
          ↓
       Return false (do NOT throw)
          ↓
       API Response Sent Normally
          ↓
       User Never Knows Email Failed
```

## Database Interactions

### User Model Updates

```
User Document
├─ _id
├─ name
├─ email
├─ password
├─ role
├─ profileImage ← NEW: File path stored here
├─ createdAt
└─ updatedAt
```

### Order Model (Existing)

```
Order Document
├─ _id
├─ userId ← Used to fetch user email
├─ items[]
├─ totalAmount
├─ status ← Triggers status email when updated
├─ createdAt
└─ updatedAt
```

### Reset Token Storage (In Memory)

```
resetTokens = {
  "token_string": {
    userId: "user_id",
    expiresAt: 1705749600000  ← Timestamp for expiration
  },
  ...
}
```

## Email Service Architecture

```
EmailService
│
├─ config/email.ts
│  ├─ Nodemailer Transporter Setup
│  ├─ Gmail SMTP Configuration
│  └─ Connection Verification
│
├─ utils/emailService.ts
│  ├─ sendEmail() [Core Function]
│  │  ├─ Compose Mailbox Options
│  │  ├─ Send via Transporter
│  │  ├─ Handle Success
│  │  └─ Handle Error (Non-Blocking)
│  │
│  ├─ sendWelcomeEmail()
│  ├─ sendPasswordResetEmail()
│  ├─ sendPasswordChangedEmail()
│  ├─ sendOrderConfirmationEmail()
│  └─ sendOrderStatusUpdateEmail()
│
└─ Controllers
   ├─ auth.controller.ts ← Calls sendWelcomeEmail()
   ├─ password.controller.ts ← Calls send*Email() 2x
   └─ order.controller.ts ← Calls send*Email() 2x
```

## File Storage Structure

```
project-root/
└─ uploads/
   ├─ profile-1705747200000-123456789.jpg
   ├─ profile-1705747300000-987654321.jpg
   ├─ product-1705747400000-111111111.jpg
   ├─ product-1705747500000-222222222.jpg
   └─ product-1705747600000-333333333.jpg

Database stores paths like:
- /uploads/profile-1705747200000-123456789.jpg
- /uploads/product-1705747400000-111111111.jpg
```

## Request/Response Cycle

### File Upload (Example: Profile Picture)

```
CLIENT                                SERVER
  │                                    │
  ├─ POST /api/users/profile/image    │
  │  Headers: Authorization, Content  │
  │  Body: multipart/form-data        │
  │─────────────────────────────────→ │
  │                                    ├─ Validate Token
  │                                    ├─ Validate File Size (< 1MB)
  │                                    ├─ Validate File Type (Image)
  │                                    ├─ Store File
  │                                    ├─ Update User.profileImage
  │                                    ├─ Save to DB
  │                                    │
  │  ← 200 OK                          │
  │  {                                 │
  │    "message": "uploaded",          │
  │    "user": { ... }                 │
  │  }                                 │
  │←─────────────────────────────────┤
  │                                    │
```

### Email Send (Example: Welcome Email)

```
API PROCESS                           EMAIL SERVICE
  │                                    │
  ├─ User Registered                  │
  │  (async) sendWelcomeEmail()        │
  │─────────────────────────────────→ │
  │                                    ├─ Compose HTML Template
  │                                    ├─ Connect to SMTP
  │  (Continue without waiting)        ├─ Send Email
  │                                    │
  │  Response Sent to Client           │ Success: Log "Sent"
  │  Immediately                       │
  │─────────────────────────────────→ │ Failure: Log "Failed"
  │  {                                 │  (do NOT error)
  │    "message": "Registered",        │
  │    "token": "...",                 │
  │    "user": { ... }                 │
  │  }                                 │
  │                                    │ Email Processing Continues
  │                                    │ in Background
```

## Security Flow

```
Authentication & Authorization

User Request
     ↓
Extract JWT Token from Header
     ↓
Verify JWT Signature
     ├─ Invalid/Expired → 401 Unauthorized
     └─ Valid → Continue
          ↓
     Decode Token → Get User ID
          ↓
     Verify User Exists
          ├─ Not Found → 401 Unauthorized
          └─ Found → Continue
               ↓
          Check User Role (if required)
          ├─ Wrong Role → 403 Forbidden
          └─ Correct Role → Allow Access
               ↓
          Execute Controller Action
```

## Error Response Matrix

```
┌─────────────────────┬────────┬──────────────────────────┐
│ Scenario            │ Code   │ Response                 │
├─────────────────────┼────────┼──────────────────────────┤
│ No File Uploaded    │ 400    │ "No file uploaded"       │
│ File Too Large      │ 413    │ "File too large"         │
│ Invalid File Type   │ 400    │ "Invalid file type"      │
│ Not Authenticated   │ 401    │ "Unauthorized"           │
│ Insufficient Role   │ 403    │ "Forbidden"              │
│ Resource Not Found  │ 404    │ "{Resource} not found"   │
│ Email Failed        │ 200    │ "Success" (logged error) │
│ Server Error        │ 500    │ "Failed to {action}"     │
└─────────────────────┴────────┴──────────────────────────┘
```

## Email Template Hierarchy

```
emailService.ts
│
├─ sendEmail(options) ← CORE FUNCTION (Error Handling)
│  ├─ Takes: {email, subject, html}
│  ├─ Returns: true/false
│  └─ Catches: Errors (logged, not thrown)
│
├─ sendWelcomeEmail()
│  ├─ HTML Template: Welcome message
│  └─ Calls: sendEmail()
│
├─ sendPasswordResetEmail()
│  ├─ HTML Template: Reset link
│  └─ Calls: sendEmail()
│
├─ sendPasswordChangedEmail()
│  ├─ HTML Template: Confirmation
│  └─ Calls: sendEmail()
│
├─ sendOrderConfirmationEmail()
│  ├─ HTML Template: Order details table
│  └─ Calls: sendEmail()
│
└─ sendOrderStatusUpdateEmail()
   ├─ HTML Template: Status-specific message
   └─ Calls: sendEmail()
```

## Configuration Sources

```
.env File
├─ EMAIL_SERVICE: "gmail"
├─ EMAIL_USER: "your_email@gmail.com"
├─ EMAIL_PASSWORD: "app_specific_password"
├─ EMAIL_FROM: "noreply@yourapp.com"
├─ FRONTEND_URL: "http://localhost:3000"
└─ ...other configs

↓ (Loaded by dotenv)

config/email.ts
├─ process.env.EMAIL_SERVICE
├─ process.env.EMAIL_USER
├─ process.env.EMAIL_PASSWORD
└─ Creates Transporter

↓ (Used by)

utils/emailService.ts
├─ Calls: transporter.sendMail()
└─ Uses: process.env.EMAIL_FROM

↓ (Configured in)

config/multer.config.ts
├─ Storage: path.join(process.cwd(), "uploads")
├─ Limits: fileSize 1MB
└─ FileFilter: JPEG|PNG|GIF|WebP only
```

---

## Data Flow Summary

```
1. FILE UPLOAD
   Client → Multer → Validation → File System → DB Update → Response

2. EMAIL SEND (Async)
   Action → Generate Token → Compose HTML → SMTP Send → Success/Error Log

3. USER PROFILE
   User Profile Upload → Old File Delete → New File Store → DB Update

4. ORDER LIFECYCLE
   Create → Confirmation Email
            ↓
         Update Status (admin) → Status Email
            ↓
         Final Status (delivered) → Cannot Modify
```

---

This architecture ensures:
✅ **Non-blocking email failures**
✅ **Secure file validation**
✅ **Proper error handling**
✅ **Clean separation of concerns**
✅ **Scalable design**
