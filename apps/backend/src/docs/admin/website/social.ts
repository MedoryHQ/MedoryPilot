/**
 * @swagger
 * tags:
 *   - name: Admin Social
 *     description: Endpoints to manage social links for the website
 *
 * /admin/social:
 *   get:
 *     summary: Fetch all socials
 *     description: Returns a list of all socials with icons and optional footer association.
 *     tags:
 *       - Admin Social
 *     responses:
 *       200:
 *         description: List of socials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminSocialListResponse'
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Create a new social
 *     description: Creates a social entry with URL, name, optional icon, and optional footer association.
 *     tags:
 *       - Admin Social
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminSocialCreate'
 *     responses:
 *       201:
 *         description: Social created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminSocialResponse'
 *       500:
 *         description: Internal server error
 *
 * /admin/social/{id}:
 *   get:
 *     summary: Fetch a single social
 *     tags:
 *       - Admin Social
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: UUID of the social
 *     responses:
 *       200:
 *         description: Social details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminSocialResponse'
 *       404:
 *         description: Social not found
 *   put:
 *     summary: Update a social
 *     tags:
 *       - Admin Social
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: UUID of the social
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminSocialUpdate'
 *     responses:
 *       200:
 *         description: Social updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminSocialResponse'
 *       404:
 *         description: Social not found
 *   delete:
 *     summary: Delete a social
 *     tags:
 *       - Admin Social
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: UUID of the social
 *     responses:
 *       200:
 *         description: Social deleted
 *       404:
 *         description: Social not found
 *
 * components:
 *   schemas:
 *     AdminSocialIcon:
 *       type: object
 *       properties:
 *         path:
 *           type: string
 *           example: "/uploads/icon.png"
 *         name:
 *           type: string
 *           example: "icon.png"
 *         size:
 *           type: integer
 *           example: 1024
 *
 *     AdminSocial:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "c56a4180-65aa-42ec-a945-5fd21dec0538"
 *         name:
 *           type: string
 *           example: "Facebook"
 *         url:
 *           type: string
 *           example: "https://facebook.com/yourpage"
 *         footerId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           example: "a12b3c45-6789-4def-9876-abcdef123456"
 *         icon:
 *           $ref: '#/components/schemas/AdminSocialIcon'
 *
 *     AdminSocialListResponse:
 *       type: object
 *       properties:
 *         count:
 *           type: integer
 *           example: 5
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AdminSocial'
 *
 *     AdminSocialResponse:
 *       type: object
 *       properties:
 *         data:
 *           $ref: '#/components/schemas/AdminSocial'
 *
 *     AdminSocialCreate:
 *       type: object
 *       required:
 *         - url
 *         - name
 *       properties:
 *         url:
 *           type: string
 *           example: "https://facebook.com/yourpage"
 *         name:
 *           type: string
 *           example: "Facebook"
 *         footerId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           example: "a12b3c45-6789-4def-9876-abcdef123456"
 *         icon:
 *           $ref: '#/components/schemas/AdminSocialIcon'
 *
 *     AdminSocialUpdate:
 *       allOf:
 *         - $ref: '#/components/schemas/AdminSocialCreate'
 */
