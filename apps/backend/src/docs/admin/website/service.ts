/**
 * @swagger
 * tags:
 *   - name: Admin Service
 *     description: Endpoints to manage website services in admin panel
 *
 * /admin/service:
 *   get:
 *     summary: Fetch list of services
 *     description: Returns all services with translations, amd icons.
 *     tags:
 *       - Admin Service
 *     parameters:
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           example: 0
 *         description: Number of items to skip
 *       - in: query
 *         name: take
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Number of items to return
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           example: "consulting"
 *         description: Search term to filter services
 *     responses:
 *       200:
 *         description: List of services
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminServiceListResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *
 * /admin/service/{id}:
 *   get:
 *     summary: Fetch single service by ID
 *     tags:
 *       - Admin Service
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
 *         description: UUID of the service
 *     responses:
 *       200:
 *         description: Service found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminServiceResponse'
 *       404:
 *         description: Service not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *
 *   post:
 *     summary: Create a new service
 *     tags:
 *       - Admin Service
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminServiceCreateRequest'
 *     responses:
 *       201:
 *         description: Service created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminServiceResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *
 *   put:
 *     summary: Update a service
 *     tags:
 *       - Admin Service
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminServiceUpdateRequest'
 *     responses:
 *       200:
 *         description: Service updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminServiceResponse'
 *       404:
 *         description: Service not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *
 *   delete:
 *     summary: Delete a service
 *     tags:
 *       - Admin Service
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Service deleted successfully
 *       404:
 *         description: Service not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *
 * components:
 *   schemas:
 *     AdminServiceTranslation:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: "title"
 *         description:
 *           type: string
 *           example: "services"
 *         language:
 *           type: object
 *           properties:
 *             code:
 *               type: string
 *               example: "en"
 *
 *     AdminServiceIcon:
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
 *     AdminService:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         translations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AdminServiceTranslation'
 *         icon:
 *           $ref: '#/components/schemas/AdminServiceIcon'
 *
 *     AdminServiceListResponse:
 *       type: object
 *       properties:
 *         count:
 *           type: integer
 *           example: 10
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AdminService'
 *
 *     AdminServiceResponse:
 *       type: object
 *       properties:
 *         data:
 *           $ref: '#/components/schemas/AdminService'
 *
 *     AdminServiceCreateRequest:
 *       type: object
 *       properties:
 *         translations:
 *           type: object
 *           additionalProperties:
 *             $ref: '#/components/schemas/AdminServiceTranslation'
 *         icon:
 *           $ref: '#/components/schemas/AdminServiceIcon'
 *
 *     AdminServiceUpdateRequest:
 *       allOf:
 *         - $ref: '#/components/schemas/AdminServiceCreateRequest'
 */
