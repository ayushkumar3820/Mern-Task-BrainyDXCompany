import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { SocketContext } from '../../context/SocketContext';


function EmployeeDashboard() {
  const [tasks, setTasks] = useState([]);
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/tasks?employee=${user.id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setTasks(response.data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };
    fetchTasks();
  }, [user]);

  const updateTask = async (taskId, updates) => {
    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/tasks/${taskId}`, updates, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setTasks(tasks.map(t => t._id === taskId ? response.data : t));
      socket.emit('taskUpdate', response.data);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h2 className="text-3xl font-bold mb-6">Employee Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <div key={task._id} className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">{task.title}</h3>
            <p className="mb-4">{task.description}</p>
            <div className="flex flex-col space-y-2">
              <select
                value={task.status}
                onChange={(e) => updateTask(task._id, { status: e.target.value })}
                className="p-2 border border-gray-300 rounded-md"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <input
                type="date"
                defaultValue={task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : ''}
                onChange={(e) => updateTask(task._id, { deadline: e.target.value })}
                className="p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EmployeeDashboard;