import { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    // TEMP login logic (replace with API later)
    if (email === "admin@gmail.com" && password === "1234") {
      localStorage.setItem("token", "dummy-token");
navigate("/dashboard");

    } else {
      alert("Invalid credentials");
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
          <Button label="Login" onClick={handleLogin} />
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
