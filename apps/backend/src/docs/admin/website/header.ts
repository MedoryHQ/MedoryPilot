/**
 * @swagger
 * tags:
 *   - name: Admin Header
 *     description: Admin endpoints to manage site header (create, read, update, delete)
 *   - name: Customer Header
 *     description: Public endpoint to read current site header
 *
 * /admin/header:
 *   get:
 *     summary: List headers (admin)
 *     description: Returns a paginated list of headers (includes logo and translations). Requires admin authentication (cookie-based).
 *     tags:
 *       - Admin Header
 *     security:
 *       - cookieAuth: []
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
 *         description: Text search applied to translations (optional)
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *         description: Ordering (e.g. "asc" or "desc") (optional)
 *     responses:
 *       200:
 *         description: Headers list returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/HeaderItem'
 *                 count:
 *                   type: integer
 *                   example: 1
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 *
 *   post:
 *     summary: Create header
 *     description: Creates a new header with translations and optional logo. If `active` is true and another header is already active the request will fail (validation prevents multiple active headers).
 *     tags:
 *       - Admin Header
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateHeaderRequest'
 *     responses:
 *       201:
 *         description: Header created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HeaderResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 *
 * /admin/header/{id}:
 *   get:
 *     summary: Get single header (admin)
 *     description: Fetch a header by UUID. Requires admin authentication.
 *     tags:
 *       - Admin Header
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Header UUID
 *     responses:
 *       200:
 *         description: Header returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HeaderResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 *
 *   put:
 *     summary: Update header
 *     description: Update header translations, logo and `active` flag by UUID. If you set `active` to true and another header is active the request will be rejected by validation.
 *     tags:
 *       - Admin Header
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Header UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateHeaderRequest'
 *     responses:
 *       200:
 *         description: Header updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HeaderResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 *
 *   delete:
 *     summary: Delete header
 *     description: Deletes a header by UUID.
 *     tags:
 *       - Admin Header
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Header UUID
 *     responses:
 *       200:
 *         description: Header deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "headerDeleted"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 *
 * /header:
 *   get:
 *     summary: Get public header
 *     description: Public endpoint that returns the current header data (logo, translations and active flag) for the website. No authentication required.
 *     tags:
 *       - Customer Header
 *     responses:
 *       200:
 *         description: Header returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HeaderResponse'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 *
 * components:
 *   responses:
 *     ValidationError:
 *       description: Validation failed (request body or params). Middleware validation errors return 400 with `errors` array.
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
 *     Unauthorized:
 *       description: Authentication failed or missing tokens/cookies.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: string
 *                 example: "noTokenProvided"
 *
 *     NotFound:
 *       description: Resource not found
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: string
 *                 example: "headerNotFound"
 *
 *     InternalError:
 *       description: Internal server error
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               errors:
 *                 type: array
 *                 items:
 *                   type: object
 *
 *   schemas:
 *     LogoObject:
 *       type: object
 *       nullable: true
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "22222222-2222-2222-2222-222222222222"
 *         path:
 *           type: string
 *           example: "/uploads/logo.png"
 *         name:
 *           type: string
 *           example: "logo.png"
 *         size:
 *           type: integer
 *           example: 12345
 *
 *     HeaderTranslationItem:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "John"
 *         position:
 *           type: string
 *           example: "CEO"
 *         headline:
 *           type: string
 *           example: "Leader"
 *         description:
 *           type: string
 *           example: "Short description"
 *         language:
 *           type: object
 *           properties:
 *             code:
 *               type: string
 *               example: "en"
 *
 *     HeaderItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         active:
 *           type: boolean
 *         logo:
 *           $ref: '#/components/schemas/LogoObject'
 *         translations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/HeaderTranslationItem'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     HeaderResponse:
 *       type: object
 *       properties:
 *         data:
 *           $ref: '#/components/schemas/HeaderItem'
 *
 *     CreateHeaderRequest:
 *       type: object
 *       required:
 *         - translations
 *       properties:
 *         active:
 *           type: boolean
 *           example: true
 *         logo:
 *           $ref: '#/components/schemas/LogoObject'
 *         translations:
 *           type: object
 *           description: Map of language code to translation object. Each translation must contain `name`, `position`, `headline`, and `description`.
 *           example:
 *             en:
 *               name: "John"
 *               position: "CEO"
 *               headline: "Leader"
 *               description: "Short description"
 *             ka:
 *               name: "ჯონი"
 *               position: "დირექტორი"
 *               headline: "ლიდერი"
 *               description: "საკონს"
 *
 *     UpdateHeaderRequest:
 *       allOf:
 *         - $ref: '#/components/schemas/CreateHeaderRequest'
 */
