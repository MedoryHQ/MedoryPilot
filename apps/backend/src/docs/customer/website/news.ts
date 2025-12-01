/**
 * @swagger
 * tags:
 *   - name: Customer News
 *     description: Public endpoints to fetch website news
 *
 * /news:
 *   get:
 *     summary: Get all news
 *     description: Returns a list of news with pagination, filters, and optional search.
 *     tags:
 *       - Customer News
 *     parameters:
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           example: 0
 *         description: Number of records to skip for pagination
 *       - in: query
 *         name: take
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Number of records to return
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           example: "announcement"
 *         description: Search term for slug or content
 *       - in: query
 *         name: showInLanding
 *         schema:
 *           type: boolean
 *           example: true
 *         description: Filter by whether the news is shown on landing
 *     responses:
 *       200:
 *         description: List of news with count
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomerNewsListResponse'
 *       500:
 *         description: Internal server error
 *
 * /news/{slug}:
 *   get:
 *     summary: Get a single news
 *     description: Fetch a single news item by slug.
 *     tags:
 *       - Customer News
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *           example: "slug"
 *     responses:
 *       200:
 *         description: News item returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomerNewsResponse'
 *       404:
 *         description: News not found
 *       500:
 *         description: Internal server error
 *
 * components:
 *   schemas:
 *     CustomerNewsBackground:
 *       type: object
 *       nullable: true
 *       properties:
 *         path:
 *           type: string
 *           example: "/uploads/news/bg.png"
 *         name:
 *           type: string
 *           example: "bg.png"
 *         size:
 *           type: integer
 *           example: 12345
 *
 *     CustomerNewsTranslation:
 *       type: object
 *       properties:
 *         content:
 *           type: string
 *           example: "content"
 *        description:
 *          type: string
 *          example: "description"
 *        name:
 *          type: string
 *          example: "name"
 *         language:
 *           type: object
 *           properties:
 *             code:
 *               type: string
 *               example: "en"
 *
 *     CustomerNews:
 *       type: object
 *       properties:
 *         slug:
 *           type: string
 *           example: "slug"
 *         showInLanding:
 *           type: boolean
 *           example: true
 *         order:
 *           type: integer
 *           example: 1
 *         background:
 *           $ref: '#/components/schemas/CustomerNewsBackground'
 *         metaTitle:
 *           type: string
 *           example: "metaTitle"
 *         metaDescription:
 *           type: string
 *           example: "metaDescription"
 *         metaKeywords:
 *           type: string
 *           example: "metaKeywords"
 *         metaImage:
 *           type: string
 *           example: "/uploads/meta/news.png"
 *         translations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CustomerNewsTranslation'
 *
 *     CustomerNewsResponse:
 *       type: object
 *       properties:
 *         data:
 *           $ref: '#/components/schemas/CustomerNews'
 *
 *     CustomerNewsListResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CustomerNews'
 *         count:
 *           type: integer
 *           example: 25
 */
