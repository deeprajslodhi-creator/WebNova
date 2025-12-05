/**
 * Admin Routes
 * Routes for admin operations
 */

const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getAllFiles,
    getAllUsers,
    deleteAnyFile
} = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/auth');

// All routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

// Admin operations
router.get('/stats', getDashboardStats);
router.get('/files', getAllFiles);
router.get('/users', getAllUsers);
router.delete('/files/:id', deleteAnyFile);

module.exports = router;
