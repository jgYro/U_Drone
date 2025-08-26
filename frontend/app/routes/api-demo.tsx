import { useState, useEffect } from "react";
import { Link } from "react-router";
import { 
  Container, 
  Typography, 
  Paper, 
  Button, 
  TextField, 
  Box, 
  Card, 
  CardContent, 
  CardActions,
  Alert,
  CircularProgress,
  Stack
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import SendIcon from '@mui/icons-material/Send';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';

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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom color="primary">
          API Demo
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Interact with the Flask backend API endpoints
        </Typography>
      </Paper>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
        <Box>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom color="primary">
                API Status
              </Typography>
              {statusData?.error ? (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {statusData.error}
                </Alert>
              ) : statusData ? (
                <Paper variant="outlined" sx={{ p: 2, mt: 2, backgroundColor: '#f5f5f5' }}>
                  <pre style={{ margin: 0, fontSize: '14px' }}>
                    {JSON.stringify(statusData, null, 2)}
                  </pre>
                </Paper>
              ) : null}
            </CardContent>
            <CardActions>
              <Button 
                onClick={fetchStatus} 
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
                variant="contained"
              >
                Refresh Status
              </Button>
            </CardActions>
          </Card>
        </Box>

        <Box>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom color="primary">
                GET /api/hello
              </Typography>
              {helloData?.error ? (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {helloData.error}
                </Alert>
              ) : helloData ? (
                <Paper variant="outlined" sx={{ p: 2, mt: 2, backgroundColor: '#f5f5f5' }}>
                  <pre style={{ margin: 0, fontSize: '14px' }}>
                    {JSON.stringify(helloData, null, 2)}
                  </pre>
                </Paper>
              ) : null}
            </CardContent>
            <CardActions>
              <Button 
                onClick={fetchHello} 
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <CloudDownloadIcon />}
                variant="contained"
              >
                Fetch Hello Message
              </Button>
            </CardActions>
          </Card>
        </Box>

        <Box>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom color="primary">
                GET /api/data
              </Typography>
              {userData?.error ? (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {userData.error}
                </Alert>
              ) : userData ? (
                <Paper variant="outlined" sx={{ p: 2, mt: 2, backgroundColor: '#f5f5f5' }}>
                  <pre style={{ margin: 0, fontSize: '14px' }}>
                    {JSON.stringify(userData, null, 2)}
                  </pre>
                </Paper>
              ) : null}
            </CardContent>
            <CardActions>
              <Button 
                onClick={fetchUsers} 
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <CloudDownloadIcon />}
                variant="contained"
              >
                Fetch User Data
              </Button>
            </CardActions>
          </Card>
        </Box>

        <Box>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom color="primary">
                POST /api/echo
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <TextField
                  fullWidth
                  value={echoMessage}
                  onChange={(e) => setEchoMessage(e.target.value)}
                  placeholder="Enter message to echo"
                  variant="outlined"
                  size="small"
                />
                <Button 
                  onClick={sendEcho} 
                  disabled={loading || !echoMessage}
                  startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                  variant="contained"
                >
                  Send
                </Button>
              </Box>
              {echoResponse?.error ? (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {echoResponse.error}
                </Alert>
              ) : echoResponse ? (
                <Paper variant="outlined" sx={{ p: 2, mt: 2, backgroundColor: '#f5f5f5' }}>
                  <pre style={{ margin: 0, fontSize: '14px' }}>
                    {JSON.stringify(echoResponse, null, 2)}
                  </pre>
                </Paper>
              ) : null}
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Button 
          component={Link} 
          to="/" 
          variant="contained" 
          startIcon={<ArrowBackIcon />}
        >
          Back to Home
        </Button>
      </Box>
    </Container>
  );
}