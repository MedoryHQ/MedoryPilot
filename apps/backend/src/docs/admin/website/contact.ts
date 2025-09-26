/**
 * @swagger
 * tags:
 *   - name: Admin Contact
 *     description: Manage site contact block (translations, background, location)
 *
 * /admin/contact:
 *   get:
 *     summary: Get contact block
 *     tags:
 *       - Admin Contact
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
 *       500:
 *         description: Internal server error
 *
 *   post:
 *     summary: Create contact block
 *     tags:
 *       - Admin Contact
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               location:
 *                 type: string
 *                 example: "თბილისი"
 *               background:
 *                 $ref: '#/components/schemas/Background'
 *               translations:
 *                 type: object
 *                 example:
 *                   en: { title: "Contact us", description: "Better call Medory" }
 *                   ka: { title: "დაგვიკავშირდით", description: "Better call Medory" }
 *             required:
 *               - translations
 *     responses:
 *       201:
 *         description: Contact created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/ContactDetail'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         description: Internal server error
 *
 *   delete:
 *     summary: Delete contact block
 *     tags:
 *       - Admin Contact
 *     responses:
 *       200:
 *         description: Contact deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Contact not found
 *       500:
 *         description: Internal server error
 *
 * /admin/contact/{id}:
 *   put:
 *     summary: Update contact block
 *     tags:
 *       - Admin Contact
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               location:
 *                 type: string
 *               background:
 *                 $ref: '#/components/schemas/Background'
 *               translations:
 *                 type: object
 *                 example:
 *                   en: { title: "Contact us", description: "Better call Medory" }
 *                   ka: { title: "დაგვიკავშირდით", description: "Better call Medory" }
 *             required:
 *               - translations
 *     responses:
 *       200:
 *         description: Contact updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/ContactDetail'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         description: Contact not found
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
 *
 *     ContactTranslation:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         language:
 *           $ref: '#/components/schemas/LanguageCode'
 *
 *     Background:
 *       type: object
 *       nullable: true
 *       properties:
 *         path:
 *           type: string
 *         name:
 *           type: string
 *         size:
 *           type: integer
 *
 *     ContactDetail:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         location:
 *           type: string
 *           nullable: true
 *         background:
 *           $ref: '#/components/schemas/Background'
 *         translations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ContactTranslation'
 */
