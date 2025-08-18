import { Router } from "express";
import Project from "../models/Project";
import auth from "../middleware/auth";

const router = Router();

// ✅ Helper to ensure teamMembers is always an array
function normalizeTeamMembers(teamMembers: any) {
  if (!teamMembers) return [];
  return Array.isArray(teamMembers) ? teamMembers : [teamMembers];
}

// Create
router.post("/", auth, async (req, res) => {
  try {
    const { name, description, teamMembers } = req.body;

    const project = new Project({
      name,
      description,
      teamMembers: normalizeTeamMembers(teamMembers),
    });

    await project.save();
    res.json(await project.populate("teamMembers"));
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// List
router.get("/", auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const projects = await Project.find()
      .populate("teamMembers")
      .skip((+page - 1) * +limit)
      .limit(+limit);

    const total = await Project.countDocuments();
    res.json({ projects, total });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Update
router.put("/:id", auth, async (req, res) => {
  try {
    const { name, description, teamMembers } = req.body;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        teamMembers: normalizeTeamMembers(teamMembers),
      },
      { new: true }
    ).populate("teamMembers");

    res.json(project);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Delete
router.delete("/:id", auth, async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
