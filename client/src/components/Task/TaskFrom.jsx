// client/src/components/Task/TaskForm.jsx
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

/**
 * Props:
 *  - defaultProjectId (string | null)  -> recommended: pass from parent (Manager page) when creating a task under a specific project
 *  - defaultEmployeeId (string | null) -> optional: if you want to assign task to somebody else programmatically
 *  - onSuccess (function) -> optional callback receiving created task (useful to refresh parent lists)
 *
 * Behavior:
 *  - Does NOT render inputs for projectId / employeeId.
 *  - Sends projectId & employeeId in POST body.
 *  - If defaultProjectId not provided: tries to auto-pick first project managed by logged-in user (best-effort).
 *  - If projectId still missing, submit is blocked with an alert (prevents backend validation errors).
 */
function TaskForm({ defaultProjectId = null, defaultEmployeeId = null, onSuccess = null }) {
  const { user } = useContext(AuthContext);

  // visible inputs
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [deadline, setDeadline] = useState("");

  // hidden IDs used in payload
  const [projectId, setProjectId] = useState(defaultProjectId);
  const [employeeId, setEmployeeId] = useState(defaultEmployeeId || (user?.id || user?._id));

  const [loadingProjectFallback, setLoadingProjectFallback] = useState(false);
  const API = import.meta.env.VITE_API_URL;

  // keep employeeId in sync with AuthContext (unless parent explicitly provided defaultEmployeeId)
  useEffect(() => {
    if (!defaultEmployeeId) {
      setEmployeeId(user?.id || user?._id || null);
    }
  }, [defaultEmployeeId, user]);

  // If parent didn't give a projectId, try to pick a sensible default:
  // fetch projects and choose first project managed by logged-in user (best-effort).
  // If you don't want this behavior, simply always pass defaultProjectId from parent.
  useEffect(() => {
    if (projectId) return; // already set by parent
    if (!user?.token) return;

    const pickProject = async () => {
      setLoadingProjectFallback(true);
      try {
        const res = await axios.get(`${API}/api/projects`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const list = Array.isArray(res.data) ? res.data : [];

        // prefer projects where manager matches current user (populated or raw id)
        const mine = list.find((p) => {
          if (!p.manager) return false;
          const mgr = typeof p.manager === "object" ? (p.manager._id || p.manager.id) : p.manager;
          return mgr === (user?.id || user?._id);
        });

        if (mine) setProjectId(mine._id || mine.id);
      } catch (err) {
        console.error("Project fallback error:", err);
      } finally {
        setLoadingProjectFallback(false);
      }
    };

    pickProject();
  }, [projectId, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // validation: projectId required in your schema -> block submit if missing
    if (!projectId) {
      alert(
        "No project selected for this task. Either (1) pass a defaultProjectId prop to TaskForm, or (2) create/select a project first."
      );
      return;
    }

    const payload = {
      title,
      description,
      projectId,
      employeeId,
      priority,
      // send deadline only if filled (backend accepts Date)
      ...(deadline ? { deadline } : {}),
    };

    try {
      const res = await axios.post(`${API}/api/tasks`, payload, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });

      // clear visible form fields only (we keep hidden IDs intact)
      setTitle("");
      setDescription("");
      setPriority("medium");
      setDeadline("");

      onSuccess && onSuccess(res.data); // let parent refresh lists
      // optional: keep projectId/employeeId as-is (so user can create more tasks for same project)
      alert("Task created successfully");
    } catch (err) {
      console.error("Error creating task:", err);
      alert("Error creating task — check console/server logs.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h3 className="text-xl font-bold mb-4">Create Task</h3>

      {/* show a small notice if we're auto-picking a project so you know what's happening */}
      {defaultProjectId ? null : (
        <p className="text-sm text-gray-500 mb-2">
          {projectId
            ? `Creating task under project: ${projectId}`
            : loadingProjectFallback
            ? "Finding a project to attach task to..."
            : "No project selected — task creation will be blocked until a project is available."}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task Title"
          className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* priority + deadline visible to user */}
        <div className="flex gap-3">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600"
        >
          Create
        </button>
      </form>
    </div>
  );
}

export default TaskForm;
