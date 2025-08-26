import type { Route } from "./+types/home";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "React + Flask App" },
    { name: "description", content: "Simple React frontend with Flask backend" },
  ];
}

export default function Home() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Welcome to React + Flask App</h1>
      <p>This is a simple React frontend with Flask backend.</p>
      
      <nav style={{ marginTop: "2rem" }}>
        <h2>Navigation</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li style={{ marginBottom: "1rem" }}>
            <Link to="/" style={{ color: "#007bff", textDecoration: "none" }}>
              🏠 Home
            </Link>
          </li>
          <li style={{ marginBottom: "1rem" }}>
            <Link to="/about" style={{ color: "#007bff", textDecoration: "none" }}>
              📖 About
            </Link>
          </li>
          <li style={{ marginBottom: "1rem" }}>
            <Link to="/api-demo" style={{ color: "#007bff", textDecoration: "none" }}>
              🔌 API Demo
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
