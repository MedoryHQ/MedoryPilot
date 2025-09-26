/**
 * @swagger
 * tags:
 *   - name: Admin Footer
 *     description: CRUD operations for site footer (admin)
 *
 * /admin/footer:
 *   get:
 *     summary: Get footer
 *     description: Returns the single footer record if exists (includes connected pages and socials).
 *     tags:
 *       - Admin Footer
 *     responses:
 *       200:
 *         description: Footer returned (may be null)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/FooterResponse'
 *       500:
 *         description: Internal server error
 *
 *   post:
 *     summary: Create footer
 *     description: Creates a footer. Only one footer is allowed — creating when one exists returns 400.
 *     tags:
 *       - Admin Footer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FooterCreate'
 *     responses:
 *       201:
 *         description: Footer created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/FooterResponse'
 *       400:
 *         description: Validation error or footer already exists
 *       500:
 *         description: Internal server error
 *
 * /admin/footer/{id}:
 *   put:
 *     summary: Update footer
 *     description: Update footer fields and relations (pages, socials). `id` must be a UUID.
 *     tags:
 *       - Admin Footer
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Footer id (UUID)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FooterUpdate'
 *     responses:
 *       200:
 *         description: Footer updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/FooterResponse'
 *       400:
 *         description: Validation error (e.g., invalid UUIDs in socials/pages)
 *       404:
 *         description: Footer not found
 *       500:
 *         description: Internal server error
 *
 *   delete:
 *     summary: Delete footer
 *     description: Deletes the footer by id. `id` must be a UUID.
 *     tags:
 *       - Admin Footer
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Footer id (UUID)
 *     responses:
 *       200:
 *         description: Footer deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid id
 *       404:
 *         description: Footer not found
 *       500:
 *         description: Internal server error
 *
 * components:
 *   schemas:
 *     FooterCreate:
 *       type: object
 *       properties:
 *         phone:
 *           type: string
 *           example: "+1 555 123 4567"
 *         email:
 *           type: string
 *           format: email
 *           example: "info@example.com"
 *         socials:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *           description: Array of social IDs to connect (UUIDs)
 *         pages:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *           description: Array of page component IDs to connect (UUIDs)
 *       required: []
 *
 *     FooterUpdate:
 *       type: object
 *       properties:
 *         phone:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         socials:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *         pages:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *
 *     FooterPageItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         slug:
 *           type: string
 *         footerOrder:
 *           type: integer
 *         translations:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               content:
 *                 type: string
 *               language:
 *                 type: object
 *                 properties:
 *                   code:
 *                     type: string
 *
 *     FooterSocialItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         url:
 *           type: string
 *         name:
 *           type: string
 *         icon:
 *           type: object
 *           nullable: true
 *           properties:
 *             id:
 *               type: string
 *             path:
 *               type: string
 *
 *     FooterResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         phone:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         pages:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/FooterPageItem'
 *         socials:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/FooterSocialItem'
 */
