const express = require("express");
const { body } = require("express-validator");
const organizations = require("../controllers/organizations");
const router = express.Router();

router.post(
  "/create",
  // Basic Validations
  [
    body("creator", "Creator not specified.").notEmpty(),
    body("name", "Name not specified").notEmpty(),
    body("desc", "Description not specified").notEmpty(),
  ],
  // Callback Functions
  organizations.createOrg
);

router.post(
  "/createTasklist",
  [
    body("title", "Title not specified.").notEmpty(),
    body("org_id", "Organization ID not specified").notEmpty(),
  ],
  organizations.createTasklist
);

router.post(
  "/createTask",
  [
    body("title", "Title not specified.").notEmpty(),
    body("desc", "Description not specified.").notEmpty(),
    body("tasklist_id", "Tasklist ID not specified").notEmpty(),
  ],
  organizations.createTask
);

router.post(
  "/addMember",
  [
    body("task_id", "Task ID required").notEmpty(),
    body("userArray", "User ID required").isArray({ min: 1 }),
  ],
  organizations.addMember
);
router.post(
  "/addMemberOrg",
  [
    body("org_id", "Organization ID required").notEmpty(),
    body("userArray", "User required").isArray({ min: 1 }),
  ],
  organizations.addMemberOrg
);

router.post(
  "/changeStatus",
  [
    body("task_id", "Task ID required").notEmpty(),
    body("user_id", "User required").notEmpty(),
    body("status", "New Status required").notEmpty(),
  ],
  organizations.changeStatus
);
module.exports = router;