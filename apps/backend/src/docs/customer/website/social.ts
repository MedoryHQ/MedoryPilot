/**
 * @swagger
 * tags:
 *   - name: Customer Social
 *     description: Endpoints to fetch social links for the website (public)
 *
 * /customer/social:
 *   get:
 *     summary: Fetch all socials
 *     description: Returns a list of all social links with icons. Public endpoint.
 *     tags:
 *       - Customer Social
 *     parameters:
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of items to skip for pagination
 *       - in: query
 *         name: take
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items to take for pagination
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *           example: "createdAt:desc"
 *         description: Sorting option
 *     responses:
 *       200:
 *         description: List of socials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomerSocialListResponse'
 *       500:
 *         description: Internal server error
 *
 * components:
 *   schemas:
 *     CustomerSocialIcon:
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
 *     CustomerSocial:
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
 *         icon:
 *           $ref: '#/components/schemas/CustomerSocialIcon'
 *
 *     CustomerSocialListResponse:
 *       type: object
 *       properties:
 *         count:
 *           type: integer
 *           example: 5
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CustomerSocial'
 */
