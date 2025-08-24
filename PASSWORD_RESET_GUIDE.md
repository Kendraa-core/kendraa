# 🔐 Password Reset Guide for Kendraa

This guide explains how the password reset functionality works in the Kendraa application using Supabase.

## 📋 Overview

The password reset system is already fully implemented and includes:

- ✅ **Forgot Password Page** (`/forgot-password`)
- ✅ **Reset Password Page** (`/reset-password`)
- ✅ **Email Integration** with Supabase
- ✅ **Security Validation** and error handling
- ✅ **User-friendly UI** with loading states

## 🔄 How It Works

### 1. User Requests Password Reset

**Flow:**
1. User visits `/forgot-password`
2. Enters their email address
3. Clicks "Send reset link"
4. Supabase sends reset email

**Code Location:** `app/(auth)/forgot-password/page.tsx`

### 2. User Receives Email

**Email Content:**
- Reset link with secure token
- 1-hour expiration
- Redirects to `/reset-password`

### 3. User Resets Password

**Flow:**
1. User clicks email link
2. Redirected to `/reset-password`
3. Enters new password
4. Password is updated in Supabase
5. User is signed out and redirected to sign in

**Code Location:** `app/(auth)/reset-password/page.tsx`

## 🛠️ Technical Implementation

### Supabase Configuration

The password reset uses Supabase's built-in auth system:

```typescript
// Request password reset
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/reset-password`,
});

// Update password
const { error } = await supabase.auth.updateUser({
  password: newPassword
});
```

### Security Features

1. **Email Validation**
   - Checks if email exists in database
   - Validates email format
   - Prevents spam requests

2. **Password Requirements**
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number

3. **Session Validation**
   - Verifies reset token is valid
   - Checks token expiration
   - Redirects if invalid

4. **Error Handling**
   - User-friendly error messages
   - Specific Supabase error handling
   - Graceful fallbacks

## 🎨 UI Features

### Forgot Password Page

- **Clean, professional design**
- **Email validation** with real-time feedback
- **Loading states** during request
- **Success confirmation** after email sent
- **Error handling** with specific messages

### Reset Password Page

- **Password strength validation**
- **Show/hide password toggles**
- **Confirm password matching**
- **Progress indicators**
- **Success confirmation**

## 🔧 Configuration

### Environment Variables

Make sure these are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Auth Settings

In your Supabase dashboard:

1. **Go to Authentication → Settings**
2. **Set Site URL:** `http://localhost:3000` (development)
3. **Add Redirect URLs:**
   - `http://localhost:3000/reset-password`
   - `https://yourdomain.com/reset-password` (production)

### Email Templates

Customize email templates in Supabase:

1. **Go to Authentication → Email Templates**
2. **Edit "Reset password" template**
3. **Customize subject and content**

## 🧪 Testing

### Test the Flow

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Test forgot password:**
   - Go to `http://localhost:3000/forgot-password`
   - Enter your email
   - Check email for reset link

3. **Test password reset:**
   - Click reset link in email
   - Enter new password
   - Verify password is updated

### Test Error Cases

1. **Invalid email:**
   - Enter non-existent email
   - Should show "No account found" error

2. **Weak password:**
   - Enter password without requirements
   - Should show validation error

3. **Expired link:**
   - Wait 1 hour after requesting reset
   - Link should be invalid

## 🚨 Troubleshooting

### Common Issues

#### 1. "User not found" Error

**Cause:** Email doesn't exist in database
**Solution:** Check if user is registered

#### 2. "Invalid JWT" Error

**Cause:** Reset token is expired or invalid
**Solution:** Request new reset link

#### 3. "Too many requests" Error

**Cause:** Rate limiting by Supabase
**Solution:** Wait before trying again

#### 4. Email not received

**Cause:** Email in spam folder or wrong email
**Solution:** Check spam folder, verify email address

### Debug Steps

1. **Check Supabase logs:**
   - Go to Authentication → Logs
   - Look for password reset events

2. **Verify environment variables:**
   ```bash
   echo $NEXT_PUBLIC_SUPABASE_URL
   echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

3. **Test Supabase connection:**
   ```bash
   curl -X GET "https://your-project.supabase.co/rest/v1/" \
     -H "apikey: your-anon-key"
   ```

## 🔒 Security Best Practices

### Implemented Security

- ✅ **Secure token generation** by Supabase
- ✅ **1-hour token expiration**
- ✅ **HTTPS-only in production**
- ✅ **Password strength requirements**
- ✅ **Rate limiting** by Supabase
- ✅ **Session invalidation** after reset

### Additional Recommendations

1. **Monitor reset attempts:**
   - Track failed attempts
   - Implement additional rate limiting if needed

2. **Email verification:**
   - Ensure email is confirmed before allowing reset

3. **Audit logging:**
   - Log password reset events
   - Monitor for suspicious activity

## 📱 Mobile Responsiveness

The password reset pages are fully responsive:

- ✅ **Mobile-first design**
- ✅ **Touch-friendly buttons**
- ✅ **Readable text on small screens**
- ✅ **Proper keyboard handling**

## 🎯 Customization

### Styling

The pages use Tailwind CSS and can be customized:

```css
/* Custom colors */
.bg-blue-600 { /* Primary button color */ }
.text-gray-900 { /* Heading color */ }
.border-gray-300 { /* Input border color */ }
```

### Content

Update text content in the component files:

- `app/(auth)/forgot-password/page.tsx`
- `app/(auth)/reset-password/page.tsx`

### Email Templates

Customize email content in Supabase dashboard:

1. **Go to Authentication → Email Templates**
2. **Edit "Reset password" template**
3. **Update subject and body**

## 📞 Support

If you encounter issues:

1. **Check Supabase status:** https://status.supabase.com
2. **Review Supabase docs:** https://supabase.com/docs/guides/auth
3. **Check application logs** in browser console
4. **Verify Supabase configuration** in dashboard

---

## ✅ Checklist

- [ ] Supabase project configured
- [ ] Environment variables set
- [ ] Auth settings configured
- [ ] Email templates customized
- [ ] Password reset flow tested
- [ ] Error handling verified
- [ ] Mobile responsiveness checked
- [ ] Security measures implemented

The password reset functionality is ready to use! 🎉
