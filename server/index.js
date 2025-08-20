import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/database.js";
import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/project.js";
import taskRoutes from "./routes/task.js";
import { configDotenv } from "dotenv";
configDotenv();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://mern-task-brainy-dx-company.vercel.app/",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/", (req, res) => {
  res.send("task are run in server ");
});
io.on("connection", (socket) => {
  console.log("New client connected");
  socket.on("taskUpdate", (task) => {
    io.emit("taskUpdated", task);
  });
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));