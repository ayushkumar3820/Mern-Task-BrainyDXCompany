import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

function ProjectList({ search }) {
  const [projects, setProjects] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user || !user.token) {
        console.warn("No user token found. Redirect to login maybe?");
        return;
      }

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/projects`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );

        // ✅ make sure response is an array
        const projectData = Array.isArray(response.data) ? response.data : [];
        setProjects(
          projectData.filter((p) =>
            p.title.toLowerCase().includes(search.toLowerCase())
          )
        );
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, [search, user]);

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
              <th className="border p-2">Manager</th>
            </tr>
          </thead>
          <tbody>
            {projects.length > 0 ? (
              projects.map((project, index) => (
                <tr key={project._id} className="hover:bg-gray-50">
                  <td className="border p-2">{index + 1}</td>
                  <td className="border p-2 font-medium">{project.title}</td>
                  <td className="border p-2">{project.description}</td>
                  <td className="border p-2">
                    {project.manager?.name || "Unknown"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center p-4">
                  No projects found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProjectList;
