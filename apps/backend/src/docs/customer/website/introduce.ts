/**
 * @swagger
 * tags:
 *   - name: Customer Introduce
 *     description: Public endpoint to fetch introduce section with translations, thumbnail, and video.
 *
 * /introduce:
 *   get:
 *     summary: Get introduce section
 *     description: Returns the introduce section with translations (headline, description), thumbnail, and video.
 *     tags:
 *       - Customer Introduce
 *     responses:
 *       200:
 *         description: Introduce section returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomerIntroduceResponse'
 *       404:
 *         description: Introduce not found
 *       500:
 *         description: Internal server error
 *
 * components:
 *   schemas:
 *     File:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "file-uuid"
 *         name:
 *           type: string
 *           example: "thumbnail.png"
 *         path:
 *           type: string
 *           example: "/uploads/thumbnail.png"
 *         size:
 *           type: integer
 *           example: 12345
 *
 *     CustomerIntroduceTranslation:
 *       type: object
 *       properties:
 *         headline:
 *           type: string
 *           example: "Headline of Medory"
 *         description:
 *           type: string
 *           example: "Description of Medory"
 *         language:
 *           type: object
 *           properties:
 *             code:
 *               type: string
 *               example: "en"
 *
 *     CustomerIntroduceResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: object
 *           properties:
 *             translations:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CustomerIntroduceTranslation'
 *             thumbnail:
 *               $ref: '#/components/schemas/File'
 *             video:
 *               $ref: '#/components/schemas/File'
 */
