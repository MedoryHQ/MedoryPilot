/**
 * @swagger
 * tags:
 *   - name: Admin Education
 *     description: Endpoints to manage website educations in admin panel
 *
 * /admin/education:
 *   get:
 *     summary: Fetch list of educations
 *     description: Returns educations with translations, icon and optional filters (icon, link, fromDate, endDate, search, pagination).
 *     tags:
 *       - Admin Education
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
 *           example: "computer science"
 *         description: Search term to filter by translations and link
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
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date-time
 *           example: "2020-09-01T00:00:00Z"
 *         description: Filter educations with fromDate >= this ISO8601 date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *           example: "2022-06-01T00:00:00Z"
 *         description: Filter educations with endDate <= this ISO8601 date-time
 *     responses:
 *       200:
 *         description: List of educations
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminEducationListResponse'
 *       400:
 *         description: Bad request (invalid query / date format)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *
 * /admin/education/{id}:
 *   get:
 *     summary: Fetch single education by ID
 *     tags:
 *       - Admin Education
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
 *         description: UUID of the education
 *     responses:
 *       200:
 *         description: Education found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminEducationResponse'
 *       404:
 *         description: Education not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *
 *   delete:
 *     summary: Delete an education
 *     tags:
 *       - Admin Education
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Education deleted successfully
 *       404:
 *         description: Education not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *
 *   post:
 *     summary: Create a new education
 *     tags:
 *       - Admin Education
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminEducationCreateRequest'
 *     responses:
 *       201:
 *         description: Education created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminEducationResponse'
 *       400:
 *         description: Validation failed (invalid body / date formats)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *
 *   put:
 *     summary: Update an education
 *     tags:
 *       - Admin Education
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
 *             $ref: '#/components/schemas/AdminEducationUpdateRequest'
 *     responses:
 *       200:
 *         description: Education updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminEducationResponse'
 *       400:
 *         description: Validation failed
 *       404:
 *         description: Education not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *
 * components:
 *   schemas:
 *     AdminEducationTranslation:
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
 *     AdminEducationIcon:
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
 *     AdminEducation:
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
 *           $ref: '#/components/schemas/AdminEducationIcon'
 *         translations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AdminEducationTranslation'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     AdminEducationListResponse:
 *       type: object
 *       properties:
 *         count:
 *           type: integer
 *           example: 10
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AdminEducation'
 *
 *     AdminEducationResponse:
 *       type: object
 *       properties:
 *         data:
 *           $ref: '#/components/schemas/AdminEducation'
 *
 *     AdminEducationCreateRequest:
 *       type: object
 *       required:
 *         - translations
 *         - fromDate
 *       properties:
 *         translations:
 *           type: object
 *           description: "Map of language code -> translation object. Each translation must contain { name, degree, description }"
 *           additionalProperties:
 *             $ref: '#/components/schemas/AdminEducationTranslation'
 *           example:
 *             en:
 *               name: "Tbilisi State University"
 *               degree: "Bachelor of Science"
 *               description: "Department of Computer Science"
 *             ka:
 *               name: "თბილისის სახელმწიფო უნივერსიტეტი"
 *               degree: "ბაკალავრი"
 *               description: "ინფორმატიკის დეპარტამენტი"
 *         icon:
 *           $ref: '#/components/schemas/AdminEducationIcon'
 *         link:
 *           type: string
 *         fromDate:
 *           type: string
 *           format: date-time
 *           example: "2018-09-01T00:00:00Z"
 *         endDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2022-06-01T00:00:00Z"
 *
 *     AdminEducationUpdateRequest:
 *       allOf:
 *         - $ref: '#/components/schemas/AdminEducationCreateRequest'
 */
