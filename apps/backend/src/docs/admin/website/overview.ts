/**
 * @swagger
 * tags:
 *   - name: Admin Overview
 *     description: Admin-only endpoint providing statistics of website entities
 *
 * /admin/overview:
 *   get:
 *     summary: Get overview statistics
 *     description: Returns counts of main entities in the system (headers, introduce, news, services, faqs, blogs, categories, contact, footer, socials, pages, tariffs).
 *     security:
 *       - cookieAuth: []
 *     tags:
 *       - Admin Overview
 *     responses:
 *       200:
 *         description: Overview statistics successfully returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminOverviewResponse'
 *       401:
 *         description: Unauthorized (admin verification required)
 *       500:
 *         description: Internal server error
 *
 * components:
 *   schemas:
 *     AdminOverviewResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: object
 *           properties:
 *             headers:
 *               type: integer
 *               example: 2
 *             introduce:
 *               type: integer
 *               example: 1
 *             newses:
 *               type: integer
 *               example: 15
 *             services:
 *               type: integer
 *               example: 6
 *             faqs:
 *               type: integer
 *               example: 10
 *             blogs:
 *               type: integer
 *               example: 7
 *             categories:
 *               type: integer
 *               example: 5
 *             contact:
 *               type: integer
 *               example: 1
 *             footer:
 *               type: integer
 *               example: 1
 *             socials:
 *               type: integer
 *               example: 8
 *             pages:
 *               type: integer
 *               example: 12
 *             tariffs:
 *               type: integer
 *               example: 20
 *             about:
 *               type: integer
 *               example: 1
 *             educations:
 *               type: integer
 *               example: 2
 *             experiences:
 *               type: integer
 *               example: 4
 *             videos:
 *               type: integer
 *               example: 11
 *
 * securitySchemes:
 *   cookieAuth:
 *     type: apiKey
 *     in: cookie
 *     name: admin_verify_stage
 */
