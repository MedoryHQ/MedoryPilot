/**
 * @swagger
 * tags:
 *   - name: Blog (Customer)
 *     description: Public endpoints to list blogs and fetch a single blog by slug
 *
 * /blog:
 *   get:
 *     summary: List public blogs
 *     tags:
 *       - Blog (Customer)
 *     parameters:
 *       - name: skip
 *         in: query
 *         schema:
 *           type: integer
 *           example: 0
 *       - name: take
 *         in: query
 *         schema:
 *           type: integer
 *           example: 10
 *       - name: orderBy
 *         in: query
 *         schema:
 *           type: string
 *           example: createdAt
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *       - name: categories
 *         in: query
 *         description: Array of category UUIDs to filter by
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *       - name: showIsLanding
 *         in: query
 *         description: Filter for items shown on landing
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Array of blogs with pagination count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BlogSummary'
 *                 count:
 *                   type: integer
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         description: Internal server error
 *
 * /blog/{slug}:
 *   get:
 *     summary: Get a single blog by slug
 *     tags:
 *       - Blog (Customer)
 *     parameters:
 *       - name: slug
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: my-first-blog
 *     responses:
 *       200:
 *         description: Blog returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/BlogDetail'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         description: Blog not found
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
 *     CategoryTranslation:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         language:
 *           $ref: '#/components/schemas/LanguageCode'
 *
 *     CategorySummary:
 *       type: object
 *       properties:
 *         translations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CategoryTranslation'
 *
 *     BlogTranslationSummary:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         language:
 *           $ref: '#/components/schemas/LanguageCode'
 *
 *     Background:
 *       type: object
 *       nullable: true
 *       properties:
 *         id:
 *           type: string
 *         path:
 *           type: string
 *
 *     BlogSummary:
 *       type: object
 *       properties:
 *         slug:
 *           type: string
 *         showInLanding:
 *           type: boolean
 *         landingOrder:
 *           type: integer
 *           nullable: true
 *         metaTitle:
 *           type: string
 *           nullable: true
 *         metaDescription:
 *           type: string
 *           nullable: true
 *         metaKeywords:
 *           type: string
 *           nullable: true
 *         metaImage:
 *           type: string
 *           nullable: true
 *         stars:
 *           type: integer
 *         background:
 *           $ref: '#/components/schemas/Background'
 *         categories:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CategorySummary'
 *         translations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/BlogTranslationSummary'
 *
 *     BlogDetail:
 *       allOf:
 *         - $ref: '#/components/schemas/BlogSummary'
 *       description: Full blog detail returned to customers (same selected fields)
 */
