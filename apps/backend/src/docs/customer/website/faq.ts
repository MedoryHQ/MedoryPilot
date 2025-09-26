/**
 * @swagger
 * tags:
 *   - name: FAQ (Customer)
 *     description: Public endpoints to fetch Frequently Asked Questions
 *
 * /faq:
 *   get:
 *     summary: List FAQs (public)
 *     description: Returns a paginated list of FAQs with translations (only fields exposed to customers).
 *     tags:
 *       - FAQ (Customer)
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
 *                     $ref: '#/components/schemas/CustomerFAQItem'
 *                 count:
 *                   type: integer
 *       500:
 *         description: Internal server error
 *
 * components:
 *   schemas:
 *     LanguageCode:
 *       type: object
 *       properties:
 *         code:
 *           type: string
 *           example: en
 *
 *     FAQTranslationCustomer:
 *       type: object
 *       properties:
 *         question:
 *           type: string
 *           example: "What is your refund policy?"
 *         answer:
 *           type: string
 *           example: "You may request a refund within 30 days."
 *         language:
 *           $ref: '#/components/schemas/LanguageCode'
 *
 *     CustomerFAQItem:
 *       type: object
 *       properties:
 *         order:
 *           type: integer
 *         translations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/FAQTranslationCustomer'
 */
