const express = require("express");
const router = express.Router();
const PressPackOrderController = require("../controllers/pressPackOrderController");
const {
  verifyAdminToken,
  requireAdminPanelAccess,
  requireAdminPermission,
} = require("../middleware/auth");

const pressPackOrderController = new PressPackOrderController();

// All routes require admin authentication and panel access
router.use(verifyAdminToken);
router.use(requireAdminPanelAccess);
router.use(requireAdminPermission("manage_orders"));

// Get all press pack orders (admin management)
router.get("/", pressPackOrderController.getAll);

// Get press pack order by ID
router.get("/:id", pressPackOrderController.getById);

// Update press pack order status (admin only)
router.put("/:id", pressPackOrderController.update);

module.exports = router;