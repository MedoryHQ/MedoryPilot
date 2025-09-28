/**
 * @swagger
 * tags:
 *   - name: Admin Authentication
 *     description: Routes for admin login, verification, token renew, and password management
 *
 * /admin/auth/login:
 *   post:
 *     summary: Admin login (OTP-based)
 *     description: Authenticates an admin and sends a verification OTP via stage token cookie.
 *     tags:
 *       - Admin Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: email
 *               password:
 *                 type: string
 *                 example: "password"
 *               remember:
 *                 type: boolean
 *                 description: Whether to remember admin for extended session
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: OTP sent successfully, stage token set in cookie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "OTP code sent"
 *       401:
 *         description: Invalid credentials
 *       400:
 *         description: Validation errors (e.g., invalid email or password)
 *       500:
 *         description: Internal server error
 *
 * /admin/auth/verify-otp:
 *   post:
 *     summary: Verify OTP code
 *     description: Verifies admin OTP from stage token and sets access & refresh tokens in cookies.
 *     tags:
 *       - Admin Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 example: "1234"
 *             required:
 *               - code
 *     responses:
 *       200:
 *         description: OTP verified successfully, access & refresh tokens set
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         email:
 *                           type: string
 *       401:
 *         description: Invalid OTP code
 *       400:
 *         description: OTP expired
 *       404:
 *         description: Admin not found
 *
 * /admin/auth/resend-otp:
 *   post:
 *     summary: Resend OTP code
 *     description: Sends a new OTP code if previous one expired.
 *     tags:
 *       - Admin Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Verification code resent"
 *       400:
 *         description: Previous OTP still valid
 *       404:
 *         description: Admin not found
 *
 * /admin/auth/renew:
 *   get:
 *     summary: Renew admin session
 *     description: Validates current session via access and refresh tokens, returns admin user data.
 *     tags:
 *       - Admin Authentication
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Admin session renewed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                     userType:
 *                       type: string
 *                       enum: [ADMIN]
 *       401:
 *         description: Tokens missing or invalid
 *       404:
 *         description: Admin not found
 *       500:
 *         description: JWT secrets missing or internal error
 *
 * /admin/auth/forgot-password:
 *   post:
 *     summary: Request forgot password code
 *     description: Sends a verification code to admin email.
 *     tags:
 *       - Admin Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: Code sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Previous code still valid
 *       404:
 *         description: Admin not found
 *
 * /admin/auth/forgot-password-verification:
 *   post:
 *     summary: Verify forgot password code
 *     description: Verifies SMS code sent during forgot password process.
 *     tags:
 *       - Admin Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               smsCode:
 *                 type: string
 *             required:
 *               - email
 *               - smsCode
 *     responses:
 *       200:
 *         description: Code verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Code expired
 *       401:
 *         description: Invalid code
 *       404:
 *         description: Admin not found
 *
 * /admin/auth/password-reset:
 *   post:
 *     summary: Reset password
 *     description: Resets admin password after successful forgot-password verification.
 *     tags:
 *       - Admin Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               smsCode:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *               - smsCode
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 admin:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *       400:
 *         description: Code expired or validation errors
 *       401:
 *         description: Invalid code
 *       404:
 *         description: Admin not found
 */
