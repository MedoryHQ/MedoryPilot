/**
 * @swagger
 * tags:
 *   - name: Customer Service
 *     description: Endpoints for customers to view services on the website
 *
 * /customer/service:
 *   get:
 *     summary: Fetch list of services
 *     description: Returns all services with translations, icons, and backgrounds.
 *     tags:
 *       - Customer Service
 *     parameters:
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           example: 0
 *         description: Number of items to skip (pagination)
 *       - in: query
 *         name: take
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Number of items to return (pagination)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           example: "consulting"
 *         description: Search term to filter services by title or description
 *     responses:
 *       200:
 *         description: List of services with translations
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomerServiceListResponse'
 *       500:
 *         description: Internal server error
 *
 * components:
 *   schemas:
 *     CustomerServiceTranslation:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: "title"
 *         description:
 *           type: string
 *           example: "description"
 *         language:
 *           type: object
 *           properties:
 *             code:
 *               type: string
 *               example: "en"
 *
 *     CustomerServiceIconOrBackground:
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
 *           example: 2048
 *
 *     CustomerService:
 *       type: object
 *       properties:
 *         icon:
 *           $ref: '#/components/schemas/CustomerServiceIconOrBackground'
 *         background:
 *           $ref: '#/components/schemas/CustomerServiceIconOrBackground'
 *         translations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CustomerServiceTranslation'
 *
 *     CustomerServiceListResponse:
 *       type: object
 *       properties:
 *         count:
 *           type: integer
 *           example: 10
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CustomerService'
 */
