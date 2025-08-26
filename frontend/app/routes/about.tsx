import { Link } from "react-router";
import { 
  Container, 
  Typography, 
  Paper, 
  Box,
  Stack,
  Button,
  Divider,
  useTheme,
  alpha,
  Chip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StorageIcon from '@mui/icons-material/Storage';
import ApiIcon from '@mui/icons-material/Api';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShieldIcon from '@mui/icons-material/Shield';
import SpeedIcon from '@mui/icons-material/Speed';
import CodeIcon from '@mui/icons-material/Code';

export default function About() {
  const theme = useTheme();
  
  const systemFeatures = [
    {
      icon: <DashboardIcon sx={{ fontSize: 30 }} />,
      title: "NEURAL INTERFACE",
      description: "Advanced React v19.1.0 quantum processing unit",
      status: "ACTIVE",
      metrics: ["99.9% Uptime", "< 10ms Response"]
    },
    {
      icon: <StorageIcon sx={{ fontSize: 30 }} />,
      title: "DATA MATRIX",
      description: "Flask-powered backend with CORS-enabled API gateway",
      status: "ONLINE",
      metrics: ["RESTful", "JSON Protocol"]
    },
    {
      icon: <ShieldIcon sx={{ fontSize: 30 }} />,
      title: "SECURITY PROTOCOL",
      description: "Material-UI enhanced cyber defense system",
      status: "ARMED",
      metrics: ["AES-256", "SSL/TLS"]
    },
  ];

  const techStack = [
    { name: "REACT", version: "19.1.0", status: "operational" },
    { name: "MATERIAL-UI", version: "7.3.1", status: "operational" },
    { name: "FLASK", version: "3.0.0", status: "operational" },
    { name: "TYPESCRIPT", version: "5.8.3", status: "operational" },
    { name: "VITE", version: "6.3.3", status: "operational" },
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
          background: `linear-gradient(180deg, 
            ${alpha(theme.palette.primary.dark, 0.1)} 0%, 
            transparent 50%,
            ${alpha(theme.palette.secondary.dark, 0.1)} 100%)`,
          pointerEvents: 'none',
        }
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography 
            variant="h2" 
            sx={{ 
              mb: 2,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              textShadow: `0 0 40px ${alpha(theme.palette.primary.main, 0.5)}`,
            }}
          >
            SYSTEM ARCHITECTURE
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, letterSpacing: 3 }}>
            [ CLASSIFIED INFORMATION ] [ LEVEL 5 CLEARANCE ]
          </Typography>
        </Box>

        {/* System Features Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 3,
            mb: 6,
          }}
        >
          {systemFeatures.map((feature, index) => (
            <Paper
              key={index}
              elevation={3}
              sx={{
                p: 3,
                position: 'relative',
                overflow: 'hidden',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: `linear-gradient(90deg, 
                    transparent, 
                    ${theme.palette.primary.main}, 
                    ${theme.palette.secondary.main},
                    transparent)`,
                  animation: 'pulse 3s ease-in-out infinite',
                }
              }}
            >
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ color: theme.palette.primary.main }}>
                    {feature.icon}
                  </Box>
                  <Chip 
                    label={feature.status} 
                    size="small"
                    sx={{
                      backgroundColor: alpha(theme.palette.success.main, 0.2),
                      color: theme.palette.success.light,
                      border: `1px solid ${theme.palette.success.main}`,
                      fontWeight: 700,
                      letterSpacing: 1,
                    }}
                  />
                </Box>
                
                <Typography variant="h6" sx={{ 
                  color: theme.palette.text.primary,
                  fontWeight: 700,
                  letterSpacing: 1,
                }}>
                  {feature.title}
                </Typography>
                
                <Typography variant="body2" sx={{ 
                  color: theme.palette.text.secondary,
                  lineHeight: 1.6,
                }}>
                  {feature.description}
                </Typography>
                
                <Stack direction="row" spacing={1}>
                  {feature.metrics.map((metric, idx) => (
                    <Typography
                      key={idx}
                      variant="caption"
                      sx={{
                        px: 1,
                        py: 0.5,
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                        borderRadius: 0,
                        color: theme.palette.primary.light,
                        fontFamily: 'monospace',
                      }}
                    >
                      {metric}
                    </Typography>
                  ))}
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Box>

        {/* Tech Stack Matrix */}
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mb: 6,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Typography variant="h5" sx={{ 
            mb: 3,
            color: theme.palette.primary.main,
            fontWeight: 700,
            letterSpacing: 2,
            textAlign: 'center',
          }}>
            TECHNOLOGY MATRIX
          </Typography>
          
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 2,
            }}
          >
            {techStack.map((tech, index) => (
              <Box
                key={index}
                sx={{
                  p: 2,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.5)}`,
                  background: alpha(theme.palette.background.paper, 0.5),
                  position: 'relative',
                  '&:hover': {
                    background: alpha(theme.palette.primary.main, 0.05),
                    borderColor: theme.palette.primary.light,
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle2" sx={{ 
                      color: theme.palette.text.primary,
                      fontWeight: 700,
                      letterSpacing: 1,
                    }}>
                      {tech.name}
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      color: theme.palette.text.secondary,
                      fontFamily: 'monospace',
                    }}>
                      v{tech.version}
                    </Typography>
                  </Box>
                  <CheckCircleIcon sx={{ 
                    color: theme.palette.success.main,
                    fontSize: 20,
                  }} />
                </Stack>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* System Status */}
        <Paper
          elevation={2}
          sx={{
            p: 4,
            mb: 6,
            background: `linear-gradient(135deg, 
              ${alpha(theme.palette.background.paper, 0.9)}, 
              ${alpha(theme.palette.primary.dark, 0.1)})`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
            textAlign: 'center',
          }}
        >
          <Stack spacing={3}>
            <Typography variant="h5" sx={{ 
              color: theme.palette.primary.main,
              fontWeight: 700,
              letterSpacing: 2,
            }}>
              SYSTEM STATUS
            </Typography>
            
            <Stack direction="row" spacing={4} justifyContent="center" flexWrap="wrap">
              <Stack alignItems="center" spacing={1}>
                <SpeedIcon sx={{ color: theme.palette.success.main, fontSize: 30 }} />
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  PERFORMANCE
                </Typography>
                <Typography variant="h6" sx={{ color: theme.palette.success.light, fontFamily: 'monospace' }}>
                  OPTIMAL
                </Typography>
              </Stack>
              
              <Divider orientation="vertical" flexItem sx={{ borderColor: alpha(theme.palette.primary.main, 0.3) }} />
              
              <Stack alignItems="center" spacing={1}>
                <ApiIcon sx={{ color: theme.palette.success.main, fontSize: 30 }} />
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  API STATUS
                </Typography>
                <Typography variant="h6" sx={{ color: theme.palette.success.light, fontFamily: 'monospace' }}>
                  CONNECTED
                </Typography>
              </Stack>
              
              <Divider orientation="vertical" flexItem sx={{ borderColor: alpha(theme.palette.primary.main, 0.3) }} />
              
              <Stack alignItems="center" spacing={1}>
                <CodeIcon sx={{ color: theme.palette.success.main, fontSize: 30 }} />
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  BUILD STATUS
                </Typography>
                <Typography variant="h6" sx={{ color: theme.palette.success.light, fontFamily: 'monospace' }}>
                  COMPILED
                </Typography>
              </Stack>
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
            RETURN TO MAINFRAME
          </Button>
        </Box>
      </Container>
    </Box>
  );
}