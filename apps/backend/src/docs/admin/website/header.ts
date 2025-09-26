/**
 * @swagger
 * tags:
 *   - name: Admin Header
 *     description: Admin endpoints to manage site header (create, read, update, delete)
 *   - name: Customer Header
 *     description: Public endpoint to read current site header
 *
 * /admin/header:
 *   get:
 *     summary: Get header (admin)
 *     description: Returns the current header (includes logo and translations). Requires admin verification (cookie).
 *     tags:
 *       - Admin Header
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Header returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HeaderResponse'
 *       404:
 *         description: Header not found
 *       401:
 *         description: Admin verification required / invalid token
 *       500:
 *         description: Internal server error
 *
 *   post:
 *     summary: Create header
 *     description: Creates a new header with translations and optional logo. Requires admin verification.
 *     tags:
 *       - Admin Header
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateHeaderRequest'
 *     responses:
 *       201:
 *         description: Header created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HeaderResponse'
 *       400:
 *         description: Validation errors
 *       401:
 *         description: Admin verification required
 *       500:
 *         description: Internal server error
 *
 * /admin/header/{id}:
 *   put:
 *     summary: Update header
 *     description: Update header translations, logo and active flag. Requires admin verification.
 *     tags:
 *       - Admin Header
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Header UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateHeaderRequest'
 *     responses:
 *       200:
 *         description: Header updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HeaderResponse'
 *       400:
 *         description: Validation errors (invalid id or body)
 *       401:
 *         description: Admin verification required
 *       404:
 *         description: Header not found
 *       500:
 *         description: Internal server error
 *
 *   delete:
 *     summary: Delete header
 *     description: Deletes header by id. Requires admin verification.
 *     tags:
 *       - Admin Header
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Header UUID
 *     responses:
 *       200:
 *         description: Header deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Header deleted successfully"
 *       400:
 *         description: Validation errors (invalid id)
 *       401:
 *         description: Admin verification required
 *       404:
 *         description: Header not found
 *       500:
 *         description: Internal server error
 *
 * /header:
 *   get:
 *     summary: Get public header
 *     description: Public endpoint that returns header data (logo, translations and active flag) for the website.
 *     tags:
 *       - Customer Header
 *     responses:
 *       200:
 *         description: Header returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HeaderResponse'
 *       404:
 *         description: Header not found
 *       500:
 *         description: Internal server error
 *
 * components:
 *   schemas:
 *     LogoObject:
 *       type: object
 *       nullable: true
 *       properties:
 *         id:
 *           type: string
 *           example: "22222222-2222-2222-2222-222222222222"
 *         path:
 *           type: string
 *           example: "/uploads/logo.png"
 *         name:
 *           type: string
 *           example: "logo.png"
 *         size:
 *           type: integer
 *           example: 12345
 *
 *     HeaderTranslationItem:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Medory"
 *         position:
 *           type: string
 *           example: "CEO"
 *         headline:
 *           type: string
 *           example: "Welcome to our site"
 *         description:
 *           type: string
 *           example: "Short description text"
 *         language:
 *           type: object
 *           properties:
 *             code:
 *               type: string
 *               example: "en"
 *
 *     HeaderResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               example: "11111111-1111-1111-1111-111111111111"
 *             active:
 *               type: boolean
 *               example: true
 *             logo:
 *               $ref: '#/components/schemas/LogoObject'
 *             translations:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/HeaderTranslationItem'
 *
 *     CreateHeaderRequest:
 *       type: object
 *       properties:
 *         active:
 *           type: boolean
 *           example: true
 *         logo:
 *           $ref: '#/components/schemas/LogoObject'
 *         translations:
 *           type: object
 *           description: Map of language code to translation object. At least 'en' and 'ka' translations are required by validation.
 *           example:
 *             en:
 *               name: "Medory"
 *               position: "CEO"
 *               headline: "Welcome"
 *               description: "Short description"
 *             ka:
 *               name: "Sample"
 *               position: "Position"
 *               headline: "Headline"
 *               description: "Description"
 *
 *     UpdateHeaderRequest:
 *       allOf:
 *         - $ref: '#/components/schemas/CreateHeaderRequest'
 */
