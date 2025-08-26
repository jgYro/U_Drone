import { Link } from "react-router";

export default function About() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>About This Application</h1>
      <p>This is a simple full-stack application demonstrating:</p>
      <ul>
        <li>React frontend with React Router for navigation</li>
        <li>Flask backend API with CORS support</li>
        <li>API integration between frontend and backend</li>
      </ul>
      
      <div style={{ marginTop: "2rem" }}>
        <Link to="/" style={{ color: "#007bff", textDecoration: "none" }}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}