/**
 * @swagger
 * tags:
 *   - name: Admin Tariff
 *     description: Endpoints to manage tariffs (admin)
 *
 * /admin/tariff:
 *   get:
 *     summary: Fetch current tariff and total count
 *     description: Returns the current active tariff and the total count including history.
 *     tags:
 *       - Admin Tariff
 *     responses:
 *       200:
 *         description: Current tariff and count
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminTariffListResponse'
 *       500:
 *         description: Internal server error
 *
 *   post:
 *     summary: Create a new tariff
 *     description: Creates a new tariff. Moves existing active tariff to history.
 *     tags:
 *       - Admin Tariff
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTariffDTO'
 *     responses:
 *       201:
 *         description: Tariff created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminTariff'
 *       500:
 *         description: Internal server error
 *
 * /admin/tariff/{id}:
 *   get:
 *     summary: Fetch a specific tariff
 *     description: Fetches a tariff by ID, either active or history.
 *     tags:
 *       - Admin Tariff
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: body
 *         name: type
 *         schema:
 *           type: string
 *           enum: [active, history]
 *         required: true
 *     responses:
 *       200:
 *         description: Tariff fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminTariffResponse'
 *       404:
 *         description: Tariff not found
 *       500:
 *         description: Internal server error
 *
 *   put:
 *     summary: Update a tariff
 *     description: Updates the price of an existing tariff by ID.
 *     tags:
 *       - Admin Tariff
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
 *             $ref: '#/components/schemas/UpdateTariffDTO'
 *     responses:
 *       200:
 *         description: Tariff updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminTariff'
 *       404:
 *         description: Tariff not found
 *       500:
 *         description: Internal server error
 *
 *   delete:
 *     summary: Delete a tariff
 *     description: Deletes a tariff by ID, either active or history.
 *     tags:
 *       - Admin Tariff
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
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [active, history]
 *                 example: active
 *     responses:
 *       200:
 *         description: Tariff deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tariff deleted successfully"
 *       404:
 *         description: Tariff not found
 *       500:
 *         description: Internal server error
 *
 * components:
 *   schemas:
 *     AdminTariff:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         price:
 *           type: number
 *           example: 99.99
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreateTariffDTO:
 *       type: object
 *       required:
 *         - price
 *       properties:
 *         price:
 *           type: number
 *           example: 99.99
 *
 *     UpdateTariffDTO:
 *       type: object
 *       required:
 *         - price
 *       properties:
 *         price:
 *           type: number
 *           example: 119.99
 *
 *     AdminTariffListResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: object
 *           properties:
 *             currentTariff:
 *               $ref: '#/components/schemas/AdminTariff'
 *         count:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *               example: 5
 *
 *     AdminTariffResponse:
 *       type: object
 *       properties:
 *         data:
 *           $ref: '#/components/schemas/AdminTariff'
 *         type:
 *           type: string
 *           enum: [active, history]
 */
