import { useState, useEffect } from "react";
import { Link } from "react-router";

const API_BASE = "http://localhost:5000/api";

export default function ApiDemo() {
  const [helloData, setHelloData] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [echoMessage, setEchoMessage] = useState("");
  const [echoResponse, setEchoResponse] = useState<any>(null);
  const [statusData, setStatusData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchHello = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/hello`);
      const data = await response.json();
      setHelloData(data);
    } catch (error) {
      console.error("Error fetching hello:", error);
      setHelloData({ error: "Failed to fetch" });
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/data`);
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUserData({ error: "Failed to fetch" });
    }
    setLoading(false);
  };

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/status`);
      const data = await response.json();
      setStatusData(data);
    } catch (error) {
      console.error("Error fetching status:", error);
      setStatusData({ error: "Failed to fetch" });
    }
    setLoading(false);
  };

  const sendEcho = async () => {
    if (!echoMessage) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/echo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: echoMessage }),
      });
      const data = await response.json();
      setEchoResponse(data);
    } catch (error) {
      console.error("Error sending echo:", error);
      setEchoResponse({ error: "Failed to send" });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>API Demo</h1>
      <p>Interact with the Flask backend API endpoints:</p>

      <div style={{ marginTop: "2rem", border: "1px solid #ddd", padding: "1rem", borderRadius: "4px" }}>
        <h2>API Status</h2>
        <button onClick={fetchStatus} disabled={loading}>
          Refresh Status
        </button>
        {statusData && (
          <pre style={{ backgroundColor: "#f4f4f4", padding: "1rem", marginTop: "1rem" }}>
            {JSON.stringify(statusData, null, 2)}
          </pre>
        )}
      </div>

      <div style={{ marginTop: "2rem", border: "1px solid #ddd", padding: "1rem", borderRadius: "4px" }}>
        <h2>GET /api/hello</h2>
        <button onClick={fetchHello} disabled={loading}>
          Fetch Hello Message
        </button>
        {helloData && (
          <pre style={{ backgroundColor: "#f4f4f4", padding: "1rem", marginTop: "1rem" }}>
            {JSON.stringify(helloData, null, 2)}
          </pre>
        )}
      </div>

      <div style={{ marginTop: "2rem", border: "1px solid #ddd", padding: "1rem", borderRadius: "4px" }}>
        <h2>GET /api/data</h2>
        <button onClick={fetchUsers} disabled={loading}>
          Fetch User Data
        </button>
        {userData && (
          <pre style={{ backgroundColor: "#f4f4f4", padding: "1rem", marginTop: "1rem" }}>
            {JSON.stringify(userData, null, 2)}
          </pre>
        )}
      </div>

      <div style={{ marginTop: "2rem", border: "1px solid #ddd", padding: "1rem", borderRadius: "4px" }}>
        <h2>POST /api/echo</h2>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <input
            type="text"
            value={echoMessage}
            onChange={(e) => setEchoMessage(e.target.value)}
            placeholder="Enter message to echo"
            style={{ padding: "0.5rem", flex: 1 }}
          />
          <button onClick={sendEcho} disabled={loading || !echoMessage}>
            Send Echo
          </button>
        </div>
        {echoResponse && (
          <pre style={{ backgroundColor: "#f4f4f4", padding: "1rem", marginTop: "1rem" }}>
            {JSON.stringify(echoResponse, null, 2)}
          </pre>
        )}
      </div>

      <div style={{ marginTop: "2rem" }}>
        <Link to="/" style={{ color: "#007bff", textDecoration: "none" }}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}