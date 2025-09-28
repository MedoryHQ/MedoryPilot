/**
 * @swagger
 * tags:
 *   - name: Admin FAQ
 *     description: Admin CRUD for Frequently Asked Questions (FAQs)
 *
 * /admin/faq:
 *   get:
 *     summary: List FAQs
 *     description: Returns paginated list of FAQs with translations.
 *     tags:
 *       - Admin FAQ
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (optional)
 *       - in: query
 *         name: take
 *         schema:
 *           type: integer
 *         description: Items per page (optional)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search text for question/answer (optional)
 *     responses:
 *       200:
 *         description: FAQs list returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FAQItem'
 *                 count:
 *                   type: integer
 *       500:
 *         description: Internal server error
 *
 *   post:
 *     summary: Create FAQ
 *     description: Create a new FAQ with translations (en and ka required).
 *     tags:
 *       - Admin FAQ
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               order:
 *                 type: integer
 *               translations:
 *                 type: object
 *                 example:
 *                   en:
 *                     question: "Question?"
 *                     answer: "Answer."
 *                   ka:
 *                     question: "Question? (ka)"
 *                     answer: "Answer (ka)"
 *             required:
 *               - translations
 *     responses:
 *       201:
 *         description: FAQ created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FAQItem'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         description: Internal server error
 *
 * /admin/faq/{id}:
 *   get:
 *     summary: Get single FAQ
 *     description: Fetch a single FAQ by UUID.
 *     tags:
 *       - Admin FAQ
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: FAQ found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FAQItem'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         description: FAQ not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "faqNotFound"
 *       500:
 *         description: Internal server error
 *
 *   put:
 *     summary: Update FAQ
 *     description: Update FAQ translations and order by UUID.
 *     tags:
 *       - Admin FAQ
 *     parameters:
 *       - in: path
 *         name: id
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
 *               order:
 *                 type: integer
 *               translations:
 *                 type: object
 *                 example:
 *                   en:
 *                     question: "Question?"
 *                     answer: "Answer."
 *                   ka:
 *                     question: "Question? (ka)"
 *                     answer: "Answer (ka)"
 *             required:
 *               - translations
 *     responses:
 *       200:
 *         description: FAQ updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FAQItem'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         description: FAQ not found
 *       500:
 *         description: Internal server error
 *
 *   delete:
 *     summary: Delete FAQ
 *     description: Delete an FAQ by UUID.
 *     tags:
 *       - Admin FAQ
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: FAQ deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         description: FAQ not found
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
 *     FAQTranslation:
 *       type: object
 *       properties:
 *         question:
 *           type: string
 *           example: "Question?"
 *         answer:
 *           type: string
 *           example: "Answer."
 *         language:
 *           $ref: '#/components/schemas/LanguageCode'
 *
 *     FAQItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         order:
 *           type: integer
 *         translations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/FAQTranslation'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
