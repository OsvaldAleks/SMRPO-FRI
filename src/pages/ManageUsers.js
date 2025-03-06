import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUsers } from "../api";  // Import the getAllUsers function

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        if (!data.error) {
          setUsers(data);
        } else {
          console.error('Error fetching users:', data.message);
        }
        setLoading(false);
      } catch (error) {
        console.error('Network error:', error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div>
      <h1>Manage Users</h1>
      <Link to="/addUser">+</Link>

      {/* Conditional rendering based on loading state */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {users.length > 0 ? (
            users.map((user) => (
              <li key={user.id}>{user.name} ({user.email})</li>
            ))
          ) : (
            <p>No users found</p>
          )}
        </ul>
      )}
    </div>
  );
};

export default ManageUsers;
