import { Router } from "express";
import Project from "../models/Project";
import auth from "../middleware/auth";

const router = Router();

// Create
router.post("/", auth, async (req, res) => {
  const project = new Project(req.body);
  await project.save();
  res.json(project);
});

// List
router.get("/", auth, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const projects = await Project.find()
    .populate("teamMembers")
    .skip((+page - 1) * +limit)
    .limit(+limit);
  const total = await Project.countDocuments();
  res.json({ projects, total });
});

// Update
router.put("/:id", auth, async (req, res) => {
  const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(project);
});

// Delete
router.delete("/:id", auth, async (req, res) => {
  await Project.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

export default router;
