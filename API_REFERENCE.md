# API Reference - File Upload & Email Features

## Table of Contents
1. [File Upload Endpoints](#file-upload-endpoints)
2. [Email Trigger Endpoints](#email-trigger-endpoints)
3. [Error Codes](#error-codes)

---

## File Upload Endpoints

### 1. Upload Profile Picture

**POST** `/api/users/profile/image`

Upload a profile picture for the authenticated user.

#### Authentication
- Required: Yes (JWT Token)
- Header: `Authorization: Bearer {token}`

#### Request
```bash
curl -X POST http://localhost:5000/api/users/profile/image \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -F "image=@profile.jpg"
```

#### Response (Success - 200)
```json
{
  "message": "Profile image uploaded successfully",
  "user": {
    "_id": "64f1a9e2b3c4d5e6f7890123",
    "name": "John Doe",
    "email": "john@example.com",
    "profileImage": "/uploads/profile-1705747200000-123456789.jpg",
    "role": "user",
    "createdAt": "2024-01-20T10:30:00Z"
  }
}
```

#### Response (Error - 400)
```json
{
  "message": "No file uploaded"
}
```

#### Constraints
- File size: Max 1MB
- File type: JPEG, PNG, GIF, WebP only
- Overwrites previous profile image if exists

---

### 2. Upload Product Image

**POST** `/api/products/{productId}/image`

Upload an image for a product. Multiple images can be uploaded (appended to images array).

#### Authentication
- Required: Yes (JWT Token)
- Allowed Roles: `admin`, `vendor`
- Header: `Authorization: Bearer {token}`

#### Request
```bash
curl -X POST http://localhost:5000/api/products/64f1a9e2b3c4d5e6f7890123/image \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -F "image=@product.jpg"
```

#### Response (Success - 200)
```json
{
  "message": "Product image uploaded successfully",
  "product": {
    "_id": "64f1a9e2b3c4d5e6f7890123",
    "name": "iPhone 15 Pro",
    "price": 1299.99,
    "description": "Latest Apple smartphone",
    "categoryId": "64f1a0c1a2b3c4d5e6f78901",
    "quantity": 50,
    "inStock": true,
    "images": [
      "/uploads/product-1705747200000-123456789.jpg",
      "/uploads/product-1705747300000-987654321.jpg"
    ],
    "createdAt": "2024-01-20T10:30:00Z"
  }
}
```

#### Response (Error - 404)
```json
{
  "message": "Product not found"
}
```

#### Response (Error - 403)
```json
{
  "message": "Forbidden (Admin/Vendor only)"
}
```

#### Constraints
- File size: Max 1MB
- File type: JPEG, PNG, GIF, WebP only
- Multiple images supported per product
- Previous images NOT deleted automatically

---

### 3. Delete Product Image

**DELETE** `/api/products/{productId}/image`

Remove a specific image from a product's images array and delete from storage.

#### Authentication
- Required: Yes (JWT Token)
- Allowed Roles: `admin`, `vendor`
- Header: `Authorization: Bearer {token}`

#### Request
```bash
curl -X DELETE http://localhost:5000/api/products/64f1a9e2b3c4d5e6f7890123/image \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "/uploads/product-1705747200000-123456789.jpg"
  }'
```

#### Response (Success - 200)
```json
{
  "message": "Product image deleted successfully",
  "product": {
    "_id": "64f1a9e2b3c4d5e6f7890123",
    "name": "iPhone 15 Pro",
    "price": 1299.99,
    "images": [
      "/uploads/product-1705747300000-987654321.jpg"
    ]
  }
}
```

#### Response (Error - 400)
```json
{
  "message": "Image URL is required"
}
```

#### Features
- Only specified image is deleted
- File removed from `/uploads` directory
- Image URL removed from product's images array

---

## Email Trigger Endpoints

### 1. User Registration (Triggers Welcome Email)

**POST** `/api/auth/register`

Register a new user account. Automatically sends welcome email.

#### Request
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "user"
  }'
```

#### Email Sent
- **To:** john@example.com
- **Subject:** Welcome to Our Platform!
- **Content:** Welcome message with account confirmation

#### Response (Success - 201)
```json
{
  "user": {
    "_id": "64f1a9e2b3c4d5e6f7890123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Notes
- Email sending failure does NOT prevent registration
- Check server logs if email not received

---

### 2. Forgot Password (Triggers Reset Email)

**POST** `/api/password/forgot`

Request a password reset token. Automatically sends reset email with link.

#### Request
```bash
curl -X POST http://localhost:5000/api/password/forgot \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

#### Email Sent
- **To:** john@example.com
- **Subject:** Password Reset Request
- **Content:** Reset link (valid for 30 minutes)
- **Link Format:** `{FRONTEND_URL}/reset-password?token={resetToken}`

#### Response (Success - 200)
```json
{
  "message": "Password reset email sent successfully",
  "resetToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
}
```

#### Response (Error - 404)
```json
{
  "message": "User not found"
}
```

#### Configuration
- Reset token valid for: **30 minutes**
- Frontend URL: Set in `.env` as `FRONTEND_URL`
- Example: `FRONTEND_URL=http://localhost:3000`

---

### 3. Reset Password (Triggers Confirmation Email)

**POST** `/api/password/reset`

Complete password reset using token. Automatically sends confirmation email.

#### Request
```bash
curl -X POST http://localhost:5000/api/password/reset \
  -H "Content-Type: application/json" \
  -d '{
    "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    "newPassword": "newPassword123"
  }'
```

#### Email Sent
- **To:** User's registered email
- **Subject:** Password Changed Successfully
- **Content:** Confirmation of password change

#### Response (Success - 200)
```json
{
  "message": "Password reset successfully"
}
```

#### Response (Error - 400)
```json
{
  "message": "Invalid or expired token"
}
```

#### Validation
- Token must be valid and not expired
- New password required
- Old token automatically removed after use

---

### 4. Create Order (Triggers Confirmation Email)

**POST** `/api/orders`

Create order from cart. Automatically sends order confirmation email.

#### Authentication
- Required: Yes (JWT Token)
- Allowed Roles: `customer`
- Header: `Authorization: Bearer {token}`

#### Request
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json"
```

#### Email Sent
- **To:** Customer's email
- **Subject:** Order Confirmation - Order #{orderId}
- **Content:** 
  - Order ID
  - Item details (name, quantity, price)
  - Total amount
  - Order tracking information

#### Response (Success - 201)
```json
{
  "_id": "64f1a9e2b3c4d5e6f7890123",
  "userId": "64f1a9e2b3c4d5e6f7890124",
  "items": [
    {
      "productId": "64f1a9e2b3c4d5e6f7890125",
      "name": "iPhone 15 Pro",
      "price": 1299.99,
      "quantity": 1
    }
  ],
  "totalAmount": 1299.99,
  "status": "pending",
  "createdAt": "2024-01-20T10:30:00Z"
}
```

#### Response (Error - 400)
```json
{
  "message": "Cart is empty"
}
```

#### Features
- Cart is cleared after order creation
- Email sent with order summary
- Order tracking information included

---

### 5. Update Order Status (Triggers Status Email)

**PATCH** `/api/orders/{orderId}/status`

Update order status. Automatically sends status update email to customer.

#### Authentication
- Required: Yes (JWT Token)
- Allowed Roles: `admin`
- Header: `Authorization: Bearer {token}`

#### Request
```bash
curl -X PATCH http://localhost:5000/api/orders/64f1a9e2b3c4d5e6f7890123/status \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "status": "confirmed"
  }'
```

#### Email Sent (varies by status)

**Confirmed:**
- Subject: Order Status Update - Order #{orderId}
- Message: "Your order has been confirmed and is being prepared."

**Shipped:**
- Subject: Order Status Update - Order #{orderId}
- Message: "Your order has been shipped! You can track it using the information below."

**Delivered:**
- Subject: Order Status Update - Order #{orderId}
- Message: "Your order has been delivered. Thank you for your purchase!"

**Cancelled:**
- Subject: Order Status Update - Order #{orderId}
- Message: "Your order has been cancelled. If you have any questions, please contact us."

#### Response (Success - 200)
```json
{
  "_id": "64f1a9e2b3c4d5e6f7890123",
  "userId": "64f1a9e2b3c4d5e6f7890124",
  "items": [...],
  "totalAmount": 1299.99,
  "status": "confirmed",
  "updatedAt": "2024-01-20T10:30:00Z"
}
```

#### Response (Error - 404)
```json
{
  "message": "Order not found"
}
```

#### Valid Statuses
- `pending` (initial status)
- `confirmed` (order confirmed, being prepared)
- `shipped` (order in transit)
- `delivered` (order delivered)
- `cancelled` (order cancelled)

---

## Error Codes

### File Upload Errors

| Code | Status | Message | Cause |
|------|--------|---------|-------|
| 400 | Bad Request | No file uploaded | Missing file in request |
| 400 | Bad Request | Only image files (JPEG, PNG, GIF, WebP) are allowed | Invalid file type |
| 404 | Not Found | User not found | User ID doesn't exist |
| 404 | Not Found | Product not found | Product ID doesn't exist |
| 413 | Payload Too Large | File too large | File exceeds 1MB limit |
| 500 | Server Error | Failed to upload profile image | Server error |

### Email Errors

| Code | Status | Message | Cause |
|------|--------|---------|-------|
| 400 | Bad Request | Email is required | Missing email parameter |
| 400 | Bad Request | Token and new password required | Missing required fields |
| 400 | Bad Request | Invalid or expired token | Password reset token invalid/expired |
| 404 | Not Found | User not found | User ID doesn't exist |
| 409 | Conflict | Email already exists | Email already registered |
| 500 | Server Error | Failed to send email | Email service error (non-blocking) |

### Order Errors

| Code | Status | Message | Cause |
|------|--------|---------|-------|
| 400 | Bad Request | Cart is empty | Cannot create order with empty cart |
| 400 | Bad Request | Only pending orders can be cancelled | Order already processed |
| 403 | Forbidden | Access denied | Not order owner |
| 404 | Not Found | Order not found | Order ID doesn't exist |
| 500 | Server Error | Failed to create order | Server error |

---

## Authentication

### JWT Token Structure

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0ZjFhOWUyYjNjNGQ1ZTZmNzg5MDEyMyIsImlhdCI6MTcwNTc0NzIwMCwiZXhwIjoxNzA2MzUyMDAwfQ.signature
```

### Getting Token

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "user": {...},
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## Testing Commands

### Test All Features

```bash
# 1. Register user (triggers welcome email)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@gmail.com","password":"test123"}'

# 2. Login to get token
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gmail.com","password":"test123"}' \
  | jq -r '.token')

# 3. Upload profile image
curl -X POST http://localhost:5000/api/users/profile/image \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@profile.jpg"

# 4. Request password reset (triggers reset email)
curl -X POST http://localhost:5000/api/password/forgot \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gmail.com"}'

# 5. Create order (triggers order email)
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer $TOKEN"
```

---

## Response Format

All responses follow this format:

### Success Response
```json
{
  "message": "Operation successful",
  "data": {...}
}
```

### Error Response
```json
{
  "message": "Error description",
  "error": "Additional error info"
}
```

---

## Pagination & Filtering

Currently not implemented for file upload and email features.

---

## Rate Limiting

No rate limiting currently implemented. Recommended for production:
- Email sending: Max 100 emails/hour per IP
- File upload: Max 50 uploads/hour per user
- Consider using express-rate-limit package

---

## Best Practices

1. **Email Configuration**
   - Use Gmail App Password, not regular password
   - Enable 2FA on Gmail account
   - Update credentials regularly

2. **File Upload**
   - Compress images before upload
   - Validate file size before sending
   - Use appropriate Content-Type headers

3. **Error Handling**
   - Check email logs if delivery fails
   - Verify file permissions in `/uploads` directory
   - Test with valid tokens before production

4. **Security**
   - Don't expose sensitive data in emails
   - Use HTTPS in production
   - Validate all inputs server-side
