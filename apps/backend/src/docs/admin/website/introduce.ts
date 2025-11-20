/**
 * @swagger
 * tags:
 *   - name: Admin Introduce
 *     description: Manage website "Introduce" section (video, thumbnail, headline and description with translations).
 *
 * /admin/introduce:
 *   get:
 *     summary: Fetch introduce
 *     description: Get the first introduce entry with translations, thumbnail, and video.
 *     tags:
 *       - Admin Introduce
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Introduce found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminIntroduceResponse'
 *       404:
 *         description: Introduce not found
 *       401:
 *         description: Unauthorized
 *
 *   post:
 *     summary: Create introduce
 *     description: Create a new introduce entry with translations, thumbnail, and video.
 *     tags:
 *       - Admin Introduce
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateIntroduceInput'
 *     responses:
 *       201:
 *         description: Introduce created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminIntroduceResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *
 * /admin/introduce/{id}:
 *   delete:
 *     summary: Delete introduce
 *     description: Remove an introduce entry by ID.
 *     tags:
 *       - Admin Introduce
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Introduce ID
 *     responses:
 *       200:
 *         description: Introduce deleted
 *       404:
 *         description: Introduce not found
 *       401:
 *         description: Unauthorized
 *
 *   put:
 *     summary: Update introduce
 *     description: Update an introduce entry and replace translations, thumbnail, and video.
 *     tags:
 *       - Admin Introduce
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Introduce ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateIntroduceInput'
 *     responses:
 *       200:
 *         description: Introduce updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminIntroduceResponse'
 *       404:
 *         description: Introduce not found
 *       401:
 *         description: Unauthorized
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
 *     IntroduceTranslation:
 *       type: object
 *       properties:
 *         headline:
 *           type: string
 *           example: "headline"
 *         description:
 *           type: string
 *           example: "Description"
 *         language:
 *           type: object
 *           properties:
 *             code:
 *               type: string
 *               example: "en"
 *
 *     CreateIntroduceInput:
 *       type: object
 *       properties:
 *         translations:
 *           type: object
 *           description: Translations for multiple languages
 *           example:
 *             en:
 *               headline: "description"
 *               description: "Welcome."
 *             ka:
 *               headline: "სათაური"
 *               description: "აღწერა."
 *         thumbnail:
 *           $ref: '#/components/schemas/File'
 *         video:
 *           $ref: '#/components/schemas/File'
 *
 *     UpdateIntroduceInput:
 *       allOf:
 *         - $ref: '#/components/schemas/CreateIntroduceInput'
 *
 *     AdminIntroduceResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               example: "11111111-1111-1111-1111-111111111111"
 *             translations:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/IntroduceTranslation'
 *             thumbnail:
 *               $ref: '#/components/schemas/File'
 *             video:
 *               $ref: '#/components/schemas/File'
 */
