import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

function TaskList({ search, filter }) {
  const [tasks, setTasks] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const params = new URLSearchParams({ search, ...filter });
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/tasks?${params.toString()}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setTasks(response.data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };
    fetchTasks();
  }, [search, filter, user]);

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Tasks</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <div key={task._id} className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="text-lg font-semibold mb-2">{task.title}</h4>
            <p>{task.description}</p>
            <p className="text-sm text-gray-600">Status: {task.status}</p>
            <p className="text-sm text-gray-600">Priority: {task.priority}</p>
            <p className="text-sm text-gray-600">Assigned to: {task.assignedTo.name}</p>
            <p className="text-sm text-gray-600">Deadline: {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'Not set'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TaskList;