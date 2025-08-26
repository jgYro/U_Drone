import type { Route } from "./+types/home";
import { Link } from "react-router";
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Button,
  Stack,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CodeIcon from '@mui/icons-material/Code';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import TerminalIcon from '@mui/icons-material/Terminal';
import WebIcon from '@mui/icons-material/Web';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "CYBER SYSTEM | Neural Interface" },
    { name: "description", content: "Advanced Cyber Interface System" },
  ];
}

export default function Home() {
  const theme = useTheme();
  
  const navItems = [
    { 
      icon: <TerminalIcon sx={{ fontSize: 40 }} />, 
      label: "SYSTEM HOME", 
      sublabel: "MAIN HUB",
      path: "/",
      primary: true
    },
    { 
      icon: <LocalFireDepartmentIcon sx={{ fontSize: 40 }} />, 
      label: "FIRE TRACKING", 
      sublabel: "UKRAINE MONITORING",
      path: "/ukraine-fire-tracking",
      primary: false
    },
    { 
      icon: <AnalyticsIcon sx={{ fontSize: 40 }} />, 
      label: "DATA ANALYTICS", 
      sublabel: "THREAT ANALYSIS",
      path: "/data",
      primary: false
    },
    { 
      icon: <SecurityIcon sx={{ fontSize: 40 }} />, 
      label: "ABOUT MATRIX", 
      sublabel: "SYSTEM INFO",
      path: "/about",
      primary: false
    },
    { 
      icon: <CloudQueueIcon sx={{ fontSize: 40 }} />, 
      label: "API TERMINAL", 
      sublabel: "DATA STREAM",
      path: "/api-demo",
      primary: false
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '200%',
          height: '200%',
          background: `radial-gradient(circle at center, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 70%)`,
          animation: 'pulse 4s ease-in-out infinite',
        },
      }}
    >
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography 
            variant="h1" 
            sx={{ 
              mb: 2,
              fontSize: { xs: '2rem', md: '4rem' },
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              position: 'relative',
              '&::after': {
                content: '"CYBER SYSTEM"',
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100%',
                color: theme.palette.primary.main,
                opacity: 0.2,
                filter: 'blur(3px)',
                zIndex: -1,
              }
            }}
          >
            CYBER SYSTEM
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
            <Box sx={{ 
              width: 100, 
              height: 2, 
              background: `linear-gradient(90deg, transparent, ${theme.palette.primary.main}, transparent)` 
            }} />
            <Typography variant="h6" sx={{ color: theme.palette.primary.light }}>
              NEURAL INTERFACE v2.0
            </Typography>
            <Box sx={{ 
              width: 100, 
              height: 2, 
              background: `linear-gradient(90deg, transparent, ${theme.palette.primary.main}, transparent)` 
            }} />
          </Box>
          
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, letterSpacing: 2 }}>
            [ SYSTEM ONLINE ] [ FULL ACCESS GRANTED ]
          </Typography>
        </Box>

        {/* Main Grid - Symmetric Layout */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 3,
            mb: 8,
          }}
        >
          {navItems.map((item, index) => (
            <Paper
              key={index}
              elevation={3}
              sx={{
                p: 4,
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: `2px solid ${item.primary ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.3)}`,
                background: item.primary 
                  ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.2)}, ${alpha(theme.palette.background.paper, 0.9)})`
                  : theme.palette.background.paper,
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  border: `2px solid ${theme.palette.primary.light}`,
                  '& .nav-icon': {
                    transform: 'rotateY(180deg)',
                    color: theme.palette.primary.light,
                  },
                  '& .nav-arrow': {
                    transform: 'translateX(8px)',
                  },
                  '&::before': {
                    opacity: 1,
                  }
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.1)}, transparent)`,
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '2px',
                  background: `linear-gradient(90deg, transparent, ${theme.palette.primary.main}, transparent)`,
                  animation: 'pulse 2s ease-in-out infinite',
                }
              }}
              component={Link}
              to={item.path}
            >
              <Box className="nav-icon" sx={{ 
                color: item.primary ? theme.palette.primary.main : theme.palette.primary.light,
                mb: 2,
                transition: 'all 0.3s ease',
                transformStyle: 'preserve-3d',
              }}>
                {item.icon}
              </Box>
              
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 1,
                  fontWeight: 700,
                  letterSpacing: 2,
                  color: theme.palette.text.primary,
                }}
              >
                {item.label}
              </Typography>
              
              <Typography 
                variant="body2" 
                sx={{ 
                  color: theme.palette.text.secondary,
                  mb: 2,
                  letterSpacing: 1,
                }}
              >
                {item.sublabel}
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  width: 40, 
                  height: 1, 
                  background: theme.palette.primary.main,
                  opacity: 0.5,
                }} />
                <NavigateNextIcon 
                  className="nav-arrow" 
                  sx={{ 
                    color: theme.palette.primary.main,
                    transition: 'transform 0.3s ease',
                  }} 
                />
                <Box sx={{ 
                  width: 40, 
                  height: 1, 
                  background: theme.palette.primary.main,
                  opacity: 0.5,
                }} />
              </Box>
            </Paper>
          ))}
        </Box>

        {/* Status Bar */}
        <Paper
          elevation={2}
          sx={{
            p: 3,
            background: alpha(theme.palette.background.paper, 0.5),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          }}
        >
          <Stack direction="row" spacing={4} justifyContent="center" alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <CodeIcon sx={{ color: theme.palette.success.main }} />
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                REACT v19.1.0
              </Typography>
            </Stack>
            
            <Divider orientation="vertical" flexItem sx={{ borderColor: alpha(theme.palette.primary.main, 0.3) }} />
            
            <Stack direction="row" spacing={1} alignItems="center">
              <WebIcon sx={{ color: theme.palette.success.main }} />
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                FLASK ONLINE
              </Typography>
            </Stack>
            
            <Divider orientation="vertical" flexItem sx={{ borderColor: alpha(theme.palette.primary.main, 0.3) }} />
            
            <Stack direction="row" spacing={1} alignItems="center">
              <SpeedIcon sx={{ color: theme.palette.success.main }} />
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                LATENCY: 12ms
              </Typography>
            </Stack>
          </Stack>
        </Paper>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography variant="body2" sx={{ color: alpha(theme.palette.text.secondary, 0.5), letterSpacing: 2 }}>
            [ SECURE CONNECTION ESTABLISHED ] 
          </Typography>
          <Typography variant="body2" sx={{ color: alpha(theme.palette.primary.main, 0.5), mt: 1 }}>
            SYSTEM ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}