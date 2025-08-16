/**
 * @swagger
 * /admin/auth/login:
 *   post:
 *     summary: Admin login
 *     description: Authenticates an admin user and returns access and refresh tokens.
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
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Successful login
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
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *                     userType:
 *                       type: string
 *                       enum: [ADMIN]
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Internal server error
 *
 * /admin/auth/renew:
 *   get:
 *     summary: Renew admin session
 *     description: Returns the admin's user data if their session is valid.
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
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Internal server error
 */
