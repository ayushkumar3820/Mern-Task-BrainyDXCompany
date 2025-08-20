import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { SocketContext } from "../../context/SocketContext";

function EmployeeDashboard() {
  const [tasks, setTasks] = useState([]);
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    if (!user) return;
    const fetchTasks = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/tasks?employee=${user.id}`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        setTasks(response.data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    fetchTasks();
  }, [user]);

  const updateTask = async (taskId, updates) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/tasks/${taskId}`,
        updates,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setTasks(tasks.map((t) => (t._id === taskId ? response.data : t)));
      socket.emit("taskUpdate", response.data);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h2 className="text-3xl font-bold mb-6">Employee Dashboard</h2>

      {tasks.length === 0 ? (
        <p>No tasks assigned yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg shadow-md bg-white">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2 text-left">Description</th>
                <th className="px-4 py-2 text-left">Project</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Priority</th>
                <th className="px-4 py-2 text-left">Deadline</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{task.title}</td>
                  <td className="px-4 py-2">{task.description}</td>
                  <td className="px-4 py-2">
                    {task.project ? task.project.title : "—"}
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={task.status}
                      onChange={(e) =>
                        updateTask(task._id, { status: e.target.value })
                      }
                      className={`px-2 py-1 rounded-md ${getStatusClass(
                        task.status
                      )}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                  <td className="px-4 py-2 capitalize">{task.priority}</td>
                  <td className="px-4 py-2">
                    <input
                      type="date"
                      defaultValue={
                        task.deadline
                          ? new Date(task.deadline).toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        updateTask(task._id, { deadline: e.target.value })
                      }
                      className="p-1 border border-gray-300 rounded-md"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default EmployeeDashboard;
