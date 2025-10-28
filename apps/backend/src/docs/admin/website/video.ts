/**
 * @swagger
 * tags:
 *   - name: Admin Video
 *     description: Endpoints to manage website videos in admin panel
 *
 * /admin/video:
 *   get:
 *     summary: Fetch list of videos
 *     description: Returns videos with translations, thumbnail and optional filters (thumbnail, search, pagination).
 *     tags:
 *       - Admin Video
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
 *           example: "interview"
 *         description: Search term to filter by translations and link
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *           example: "createdAt:desc"
 *         description: Order by field and direction
 *       - in: query
 *         name: thumbnail
 *         schema:
 *           type: boolean
 *         description: Filter by presence of thumbnail (true - has thumbnail, false - no thumbnail)
 *     responses:
 *       200:
 *         description: List of videos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminVideoListResponse'
 *       400:
 *         description: Bad request (invalid query)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *
 * /admin/video/{id}:
 *   get:
 *     summary: Fetch single video by ID
 *     tags:
 *       - Admin Video
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
 *         description: UUID of the video
 *     responses:
 *       200:
 *         description: Video found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminVideoResponse'
 *       404:
 *         description: Video not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *
 *   delete:
 *     summary: Delete a video
 *     tags:
 *       - Admin Video
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Video deleted successfully
 *       404:
 *         description: Video not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *
 *   post:
 *     summary: Create a new video
 *     tags:
 *       - Admin Video
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminVideoCreateRequest'
 *     responses:
 *       201:
 *         description: Video created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminVideoResponse'
 *       400:
 *         description: Validation failed (invalid body / date format)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *
 *   put:
 *     summary: Update a video
 *     tags:
 *       - Admin Video
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
 *             $ref: '#/components/schemas/AdminVideoUpdateRequest'
 *     responses:
 *       200:
 *         description: Video updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminVideoResponse'
 *       400:
 *         description: Validation failed
 *       404:
 *         description: Video not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *
 * components:
 *   schemas:
 *     AdminVideoTranslation:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Interview with CEO"
 *         language:
 *           type: object
 *           properties:
 *             code:
 *               type: string
 *               example: "en"
 *
 *     AdminVideoThumbnail:
 *       type: object
 *       properties:
 *         path:
 *           type: string
 *           example: "/uploads/thumbnail.png"
 *         name:
 *           type: string
 *           example: "thumbnail.png"
 *         size:
 *           type: integer
 *           example: 2048
 *
 *     AdminVideo:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         link:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         thumbnail:
 *           $ref: '#/components/schemas/AdminVideoThumbnail'
 *         translations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AdminVideoTranslation'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     AdminVideoListResponse:
 *       type: object
 *       properties:
 *         count:
 *           type: integer
 *           example: 10
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AdminVideo'
 *
 *     AdminVideoResponse:
 *       type: object
 *       properties:
 *         data:
 *           $ref: '#/components/schemas/AdminVideo'
 *
 *     AdminVideoCreateRequest:
 *       type: object
 *       required:
 *         - translations
 *         - link
 *       properties:
 *         translations:
 *           type: object
 *           description: "Map of language code -> translation object. Each translation must contain { name }"
 *           additionalProperties:
 *             $ref: '#/components/schemas/AdminVideoTranslation'
 *           example:
 *             en:
 *               name: "Interview with CEO"
 *             ka:
 *               name: "ინტერვიუ CEO-სთან"
 *         thumbnail:
 *           $ref: '#/components/schemas/AdminVideoThumbnail'
 *         link:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2023-07-01T12:00:00Z"
 *
 *     AdminVideoUpdateRequest:
 *       allOf:
 *         - $ref: '#/components/schemas/AdminVideoCreateRequest'
 */
