import { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/signup/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error();

      alert("Signup successful! Please login.");
      navigate("/login");
    } catch {
      alert("Signup failed");
    }
  };

  return (
    <div className="flex justify-content-center align-items-center h-screen">
      <Card title="Create Account" className="w-25">
        <div className="flex flex-column gap-3">
          <InputText
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Password
            placeholder="Password"
            feedback={true}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Password
            placeholder="Confirm Password"
            feedback={false}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button label="Sign Up" onClick={handleSignup} />
        </div>
      </Card>
    </div>
  );
}
