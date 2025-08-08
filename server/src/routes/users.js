// server/src/routes/users.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
  getMyProfile,
  updateMyProfile
} = require('../controllers/userController');

router.route('/')
  .get(protect, authorize('superadmin'), getUsers)
  .post(protect, authorize('superadmin'), createUser);

router.route('/me')
  .get(protect, getMyProfile)
  .put(protect, updateMyProfile);

router.route('/change-password')
  .put(protect, changePassword);

router.route('/:id')
  .get(protect, authorize('superadmin'), getUserById)
  .put(protect, authorize('superadmin'), updateUser)
  .delete(protect, authorize('superadmin'), deleteUser);

module.exports = router;