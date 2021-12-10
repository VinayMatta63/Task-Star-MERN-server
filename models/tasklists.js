const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TasklistSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  org_id: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  tasks: [Schema.Types.ObjectId],
});

module.exports = mongoose.model("Tasklist", TasklistSchema);
