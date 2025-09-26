/**
 * @swagger
 * tags:
 *   - name: Customer Footer
 *     description: Public endpoints to read site footer (email, phone, pages, socials)
 *
 * /footer:
 *   get:
 *     summary: Get public footer
 *     description: Returns footer contact info, ordered page links and socials for the public site.
 *     tags:
 *       - Customer Footer
 *     responses:
 *       200:
 *         description: Footer returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/CustomerFooterResponse'
 *       404:
 *         description: Footer not found
 *       500:
 *         description: Internal server error
 *
 * components:
 *   schemas:
 *     CustomerFooterPageTranslation:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Home"
 *         language:
 *           type: object
 *           properties:
 *             code:
 *               type: string
 *               example: "en"
 *
 *     CustomerFooterPage:
 *       type: object
 *       properties:
 *         footerOrder:
 *           type: integer
 *           example: 1
 *         slug:
 *           type: string
 *           example: "home"
 *         translations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CustomerFooterPageTranslation'
 *
 *     CustomerFooterSocialIcon:
 *       type: object
 *       nullable: true
 *       properties:
 *         id:
 *           type: string
 *         path:
 *           type: string
 *         name:
 *           type: string
 *
 *     CustomerFooterSocial:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "facebook"
 *         url:
 *           type: string
 *           example: "https://facebook.com/example"
 *         icon:
 *           $ref: '#/components/schemas/CustomerFooterSocialIcon'
 *
 *     CustomerFooterResponse:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "info@example.com"
 *         phone:
 *           type: string
 *           example: "+1 555 123 4567"
 *         pages:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CustomerFooterPage'
 *         socials:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CustomerFooterSocial'
 */
