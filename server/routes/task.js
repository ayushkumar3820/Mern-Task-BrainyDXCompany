import express from "express";
import {
  createTask,
  updateTask,
  getTasks,
} from "../controllers/taskController.js";
import authMiddleware from "../middleware/auth.js";


const taskRoutes = express.Router();

taskRoutes.post("/", authMiddleware(["manager"]), createTask);
taskRoutes.put("/:id", authMiddleware(["employee", "manager"]), updateTask);
taskRoutes.get("/", authMiddleware(["admin", "manager", "employee"]), getTasks);

export default taskRoutes;
