// client/src/pages/Manager/ManagerDashboard.jsx
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import ProjectForm from "../Project/ProjectForm.jsx";
import TaskForm from "../Task/TaskFrom.jsx";
import { AuthContext } from "../../context/AuthContext";
import { SocketContext } from "../../context/SocketContext.jsx";
import Notification from "../Notification.jsx";

const API = import.meta.env.VITE_API_URL;

const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString();
};

function ManagerDashboard() {
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState({ status: "", priority: "", employee: "" });

  const [notifications, setNotifications] = useState([]);

  // -------- fetch functions --------
  const fetchProjects = async () => {
    if (!user?.token) return;
    setLoadingProjects(true);
    try {
      const res = await axios.get(`${API}/api/projects`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setProjects(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("fetchProjects error:", err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchTasks = async () => {
    if (!user?.token) return;
    setLoadingTasks(true);
    try {
      // use filter params for status/priority/employee and search for task title
      const params = {};
      if (filter.status) params.status = filter.status;
      if (filter.priority) params.priority = filter.priority;
      if (filter.employee) params.employee = filter.employee;
      if (search) params.search = search;

      const res = await axios.get(`${API}/api/tasks`, {
        headers: { Authorization: `Bearer ${user.token}` },
        params,
      });
      setTasks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("fetchTasks error:", err);
    } finally {
      setLoadingTasks(false);
    }
  };

  // initial load & on user/token change
  useEffect(() => {
    if (!user?.token) return;
    fetchProjects();
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // re-fetch when search or filter changes
  useEffect(() => {
    // debounce small: immediate is fine for dev
    fetchTasks();
    // also filter projects client-side by search (so re-render)
    // we keep server projects as-is and filter when rendering
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filter]);

  // socket notifications & live update
  useEffect(() => {
    if (!socket) return;

    const onTaskUpdated = (task) => {
      setNotifications((prev) => [...prev, `Task ${task.title} updated to ${task.status}`]);
      // update local tasks list if present
      setTasks((prev) => {
        const exists = prev.find((t) => t._id === task._id);
        if (exists) return prev.map((t) => (t._id === task._id ? task : t));
        return [task, ...prev]; // new task arrived
      });
    };

    socket.on("taskUpdated", onTaskUpdated);
    socket.on("taskUpdate", onTaskUpdated); // some backends use different event names
    return () => {
      socket.off("taskUpdated", onTaskUpdated);
      socket.off("taskUpdate", onTaskUpdated);
    };
  }, [socket]);

  // -------- update task inline (status / deadline) --------
  const updateTask = async (taskId, updates) => {
    if (!user?.token) return;
    try {
      const res = await axios.put(`${API}/api/tasks/${taskId}`, updates, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const updated = res.data;
      setTasks((prev) => prev.map((t) => (t._id === taskId ? updated : t)));
      if (socket) socket.emit("taskUpdated", updated);
    } catch (err) {
      console.error("updateTask error:", err);
      alert("Failed to update task. See console.");
    }
  };

  // derive employee options from projects/tasks
  const employeeOptions = (() => {
    const map = new Map();
    // collect from projects.employees (populated) and tasks.assignedTo (populated)
    projects.forEach((p) => {
      (p.employees || []).forEach((e) => {
        if (e && e._id) map.set(e._id, e.name || e._id);
      });
    });
    tasks.forEach((t) => {
      const a = t.assignedTo;
      if (a && a._id) map.set(a._id, a.name || a._id);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  })();

  // client-side project search filter
  const visibleProjects = (projects || []).filter((p) =>
    p.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h2 className="text-3xl font-bold mb-6">Manager Dashboard</h2>

      {/* Search + Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects/tasks..."
          className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          className="w-full md:w-48 p-2 border rounded-md"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        <select
          value={filter.priority}
          onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
          className="w-full md:w-48 p-2 border rounded-md"
        >
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <select
          value={filter.employee}
          onChange={(e) => setFilter({ ...filter, employee: e.target.value })}
          className="w-full md:w-56 p-2 border rounded-md"
        >
          <option value="">All Employees</option>
          {employeeOptions.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name}
            </option>
          ))}
        </select>
      </div>

      {/* Two column layout on large screens: Projects | Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects Table */}
        <section className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Projects</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={fetchProjects}
                className="text-sm px-3 py-1 rounded border hover:bg-gray-50"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="mb-4">
            <ProjectForm onSuccess={fetchProjects} />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2">Title</th>
                  <th className="px-4 py-2">Description</th>
                  <th className="px-4 py-2">Manager</th>
                  <th className="px-4 py-2">Employees</th>
                  <th className="px-4 py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {loadingProjects ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-6 text-center">
                      Loading projects...
                    </td>
                  </tr>
                ) : visibleProjects.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-6 text-center text-gray-500">
                      No projects found
                    </td>
                  </tr>
                ) : (
                  visibleProjects.map((p) => (
                    <tr key={p._id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">{p.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{p.description || "—"}</td>
                      <td className="px-4 py-3">{p.manager?.name || "—"}</td>
                      <td className="px-4 py-3">
                        {Array.isArray(p.employees) && p.employees.length > 0 ? (
                          <div className="text-sm text-gray-700">
                            {p.employees.map((e) => e.name || e._id).join(", ")}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">{formatDate(p.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Tasks Table */}
        <section className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Tasks</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={fetchTasks}
                className="text-sm px-3 py-1 rounded border hover:bg-gray-50"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="mb-4">
            <TaskForm onSuccess={fetchTasks} />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2">Title</th>
                  <th className="px-4 py-2">Project</th>
                  <th className="px-4 py-2">Assigned To</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Priority</th>
                  <th className="px-4 py-2">Deadline</th>
                  <th className="px-4 py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {loadingTasks ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-6 text-center">
                      Loading tasks...
                    </td>
                  </tr>
                ) : tasks.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-6 text-center text-gray-500">
                      No tasks found
                    </td>
                  </tr>
                ) : (
                  tasks.map((t) => (
                    <tr key={t._id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">{t.title}</td>
                      <td className="px-4 py-3">{t.project?.title || "—"}</td>
                      <td className="px-4 py-3">{t.assignedTo?.name || "—"}</td>
                      <td className="px-4 py-3">
                        <select
                          value={t.status}
                          onChange={(e) => updateTask(t._id, { status: e.target.value })}
                          className="px-2 py-1 rounded-md border"
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">{t.priority}</td>
                      <td className="px-4 py-3">
                        <input
                          type="date"
                          value={t.deadline ? new Date(t.deadline).toISOString().split("T")[0] : ""}
                          onChange={(e) => updateTask(t._id, { deadline: e.target.value })}
                          className="p-1 border rounded-md"
                        />
                      </td>
                      <td className="px-4 py-3">{formatDate(t.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Notifications */}
      <div className="mt-6">
        <Notification notifications={notifications} />
      </div>
    </div>
  );
}

export default ManagerDashboard;
