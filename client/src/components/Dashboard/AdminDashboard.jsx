import React, { useState } from 'react';
import ProjectList from '../Project/ProjectList.jsx';
import TaskList from '../Task/TaskList.jsx';
import Notification from '../Notification.jsx';

function AdminDashboard() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ status: '', priority: '', employee: '' });

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h2 className="text-3xl font-bold mb-6">Admin Dashboard</h2>

      {/* 🔍 Search Bar */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search projects/tasks..."
        className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* 🔽 Filters */}
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

      {/* 📊 Projects Table */}
      <h3 className="text-2xl font-semibold mb-4">Projects</h3>
      <ProjectList search={search} />

      {/* 📊 Tasks Table */}
      <h3 className="text-2xl font-semibold mt-8 mb-4">Tasks</h3>
      <TaskList search={search} filter={filter} />

      {/* 🔔 Notifications */}
      <Notification />
    </div>
  );
}

export default AdminDashboard;
