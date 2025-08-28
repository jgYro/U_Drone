import { Link } from "react-router";
import { useState, useEffect } from 'react';
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
import Grid from '@mui/material/Grid';
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
import LayersIcon from '@mui/icons-material/Layers';
import MemoryIcon from '@mui/icons-material/Memory';
import GavelIcon from '@mui/icons-material/Gavel';
import LinkIcon from '@mui/icons-material/Link';
import VerifiedIcon from '@mui/icons-material/Verified';
import InfoIcon from '@mui/icons-material/Info';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import HttpsIcon from '@mui/icons-material/Https';
import AssignmentIcon from '@mui/icons-material/Assignment';
import cybersecurityConfig from '../data/cybersecurity-config.json';
import sbomData from '../../../sbom/sbom.json';
import pythonSbomData from '../../../sbom/test_python_sbom.json';
import cbomData from '../../../cbom/test_python_cbom.json';

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

interface SBOMComponent {
  type: string;
  name: string;
  version: string;
  purl?: string;
  licenses?: string[];
  publisher?: string;
  description?: string;
  externalReferences?: {
    repository?: string;
    homepage?: string;
  };
}

interface CBOMComponent {
  type: string;
  name: string;
  'bom-ref': string;
  evidence?: {
    occurrences: Array<{
      location: string;
      line: number;
      offset: number;
      additional_context: string;
    }>;
  };
  cryptoProperties?: {
    assetType: string;
    algorithmProperties?: {
      variant?: string;
      primitive?: string;
      parameterSetIdentifier?: string;
      curve?: string;
      executionEnvironment?: string;
      implementationPlatform?: string;
      certificationLevel?: string[];
      mode?: string;
      padding?: string;
      cryptoFunctions?: string[];
      classicalSecurityLevel?: number;
      nistQuantumSecurityLevel?: number;
    };
    relatedCryptoMaterialProperties?: {
      name: string;
      additionalContext: string;
    };
  };
}

