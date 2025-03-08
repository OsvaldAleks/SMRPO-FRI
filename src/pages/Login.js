import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); 
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error.message);
    }
  };

  return (
    <div className="center--container">
      <div className="center--box">
        
        <form onSubmit={handleLogin}>
        <h1>
          Login
        </h1>

       <div className={"block--element"}>
         <label className={"block--element"}>
          Username
         </label>
            <Input
              className={"block--element"}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your username or email"
            />
       </div>


          <div className={"block--element"} >
          <label className={"block--element"}>
        Password
       </label>
            <Input
              className={"block--element"}
              type={showPassword ? "text" : "password"} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
            <span className={"checkbox-container"}>
              <Input
               className={"input--checkbox"}
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
              />
             
              Show Password
            
              
            </span>
          </div>
          <div className={"block--element"} >
          <Button variant="primery" type="submit">Login</Button>
          </div>
        </form>
      </div>
    </div>
   
  );
};


export default Login;
