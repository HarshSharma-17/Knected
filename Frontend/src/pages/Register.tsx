import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";

const Register = () => {

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);


  const handleSignup = async () => {

    if (!name || !email || !password || !confirmPassword) {
      alert("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {

      setLoading(true);

      const result = await registerUser(
        name,
        email,
        password
      );

      if (result.success) {

        alert("Account created successfully!");

        navigate("/login");

      } else {

        alert(result.message || "Registration failed");

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
    <h1>Register</h1>

    <input
      type="text"
      placeholder="Name"
      value={name}
      onChange={(e) => setName(e.target.value)}
    />

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

    <input
      type="password"
      placeholder="Confirm Password"
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
    />

    <button onClick={handleSignup} disabled={loading}>
      {loading ? "Creating..." : "Register"}
    </button>
  </div>
);
};

export default Register;