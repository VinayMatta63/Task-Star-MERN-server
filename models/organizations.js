const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrganizationSchema = new Schema({
  creator: { type: Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  desc: { type: String, required: true },
  members: [Schema.Types.ObjectId],
  tasklist: [Schema.Types.ObjectId],
});

module.exports = mongoose.model("Organization", OrganizationSchema);
