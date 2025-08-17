import React, { useState, useEffect, useContext } from 'react';
import ProjectForm from '../Project/ProjectForm.jsx';
import ProjectList from '../Project/ProjectList.jsx';

import TaskList from '../Task/TaskList.jsx';

import { SocketContext } from '../../context/SocketContext.jsx';
import TaskForm from '../Task/TaskFrom.jsx';
import Notification from '../Notification.jsx';

function ManagerDashboard() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ status: '', priority: '', employee: '' });
  const { socket } = useContext(SocketContext);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (socket) {
      socket.on('taskUpdated', (task) => {
        setNotifications((prev) => [...prev, `Task ${task.title} updated to ${task.status}`]);
      });
    }
    return () => socket && socket.off('taskUpdated');
  }, [socket]);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h2 className="text-3xl font-bold mb-6">Manager Dashboard</h2>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search projects/tasks..."
        className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <select
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select
          onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
          className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <ProjectForm />
      <ProjectList search={search} />
      <TaskForm/>
      <TaskList search={search} filter={filter} />
      <Notification notifications={notifications} />
    </div>
  );
}

export default ManagerDashboard;