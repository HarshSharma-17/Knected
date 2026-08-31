import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";

const Login = () => {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {

      setLoading(true);

      const result = await loginUser(email, password);

      if (result.success) {

        localStorage.setItem("token", result.token);

        alert("Login successful!");

        navigate("/dashboard");

      } else {

        alert(result.message || "Login failed");

      }

    } catch {
  alert("Something went wrong. Please try again.");
}
 finally {

      setLoading(false);

    }
  };


  return (
  <div>
    <h1>Login</h1>

    <input
      type="email"
      placeholder="Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />

    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />

    <button onClick={handleLogin} disabled={loading}>
      {loading ? "Logging in..." : "Login"}
    </button>
  </div>
);
};

export default Login;