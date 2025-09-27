/**
 * @swagger
 * tags:
 *   - name: Admin News
 *     description: Admin endpoints to manage website news
 *
 * /admin/news:
 *   get:
 *     summary: Get all news
 *     description: Returns a list of news with pagination, filters, and optional search.
 *     tags:
 *       - Admin News
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
 *               $ref: '#/components/schemas/AdminNewsListResponse'
 *       500:
 *         description: Internal server error
 *
 *   post:
 *     summary: Create a news
 *     description: Creates a new news item with translations and optional background.
 *     tags:
 *       - Admin News
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminNewsCreateRequest'
 *     responses:
 *       201:
 *         description: News created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminNewsResponse'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 *
 * /admin/news/{slug}:
 *   get:
 *     summary: Get a single news
 *     description: Fetch a single news item by slug.
 *     tags:
 *       - Admin News
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
 *               $ref: '#/components/schemas/AdminNewsResponse'
 *       404:
 *         description: News not found
 *       500:
 *         description: Internal server error
 *
 *   put:
 *     summary: Update a news
 *     description: Updates an existing news item by slug, replacing translations and optional background.
 *     tags:
 *       - Admin News
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *           example: "slug"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminNewsUpdateRequest'
 *     responses:
 *       200:
 *         description: News updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminNewsResponse'
 *       404:
 *         description: News not found
 *       500:
 *         description: Internal server error
 *
 *   delete:
 *     summary: Delete a news
 *     description: Deletes a news item by slug.
 *     tags:
 *       - Admin News
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *           example: "slug"
 *     responses:
 *       200:
 *         description: News deleted successfully
 *       404:
 *         description: News not found
 *       500:
 *         description: Internal server error
 *
 * components:
 *   schemas:
 *     AdminNewsBackground:
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
 *     AdminNewsTranslation:
 *       type: object
 *       properties:
 *         content:
 *           type: string
 *           example: "content"
 *         language:
 *           type: object
 *           properties:
 *             code:
 *               type: string
 *               example: "en"
 *
 *     AdminNews:
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
 *           $ref: '#/components/schemas/AdminNewsBackground'
 *         translations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AdminNewsTranslation'
 *
 *     AdminNewsCreateRequest:
 *       type: object
 *       required:
 *         - slug
 *         - translations
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
 *           $ref: '#/components/schemas/AdminNewsBackground'
 *         translations:
 *           type: object
 *           description: Key-value translations with language codes
 *           example:
 *             en:
 *               content: "description"
 *             ka:
 *               content: "აღწერა"
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
 *
 *     AdminNewsUpdateRequest:
 *       allOf:
 *         - $ref: '#/components/schemas/AdminNewsCreateRequest'
 *
 *     AdminNewsResponse:
 *       type: object
 *       properties:
 *         data:
 *           $ref: '#/components/schemas/AdminNews'
 *
 *     AdminNewsListResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AdminNews'
 *         count:
 *           type: integer
 *           example: 25
 */
