import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { getUsers } from "../api";
import { FaEdit, FaTrash } from "react-icons/fa";
import AddUserForm from '../pages/AddUserForm';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

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

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = () => {

  }

  return (
    <>
      {isEditing ?
      (
        <AddUserForm
          account={selectedUser}
          exit={()=>{setIsEditing(false);fetchUsers();}}
        />
      ):
      (
        <div className="center--box">
        <h1>Manage Users</h1>
      
      {/* Add User Button */}
      <Link to="/addUser" style={{ textDecoration: 'none', color: 'inherit' }}>
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
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id}>
                    <td><div className={user.status=='online' 
                      ? 'activeStatus'
                      : 'offlineStatus'}></div></td>
                    <td>{user.username}</td>
                    <td>{user.name}</td>
                    <td>{user.surname}</td>
                    <td>{user.email}</td>
                    <td><FaEdit 
                    onClick = {() => {
                      setSelectedUser(user);
                      setIsEditing(true);
                    }}
                    ></FaEdit></td>
                    <td><FaTrash
                      className="p--alert"
                      onClick = {() => {
                        handleDelete(user);
                      }}
                    /></td>
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
    )}
    </>
  );
};

export default ManageUsers;
