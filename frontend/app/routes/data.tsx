import { useEffect, useState } from 'react';
import type { Route } from "./+types/data";
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  useTheme,
  alpha,
  Button,
  ButtonGroup,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Stack
} from '@mui/material';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import StorageIcon from '@mui/icons-material/Storage';
import TableViewIcon from '@mui/icons-material/TableView';

interface FireData {
  latitude: number;
  longitude: number;
  acq_date: string;
  bright_ti4?: number;
  bright_ti5?: number;
  confidence?: string;
  frp?: number;
  scan?: number;
  track?: number;
}

interface MissileData {
  Date: string;
  Type: string;
  Count: number;
  Target?: string;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "DATA VIEWER | Threat Database" },
    { name: "description", content: "Raw threat data visualization" },
  ];
}

export default function DataViewer() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fireData, setFireData] = useState<FireData[]>([]);
  const [missileData, setMissileData] = useState<MissileData[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<'wildfire' | 'missile'>('wildfire');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load wildfire data
      const fireResponse = await fetch('/data/wildfire/fire_nrt_M-C61_652863.json');
      const fireJson = await fireResponse.json();
      setFireData(fireJson.slice(0, 500)); // Limit for performance
      
      // Load missile data
      const missileResponse = await fetch('/data/missile/missiles_and_uav.csv');
      const missileText = await missileResponse.text();
      const parsedMissileData = parseCSV(missileText);
      setMissileData(parsedMissileData);
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load data files');
      setLoading(false);
    }
  };

  const parseCSV = (text: string): MissileData[] => {
    const lines = text.split('\n');
    return lines.slice(1).map(line => {
      const values = line.split(',');
      return {
        Date: values[0] || '',
        Type: values[1] || '',
        Count: parseInt(values[2]) || 0,
        Target: values[3] || ''
      };
    }).filter(item => item.Date);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const currentData = selectedDataset === 'wildfire' ? fireData : missileData;
  const paginatedData = currentData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const renderWildfireTable = () => (
    <TableContainer>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>DATE</TableCell>
            <TableCell sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>LATITUDE</TableCell>
            <TableCell sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>LONGITUDE</TableCell>
            <TableCell sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>CONFIDENCE</TableCell>
            <TableCell sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>BRIGHTNESS T4</TableCell>
            <TableCell sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>BRIGHTNESS T5</TableCell>
            <TableCell sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>FRP</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(paginatedData as FireData[]).map((row, index) => (
            <TableRow
              key={index}
              sx={{ 
                '&:hover': { 
                  backgroundColor: alpha(theme.palette.primary.main, 0.05) 
                },
                '&:nth-of-type(odd)': {
                  backgroundColor: alpha(theme.palette.action.hover, 0.03),
                },
              }}
            >
              <TableCell>{row.acq_date}</TableCell>
              <TableCell>{row.latitude.toFixed(5)}</TableCell>
              <TableCell>{row.longitude.toFixed(5)}</TableCell>
              <TableCell>
                <Chip 
                  label={row.confidence || 'N/A'} 
                  size="small" 
                  color={row.confidence === 'high' ? 'error' : row.confidence === 'nominal' ? 'warning' : 'default'}
                  variant="outlined"
                />
              </TableCell>
              <TableCell>{row.bright_ti4?.toFixed(2) || 'N/A'}</TableCell>
              <TableCell>{row.bright_ti5?.toFixed(2) || 'N/A'}</TableCell>
              <TableCell>{row.frp?.toFixed(2) || 'N/A'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderMissileTable = () => (
    <TableContainer>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>DATE</TableCell>
            <TableCell sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>TYPE</TableCell>
            <TableCell sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>COUNT</TableCell>
            <TableCell sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>TARGET</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(paginatedData as MissileData[]).map((row, index) => (
            <TableRow
              key={index}
              sx={{ 
                '&:hover': { 
                  backgroundColor: alpha(theme.palette.primary.main, 0.05) 
                },
                '&:nth-of-type(odd)': {
                  backgroundColor: alpha(theme.palette.action.hover, 0.03),
                },
              }}
            >
              <TableCell>{row.Date}</TableCell>
              <TableCell>
                <Chip 
                  label={row.Type || 'Unknown'} 
                  size="small" 
                  color="secondary"
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                <Typography color={row.Count > 10 ? 'error' : 'text.primary'}>
                  {row.Count}
                </Typography>
              </TableCell>
              <TableCell>{row.Target || 'N/A'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        pt: 4,
        pb: 8,
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
          background: `radial-gradient(circle at center, ${alpha(theme.palette.primary.main, 0.03)} 0%, transparent 70%)`,
        },
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h2" 
            sx={{ 
              mb: 2,
              fontSize: { xs: '2rem', md: '3rem' },
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2
            }}
          >
            <StorageIcon sx={{ fontSize: 'inherit' }} />
            THREAT DATABASE
            <TableViewIcon sx={{ fontSize: 'inherit' }} />
          </Typography>
          
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, letterSpacing: 2 }}>
            [ RAW DATA ACCESS ] [ SYSTEM RECORDS ] [ THREAT INTELLIGENCE ]
          </Typography>
        </Box>

        {/* Data Source Selector */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <ButtonGroup variant="outlined" color="primary" size="large">
            <Button
              onClick={() => {setSelectedDataset('wildfire'); setPage(0);}}
              variant={selectedDataset === 'wildfire' ? 'contained' : 'outlined'}
              startIcon={<WhatshotIcon />}
            >
              WILDFIRE DATA
            </Button>
            <Button
              onClick={() => {setSelectedDataset('missile'); setPage(0);}}
              variant={selectedDataset === 'missile' ? 'contained' : 'outlined'}
              startIcon={<RocketLaunchIcon />}
            >
              MISSILE DATA
            </Button>
          </ButtonGroup>
        </Box>

        {/* Statistics Bar */}
        <Paper
          elevation={2}
          sx={{
            p: 2,
            mb: 4,
            background: alpha(theme.palette.background.paper, 0.5),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          }}
        >
          <Stack direction="row" spacing={4} justifyContent="center" alignItems="center">
            <Chip 
              label={`DATASET: ${selectedDataset.toUpperCase()}`} 
              color="primary" 
              variant="outlined" 
            />
            <Chip 
              label={`TOTAL RECORDS: ${currentData.length}`} 
              color="secondary" 
              variant="outlined" 
            />
            <Chip 
              label={`PAGE: ${page + 1} / ${Math.ceil(currentData.length / rowsPerPage)}`} 
              color="success" 
              variant="outlined" 
            />
            <Chip 
              label={`LAST SYNC: ${new Date().toLocaleTimeString()}`} 
              color="warning" 
              variant="outlined" 
            />
          </Stack>
        </Paper>

        {/* Main Table */}
        <Paper
          elevation={3}
          sx={{
            mb: 4,
            background: alpha(theme.palette.background.paper, 0.95),
            border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: `linear-gradient(90deg, transparent, ${theme.palette.primary.main}, transparent)`,
              animation: 'pulse 2s ease-in-out infinite',
            }
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
          ) : (
            <>
              {selectedDataset === 'wildfire' ? renderWildfireTable() : renderMissileTable()}
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={currentData.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{
                  borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  '.MuiTablePagination-toolbar': {
                    color: theme.palette.text.secondary,
                  }
                }}
              />
            </>
          )}
        </Paper>

        {/* Footer Info */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: alpha(theme.palette.text.secondary, 0.5), letterSpacing: 2 }}>
            [ DATABASE CONNECTION ESTABLISHED ] [ SECURE CHANNEL ACTIVE ]
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}