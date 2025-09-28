/**
 * @swagger
 * tags:
 *   - name: Admin Page Components
 *     description: Endpoints for managing page components (create, update, fetch, delete)
 *
 * /admin/page-component:
 *   get:
 *     summary: Get all page components
 *     description: Returns a list of page components with translations and metadata
 *     security:
 *       - cookieAuth: []
 *     tags:
 *       - Admin Page Components
 *     responses:
 *       200:
 *         description: Successfully retrieved page components
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PageComponentListResponse'
 *       401:
 *         description: Unauthorized (admin verification required)
 *       500:
 *         description: Internal server error
 *
 *   post:
 *     summary: Create a new page component
 *     description: Creates a new page component with translations, optional footer, and metadata
 *     security:
 *       - cookieAuth: []
 *     tags:
 *       - Admin Page Components
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePageComponentDTO'
 *     responses:
 *       201:
 *         description: Page component created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PageComponentResponse'
 *       401:
 *         description: Unauthorized (admin verification required)
 *       500:
 *         description: Internal server error
 *
 * /admin/page-component/{slug}:
 *   get:
 *     summary: Get page component by slug
 *     description: Returns a single page component with translations
 *     security:
 *       - cookieAuth: []
 *     tags:
 *       - Admin Page Components
 *     parameters:
 *       - name: slug
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: "slug"
 *     responses:
 *       200:
 *         description: Successfully retrieved page component
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PageComponentResponse'
 *       401:
 *         description: Unauthorized (admin verification required)
 *       404:
 *         description: Page component not found
 *       500:
 *         description: Internal server error
 *
 *   put:
 *     summary: Update a page component by slug
 *     description: Updates a page component's translations, footer info, and metadata
 *     security:
 *       - cookieAuth: []
 *     tags:
 *       - Admin Page Components
 *     parameters:
 *       - name: slug
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: "slug"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePageComponentDTO'
 *     responses:
 *       200:
 *         description: Page component updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PageComponentResponse'
 *       401:
 *         description: Unauthorized (admin verification required)
 *       404:
 *         description: Page component not found
 *       500:
 *         description: Internal server error
 *
 *   delete:
 *     summary: Delete a page component by slug
 *     description: Deletes a page component from the database
 *     security:
 *       - cookieAuth: []
 *     tags:
 *       - Admin Page Components
 *     parameters:
 *       - name: slug
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: "slug"
 *     responses:
 *       200:
 *         description: Page component deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Page component deleted successfully"
 *       401:
 *         description: Unauthorized (admin verification required)
 *       404:
 *         description: Page component not found
 *       500:
 *         description: Internal server error
 *
 * components:
 *   schemas:
 *     PageComponentTranslation:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "name"
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
 *     PageComponentResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *               example: "123e4567-e89b-12d3-a456-426614174000"
 *             slug:
 *               type: string
 *               example: "slug"
 *             footerOrder:
 *               type: integer
 *               example: 1
 *             translations:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PageComponentTranslation'
 *             footerId:
 *               type: string
 *               format: uuid
 *               nullable: true
 *             metaTitle:
 *               type: string
 *               example: "metaTitle"
 *             metaDescription:
 *               type: string
 *               example: "metaDescription"
 *             metaKeywords:
 *               type: string
 *               example: "metaKeywords"
 *             metaImage:
 *               type: string
 *               example: "/images/about-meta.jpg"
 *
 *     PageComponentListResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PageComponentResponse'
 *         count:
 *           type: integer
 *           example: 5
 *
 *     CreatePageComponentDTO:
 *       type: object
 *       required:
 *         - slug
 *         - translations
 *       properties:
 *         slug:
 *           type: string
 *           example: "slug"
 *         footerId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         footerOrder:
 *           type: integer
 *         translations:
 *           type: object
 *           example:
 *             en:
 *               name: "name"
 *               content: "content"
 *             ka:
 *               name: "სახელი"
 *               content: "კონტენტი"
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
 *           example: "/images/about-meta.jpg"
 *
 *     UpdatePageComponentDTO:
 *       allOf:
 *         - $ref: '#/components/schemas/CreatePageComponentDTO'
 */
