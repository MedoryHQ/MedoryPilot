/**
 * @swagger
 * tags:
 *   - name: Admin Blog
 *     description: Admin CRUD for blogs (translations, categories, background, metadata)
 *
 * /admin/blog:
 *   get:
 *     summary: List blogs (admin)
 *     tags:
 *       - Admin Blog
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
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *       - name: categories
 *         in: query
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *       - name: showIsLanding
 *         in: query
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Blog'
 *                 count:
 *                   type: integer
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         description: Server error
 *
 *   post:
 *     summary: Create blog
 *     tags:
 *       - Admin Blog
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBlogInput'
 *           example:
 *             slug: "my-first-blog"
 *             showInLanding: true
 *             translations:
 *               en:
 *                 title: "My first blog"
 *                 content: "English content"
 *               ka:
 *                 title: "Sample"
 *                 content: "Sample content"
 *             categories: []
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Blog'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         description: Server error
 *
 * /admin/blog/{slug}:
 *   get:
 *     summary: Get blog by slug
 *     tags:
 *       - Admin Blog
 *     parameters:
 *       - name: slug
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Blog'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         description: Not found
 *
 *   put:
 *     summary: Update blog by slug
 *     tags:
 *       - Admin Blog
 *     parameters:
 *       - name: slug
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBlogInput'
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Blog'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         description: Not found
 *
 *   delete:
 *     summary: Delete blog by slug
 *     tags:
 *       - Admin Blog
 *     parameters:
 *       - name: slug
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
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
 *         description: Not found
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
 *     Blog:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         slug:
 *           type: string
 *         showInLanding:
 *           type: boolean
 *         landingOrder:
 *           type: integer
 *         background:
 *           type: object
 *           nullable: true
 *           properties:
 *             id:
 *               type: string
 *             path:
 *               type: string
 *         categories:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *         translations:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *         metaTitle:
 *           type: string
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     CreateBlogInput:
 *       type: object
 *       required:
 *         - slug
 *         - showInLanding
 *         - translations
 *       properties:
 *         slug:
 *           type: string
 *         showInLanding:
 *           type: boolean
 *         landingOrder:
 *           type: integer
 *         background:
 *           type: object
 *           nullable: true
 *         translations:
 *           type: object
 *           additionalProperties:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *         categories:
 *           type: array
 *           items:
 *             type: string
 *
 *     UpdateBlogInput:
 *       allOf:
 *         - $ref: '#/components/schemas/CreateBlogInput'
 */
