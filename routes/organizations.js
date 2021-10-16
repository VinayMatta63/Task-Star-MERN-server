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
  "/create-task",
  [
    body("title", "Title not specified.").notEmpty(),
    body("desc", "Description not specified.").notEmpty(),
    body("tasklist_id", "Tasklist ID not specified").notEmpty(),
  ],
  organizations.createTask
);

router.post(
  "/add-member-task",
  [
    body("task_id", "Task ID required").notEmpty(),
    body("userArray", "User ID required").isArray({ min: 1 }),
  ],
  organizations.addMember
);
router.post(
  "/add-member-org",
  [
    body("org_id", "Organization ID required").notEmpty(),
    body("email", "User email required").isEmail().notEmpty(),
  ],
  organizations.addMemberOrg
);

router.post(
  "/change-status",
  [
    body("task_id", "Task ID required").notEmpty(),
    body("user_id", "User required").notEmpty(),
    body("status", "New Status required").notEmpty(),
  ],
  organizations.changeStatus
);

router.post(
  "/remove-member-org",
  [
    body("org_id", "Organization ID required").notEmpty(),
    body("user_id", "User required").notEmpty(),
  ],
  organizations.removeMember
);

router.post(
  "/getOrg",
  [body("org_id", "Organization ID required").notEmpty()],
  organizations.getOrgData
);
module.exports = router;
