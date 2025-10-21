/**
 * @swagger
 * tags:
 *   - name: Admin Category
 *     description: Admin CRUD for Categories (with translations)
 *
 * /admin/category:
 *   get:
 *     summary: List categories
 *     description: Returns paginated list of categories with translations and blog counts.
 *     tags:
 *       - Admin Category
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (optional)
 *       - in: query
 *         name: take
 *         schema:
 *           type: integer
 *         description: Items per page (optional)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search text for category name (optional)
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *         description: Order direction (e.g. "asc" or "desc") (optional)
 *     responses:
 *       200:
 *         description: Categories list returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CategoryItem'
 *                 count:
 *                   type: integer
 *       500:
 *         description: Internal server error
 *
 *   post:
 *     summary: Create category
 *     description: Create a new category with translations (at least one language required). The `translations` object must include per-language translation objects with `name`.
 *     tags:
 *       - Admin Category
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               translations:
 *                 type: object
 *                 example:
 *                   en:
 *                     name: "Technology"
 *                   ka:
 *                     name: "ტექნოლოგია"
 *             required:
 *               - translations
 *     responses:
 *       201:
 *         description: Category created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoryItem'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         description: Internal server error
 *
 * /admin/category/{id}:
 *   get:
 *     summary: Get single category
 *     description: Fetch a single category by UUID.
 *     tags:
 *       - Admin Category
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Category found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoryItem'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "categoryNotFound"
 *       500:
 *         description: Internal server error
 *
 *   put:
 *     summary: Update category
 *     description: Update category translations by UUID. Replaces translations for the category.
 *     tags:
 *       - Admin Category
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
 *               translations:
 *                 type: object
 *                 example:
 *                   en:
 *                     name: "Technology"
 *                   ka:
 *                     name: "ტექნოლოგია"
 *             required:
 *               - translations
 *     responses:
 *       200:
 *         description: Category updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoryItem'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 *
 *   delete:
 *     summary: Delete category
 *     description: Delete a category by UUID.
 *     tags:
 *       - Admin Category
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 *
 * components:
 *   responses:
 *     ValidationError:
 *       description: Validation failed (middleware errors return 400)
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
 *   schemas:
 *     LanguageCode:
 *       type: object
 *       properties:
 *         code:
 *           type: string
 *           example: en
 *
 *     CategoryTranslation:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Technology"
 *         language:
 *           $ref: '#/components/schemas/LanguageCode'
 *
 *     CategoryItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         translations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CategoryTranslation'
 *         _count:
 *           type: object
 *           properties:
 *             blogs:
 *               type: integer
 *               example: 5
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
