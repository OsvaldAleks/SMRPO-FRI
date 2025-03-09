import React, { useState } from "react";
import { registerUser } from "../api"; // Import API function
import { useNavigate } from 'react-router-dom';
import Button from "../components/Button";
import Input from "../components/Input";


const AddUserForm = () => {
  const [user, setUser] = useState({
    name: "",
    surname: "",
    email: "",
    username: "",
    password: "",
    role: "User", 
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend validation
    if (!user.name || !user.surname || !user.email || !user.username || !user.password) {
      setError("All fields are required");
      return;
    }
    console.log("User Added:", user);
    setUser({
      firstName: "",
      secondName: "",
      email: "",
      userName: "",
      password: "",
      role: "User", // Reset to default after submission
    });
    setError("");
  };
  const navigate = useNavigate();

  const goBackHandler = () => {
    navigate(-1); // This will navigate back to the previous page
  };


  return (

    <div className="center--container">
      <div className="center--box wide--box">

     <Button variant="goback" onClick={goBackHandler} />

          <h1>Add New User</h1>
        {error && <p className="p--alert">{error}</p>}

        <form onSubmit={handleSubmit}>

          <div className={"block--element"}>
           <label className={"block--element"}>
            Username
           </label>
          <Input
          className={"block--element"}
            type="text"
            name="userName"
            placeholder="Enter Username"
            value={user.userName}
            onChange={handleChange}
          />
          </div>
          <div className={"block--element"}>
           <label className={"block--element"}>
            Email
           </label>
           <Input
           className={"block--element"}
            type="email"
            name="email"
            placeholder="Enter Email"
            value={user.email}
            onChange={handleChange}
          />
          </div>
          <div className={"block--element grid"}>
            <div className="grid--leftdiv">
             <label className={"block--element"}>
             First Name
             </label>
            <Input
              className={"block--element"}
              type="text"
              name="firstName"
              placeholder="Enter First Name"
              value={user.firstName}
              onChange={handleChange}
            />
             </div>
             <div className="grid--rightdiv">
             <label className={"block--element"}>
             Second Name
             </label>
            <Input
            className={"block--element"}
              type="text"
              name="secondName"
              placeholder="Enter Second Name"
              value={user.secondName}
              onChange={handleChange}
            />
            </div>
          </div>


           <div className={"block--element"}>
           <label className={"block--element"}>
           Password
           </label>
          <Input
          className={"block--element"}
            type="password"
            name="password"
            placeholder="Enter Password"
            value={user.password}
            onChange={handleChange}
          />
         </div>
         <div className="block--element">
           
           <label className={"block--element"}>
              Role
               </label>
            <span className={"checkbox-container"}>
                <Input
                 className={"input--checkbox"}
                type="checkbox"
                name="role"
                checked={user.role === "Admin"}
                onChange={handleChange}
              />
              Register as Admin
           
           </span>
            <p className="p--note">Default role is <strong>User</strong></p>
         </div>

          
          <Button className={"btn--block"} variant={"primery"} type="submit">Add User</Button>
        </form>
      </div>
    </div>
  );
};

export default AddUserForm;
