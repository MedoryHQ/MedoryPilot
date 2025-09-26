/**
 * @swagger
 * tags:
 *   - name: Customer Contact
 *     description: Public endpoint to read site contact block
 *
 * /contact:
 *   get:
 *     summary: Get public contact block
 *     description: Retrieve the site contact information (background, location and translations) for customers.
 *     tags:
 *       - Customer Contact
 *     responses:
 *       200:
 *         description: Contact found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/ContactDetail'
 *       404:
 *         description: Contact not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 *                   properties:
 *                     en:
 *                       type: string
 *                       example: "Contact not found"
 *       500:
 *         description: Internal server error
 *
 * components:
 *   responses:
 *     ValidationError:
 *       description: Validation failed
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               errors:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     msg:
 *                       type: string
 *                     param:
 *                       type: string
 *                     location:
 *                       type: string
 *
 *   schemas:
 *     LanguageCode:
 *       type: object
 *       properties:
 *         code:
 *           type: string
 *           example: en
 *
 *     ContactTranslation:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: "Contact us"
 *         description:
 *           type: string
 *           example: "Helpful and useful text in English"
 *         language:
 *           $ref: '#/components/schemas/LanguageCode'
 *
 *     Background:
 *       type: object
 *       nullable: true
 *       properties:
 *         path:
 *           type: string
 *           example: "/images/contact-bg.png"
 *         name:
 *           type: string
 *           example: "contact-bg.png"
 *         size:
 *           type: integer
 *           example: 12345
 *
 *     ContactDetail:
 *       type: object
 *       properties:
 *         location:
 *           type: string
 *           nullable: true
 *           example: "123 Main St, City"
 *         background:
 *           $ref: '#/components/schemas/Background'
 *         translations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ContactTranslation'
 */
