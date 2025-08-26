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
  Stack,
  useTheme,
  alpha,
  Chip,
  IconButton,
  Collapse
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import SendIcon from '@mui/icons-material/Send';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DataObjectIcon from '@mui/icons-material/DataObject';
import ApiIcon from '@mui/icons-material/Api';
import MemoryIcon from '@mui/icons-material/Memory';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';

const API_BASE = "http://localhost:5000/api";

export default function ApiDemo() {
  const theme = useTheme();
  const [helloData, setHelloData] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [echoMessage, setEchoMessage] = useState("");
  const [echoResponse, setEchoResponse] = useState<any>(null);
  const [statusData, setStatusData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [expandedCards, setExpandedCards] = useState<{ [key: string]: boolean }>({});

  const handleExpandClick = (cardId: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

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

  const apiEndpoints = [
    {
      id: 'status',
      method: 'GET',
      endpoint: '/api/status',
      title: 'SYSTEM STATUS',
      icon: <SignalCellularAltIcon />,
      description: 'Query system operational status',
      data: statusData,
      onFetch: fetchStatus,
      color: theme.palette.success.main,
    },
    {
      id: 'hello',
      method: 'GET',
      endpoint: '/api/hello',
      title: 'HELLO PROTOCOL',
      icon: <MemoryIcon />,
      description: 'Initialize communication handshake',
      data: helloData,
      onFetch: fetchHello,
      color: theme.palette.info.main,
    },
    {
      id: 'data',
      method: 'GET',
      endpoint: '/api/data',
      title: 'DATA STREAM',
      icon: <DataObjectIcon />,
      description: 'Retrieve user data matrix',
      data: userData,
      onFetch: fetchUsers,
      color: theme.palette.warning.main,
    },
    {
      id: 'echo',
      method: 'POST',
      endpoint: '/api/echo',
      title: 'ECHO CHAMBER',
      icon: <ApiIcon />,
      description: 'Bidirectional data transmission',
      data: echoResponse,
      onFetch: sendEcho,
      color: theme.palette.secondary.main,
      hasInput: true,
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: 8,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(ellipse at center, ${alpha(theme.palette.primary.dark, 0.1)}, transparent)`,
          pointerEvents: 'none',
        }
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography 
            variant="h2" 
            sx={{ 
              mb: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            API TERMINAL
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, letterSpacing: 3 }}>
            [ BACKEND INTERFACE ] [ REST PROTOCOL ACTIVE ]
          </Typography>
        </Box>

        {/* API Endpoints Grid - 2x2 Symmetric Layout */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 4,
            mb: 8,
          }}
        >
          {apiEndpoints.map((api) => (
            <Card
              key={api.id}
              elevation={3}
              sx={{
                position: 'relative',
                overflow: 'visible',
                border: `2px solid ${alpha(api.color, 0.5)}`,
                background: alpha(theme.palette.background.paper, 0.9),
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  borderColor: api.color,
                  '&::before': {
                    opacity: 1,
                  }
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: -2,
                  left: -2,
                  right: -2,
                  bottom: -2,
                  background: `linear-gradient(45deg, ${alpha(api.color, 0.3)}, transparent)`,
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  zIndex: -1,
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '3px',
                  background: `linear-gradient(90deg, transparent, ${api.color}, transparent)`,
                  animation: 'pulse 3s ease-in-out infinite',
                }
              }}
            >
              <CardContent sx={{ pb: 0 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                      <Box sx={{ color: api.color }}>
                        {api.icon}
                      </Box>
                      <Typography variant="h5" sx={{ 
                        fontWeight: 700,
                        letterSpacing: 1,
                        color: theme.palette.text.primary,
                      }}>
                        {api.title}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ 
                      color: theme.palette.text.secondary,
                      mb: 1,
                    }}>
                      {api.description}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Chip 
                        label={api.method} 
                        size="small"
                        sx={{
                          backgroundColor: alpha(api.color, 0.2),
                          color: api.color,
                          border: `1px solid ${api.color}`,
                          fontWeight: 700,
                        }}
                      />
                      <Typography variant="caption" sx={{ 
                        color: theme.palette.text.secondary,
                        fontFamily: 'monospace',
                        display: 'flex',
                        alignItems: 'center',
                      }}>
                        {api.endpoint}
                      </Typography>
                    </Stack>
                  </Box>
                  <IconButton
                    onClick={() => handleExpandClick(api.id)}
                    sx={{
                      transform: expandedCards[api.id] ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s',
                      color: api.color,
                    }}
                  >
                    <ExpandMoreIcon />
                  </IconButton>
                </Stack>

                {api.hasInput && (
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      value={echoMessage}
                      onChange={(e) => setEchoMessage(e.target.value)}
                      placeholder="ENTER TRANSMISSION DATA..."
                      variant="outlined"
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          fontFamily: 'monospace',
                        }
                      }}
                    />
                  </Box>
                )}

                <Collapse in={expandedCards[api.id]} timeout="auto" unmountOnExit>
                  <Box sx={{ mt: 2 }}>
                    {api.data?.error ? (
                      <Alert 
                        severity="error" 
                        sx={{ 
                          borderRadius: 0,
                          border: `1px solid ${theme.palette.error.main}`,
                        }}
                      >
                        {api.data.error}
                      </Alert>
                    ) : api.data ? (
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 2, 
                          backgroundColor: alpha(theme.palette.background.default, 0.5),
                          border: `1px solid ${alpha(api.color, 0.3)}`,
                          borderRadius: 0,
                        }}
                      >
                        <Typography variant="caption" sx={{ 
                          color: api.color,
                          fontWeight: 700,
                          letterSpacing: 1,
                        }}>
                          RESPONSE DATA:
                        </Typography>
                        <pre style={{ 
                          margin: '8px 0 0 0', 
                          fontSize: '12px',
                          color: theme.palette.text.primary,
                          fontFamily: 'monospace',
                          overflow: 'auto',
                        }}>
                          {JSON.stringify(api.data, null, 2)}
                        </pre>
                      </Paper>
                    ) : (
                      <Typography variant="body2" sx={{ 
                        color: theme.palette.text.secondary,
                        fontStyle: 'italic',
                      }}>
                        No data available. Execute query to retrieve data.
                      </Typography>
                    )}
                  </Box>
                </Collapse>
              </CardContent>

              <CardActions sx={{ justifyContent: 'center', py: 2 }}>
                <Button 
                  onClick={api.onFetch} 
                  disabled={loading || (api.hasInput && !echoMessage)}
                  startIcon={loading ? <CircularProgress size={20} /> : api.hasInput ? <SendIcon /> : <CloudDownloadIcon />}
                  variant="contained"
                  sx={{
                    backgroundColor: alpha(api.color, 0.1),
                    color: api.color,
                    border: `1px solid ${api.color}`,
                    '&:hover': {
                      backgroundColor: alpha(api.color, 0.2),
                      borderColor: api.color,
                    },
                    '&:disabled': {
                      borderColor: alpha(api.color, 0.3),
                    }
                  }}
                >
                  {api.hasInput ? 'TRANSMIT' : 'EXECUTE'}
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>

        {/* Status Bar */}
        <Paper
          elevation={2}
          sx={{
            p: 3,
            mb: 6,
            background: alpha(theme.palette.background.paper, 0.5),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
            textAlign: 'center',
          }}
        >
          <Stack direction="row" spacing={4} justifyContent="center" alignItems="center" flexWrap="wrap">
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%',
                backgroundColor: theme.palette.success.main,
                animation: 'pulse 2s ease-in-out infinite',
              }} />
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                SERVER: ONLINE
              </Typography>
            </Stack>
            
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%',
                backgroundColor: theme.palette.info.main,
                animation: 'pulse 2s ease-in-out infinite',
                animationDelay: '0.5s',
              }} />
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                CORS: ENABLED
              </Typography>
            </Stack>
            
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%',
                backgroundColor: theme.palette.warning.main,
                animation: 'pulse 2s ease-in-out infinite',
                animationDelay: '1s',
              }} />
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                PORT: 5000
              </Typography>
            </Stack>
          </Stack>
        </Paper>

        {/* Navigation */}
        <Box sx={{ textAlign: 'center' }}>
          <Button 
            component={Link} 
            to="/" 
            variant="contained" 
            startIcon={<ArrowBackIcon />}
            size="large"
            sx={{
              px: 4,
              py: 1.5,
              letterSpacing: 2,
              fontWeight: 700,
            }}
          >
            EXIT TERMINAL
          </Button>
        </Box>
      </Container>
    </Box>
  );
}