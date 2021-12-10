const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TaskSchema = new Schema({
  title: { type: String, required: true },
  desc: { type: String, required: true },
  status: { type: String, required: true },
  created_at: {
    type: Date,
    default: Date.now(),
  },
  due: { type: Date, default: null },
  assignees: [Schema.Types.ObjectId],
  tasklist_id: { type: Schema.Types.ObjectId, required: true },
});

module.exports = mongoose.model("Task", TaskSchema);
