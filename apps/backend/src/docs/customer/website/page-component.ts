/**
 * @swagger
 * tags:
 *   - name: Customer PageComponent
 *     description: Public endpoints to fetch website page components
 *
 * /page-component:
 *   get:
 *     summary: Get list of page components
 *     description: Returns a list of website page components with translations.
 *     tags:
 *       - Customer PageComponent
 *     parameters:
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           example: 0
 *         description: Number of items to skip
 *       - in: query
 *         name: take
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Number of items to return
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           example: "name"
 *         description: Search term to filter results
 *     responses:
 *       200:
 *         description: List of page components
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomerPageComponentListResponse'
 *       500:
 *         description: Internal server error
 *
 * /page-component/{slug}:
 *   get:
 *     summary: Get single page component by slug
 *     description: Returns a single page component with translations.
 *     tags:
 *       - Customer PageComponent
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *           example: "slug"
 *         description: Slug of the page component
 *     responses:
 *       200:
 *         description: Page component found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomerPageComponentResponse'
 *       404:
 *         description: Page component not found
 *       500:
 *         description: Internal server error
 *
 * components:
 *   schemas:
 *     CustomerPageComponentTranslation:
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
 *     CustomerPageComponent:
 *       type: object
 *       properties:
 *         slug:
 *           type: string
 *           example: "slug"
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
 *           example: "/uploads/about.png"
 *         footerOrder:
 *           type: integer
 *           example: 1
 *         translations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CustomerPageComponentTranslation'
 *
 *     CustomerPageComponentListResponse:
 *       type: object
 *       properties:
 *         count:
 *           type: integer
 *           example: 25
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CustomerPageComponent'
 *
 *     CustomerPageComponentResponse:
 *       type: object
 *       properties:
 *         data:
 *           $ref: '#/components/schemas/CustomerPageComponent'
 */
