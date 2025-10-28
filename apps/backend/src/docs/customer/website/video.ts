/**
 * @swagger
 * tags:
 *   - name: Video (Public)
 *     description: Public endpoints to fetch website videos (no authentication required)
 *
 * /video:
 *   get:
 *     summary: Fetch list of videos
 *     description: Returns all videos with translations and thumbnail. Intended for public/customer usage.
 *     tags:
 *       - Video (Public)
 *     responses:
 *       200:
 *         description: List of videos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VideoListResponse'
 *       500:
 *         description: Internal server error
 *
 * /video/{id}:
 *   get:
 *     summary: Fetch single video by ID
 *     description: Returns a single video with translations and thumbnail.
 *     tags:
 *       - Video (Public)
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
 *               $ref: '#/components/schemas/VideoResponse'
 *       400:
 *         description: Bad request (invalid id)
 *       404:
 *         description: Video not found
 *       500:
 *         description: Internal server error
 *
 * components:
 *   schemas:
 *     VideoTranslation:
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
 *     VideoThumbnail:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
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
 *     Video:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         link:
 *           type: string
 *           example: "https://www.youtube.com/watch?v=abc123"
 *         date:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         thumbnail:
 *           $ref: '#/components/schemas/VideoThumbnail'
 *         translations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/VideoTranslation'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     VideoListResponse:
 *       type: object
 *       properties:
 *         count:
 *           type: integer
 *           example: 4
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Video'
 *
 *     VideoResponse:
 *       type: object
 *       properties:
 *         data:
 *           $ref: '#/components/schemas/Video'
 */
