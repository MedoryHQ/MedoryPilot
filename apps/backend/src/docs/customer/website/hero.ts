/**
 * @swagger
 * tags:
 *   - name: Customer Hero
 *     description: Public endpoint to fetch the active website hero
 *
 * /hero:
 *   get:
 *     summary: Get active hero
 *     description: Returns the active hero with logo and translations for the website. No authentication required.
 *     tags:
 *       - Customer Hero
 *     responses:
 *       200:
 *         description: Active hero returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomerHeroResponse'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 *
 * components:
 *   responses:
 *     NotFound:
 *       description: Resource not found
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: string
 *                 example: "heroNotFound"
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
 *     CustomerHeroLogo:
 *       type: object
 *       nullable: true
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "33333333-3333-3333-3333-333333333333"
 *         path:
 *           type: string
 *           example: "/uploads/logo.png"
 *         name:
 *           type: string
 *           example: "logo.png"
 *         size:
 *           type: integer
 *           example: 45678
 *
 *     CustomerHeroTranslation:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Medory"
 *         position:
 *           type: string
 *           example: "CEO"
 *         headline:
 *           type: string
 *           example: "Welcome to our site"
 *         description:
 *           type: string
 *           example: "Short description for hero"
 *         language:
 *           type: object
 *           properties:
 *             code:
 *               type: string
 *               example: "en"
 *
 *     CustomerHeroData:
 *       type: object
 *       properties:
 *         logo:
 *           $ref: '#/components/schemas/CustomerHeroLogo'
 *         translations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CustomerHeroTranslation'
 *
 *     CustomerHeroResponse:
 *       type: object
 *       properties:
 *         data:
 *           $ref: '#/components/schemas/CustomerHeroData'
 */
