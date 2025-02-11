import mongoose from "mongoose";

const whoAreYouSchema = new mongoose.Schema(
  {
    whoAreYou: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const WhoAreYou = mongoose.model("WhoAreYou", whoAreYouSchema);
export default WhoAreYou;
