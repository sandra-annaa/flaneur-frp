import { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api"; // Add this import

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      console.log("🔐 Attempting login...");
      
      const response = await api.login(email, password);
      console.log("✅ Login response:", response);
      
      if (response.success) {
        // Store tokens
        localStorage.setItem("token", response.tokens.access);
        localStorage.setItem("refreshToken", response.tokens.refresh);
        localStorage.setItem("userEmail", response.user.email);
        
        console.log("✅ Login successful! Tokens stored.");
        navigate("/dashboard");
      } else {
        alert(response.error || "Login failed");
      }
    } catch (error: any) {
      console.error("❌ Login error:", error);
      alert(error.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-content-center align-items-center h-screen">
      <Card title="Login" className="w-25">
        <div className="flex flex-column gap-3">
          <InputText
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Password
            placeholder="Password"
            feedback={false}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button 
            label="Login" 
            onClick={handleLogin} 
            loading={loading}
          />
          <Button
            label="Create new account"
            className="p-button-text"
            onClick={() => navigate("/signup")}
          />
        </div>
      </Card>
    </div>
  );
};

export default Login;