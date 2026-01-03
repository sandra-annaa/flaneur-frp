import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
export default function AuthHome() {
  const navigate = useNavigate();
useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, []);
  return (
    <div className="flex justify-content-center align-items-center h-screen">
      <Card title="Welcome to Flâneur" className="w-25 text-center">
        <p className="mb-4 text-gray-600">
          Plan smarter trips with ease
        </p>

        <div className="flex flex-column gap-3">
          <Button
            label="Login"
            icon="pi pi-sign-in"
            onClick={() => navigate("/login")}
          />

          <Button
            label="Sign Up"
            icon="pi pi-user-plus"
            severity="secondary"
            onClick={() => navigate("/signup")}
          />
        </div>
      </Card>
    </div>
  );
}
