/**
 * @swagger
 * tags:
 *   - name: Customer Header
 *     description: Public endpoint to fetch the active website header
 *
 * /header:
 *   get:
 *     summary: Get active header
 *     description: Returns the active header with logo and translations for the website. No authentication required.
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
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 *
 * components:
 *   responses:
 *     NotFound:
 *       description: Resource not found
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: string
 *                 example: "headerNotFound"
 *
 *     InternalError:
 *       description: Internal server error
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               errors:
 *                 type: array
 *                 items:
 *                   type: object
 *
 *   schemas:
 *     CustomerHeaderLogo:
 *       type: object
 *       nullable: true
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
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
 *     CustomerHeaderData:
 *       type: object
 *       properties:
 *         logo:
 *           $ref: '#/components/schemas/CustomerHeaderLogo'
 *         translations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CustomerHeaderTranslation'
 *
 *     CustomerHeaderResponse:
 *       type: object
 *       properties:
 *         data:
 *           $ref: '#/components/schemas/CustomerHeaderData'
 */
