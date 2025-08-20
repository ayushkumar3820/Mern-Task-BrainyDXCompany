import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

function TaskList({ search, filter }) {
  const [tasks, setTasks] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user || !user.token) {
        console.warn("No user token found. Redirect to login maybe?");
        return;
      }

      try {
        const params = new URLSearchParams({ search, ...filter });
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/tasks?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );

        setTasks(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, [search, filter, user]);

  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold mb-4"></h3>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="border p-2">#</th>
              <th className="border p-2">Title</th>
              <th className="border p-2">Description</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Priority</th>
              <th className="border p-2">Assigned To</th>
              <th className="border p-2">Deadline</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length > 0 ? (
              tasks.map((task, index) => (
                <tr key={task._id} className="hover:bg-gray-50">
                  <td className="border p-2">{index + 1}</td>
                  <td className="border p-2 font-medium">{task.title}</td>
                  <td className="border p-2">{task.description}</td>
                  <td className="border p-2">{task.status}</td>
                  <td className="border p-2">{task.priority}</td>
                  <td className="border p-2">
                    {task.assignedTo?.name || "Unassigned"}
                  </td>
                  <td className="border p-2">
                    {task.deadline
                      ? new Date(task.deadline).toLocaleDateString()
                      : "Not set"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center p-4">
                  No tasks found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TaskList;
