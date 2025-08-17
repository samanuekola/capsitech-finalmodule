import mongoose, { Schema, Document, Types } from "mongoose";

export type TaskStatus = "to-do" | "in-progress" | "done" | "cancelled";

export interface ITask extends Document {
  title: string;
  description: string;
  deadline?: Date;
  project: Types.ObjectId;
  assignedMembers: Types.ObjectId[];
  status: TaskStatus;
}

const taskSchema = new Schema<ITask>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  deadline: { type: Date },
  project: { type: Schema.Types.ObjectId, ref: "Project" },
  assignedMembers: [{ type: Schema.Types.ObjectId, ref: "Team" }],
  status: { type: String, enum: ["to-do", "in-progress", "done", "cancelled"], default: "to-do" }
});

export default mongoose.model<ITask>("Task", taskSchema);