export default function About() {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});
  const [sbomFilter, setSbomFilter] = useState('');
  const [cbomFilter, setCbomFilter] = useState('');
  
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
    },
    {
      title: "SBOM (JS)",
      keys: []
    },
    {
      title: "SBOM (Python)",
      keys: []
    },
    {
      title: "CBOM",
      keys: []
    }
  ];

  const getSbomStats = (data: any) => {
    const components = data.components || [];
    const licenses = new Set(components.flatMap((c: any) => c.licenses || []));
    return {
      totalComponents: components.length,
      uniqueLicenses: licenses.size,
      licenseList: Array.from(licenses),
      withVulnerabilities: 0
    };
  };

  const getCbomStats = (data: any) => {
    const components = data.components || [];
    const assetTypes = new Set(components.map((c: any) => 
      c.cryptoProperties?.assetType || 'unknown'
    ));
    const algorithms = new Set(components.map((c: any) => 
      c.cryptoProperties?.algorithmProperties?.primitive || 'N/A'
    ).filter((a: string) => a !== 'N/A'));
    
    return {
      totalAssets: components.length,
      assetTypes: Array.from(assetTypes),
      algorithms: Array.from(algorithms)
    };
  };

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
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 8 }}>
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
            <Grid size={{ xs: 12, md: 4 }}>
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
                  icon={
                    cat.title === 'SBOM (JS)' ? <LayersIcon sx={{ fontSize: 16 }} /> :
                    cat.title === 'SBOM (Python)' ? <LayersIcon sx={{ fontSize: 16 }} /> :
                    cat.title === 'CBOM' ? <FingerprintIcon sx={{ fontSize: 16 }} /> :
                    undefined
                  }
                  iconPosition="start"
                  sx={{ 
                    minHeight: 48,
                    '& .MuiTab-iconWrapper': { marginRight: 0.5 }
                  }}
                />
              ))}
            </Tabs>
          </Box>

          {cyberCategories.map((category, categoryIndex) => (
            <TabPanel key={categoryIndex} value={tabValue} index={categoryIndex}>
              <Box sx={{ px: 2 }}>
                {/* SBOM (JavaScript) Tab */}
                {category.title === 'SBOM (JS)' && (
                  <Box>
                    <Box sx={{ mb: 3 }}>
                      <Grid container spacing={2}>
                        {(() => {
                          const stats = getSbomStats(sbomData);
                          return (
                            <>
                              <Grid size={{ xs: 12, md: 3 }}>
                                <Paper elevation={1} sx={{ p: 2, backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                                  <Stack spacing={1}>
                                    <LayersIcon sx={{ color: theme.palette.primary.main }} />
                                    <Typography variant="h4" sx={{ color: theme.palette.primary.light }}>
                                      {stats.totalComponents}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Total Components
                                    </Typography>
                                  </Stack>
                                </Paper>
                              </Grid>
                              <Grid size={{ xs: 12, md: 3 }}>
                                <Paper elevation={1} sx={{ p: 2, backgroundColor: alpha(theme.palette.success.main, 0.05) }}>
                                  <Stack spacing={1}>
                                    <GavelIcon sx={{ color: theme.palette.success.main }} />
                                    <Typography variant="h4" sx={{ color: theme.palette.success.light }}>
                                      {stats.uniqueLicenses}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Unique Licenses
                                    </Typography>
                                  </Stack>
                                </Paper>
                              </Grid>
                              <Grid size={{ xs: 12, md: 6 }}>
                                <Paper elevation={1} sx={{ p: 2, backgroundColor: alpha(theme.palette.background.paper, 0.8) }}>
                                  <Typography variant="caption" color="text.secondary" gutterBottom>
                                    License Types
                                  </Typography>
                                  <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                                    {stats.licenseList.slice(0, 10).map((license: any, idx: number) => (
                                      <Chip
                                        key={idx}
                                        label={String(license)}
                                        size="small"
                                        icon={<VerifiedIcon />}
                                        sx={{
                                          backgroundColor: alpha(theme.palette.info.main, 0.1),
                                          color: theme.palette.info.light,
                                          border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                                          '& .MuiChip-icon': {
                                            color: theme.palette.info.main,
                                            fontSize: 14,
                                          }
                                        }}
                                      />
                                    ))}
                                  </Stack>
                                </Paper>
                              </Grid>
                            </>
                          );
                        })()}
                      </Grid>
                    </Box>
                    <Paper elevation={1} sx={{ p: 2 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Typography variant="h6" sx={{ color: theme.palette.primary.light }}>
                          JavaScript Dependencies
                        </Typography>
                        <input
                          type="text"
                          placeholder="Filter components..."
                          value={sbomFilter}
                          onChange={(e) => setSbomFilter(e.target.value)}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '4px',
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                            backgroundColor: alpha(theme.palette.background.paper, 0.8),
                            color: theme.palette.text.primary,
                            outline: 'none',
                            width: '250px',
                          }}
                        />
                      </Stack>
                      <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
                        <Grid container spacing={2}>
                          {(sbomData.components as SBOMComponent[])
                            .filter(comp => 
                              comp.name.toLowerCase().includes(sbomFilter.toLowerCase()) ||
                              comp.description?.toLowerCase().includes(sbomFilter.toLowerCase())
                            )
                            .slice(0, 50)
                            .map((component, idx) => (
                              <Grid size={{ xs: 12, md: 6 }} key={idx}>
                                <Paper
                                  elevation={0}
                                  sx={{
                                    p: 2,
                                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                    backgroundColor: alpha(theme.palette.background.paper, 0.5),
                                    '&:hover': {
                                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                    }
                                  }}
                                >
                                  <Stack spacing={1}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                      <Box>
                                        <Typography variant="subtitle2" sx={{ color: theme.palette.primary.light, fontWeight: 600 }}>
                                          {component.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          v{component.version}
                                        </Typography>
                                      </Box>
                                      {component.licenses && component.licenses.length > 0 && (
                                        <Chip
                                          label={component.licenses[0]}
                                          size="small"
                                          sx={{
                                            backgroundColor: alpha(theme.palette.success.main, 0.1),
                                            color: theme.palette.success.light,
                                            fontSize: '0.65rem',
                                          }}
                                        />
                                      )}
                                    </Stack>
                                    {component.description && (
                                      <Typography variant="caption" color="text.secondary" sx={{ 
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                      }}>
                                        {component.description}
                                      </Typography>
                                    )}
                                    <Stack direction="row" spacing={1}>
                                      {component.externalReferences?.repository && (
                                        <IconButton
                                          size="small"
                                          href={component.externalReferences.repository}
                                          target="_blank"
                                          sx={{ 
                                            padding: 0.5,
                                            color: theme.palette.text.secondary,
                                            '&:hover': { color: theme.palette.primary.main }
                                          }}
                                        >
                                          <CodeIcon sx={{ fontSize: 16 }} />
                                        </IconButton>
                                      )}
                                      {component.externalReferences?.homepage && (
                                        <IconButton
                                          size="small"
                                          href={component.externalReferences.homepage}
                                          target="_blank"
                                          sx={{ 
                                            padding: 0.5,
                                            color: theme.palette.text.secondary,
                                            '&:hover': { color: theme.palette.primary.main }
                                          }}
                                        >
                                          <LinkIcon sx={{ fontSize: 16 }} />
                                        </IconButton>
                                      )}
                                    </Stack>
                                  </Stack>
                                </Paper>
                              </Grid>
                            ))}
                        </Grid>
                      </Box>
                    </Paper>
                  </Box>
                )}

                {/* SBOM (Python) Tab */}
                {category.title === 'SBOM (Python)' && (
                  <Box>
                    <Box sx={{ mb: 3 }}>
                      <Grid container spacing={2}>
                        {(() => {
                          const stats = getSbomStats(pythonSbomData);
                          return (
                            <>
                              <Grid size={{ xs: 12, md: 3 }}>
                                <Paper elevation={1} sx={{ p: 2, backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                                  <Stack spacing={1}>
                                    <LayersIcon sx={{ color: theme.palette.primary.main }} />
                                    <Typography variant="h4" sx={{ color: theme.palette.primary.light }}>
                                      {stats.totalComponents}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Total Components
                                    </Typography>
                                  </Stack>
                                </Paper>
                              </Grid>
                              <Grid size={{ xs: 12, md: 3 }}>
                                <Paper elevation={1} sx={{ p: 2, backgroundColor: alpha(theme.palette.success.main, 0.05) }}>
                                  <Stack spacing={1}>
                                    <GavelIcon sx={{ color: theme.palette.success.main }} />
                                    <Typography variant="h4" sx={{ color: theme.palette.success.light }}>
                                      {stats.uniqueLicenses}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Unique Licenses
                                    </Typography>
                                  </Stack>
                                </Paper>
                              </Grid>
                              <Grid size={{ xs: 12, md: 6 }}>
                                <Paper elevation={1} sx={{ p: 2, backgroundColor: alpha(theme.palette.background.paper, 0.8) }}>
                                  <Typography variant="caption" color="text.secondary" gutterBottom>
                                    License Types
                                  </Typography>
                                  <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                                    {stats.licenseList.slice(0, 10).map((license: any, idx: number) => (
                                      <Chip
                                        key={idx}
                                        label={String(license)}
                                        size="small"
                                        icon={<VerifiedIcon />}
                                        sx={{
                                          backgroundColor: alpha(theme.palette.info.main, 0.1),
                                          color: theme.palette.info.light,
                                          border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                                          '& .MuiChip-icon': {
                                            color: theme.palette.info.main,
                                            fontSize: 14,
                                          }
                                        }}
                                      />
                                    ))}
                                  </Stack>
                                </Paper>
                              </Grid>
                            </>
                          );
                        })()}
                      </Grid>
                    </Box>
                    <Paper elevation={1} sx={{ p: 2 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Typography variant="h6" sx={{ color: theme.palette.primary.light }}>
                          Python Dependencies
                        </Typography>
                        <input
                          type="text"
                          placeholder="Filter components..."
                          value={sbomFilter}
                          onChange={(e) => setSbomFilter(e.target.value)}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '4px',
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                            backgroundColor: alpha(theme.palette.background.paper, 0.8),
                            color: theme.palette.text.primary,
                            outline: 'none',
                            width: '250px',
                          }}
                        />
                      </Stack>
                      <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
                        <Grid container spacing={2}>
                          {(pythonSbomData.components as SBOMComponent[])
                            .filter(comp => 
                              comp.name.toLowerCase().includes(sbomFilter.toLowerCase()) ||
                              comp.description?.toLowerCase().includes(sbomFilter.toLowerCase())
                            )
                            .slice(0, 50)
                            .map((component, idx) => (
                              <Grid size={{ xs: 12, md: 6 }} key={idx}>
                                <Paper
                                  elevation={0}
                                  sx={{
                                    p: 2,
                                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                    backgroundColor: alpha(theme.palette.background.paper, 0.5),
                                    '&:hover': {
                                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                    }
                                  }}
                                >
                                  <Stack spacing={1}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                      <Box>
                                        <Typography variant="subtitle2" sx={{ color: theme.palette.primary.light, fontWeight: 600 }}>
                                          {component.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          v{component.version}
                                        </Typography>
                                      </Box>
                                      {component.licenses && component.licenses.length > 0 && (
                                        <Chip
                                          label={component.licenses[0]}
                                          size="small"
                                          sx={{
                                            backgroundColor: alpha(theme.palette.success.main, 0.1),
                                            color: theme.palette.success.light,
                                            fontSize: '0.65rem',
                                          }}
                                        />
                                      )}
                                    </Stack>
                                    {component.description && (
                                      <Typography variant="caption" color="text.secondary" sx={{ 
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                      }}>
                                        {component.description}
                                      </Typography>
                                    )}
                                    <Stack direction="row" spacing={1}>
                                      {component.externalReferences?.repository && (
                                        <IconButton
                                          size="small"
                                          href={component.externalReferences.repository}
                                          target="_blank"
                                          sx={{ 
                                            padding: 0.5,
                                            color: theme.palette.text.secondary,
                                            '&:hover': { color: theme.palette.primary.main }
                                          }}
                                        >
                                          <CodeIcon sx={{ fontSize: 16 }} />
                                        </IconButton>
                                      )}
                                      {component.externalReferences?.homepage && (
                                        <IconButton
                                          size="small"
                                          href={component.externalReferences.homepage}
                                          target="_blank"
                                          sx={{ 
                                            padding: 0.5,
                                            color: theme.palette.text.secondary,
                                            '&:hover': { color: theme.palette.primary.main }
                                          }}
                                        >
                                          <LinkIcon sx={{ fontSize: 16 }} />
                                        </IconButton>
                                      )}
                                    </Stack>
                                  </Stack>
                                </Paper>
                              </Grid>
                            ))}
                        </Grid>
                      </Box>
                    </Paper>
                  </Box>
                )}

                {/* CBOM Tab */}
                {category.title === 'CBOM' && (
                  <Box>
                    <Box sx={{ mb: 3 }}>
                      <Grid container spacing={2}>
                        {(() => {
                          const stats = getCbomStats(cbomData);
                          return (
                            <>
                              <Grid size={{ xs: 12, md: 3 }}>
                                <Paper elevation={1} sx={{ p: 2, backgroundColor: alpha(theme.palette.error.main, 0.05) }}>
                                  <Stack spacing={1}>
                                    <FingerprintIcon sx={{ color: theme.palette.error.main }} />
                                    <Typography variant="h4" sx={{ color: theme.palette.error.light }}>
                                      {stats.totalAssets}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Crypto Assets
                                    </Typography>
                                  </Stack>
                                </Paper>
                              </Grid>
                              <Grid size={{ xs: 12, md: 4 }}>
                                <Paper elevation={1} sx={{ p: 2, backgroundColor: alpha(theme.palette.warning.main, 0.05) }}>
                                  <Typography variant="caption" color="text.secondary" gutterBottom>
                                    Asset Types
                                  </Typography>
                                  <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                                    {stats.assetTypes.map((type, idx) => (
                                      <Chip
                                        key={idx}
                                        label={type}
                                        size="small"
                                        icon={<HttpsIcon />}
                                        sx={{
                                          backgroundColor: alpha(theme.palette.warning.main, 0.1),
                                          color: theme.palette.warning.light,
                                          border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                                          '& .MuiChip-icon': {
                                            color: theme.palette.warning.main,
                                            fontSize: 14,
                                          }
                                        }}
                                      />
                                    ))}
                                  </Stack>
                                </Paper>
                              </Grid>
                              <Grid size={{ xs: 12, md: 5 }}>
                                <Paper elevation={1} sx={{ p: 2, backgroundColor: alpha(theme.palette.info.main, 0.05) }}>
                                  <Typography variant="caption" color="text.secondary" gutterBottom>
                                    Algorithms Detected
                                  </Typography>
                                  <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                                    {stats.algorithms.map((algo, idx) => (
                                      <Chip
                                        key={idx}
                                        label={algo}
                                        size="small"
                                        icon={<LockOpenIcon />}
                                        sx={{
                                          backgroundColor: alpha(theme.palette.info.main, 0.1),
                                          color: theme.palette.info.light,
                                          border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                                          '& .MuiChip-icon': {
                                            color: theme.palette.info.main,
                                            fontSize: 14,
                                          }
                                        }}
                                      />
                                    ))}
                                  </Stack>
                                </Paper>
                              </Grid>
                            </>
                          );
                        })()}
                      </Grid>
                    </Box>
                    <Paper elevation={1} sx={{ p: 2 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Typography variant="h6" sx={{ color: theme.palette.primary.light }}>
                          Cryptographic Assets
                        </Typography>
                        <input
                          type="text"
                          placeholder="Filter assets..."
                          value={cbomFilter}
                          onChange={(e) => setCbomFilter(e.target.value)}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '4px',
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                            backgroundColor: alpha(theme.palette.background.paper, 0.8),
                            color: theme.palette.text.primary,
                            outline: 'none',
                            width: '250px',
                          }}
                        />
                      </Stack>
                      <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
                        <Grid container spacing={2}>
                          {(cbomData.components as CBOMComponent[])
                            .filter(comp => 
                              comp.name.toLowerCase().includes(cbomFilter.toLowerCase()) ||
                              comp.cryptoProperties?.assetType?.toLowerCase().includes(cbomFilter.toLowerCase())
                            )
                            .slice(0, 50)
                            .map((component, idx) => (
                              <Grid size={12} key={idx}>
                                <Paper
                                  elevation={0}
                                  sx={{
                                    p: 2,
                                    border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                                    backgroundColor: alpha(theme.palette.background.paper, 0.5),
                                    '&:hover': {
                                      backgroundColor: alpha(theme.palette.error.main, 0.05),
                                    }
                                  }}
                                >
                                  <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                      <Stack spacing={1}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                          <FingerprintIcon sx={{ color: theme.palette.error.main, fontSize: 20 }} />
                                          <Typography variant="subtitle2" sx={{ color: theme.palette.error.light, fontWeight: 600 }}>
                                            {component.name}
                                          </Typography>
                                        </Stack>
                                        <Stack direction="row" spacing={1}>
                                          <Chip
                                            label={component.cryptoProperties?.assetType || 'unknown'}
                                            size="small"
                                            sx={{
                                              backgroundColor: alpha(theme.palette.error.main, 0.1),
                                              color: theme.palette.error.light,
                                              fontSize: '0.65rem',
                                            }}
                                          />
                                          {component.cryptoProperties?.algorithmProperties?.primitive && (
                                            <Chip
                                              label={component.cryptoProperties.algorithmProperties.primitive}
                                              size="small"
                                              sx={{
                                                backgroundColor: alpha(theme.palette.warning.main, 0.1),
                                                color: theme.palette.warning.light,
                                                fontSize: '0.65rem',
                                              }}
                                            />
                                          )}
                                        </Stack>
                                      </Stack>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                      {component.evidence?.occurrences?.[0] && (
                                        <Box>
                                          <Typography variant="caption" color="text.secondary">
                                            Location:
                                          </Typography>
                                          <Typography variant="caption" component="div" sx={{ 
                                            color: theme.palette.info.light,
                                            fontFamily: 'monospace',
                                            fontSize: '0.7rem',
                                            wordBreak: 'break-all',
                                          }}>
                                            {component.evidence.occurrences[0].location}:L{component.evidence.occurrences[0].line}
                                          </Typography>
                                          {component.evidence.occurrences[0].additional_context && (
                                            <Typography variant="caption" component="div" sx={{ 
                                              color: theme.palette.text.secondary,
                                              fontFamily: 'monospace',
                                              fontSize: '0.65rem',
                                              mt: 0.5,
                                              padding: '4px 8px',
                                              backgroundColor: alpha(theme.palette.background.default, 0.5),
                                              borderRadius: 1,
                                            }}>
                                              {component.evidence.occurrences[0].additional_context}
                                            </Typography>
                                          )}
                                        </Box>
                                      )}
                                    </Grid>
                                    {component.cryptoProperties?.algorithmProperties && (
                                      <Grid size={12}>
                                        <Box sx={{ 
                                          p: 1, 
                                          backgroundColor: alpha(theme.palette.background.default, 0.3),
                                          borderRadius: 1,
                                        }}>
                                          <Typography variant="caption" color="text.secondary" gutterBottom>
                                            Algorithm Properties:
                                          </Typography>
                                          <Grid container spacing={1} sx={{ mt: 0.5 }}>
                                            {Object.entries(component.cryptoProperties.algorithmProperties).map(([key, value]) => (
                                              <Grid size={{ xs: 6, sm: 4, md: 3 }} key={key}>
                                                <Typography variant="caption" sx={{ 
                                                  color: theme.palette.primary.main,
                                                  fontSize: '0.65rem',
                                                  fontWeight: 600,
                                                }}>
                                                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                                                </Typography>
                                                <Typography variant="caption" sx={{ 
                                                  color: theme.palette.text.secondary,
                                                  fontSize: '0.65rem',
                                                  ml: 0.5,
                                                }}>
                                                  {Array.isArray(value) ? value.join(', ') : value}
                                                </Typography>
                                              </Grid>
                                            ))}
                                          </Grid>
                                        </Box>
                                      </Grid>
                                    )}
                                  </Grid>
                                </Paper>
                              </Grid>
                            ))}
                        </Grid>
                      </Box>
                    </Paper>
                  </Box>
                )}

                {/* Original tabs content */}
                {category.keys.length > 0 && (
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
                                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={dataKey}>
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
                )}
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