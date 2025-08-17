import { Router } from "express";
import Task from "../models/Task";
import auth from "../middleware/auth";

const router = Router();

// Create
router.post("/", auth, async (req, res) => {
  const task = new Task(req.body);
  await task.save();
  res.json(task);
});

// List with filters
router.get("/", auth, async (req, res) => {
  const { page = 1, limit = 10, search, project, status, fromDate, toDate } = req.query;

  const query: any = {};
  if (search) query.title = { $regex: search, $options: "i" };
  if (project) query.project = project;
  if (status) query.status = status;
  if (fromDate || toDate) {
    query.deadline = {};
    if (fromDate) query.deadline.$gte = new Date(fromDate as string);
    if (toDate) query.deadline.$lte = new Date(toDate as string);
  }

  const tasks = await Task.find(query)
    .populate("project")
    .populate("assignedMembers")
    .skip((+page - 1) * +limit)
    .limit(+limit);

  const total = await Task.countDocuments(query);
  res.json({ tasks, total });
});

// Update
router.put("/:id", auth, async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(task);
});

// Delete
router.delete("/:id", auth, async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

export default router;
