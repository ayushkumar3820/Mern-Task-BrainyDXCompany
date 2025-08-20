// client/src/components/ProjectForm.jsx
import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

function ProjectForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { user } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Build payload WITHOUT employees key
      const payload = {
        title,
        description,
        // manager will be taken from req.user on backend (auth middleware)
        employees: [user.id || user._id], // use whichever field you have in user
      };

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/projects`,
        payload,
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );

      // reset inputs
      setTitle("");
      setDescription("");
      alert("Project created");
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Error creating project. Check console or server logs.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h3 className="text-xl font-bold mb-4">Create Project</h3>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Project Title"
          className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
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

export default ProjectForm;
