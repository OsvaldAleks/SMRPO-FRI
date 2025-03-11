import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { getUsers } from "../api";

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
      } catch (error) {
        console.error('Network error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="center--box">
      <h1>Manage Users</h1>
      
      {/* Add User Button */}
      <Link to="/addUser">
        <Button className="">Add User</Button>
      </Link>

      {/* Loading or table display */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="responsive-table-container">
          <table className="responsive-table">
            <thead>
              <tr>
                <th></th>
                <th>Username</th>
                <th>Name</th>
                <th>Last name</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id}>
                    <td><div className={user.status=='Active' 
                      ? 'activeStatus'
                      : 'offlineStatus'}></div></td>
                    <td>{user.username}</td>
                    <td>{user.name}</td>
                    <td>{user.surname}</td>
                    <td>{user.email}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
