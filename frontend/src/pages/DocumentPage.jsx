import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStudent } from "../context/StudentContext";
import DocumentOrganizer from "../components/DocumentOrganizer";

export default function DocumentPage() {
  const { student } = useStudent();
  const navigate = useNavigate();

  useEffect(() => {
    if (!student?.isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [navigate, student?.isAuthenticated]);

  if (!student?.isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        <DocumentOrganizer />
      </div>
    </div>
  );
}