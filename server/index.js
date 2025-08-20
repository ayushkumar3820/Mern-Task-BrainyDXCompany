// server.js
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/database.js";
import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/project.js";
import taskRoutes from "./routes/task.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = http.createServer(app);

// ✅ Setup Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: "https://mern-task-brainy-dx-company-1nvy.vercel.app/",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// ✅ Middleware
app.use(cors({
  origin: [
    "https://mern-task-brainy-dx-company-1nvy.vercel.app",
    "http://localhost:3000"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));
app.use(express.json()); // important for JSON body parsing

// ✅ Connect Database
connectDB();

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

// ✅ Test Route
app.get("/", (req, res) => {
  res.send("Task Manager API running 🚀");
});

// ✅ Socket.io Events
io.on("connection", (socket) => {
  console.log("🔌 New client connected");

  socket.on("taskUpdate", (task) => {
    io.emit("taskUpdated", task);
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected");
  });
});

// ✅ Global Error Handler (helps debug 500s)
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
