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
      message: "Member added to Organization",
      data: user,
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
    const savedTask = await task.save();
    await Tasklist.findOneAndUpdate(
      { id: tasklist_id },
      { $push: { tasks: savedTask } }
    );
    res
      .status(200)
      .json({ message: "Task created successfully", data: savedTask });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

/*
 *
 *
   Controller to remove member from organization.
 *
 *
 */
module.exports.removeMember = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: errors.array() });
  }
  const { org_id, user_id, request_user_id } = req.body;
  try {
    const org = await Organization.findOne({ _id: org_id });
    if (!(org.creator.toString() == request_user_id)) {
      res.status(400).json({ message: "Only Owner can remove members" });
    } else {
      await Organization.findOneAndUpdate(
        { _id: org_id },
        { $pull: { members: user_id } },
        { new: true }
      );
      const user = await User.findOneAndUpdate(
        { _id: user_id },
        { $set: { org_id: null } }
      );
      await Task.updateMany(
        { assignees: { $in: [user_id] } },
        { $pull: { assignees: user_id } },
        { new: true }
      );
      res.status(200).json({
        message: "Member removed from Organization",
        data: user,
      });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

/*
 *
 *
   Controller to remove member from task.
 *
 *
 */
module.exports.removeMemberTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: errors.array() });
  }
  const { task_id, user_id, request_user_id, org_id } = req.body;
  try {
    const org = await Organization.findOne({ _id: org_id });
    console.log(org.members.includes(request_user_id));
    if (!org.members.includes(request_user_id)) {
      res
        .status(400)
        .json({ message: "Only a Member of Organization can do this." });
    } else {
      const task = await Task.findOneAndUpdate(
        { _id: task_id },
        { $pull: { assignees: user_id } },
        { new: true }
      );
      res.status(200).json({
        message: "Member removed from Task",
        data: task,
      });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
/*
 *
 *
   Controller to add member to task assignees.
 *
 *
 */
module.exports.addMember = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: errors.array() });
  }
  const { task_id, userArray } = req.body;
  try {
    let tasks = await Task.findOne({ _id: task_id });

    const task = await Task.findOneAndUpdate(
      { _id: task_id },
      { $push: { assignees: userArray } },
      { new: true }
    );
    console.log(task);
    res.status(200).json({
      message: "Assigned Successfully!",
      data: userArray,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

/*
 *
 *
   Controller to change status of task.
 *
 *
 */
module.exports.changeStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: errors.array() });
  }
  const { task_id, user_id, status } = req.body;
  try {
    let task = await Task.findOne({ _id: task_id });
    if (task.assignees.includes(user_id)) {
      await Task.findOneAndUpdate(
        { _id: task_id },
        { $set: { status: status } },
        { new: true }
      );
      res
        .status(200)
        .json({ message: `Task status changed to ${status}`, data: status });
    } else {
      res.status(400).json({ message: "Only Assignees can change status!" });
    }
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

/*
 *
 *
   Controller to get organization data.
 *
 *
 */
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
