/**
 * @swagger
 * tags:
 *   - name: Education (Public)
 *     description: Public endpoints to fetch website educations (no authentication required)
 *
 * /education:
 *   get:
 *     summary: Fetch list of educations
 *     description: Returns all educations with translations and icon. Intended for public/customer usage.
 *     tags:
 *       - Education (Public)
 *     responses:
 *       200:
 *         description: List of educations
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EducationListResponse'
 *       500:
 *         description: Internal server error
 *
 * components:
 *   schemas:
 *     EducationTranslation:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Tbilisi State University"
 *         degree:
 *           type: string
 *           example: "Bachelor of Science"
 *         description:
 *           type: string
 *           example: "Department of Computer Science"
 *         language:
 *           type: object
 *           properties:
 *             code:
 *               type: string
 *               example: "en"
 *
 *     EducationIcon:
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
 *     Education:
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
 *         link:
 *           type: string
 *           nullable: true
 *         icon:
 *           $ref: '#/components/schemas/EducationIcon'
 *         translations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/EducationTranslation'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     EducationListResponse:
 *       type: object
 *       properties:
 *         count:
 *           type: integer
 *           example: 3
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Education'
 *
 *     EducationResponse:
 *       type: object
 *       properties:
 *         data:
 *           $ref: '#/components/schemas/Education'
 */
