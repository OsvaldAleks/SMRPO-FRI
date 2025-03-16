import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";
import { formatDate } from "../utils/storyUtils";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); 
  const [error, setError] = useState(null);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate("/");
    } catch (error) {
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="center--container">
      <div className="center--box">
        <form onSubmit={handleLogin}>
          <h1>Login</h1>

          <div className={"block--element"}>
            <label className={"block--element"}>Username</label>
            <Input
              className={"block--element"}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your username or email"
            />
          </div>

          <div className={"block--element"}>
            <label className={"block--element"}>Password</label>
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

          {error && <p className="p--alert">{error}</p>}

          <div className={"block--element"}>
            <Button className="btn--block" variant="primery" type="submit">Login</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;