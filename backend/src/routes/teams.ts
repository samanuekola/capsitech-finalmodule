import { Router } from "express";
import Team from "../models/Team";
import auth from "../middleware/auth";

const router = Router();

// Create
router.post("/", auth, async (req, res) => {
  const team = new Team(req.body);
  await team.save();
  res.json(team);
});

// List with pagination
router.get("/", auth, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const teams = await Team.find()
    .skip((+page - 1) * +limit)
    .limit(+limit);
  const total = await Team.countDocuments();
  res.json({ teams, total });
});

// Update
router.put("/:id", auth, async (req, res) => {
  const team = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(team);
});

// Delete
router.delete("/:id", auth, async (req, res) => {
  await Team.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

export default router;
