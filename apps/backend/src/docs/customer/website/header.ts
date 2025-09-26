/**
 * @swagger
 * tags:
 *   - name: Customer Header
 *     description: Public endpoint to fetch active website header
 *
 * /header:
 *   get:
 *     summary: Get active header
 *     description: Returns the active header with logo and translations for the website.
 *     tags:
 *       - Customer Header
 *     responses:
 *       200:
 *         description: Active header returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomerHeaderResponse'
 *       404:
 *         description: Header not found
 *       500:
 *         description: Internal server error
 *
 * components:
 *   schemas:
 *     CustomerHeaderLogo:
 *       type: object
 *       nullable: true
 *       properties:
 *         id:
 *           type: string
 *           example: "33333333-3333-3333-3333-333333333333"
 *         path:
 *           type: string
 *           example: "/uploads/logo.png"
 *         name:
 *           type: string
 *           example: "logo.png"
 *         size:
 *           type: integer
 *           example: 45678
 *
 *     CustomerHeaderTranslation:
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
 *           example: "Short description for header"
 *         language:
 *           type: object
 *           properties:
 *             code:
 *               type: string
 *               example: "en"
 *
 *     CustomerHeaderResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: object
 *           properties:
 *             logo:
 *               $ref: '#/components/schemas/CustomerHeaderLogo'
 *             translations:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CustomerHeaderTranslation'
 */
