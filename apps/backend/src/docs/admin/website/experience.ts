/**
 * @swagger
 * tags:
 *   - name: Admin Experience
 *     description: Endpoints to manage website experiences in admin panel
 *
 * /admin/experience:
 *   get:
 *     summary: Fetch list of experiences
 *     description: Returns experiences with translations, icon and optional filters (icon, link, location, fromDate, endDate, search, pagination).
 *     tags:
 *       - Admin Experience
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
 *           example: "frontend"
 *         description: Search term to filter by translations, location and link
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *           example: "createdAt:desc"
 *         description: Order by field and direction
 *       - in: query
 *         name: icon
 *         schema:
 *           type: boolean
 *         description: Filter by presence of icon (true - has icon, false - no icon)
 *       - in: query
 *         name: link
 *         schema:
 *           type: boolean
 *         description: Filter by presence of link (true - has link, false - no link)
 *       - in: query
 *         name: location
 *         schema:
 *           type: boolean
 *         description: Filter by presence of location (true - has location, false - no location)
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date-time
 *           example: "2019-03-01T00:00:00Z"
 *         description: Filter experiences with fromDate >= this ISO8601 date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *           example: "2021-12-31T00:00:00Z"
 *         description: Filter experiences with endDate <= this ISO8601 date-time
 *     responses:
 *       200:
 *         description: List of experiences
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminExperienceListResponse'
 *       400:
 *         description: Bad request (invalid query / date format)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *
 * /admin/experience/{id}:
 *   get:
 *     summary: Fetch single experience by ID
 *     tags:
 *       - Admin Experience
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
 *         description: UUID of the experience
 *     responses:
 *       200:
 *         description: Experience found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminExperienceResponse'
 *       404:
 *         description: Experience not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *
 *   delete:
 *     summary: Delete an experience
 *     tags:
 *       - Admin Experience
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Experience deleted successfully
 *       404:
 *         description: Experience not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *
 *   post:
 *     summary: Create a new experience
 *     tags:
 *       - Admin Experience
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminExperienceCreateRequest'
 *     responses:
 *       201:
 *         description: Experience created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminExperienceResponse'
 *       400:
 *         description: Validation failed (invalid body / date formats)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *
 *   put:
 *     summary: Update an experience
 *     tags:
 *       - Admin Experience
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
 *             $ref: '#/components/schemas/AdminExperienceUpdateRequest'
 *     responses:
 *       200:
 *         description: Experience updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminExperienceResponse'
 *       400:
 *         description: Validation failed
 *       404:
 *         description: Experience not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *
 * components:
 *   schemas:
 *     AdminExperienceTranslation:
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
 *     AdminExperienceIcon:
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
 *     AdminExperience:
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
 *           $ref: '#/components/schemas/AdminExperienceIcon'
 *         translations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AdminExperienceTranslation'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     AdminExperienceListResponse:
 *       type: object
 *       properties:
 *         count:
 *           type: integer
 *           example: 10
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AdminExperience'
 *
 *     AdminExperienceResponse:
 *       type: object
 *       properties:
 *         data:
 *           $ref: '#/components/schemas/AdminExperience'
 *
 *     AdminExperienceCreateRequest:
 *       type: object
 *       required:
 *         - translations
 *         - fromDate
 *       properties:
 *         translations:
 *           type: object
 *           description: "Map of language code -> translation object. Each translation must contain { name, position, description }"
 *           additionalProperties:
 *             $ref: '#/components/schemas/AdminExperienceTranslation'
 *           example:
 *             en:
 *               name: "ACME Corp"
 *               position: "Frontend Developer"
 *               description: "Built customer-facing React apps"
 *             ka:
 *               name: "ACME კორპ"
 *               position: "ფრონტენდ დეველოპერი"
 *               description: "მომხმარებლის აპლიკაციების განვითარების გამოცდილება"
 *         icon:
 *           $ref: '#/components/schemas/AdminExperienceIcon'
 *         link:
 *           type: string
 *         location:
 *           type: string
 *         fromDate:
 *           type: string
 *           format: date-time
 *           example: "2019-03-01T00:00:00Z"
 *         endDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2021-12-31T00:00:00Z"
 *
 *     AdminExperienceUpdateRequest:
 *       allOf:
 *         - $ref: '#/components/schemas/AdminExperienceCreateRequest'
 */
