const express = require('express');
const { login, addAdmin, suspendAdmin, resetPassword, allAdmin, completeTask, cancelTask, quickPickups, updateProfile, allTransactions, suspendUser } = require('../controllers/admin');
const { getAllUsers } = require('../controllers/user');
const router = express.Router();

router.post("/admin/login", login);
router.post("/admin/register_admin", addAdmin);
router.post("/admin/revoke_admin_access", suspendAdmin);
router.get('/admin/admin_fetch_all_admin', allAdmin);
router.post("/admin/reset_password", resetPassword);
router.post("/admin/update_profile", updateProfile);
router.get("/admin/all_users", getAllUsers);
router.get("/admin/transactions", allTransactions);
router.get("/admin/suspend", suspendUser);

module.exports = router;