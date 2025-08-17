import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

function ProjectList({ search }) {
  const [projects, setProjects] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/projects`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setProjects(response.data.filter(p => p.title.toLowerCase().includes(search.toLowerCase())));
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };
    fetchProjects();
  }, [search, user]);

  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold mb-4">Projects</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project._id} className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="text-lg font-semibold mb-2">{project.title}</h4>
            <p>{project.description}</p>
            <p className="text-sm text-gray-600">Manager: {project.manager.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProjectList;