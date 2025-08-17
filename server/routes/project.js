import express from "express";
import {
  createProject,
  getProjects,
} from "../controllers/projectController.js";
import authMiddleware from "../middleware/auth.js";


const projectRoutes = express.Router();

projectRoutes.post("/", authMiddleware(["manager"]), createProject);
projectRoutes.get(
  "/",
  authMiddleware(["admin", "manager", "employee"]),
  getProjects
);

export default projectRoutes;
