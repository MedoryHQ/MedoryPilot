/**
 * @swagger
 * tags:
 *   - name: Admin Hero
 *     description: Admin endpoints to manage site hero (create, read, update, delete)
 *   - name: Customer Hero
 *     description: Public endpoint to read current site hero
 *
 * /admin/hero:
 *   get:
 *     summary: List heros (admin)
 *     description: Returns a paginated list of heros (includes logo and translations). Requires admin authentication (cookie-based).
 *     tags:
 *       - Admin Hero
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
 *         description: Heros list returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/HeroItem'
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
 *     summary: Create hero
 *     description: Creates a new hero with translations and optional logo. If `active` is true and another hero is already active the request will fail (validation prevents multiple active heros).
 *     tags:
 *       - Admin Hero
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateHeroRequest'
 *     responses:
 *       201:
 *         description: Hero created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HeroResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 *
 * /admin/hero/{id}:
 *   get:
 *     summary: Get single hero (admin)
 *     description: Fetch a hero by UUID. Requires admin authentication.
 *     tags:
 *       - Admin Hero
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Hero UUID
 *     responses:
 *       200:
 *         description: Hero returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HeroResponse'
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
 *     summary: Update hero
 *     description: Update hero translations, logo and `active` flag by UUID. If you set `active` to true and another hero is active the request will be rejected by validation.
 *     tags:
 *       - Admin Hero
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Hero UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateHeroRequest'
 *     responses:
 *       200:
 *         description: Hero updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HeroResponse'
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
 *     summary: Delete hero
 *     description: Deletes a hero by UUID.
 *     tags:
 *       - Admin Hero
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Hero UUID
 *     responses:
 *       200:
 *         description: Hero deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "heroDeleted"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 *
 * /hero:
 *   get:
 *     summary: Get public hero
 *     description: Public endpoint that returns the current hero data (logo, translations and active flag) for the website. No authentication required.
 *     tags:
 *       - Customer Hero
 *     responses:
 *       200:
 *         description: Hero returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HeroResponse'
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
 *                 example: "heroNotFound"
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
 *     HeroTranslationItem:
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
 *     HeroItem:
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
 *             $ref: '#/components/schemas/HeroTranslationItem'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     HeroResponse:
 *       type: object
 *       properties:
 *         data:
 *           $ref: '#/components/schemas/HeroItem'
 *
 *     CreateHeroRequest:
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
 *     UpdateHeroRequest:
 *       allOf:
 *         - $ref: '#/components/schemas/CreateHeroRequest'
 */
