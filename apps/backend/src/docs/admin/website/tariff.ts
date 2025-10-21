/**
 * @swagger
 * tags:
 *   - name: Admin Tariff
 *     description: Endpoints to manage tariffs (admin). Tariffs support versioning: a single **isCurrent** tariff is active, older tariffs are kept as history and linked via `parentId`.
 *
 * /admin/tariff:
 *   get:
 *     summary: List tariffs
 *     description: |
 *       Returns a paginated list of tariffs. Use `type` to filter current (active) vs history entries. You can also filter by price range using `price[min]` and `price[max]`.
 *     tags:
 *       - Admin Tariff
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Page number (optional).
 *       - in: query
 *         name: take
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Items per page (optional).
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Text search applied to tariff fields (optional).
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Order direction for the `createdAt` (optional).
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [tariff, history]
 *         description: Filter by `tariff` (current active tariffs) or `history` (non-current tariffs). (optional)
 *       - in: query
 *         name: price[min]
 *         schema:
 *           type: number
 *         description: Minimum price filter (optional).
 *       - in: query
 *         name: price[max]
 *         schema:
 *           type: number
 *         description: Maximum price filter (optional).
 *     responses:
 *       200:
 *         description: Tariffs list returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminTariffListResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 *
 *   post:
 *     summary: Create a new tariff
 *     description: |
 *       Creates a new tariff and marks it as the current tariff. If an active tariff already exists it will be moved into history:
 *       - the previous active tariff's `isCurrent` will be set to `false`,
 *       - its `endDate` will be set,
 *       - its `parentId` will be set to the newly created tariff id,
 *       - children that referenced the previous active tariff will be updated to reference the newly created tariff.
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
 *               $ref: '#/components/schemas/AdminTariffResponseSingle'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 *
 * /admin/tariff/{id}:
 *   get:
 *     summary: Get a tariff by id
 *     description: Returns a single tariff. Response includes a `type` field: `"active"` if `isCurrent` is true, otherwise `"history"`.
 *     tags:
 *       - Admin Tariff
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Tariff UUID.
 *     responses:
 *       200:
 *         description: Tariff fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminTariffResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 *
 *   put:
 *     summary: Update tariff price
 *     description: Update the `price` of an existing tariff by id. Only `price` may be updated via this endpoint.
 *     tags:
 *       - Admin Tariff
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Tariff UUID to update.
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
 *               $ref: '#/components/schemas/AdminTariffResponseSingle'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 *
 *   delete:
 *     summary: Delete a tariff
 *     description: |
 *       Deletes a tariff by id. If the deleted tariff was the current tariff, the most recent child (by `createdAt`) will be promoted:
 *       - its `isCurrent` will be set to `true`,
 *       - its `parentId` will be cleared and `endDate` set to `null`.
 *     tags:
 *       - Admin Tariff
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Tariff UUID to delete.
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
 *                   example: "tariffDeleted"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 *
 * components:
 *   responses:
 *     ValidationError:
 *       description: Validation failed (request body or path params). Middleware validation errors return 400 with `errors` array.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               errors:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     msg:
 *                       type: string
 *                     param:
 *                       type: string
 *                     location:
 *                       type: string
 *
 *     Unauthorized:
 *       description: Authentication failed or missing tokens.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: string
 *                 example: "noTokenProvided"
 *
 *     NotFound:
 *       description: Resource not found
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: string
 *                 example: "tariffNotFound"
 *
 *     InternalError:
 *       description: Internal server error
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               errors:
 *                 type: array
 *                 items:
 *                   type: object
 *
 *   schemas:
 *     AdminTariff:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         price:
 *           type: number
 *           format: float
 *           example: 99.99
 *         fromDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         isCurrent:
 *           type: boolean
 *           example: true
 *         parentId:
 *           type: string
 *           format: uuid
 *           nullable: true
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
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AdminTariff'
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
 *
 *     AdminTariffResponseSingle:
 *       type: object
 *       properties:
 *         data:
 *           $ref: '#/components/schemas/AdminTariff'
 */
