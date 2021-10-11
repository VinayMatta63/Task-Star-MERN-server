const Organization = require("../models/organizations");
const User = require("../models/users");
const Tasklist = require("../models/tasklists");
const Task = require("../models/tasks");
const { validationResult } = require("express-validator");

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
    await org.save();
    res
      .status(200)
      .json({ message: "Organisation saved Successfully!", data: org });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports.createTasklist = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { title, org_id } = req.body;
  try {
    let tasklist = new Tasklist({ title: title, org_id: org_id, tasks: [] });
    await tasklist.save();
    let org = await Organization.findOne({ _id: org_id });
    org.tasklist.push(tasklist);
    await Organization.updateOne({
      id: org_id,
      $set: { tasklist: org.tasklist },
    });
    res
      .status(200)
      .json({ message: "Tasklist created successfully", data: org.tasklist });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

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
      id: tasklist_id,
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

module.exports.addMemberOrg = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: errors.array() });
  }
  const { org_id, userArray } = req.body;
  try {
    let org = await Organization.findOne({ _id: org_id });

    org.members.push(...userArray);
    let newMembers = org.members.filter(
      (item, index) => org.members.indexOf(item) === index
    );
    await Organization.updateOne({
      _id: org_id,
      $set: { members: newMembers },
    });
    org.members = newMembers;
    userArray.forEach(async (item, index) => {
      let user = await User.findOne({ id: item });
      await User.updateOne({
        id: user.id,
        $set: { org_id: org_id },
      });
    });
    res.status(200).json({
      message: "Members added to Organization",
      data: org,
    });
  } catch (e) {
    res.status(500).json({ error: e });
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
