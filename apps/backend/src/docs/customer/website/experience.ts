/**
 * @swagger
 * tags:
 *   - name: Experience (Public)
 *     description: Public endpoints to fetch website experiences (no authentication required)
 *
 * /experience:
 *   get:
 *     summary: Fetch list of experiences
 *     description: Returns all experiences with translations and icon. Intended for public/customer usage.
 *     tags:
 *       - Experience (Public)
 *     responses:
 *       200:
 *         description: List of experiences
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExperienceListResponse'
 *       500:
 *         description: Internal server error
 *
 * components:
 *   schemas:
 *     ExperienceTranslation:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "ACME Corp"
 *         position:
 *           type: string
 *           example: "Frontend Developer"
 *         description:
 *           type: string
 *           example: "Built customer-facing React apps"
 *         language:
 *           type: object
 *           properties:
 *             code:
 *               type: string
 *               example: "en"
 *
 *     ExperienceIcon:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         path:
 *           type: string
 *           example: "/uploads/icon.png"
 *         name:
 *           type: string
 *           example: "icon.png"
 *         size:
 *           type: integer
 *           example: 2048
 *
 *     Experience:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         fromDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         location:
 *           type: string
 *           nullable: true
 *         link:
 *           type: string
 *           nullable: true
 *         icon:
 *           $ref: '#/components/schemas/ExperienceIcon'
 *         translations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ExperienceTranslation'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     ExperienceListResponse:
 *       type: object
 *       properties:
 *         count:
 *           type: integer
 *           example: 5
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Experience'
 *
 *     ExperienceResponse:
 *       type: object
 *       properties:
 *         data:
 *           $ref: '#/components/schemas/Experience'
 */
