const Organization = require("../models/organizations");
const User = require("../models/users");
const Tasklist = require("../models/tasklists");
const Task = require("../models/tasks");
const { validationResult } = require("express-validator");

/*
 *
 *
  Controller for creating a new organization.
 *
 *
 */
module.exports.createOrg = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { creator, name, desc } = req.body;
  try {
    let org = new Organization({
      creator: creator,
      name: name,
      desc: desc,
      members: [creator],
      tasklist: [],
    });
    const orgData = await org.save();
    const userData = await User.findOneAndUpdate(
      { _id: creator },
      { org_id: orgData._id },
      { new: true }
    );
    const members = {};
    members[userData._id] = userData;
    res.status(200).json({
      message: "Organisation saved Successfully!",
      data: {
        org_data: orgData,
        members: members,
        tasklist: [],
        tasks: [],
      },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

/*
 *
 *
  Controller for adding new members to organization
 *
 *
 */
module.exports.addMemberOrg = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: errors.array() });
  }
  const { org_id, email } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { email: email },
      { $set: { org_id: org_id } },
      { new: true }
    );
    await Organization.findOneAndUpdate(
      { id: org_id },
      { $push: { members: user._id } },
      { new: true }
    );

    res.status(200).json({
      message: "Members added to Organization",
      data: { member: user },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

/*
 *
 *
   Controller to create a tasklist
 *
 *
 */
module.exports.createTasklist = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, org_id } = req.body;
  try {
    let tasklist = new Tasklist({ title: title, org_id: org_id, tasks: [] });
    const savedList = await tasklist.save();
    await Organization.findOneAndUpdate(
      { id: org_id },
      { $push: { tasklist: savedList._id } },
      { new: true }
    );
    res.status(200).json({
      message: "Tasklist created successfully",
      data: savedList,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

/*
 *
 *
   Controller to create a task.
 *
 *
 */
module.exports.createTask = async (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).json({ error: error.array() });
  }
  const { title, tasklist_id, status, desc, due } = req.body;
  try {
    let task = new Task({
      title: title,
      tasklist_id: tasklist_id,
      desc: desc,
      due: due,
      status: status,
      assignees: [],
    });
    await task.save();
    let tasklist = await Tasklist.findOne({ _id: tasklist_id });
    tasklist.tasks.push(task);
    await Tasklist.updateOne({
      _id: tasklist_id,
      $set: { tasks: tasklist.tasks },
    });
    res
      .status(200)
      .json({ message: "Task created successfully", data: tasklist.tasks });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports.addMember = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: errors.array() });
  }
  const { task_id, userArray } = req.body;
  try {
    let tasks = await Task.findOne({ _id: task_id });
    tasks.assignees.push(...userArray);
    let newAssignees = tasks.assignees.filter(
      (item, index) => tasks.assignees.indexOf(item) === index
    );
    await Task.updateOne({
      _id: task_id,
      $set: { assignees: newAssignees },
    });
    res.status(200).json({
      message: "Members added Successfully",
      data: { assignees: newAssignees },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports.changeStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: errors.array() });
  }
  const { task_id, user_id, status } = req.body;
  try {
    let task = await Task.findOne({ _id: task_id });
    if (task.assignees.includes(user_id)) {
      await Task.updateOne({
        _id: task_id,
        $set: { status: status },
      });
      res.status(200).json({ message: "Task status updated successfully" });
    } else {
      res.status(400).json({ error: "Only Assignees can change status." });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports.removeMember = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: errors.array() });
  }
  const { org_id, user_id } = req.body;
  try {
    let org = await Organization.findOne({ _id: org_id });
    let newMembers = org.members.filter((item) => item != user_id);
    await Organization.updateOne({
      _id: org_id,
      $set: { members: newMembers },
    });
    res.status(200).json({
      message: "Members removed from Organization",
      data: { members: newMembers },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports.getOrgData = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: errors.array() });
  }
  const { org_id } = req.body;
  try {
    const org = await Organization.findOne({ id: org_id });
    const tasklists = await Tasklist.find({ org_id: org_id });

    const allMembers = {};
    for (let member of org.members) {
      allMembers[member] = await User.findOne({ _id: member });
    }
    const allTasks = {};
    for (let tasklist of tasklists) {
      allTasks[tasklist.id] = await Task.find({ tasklist_id: tasklist.id });
    }

    res.status(200).json({
      org_data: org,
      tasklist: tasklists,
      tasks: allTasks,
      members: allMembers,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
    console.log({ error: e });
  }
};

// module.exports.getTasks = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     res.status(400).json({ error: errors.array() });
//   }
//   const { tasklist_id } = req.body;
//   try {
//     const tasks = await Task.find({ tasklist_id: tasklist_id });
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// };
