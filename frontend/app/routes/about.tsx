import { Link } from "react-router";
import { useState } from 'react';
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
  Chip,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StorageIcon from '@mui/icons-material/Storage';
import ApiIcon from '@mui/icons-material/Api';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShieldIcon from '@mui/icons-material/Shield';
import SpeedIcon from '@mui/icons-material/Speed';
import CodeIcon from '@mui/icons-material/Code';
import ComputerIcon from '@mui/icons-material/Computer';
import SecurityIcon from '@mui/icons-material/Security';
import LockIcon from '@mui/icons-material/Lock';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';
import BugReportIcon from '@mui/icons-material/BugReport';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import InventoryIcon from '@mui/icons-material/Inventory';
import DeveloperModeIcon from '@mui/icons-material/DeveloperMode';
import ReceiptIcon from '@mui/icons-material/Receipt';
import DataObjectIcon from '@mui/icons-material/DataObject';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import DescriptionIcon from '@mui/icons-material/Description';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import PsychologyIcon from '@mui/icons-material/Psychology';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import SettingsIcon from '@mui/icons-material/Settings';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import cybersecurityConfig from '../data/cybersecurity-config.json';

const iconMap: { [key: string]: React.ElementType } = {
  Code: CodeIcon,
  Computer: ComputerIcon,
  Security: SecurityIcon,
  Shield: ShieldIcon,
  Settings: SettingsIcon,
  CloudSync: CloudSyncIcon,
  Lock: LockIcon,
  Key: VpnKeyIcon,
  Network: NetworkCheckIcon,
  Bug: BugReportIcon,
  Pipeline: AccountTreeIcon,
  Inventory: InventoryIcon,
  Development: DeveloperModeIcon,
  License: ReceiptIcon,
  Database: DataObjectIcon,
  Architecture: ArchitectureIcon,
  Logs: DescriptionIcon,
  Automation: AutorenewIcon,
  Brain: PsychologyIcon
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function About() {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});
  
  const systemFeatures = [
    {
      icon: <DashboardIcon sx={{ fontSize: 24 }} />,
      title: "NEURAL INTERFACE",
      value: "React v19.1.0",
      metric: "99.9% Uptime"
    },
    {
      icon: <StorageIcon sx={{ fontSize: 24 }} />,
      title: "DATA MATRIX",
      value: "Flask v3.0.0",
      metric: "RESTful API"
    },
    {
      icon: <ShieldIcon sx={{ fontSize: 24 }} />,
      title: "SECURITY",
      value: "AES-256",
      metric: "TLS 1.3"
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 24 }} />,
      title: "PERFORMANCE",
      value: "< 10ms",
      metric: "Response Time"
    },
  ];

  const techStack = [
    { name: "React", version: "19.1.0" },
    { name: "Material-UI", version: "7.3.1" },
    { name: "Flask", version: "3.0.0" },
    { name: "TypeScript", version: "5.8.3" },
    { name: "Vite", version: "6.3.3" },
    { name: "Node.js", version: "20.x" },
  ];

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const cyberCategories = [
    { 
      title: "Infrastructure", 
      keys: ["softwareStack", "operatingSystem", "networkSecurity", "dataIntegration", "automation"]
    },
    { 
      title: "Security", 
      keys: ["classificationLevel", "stigCompliance", "stigTools", "dataEncryption", "authentication", "zeroTrust"]
    },
    { 
      title: "Testing & Compliance", 
      keys: ["securityTesting", "continuityPlanning", "logging", "billOfMaterials"]
    },
    { 
      title: "Operations", 
      keys: ["devSecOps", "sdlc", "licensing", "architectureDiagrams"]
    },
    { 
      title: "AI/ML", 
      keys: ["aiMl"]
    }
  ];

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: theme.palette.background.default 
    }}>
      {/* Navigation Bar */}
      <AppBar 
        position="static" 
        sx={{ 
          backgroundColor: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          flexShrink: 0,
        }}
      >
        <Toolbar>
          <IconButton
            component={Link}
            to="/"
            edge="start"
            color="primary"
            sx={{ mr: 2 }}
          >
            <HomeIcon />
          </IconButton>
          
          <Typography variant="h6" sx={{ 
            flexGrow: 1,
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            fontWeight: 700,
            letterSpacing: 2,
          }}>
            SYSTEM ARCHITECTURE
          </Typography>

          <Stack direction="row" spacing={1}>
            <Button
              component={Link}
              to="/ukraine-fire-tracking"
              startIcon={<LocalFireDepartmentIcon />}
              sx={{ color: theme.palette.text.secondary }}
            >
              Fire Tracking
            </Button>
            <Button
              component={Link}
              to="/data"
              startIcon={<StorageOutlinedIcon />}
              sx={{ color: theme.palette.text.secondary }}
            >
              Data
            </Button>
            <Button
              component={Link}
              to="/api-demo"
              startIcon={<ApiIcon />}
              sx={{ color: theme.palette.text.secondary }}
            >
              API
            </Button>
            <Button
              component={Link}
              to="/settings"
              startIcon={<SettingsIcon />}
              sx={{ color: theme.palette.text.secondary }}
            >
              Settings
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Scrollable Content Area */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto',
        py: 3,
      }}>
        <Container maxWidth="xl">
        {/* System Overview - Compact Header */}
        <Paper
          elevation={3}
          sx={{
            p: 2,
            mb: 3,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
            background: `linear-gradient(135deg, 
              ${alpha(theme.palette.background.paper, 0.95)}, 
              ${alpha(theme.palette.primary.dark, 0.05)})`,
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Stack direction="row" spacing={3} flexWrap="wrap">
                {systemFeatures.map((feature, index) => (
                  <Stack key={index} direction="row" spacing={1} alignItems="center" sx={{ minWidth: 200 }}>
                    <Box sx={{ color: theme.palette.primary.main }}>
                      {feature.icon}
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ 
                        color: theme.palette.text.secondary,
                        textTransform: 'uppercase',
                        fontSize: '0.65rem',
                      }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: theme.palette.primary.light,
                        fontWeight: 600,
                      }}>
                        {feature.value}
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        color: theme.palette.success.main,
                        fontSize: '0.6rem',
                      }}>
                        {feature.metric}
                      </Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap">
                {techStack.map((tech, index) => (
                  <Chip
                    key={index}
                    label={`${tech.name} v${tech.version}`}
                    size="small"
                    icon={<CheckCircleIcon />}
                    sx={{
                      backgroundColor: alpha(theme.palette.success.main, 0.1),
                      color: theme.palette.success.light,
                      border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                      '& .MuiChip-icon': {
                        color: theme.palette.success.main,
                        fontSize: 14,
                      }
                    }}
                  />
                ))}
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* Cybersecurity Architecture - Tabbed Interface */}
        <Paper
          elevation={3}
          sx={{
            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            backgroundColor: alpha(theme.palette.background.paper, 0.5),
          }}>
            <Tabs 
              value={tabValue} 
              onChange={(e, v) => setTabValue(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  minHeight: 48,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  fontWeight: 600,
                },
                '& .Mui-selected': {
                  color: theme.palette.primary.light,
                },
              }}
            >
              {cyberCategories.map((cat, idx) => (
                <Tab 
                  key={idx} 
                  label={cat.title}
                />
              ))}
            </Tabs>
          </Box>

          {cyberCategories.map((category, categoryIndex) => (
            <TabPanel key={categoryIndex} value={tabValue} index={categoryIndex}>
              <Box sx={{ px: 2 }}>
                <List dense sx={{ p: 0 }}>
                  {category.keys.map((key) => {
                    const section = cybersecurityConfig.cybersecurityAspects[key as keyof typeof cybersecurityConfig.cybersecurityAspects];
                    if (!section) return null;
                    
                    const IconComponent = iconMap[section.icon] || ShieldIcon;
                    const isExpanded = expandedSections[key];
                    
                    return (
                      <Box key={key} sx={{ mb: 1 }}>
                        <Paper
                          elevation={1}
                          sx={{
                            backgroundColor: alpha(theme.palette.background.paper, 0.5),
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                            overflow: 'hidden',
                          }}
                        >
                          <ListItem
                            button
                            onClick={() => toggleSection(key)}
                            sx={{
                              py: 1,
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                              }
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <IconComponent sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
                            </ListItemIcon>
                            <ListItemText 
                              primary={
                                <Typography variant="body2" sx={{ 
                                  fontWeight: 600,
                                  color: theme.palette.primary.light,
                                }}>
                                  {section.title}
                                </Typography>
                              }
                              secondary={
                                <Typography variant="caption" sx={{ 
                                  color: theme.palette.text.secondary,
                                  fontSize: '0.7rem',
                                }}>
                                  {section.description}
                                </Typography>
                              }
                            />
                            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </ListItem>
                          
                          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            <Box sx={{ 
                              px: 2, 
                              pb: 2,
                              backgroundColor: alpha(theme.palette.background.default, 0.3),
                              borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                            }}>
                              <Grid container spacing={2} sx={{ mt: 0 }}>
                                {Object.entries(section.data).map(([dataKey, items]) => (
                                  <Grid item xs={12} sm={6} md={4} lg={3} key={dataKey}>
                                    <Box>
                                      <Typography variant="caption" sx={{
                                        color: theme.palette.primary.main,
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        fontSize: '0.65rem',
                                        display: 'block',
                                        mb: 0.5,
                                      }}>
                                        {dataKey.replace(/([A-Z])/g, ' $1').trim()}
                                      </Typography>
                                      <Box sx={{ pl: 1 }}>
                                        {(Array.isArray(items) ? items : []).map((item, idx) => (
                                          <Typography
                                            key={idx}
                                            variant="caption"
                                            component="div"
                                            sx={{
                                              color: theme.palette.text.secondary,
                                              fontSize: '0.7rem',
                                              py: 0.25,
                                            }}
                                          >
                                            • {item}
                                          </Typography>
                                        ))}
                                      </Box>
                                    </Box>
                                  </Grid>
                                ))}
                              </Grid>
                            </Box>
                          </Collapse>
                        </Paper>
                      </Box>
                    );
                  })}
                </List>
              </Box>
            </TabPanel>
          ))}
        </Paper>
        </Container>
      </Box>

      {/* System Status Footer - Fixed at bottom */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          background: alpha(theme.palette.background.paper, 0.95),
          borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          flexShrink: 0,
        }}
      >
        <Stack direction="row" spacing={3} justifyContent="center" alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <CheckCircleIcon sx={{ color: theme.palette.success.main, fontSize: 18 }} />
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              SYSTEM: <strong style={{ color: theme.palette.success.light }}>OPERATIONAL</strong>
            </Typography>
          </Stack>
          <Divider orientation="vertical" flexItem />
          <Stack direction="row" spacing={1} alignItems="center">
            <SecurityIcon sx={{ color: theme.palette.success.main, fontSize: 18 }} />
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              SECURITY: <strong style={{ color: theme.palette.success.light }}>HARDENED</strong>
            </Typography>
          </Stack>
          <Divider orientation="vertical" flexItem />
          <Stack direction="row" spacing={1} alignItems="center">
            <ApiIcon sx={{ color: theme.palette.success.main, fontSize: 18 }} />
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              API: <strong style={{ color: theme.palette.success.light }}>CONNECTED</strong>
            </Typography>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}