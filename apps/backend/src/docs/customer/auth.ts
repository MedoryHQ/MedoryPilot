/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: User registration
 *     description: Registers a new user and sends SMS verification code.
 *     tags:
 *       - Customer Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - firstName
 *               - lastName
 *               - personalId
 *               - dateOfBirth
 *               - password
 *             properties:
 *               phoneNumber:
 *                 type: string
 *               email:
 *                 type: string
 *                 nullable: true
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               personalId:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: SMS verification sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     phoneNumber:
 *                       type: string
 *       400:
 *         description: Validation error or invalid data
 *       409:
 *         description: Phone number already exists
 *
 * /auth/verify:
 *   post:
 *     summary: Verify user account
 *     description: Verifies the user's phone number using SMS code and activates the account.
 *     tags:
 *       - Customer Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - phoneNumber
 *               - code
 *             properties:
 *               id:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verification successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     phoneNumber:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       nullable: true
 *                     verified:
 *                       type: boolean
 *       400:
 *         description: Verification code expired or invalid
 *       401:
 *         description: Invalid SMS code
 *       404:
 *         description: User not found
 *
 * /auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticates a user using phone number and password. Sets JWT tokens as HttpOnly cookies.
 *     tags:
 *       - Customer Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - password
 *             properties:
 *               phoneNumber:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful (tokens set in cookies)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         phoneNumber:
 *                           type: string
 *                         fullName:
 *                           type: string
 *                         email:
 *                           type: string
 *       400:
 *         description: Invalid password
 *       401:
 *         description: Invalid credentials
 *
 * /auth/verification-resend:
 *   post:
 *     summary: Resend verification code
 *     description: Resends SMS verification code to the user's phone number.
 *     tags:
 *       - Customer Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *             properties:
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verification code resent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Verification code still valid
 *       404:
 *         description: User not found
 *
 * /auth/forgot-password:
 *   post:
 *     summary: Forgot password via phone
 *     description: Sends an SMS verification code to the user's phone number to reset the password.
 *     tags:
 *       - Customer Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *             properties:
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verification code sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Verification code still valid
 *       404:
 *         description: User not found
 *
 * /auth/forgot-password/with-email:
 *   post:
 *     summary: Forgot password via email
 *     description: Sends a verification code to the user's email to reset the password.
 *     tags:
 *       - Customer Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verification code sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Verification code still valid
 *       404:
 *         description: User not found
 *
 * /auth/forgot-password-verification:
 *   post:
 *     summary: Verify forgot password code
 *     description: Verifies the code sent to the user's phone for password reset.
 *     tags:
 *       - Customer Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - smsCode
 *             properties:
 *               phoneNumber:
 *                 type: string
 *               smsCode:
 *                 type: string
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
 *         description: Verification code expired
 *       401:
 *         description: Invalid verification code
 *       404:
 *         description: User not found
 *
 * /auth/password-reset:
 *   post:
 *     summary: Reset password
 *     description: Resets the user's password using a valid verification code.
 *     tags:
 *       - Customer Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - password
 *               - smsCode
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [phoneNumber, email]
 *                 description: If type=phoneNumber, provide phoneNumber; if type=email, provide email
 *               phoneNumber:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               smsCode:
 *                 type: string
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
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     phoneNumber:
 *                       type: string
 *                     email:
 *                       type: string
 *       400:
 *         description: Verification code expired
 *       401:
 *         description: Invalid verification code
 *       404:
 *         description: User not found
 *
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh JWT tokens
 *     description: Generates new access and refresh tokens using a valid refresh token cookie.
 *     tags:
 *       - Customer Authentication
 *     responses:
 *       200:
 *         description: Token refreshed successfully (tokens set in cookies)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized or invalid refresh token
 */
