const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth');
const {
  createProperty,
  getProperties,
  getProperty,
  updateProperty,
  deleteProperty,
  deletePropertyAsAdmin
} = require('../controllers/propertyController');

const router = express.Router();

/**
 * @swagger
 * /api/properties:
 *   get:
 *     summary: Get all properties with pagination and filters
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, sold]
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of properties
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, getProperties);

/**
 * @swagger
 * /api/properties/{id}:
 *   get:
 *     summary: Get a single property by ID
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Property details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Property not found
 */
router.get('/:id', authenticate, getProperty);

/**
 * @swagger
 * /api/properties:
 *   post:
 *     summary: Create a new property (agents only)
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - price
 *               - location
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               location:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [available, sold]
 *     responses:
 *       201:
 *         description: Property created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - only agents can create properties
 */
router.post('/', authenticate, authorize(['agent']), createProperty);

/**
 * @swagger
 * /api/properties/{id}:
 *   put:
 *     summary: Update a property (agents only - own properties)
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               location:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [available, sold]
 *     responses:
 *       200:
 *         description: Property updated successfully
 *       403:
 *         description: Forbidden - can only update own properties
 *       404:
 *         description: Property not found
 */
router.put('/:id', authenticate, authorize(['agent']), updateProperty);

/**
 * @swagger
 * /api/properties/admin/{id}:
 *   delete:
 *     summary: Delete any property (admins only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Property deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admins only
 *       404:
 *         description: Property not found
 */
router.delete('/admin/:id', authenticate, authorize(['admin']), deletePropertyAsAdmin);

/**
 * @swagger
 * /api/properties/{id}:
 *   delete:
 *     summary: Delete a property (agents only - own properties)
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Property deleted successfully
 *       403:
 *         description: Forbidden - can only delete own properties
 *       404:
 *         description: Property not found
 */
router.delete('/:id', authenticate, authorize(['agent']), deleteProperty);

module.exports = router;
