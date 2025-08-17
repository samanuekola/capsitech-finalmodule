import mongoose, { Schema, Document, Types } from "mongoose";

export interface IProject extends Document {
  name: string;
  description: string;
  teamMembers: Types.ObjectId[];
}

const projectSchema = new Schema<IProject>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  teamMembers: [{ type: Schema.Types.ObjectId, ref: "Team" }]
});

export default mongoose.model<IProject>("Project", projectSchema);
