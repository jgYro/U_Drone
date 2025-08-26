import { useEffect, useState, useRef, useCallback } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Button,
  ButtonGroup,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  alpha,
  Divider,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip
} from '@mui/material';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import SettingsIcon from '@mui/icons-material/Settings';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';

interface FireData {
  latitude: number;
  longitude: number;
  acq_date: string;
  acq_time?: string;
  bright_ti4?: number;
  bright_ti5?: number;
  bright_t31?: number;
  confidence?: string;
  frp?: number;
  scan?: number;
  track?: number;
  version?: string;
  daynight?: string;
}

interface ImportedFile {
  name: string;
  data: FireData[];
  status: 'processing' | 'success' | 'error';
  error?: string;
  size: number;
  lastModified: number;
}

export default function Settings() {
  const theme = useTheme();
  const [fireData, setFireData] = useState<FireData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDataset, setSelectedDataset] = useState<string>('fire_nrt_M-C61_652863');
  
  // New import functionality state
  const [importedFiles, setImportedFiles] = useState<ImportedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [newDatasetName, setNewDatasetName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Available fire datasets
  const fireDatasets = [
    { value: 'fire_nrt_M-C61_652863', label: 'MODIS Terra NRT (M-C61)', type: 'NRT' },
    { value: 'fire_nrt_J1V-C2_652865', label: 'VIIRS J1 NRT (J1V-C2)', type: 'NRT' },
    { value: 'fire_nrt_J2V-C2_652866', label: 'VIIRS J2 NRT (J2V-C2)', type: 'NRT' },
    { value: 'fire_nrt_SV-C2_652867', label: 'VIIRS Suomi NPP NRT (SV-C2)', type: 'NRT' },
    { value: 'fire_archive_M-C61_652863', label: 'MODIS Terra Archive (M-C61)', type: 'Archive' },
    { value: 'fire_archive_J1V-C2_652865', label: 'VIIRS J1 Archive (J1V-C2)', type: 'Archive' },
    { value: 'fire_archive_SV-C2_652867', label: 'VIIRS Suomi NPP Archive (SV-C2)', type: 'Archive' }
  ];

  const loadFireData = async (dataset: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/data/wildfire/${dataset}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load ${dataset}`);
      }
      
      const data = await response.json();
      setFireData(data.slice(0, 1000)); // Limit for performance
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load fire data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFireData(selectedDataset);
  }, [selectedDataset]);

  // File validation function
  const validateFireData = (data: any[]): { isValid: boolean; error?: string } => {
    if (!Array.isArray(data)) {
      return { isValid: false, error: 'Data must be an array' };
    }

    if (data.length === 0) {
      return { isValid: false, error: 'File is empty' };
    }

    // Check first few items for required fields
    const sampleSize = Math.min(5, data.length);
    for (let i = 0; i < sampleSize; i++) {
      const item = data[i];
      if (!item.latitude || !item.longitude || !item.acq_date) {
        return { 
          isValid: false, 
          error: `Missing required fields (latitude, longitude, acq_date) in record ${i + 1}` 
        };
      }
      
      if (typeof item.latitude !== 'number' || typeof item.longitude !== 'number') {
        return { 
          isValid: false, 
          error: `Invalid coordinate types in record ${i + 1}` 
        };
      }
    }

    return { isValid: true };
  };

  // File processing function
  const processFile = async (file: File): Promise<ImportedFile> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);
          
          const validation = validateFireData(data);
          
          if (!validation.isValid) {
            resolve({
              name: file.name,
              data: [],
              status: 'error',
              error: validation.error,
              size: file.size,
              lastModified: file.lastModified
            });
            return;
          }

          resolve({
            name: file.name,
            data: data as FireData[],
            status: 'success',
            size: file.size,
            lastModified: file.lastModified
          });
        } catch (err) {
          resolve({
            name: file.name,
            data: [],
            status: 'error',
            error: 'Invalid JSON format',
            size: file.size,
            lastModified: file.lastModified
          });
        }
      };

      reader.onerror = () => {
        resolve({
          name: file.name,
          data: [],
          status: 'error',
          error: 'Failed to read file',
          size: file.size,
          lastModified: file.lastModified
        });
      };

      reader.readAsText(file);
    });
  };

  // Handle file upload
  const handleFileUpload = async (files: FileList) => {
    setUploading(true);
    const newFiles: ImportedFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Only process JSON files
      if (!file.name.toLowerCase().endsWith('.json')) {
        newFiles.push({
          name: file.name,
          data: [],
          status: 'error',
          error: 'Only JSON files are supported',
          size: file.size,
          lastModified: file.lastModified
        });
        continue;
      }

      const processedFile = await processFile(file);
      newFiles.push(processedFile);
    }

    setImportedFiles(prev => [...prev, ...newFiles]);
    setUploading(false);
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, []);

  // Load imported file data
  const loadImportedData = (file: ImportedFile) => {
    if (file.status === 'success') {
      setFireData(file.data.slice(0, 1000)); // Limit for performance
      setSelectedDataset(`imported_${file.name}`);
    }
  };

  // Remove imported file
  const removeImportedFile = (index: number) => {
    setImportedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Save imported data as new dataset
  const saveImportedData = () => {
    const successfulFiles = importedFiles.filter(f => f.status === 'success');
    if (successfulFiles.length === 0) {
      setError('No valid files to save');
      return;
    }

    // In a real application, this would save to a backend
    console.log('Saving datasets:', successfulFiles.map(f => ({
      name: newDatasetName || f.name,
      data: f.data
    })));
    
    setSaveDialogOpen(false);
    setNewDatasetName('');
    // Show success message
    setError(null);
  };

  const getDatasetInfo = () => {
    const dataset = fireDatasets.find(d => d.value === selectedDataset);
    return dataset || fireDatasets[0];
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <SettingsIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            Fire Data Import Settings
          </Typography>
        </Stack>
        <Typography variant="body1" color="text.secondary">
          Configure and import fire detection data from various satellite sources
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3, background: alpha(theme.palette.primary.main, 0.02) }}>
        <Stack spacing={3}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WhatshotIcon color="primary" />
            Fire Dataset Selection
          </Typography>

          <FormControl fullWidth>
            <InputLabel>Select Fire Dataset</InputLabel>
            <Select
              value={selectedDataset}
              label="Select Fire Dataset"
              onChange={(e) => setSelectedDataset(e.target.value)}
            >
              {fireDatasets.map((dataset) => (
                <MenuItem key={dataset.value} value={dataset.value}>
                  <Stack direction="row" justifyContent="space-between" sx={{ width: '100%' }}>
                    <span>{dataset.label}</span>
                    <Chip 
                      label={dataset.type} 
                      size="small" 
                      color={dataset.type === 'NRT' ? 'primary' : 'secondary'}
                    />
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <ButtonGroup variant="contained" sx={{ alignSelf: 'flex-start' }}>
            <Button
              onClick={() => loadFireData(selectedDataset)}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : <CloudDownloadIcon />}
            >
              {loading ? 'Loading...' : 'Reload Data'}
            </Button>
          </ButtonGroup>

          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}
        </Stack>
      </Paper>

      {/* New Data Import Section */}
      <Paper sx={{ p: 3, mb: 3, background: alpha(theme.palette.secondary.main, 0.02) }}>
        <Stack spacing={3}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <UploadFileIcon color="secondary" />
            Import New Fire Data
          </Typography>

          {/* File Upload Area */}
          <Box
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            sx={{
              border: `2px dashed ${dragOver ? theme.palette.secondary.main : alpha(theme.palette.secondary.main, 0.5)}`,
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              background: dragOver ? alpha(theme.palette.secondary.main, 0.05) : 'transparent',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              '&:hover': {
                borderColor: theme.palette.secondary.main,
                background: alpha(theme.palette.secondary.main, 0.03),
              }
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".json"
              style={{ display: 'none' }}
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            />
            
            <Stack spacing={2} alignItems="center">
              <FileUploadIcon sx={{ fontSize: 48, color: theme.palette.secondary.main }} />
              <Typography variant="h6" color="secondary">
                Drop JSON files here or click to select
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Supports multiple files • JSON format only • Fire data structure required
              </Typography>
              <Button 
                variant="outlined" 
                color="secondary"
                startIcon={<FolderOpenIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Browse Files
              </Button>
            </Stack>
          </Box>

          {uploading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CircularProgress size={20} color="secondary" />
              <Typography variant="body2" color="text.secondary">
                Processing files...
              </Typography>
            </Box>
          )}

          {/* Imported Files List */}
          {importedFiles.length > 0 && (
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InfoIcon color="info" />
                  Imported Files ({importedFiles.length})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  {importedFiles.map((file, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        border: 1,
                        borderColor: alpha(theme.palette.divider, 0.2),
                        borderRadius: 1,
                        mb: 1,
                        background: file.status === 'success' 
                          ? alpha(theme.palette.success.main, 0.05)
                          : alpha(theme.palette.error.main, 0.05)
                      }}
                    >
                      <ListItemIcon>
                        {file.status === 'success' ? (
                          <CheckCircleIcon color="success" />
                        ) : (
                          <ErrorIcon color="error" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Typography variant="subtitle1">{file.name}</Typography>
                            <Chip 
                              label={file.status.toUpperCase()} 
                              size="small"
                              color={file.status === 'success' ? 'success' : 'error'}
                            />
                            {file.status === 'success' && (
                              <Chip 
                                label={`${file.data.length.toLocaleString()} records`} 
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Stack>
                        }
                        secondary={
                          <Stack spacing={1}>
                            <Typography variant="caption" color="text.secondary">
                              Size: {(file.size / 1024).toFixed(1)} KB • 
                              Modified: {new Date(file.lastModified).toLocaleString()}
                            </Typography>
                            {file.error && (
                              <Typography variant="caption" color="error">
                                Error: {file.error}
                              </Typography>
                            )}
                          </Stack>
                        }
                      />
                      <Stack direction="row" spacing={1}>
                        {file.status === 'success' && (
                          <Tooltip title="Load this dataset">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => loadImportedData(file)}
                            >
                              <CloudDownloadIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Remove file">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => removeImportedFile(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </ListItem>
                  ))}
                </List>

                {importedFiles.some(f => f.status === 'success') && (
                  <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<SaveIcon />}
                      onClick={() => setSaveDialogOpen(true)}
                    >
                      Save as New Dataset
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => setImportedFiles([])}
                    >
                      Clear All
                    </Button>
                  </Stack>
                )}
              </AccordionDetails>
            </Accordion>
          )}
        </Stack>
      </Paper>

      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Save Imported Data</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Dataset Name"
            fullWidth
            variant="outlined"
            value={newDatasetName}
            onChange={(e) => setNewDatasetName(e.target.value)}
            placeholder="Enter a name for the new dataset"
            sx={{ mt: 2 }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            This will save {importedFiles.filter(f => f.status === 'success').length} successful file(s) as a new dataset.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={saveImportedData} 
            variant="contained"
            disabled={!newDatasetName.trim()}
          >
            Save Dataset
          </Button>
        </DialogActions>
      </Dialog>

      {fireData.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <WhatshotIcon color="primary" />
            Imported Fire Data Preview
          </Typography>
          
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <Chip 
              label={`Dataset: ${getDatasetInfo().label}`} 
              color="primary" 
              variant="outlined" 
            />
            <Chip 
              label={`Records: ${fireData.length.toLocaleString()}`} 
              color="secondary" 
              variant="outlined" 
            />
            <Chip 
              label={`Type: ${getDatasetInfo().type}`} 
              color={getDatasetInfo().type === 'NRT' ? 'success' : 'info'} 
              variant="outlined" 
            />
          </Stack>

          <TableContainer sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Latitude</TableCell>
                  <TableCell>Longitude</TableCell>
                  <TableCell>Confidence</TableCell>
                  <TableCell>FRP</TableCell>
                  <TableCell>Brightness</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fireData.slice(0, 50).map((fire, index) => (
                  <TableRow key={index}>
                    <TableCell>{fire.acq_date}</TableCell>
                    <TableCell>{fire.acq_time || 'N/A'}</TableCell>
                    <TableCell>{fire.latitude.toFixed(5)}</TableCell>
                    <TableCell>{fire.longitude.toFixed(5)}</TableCell>
                    <TableCell>
                      {fire.confidence && (
                        <Chip 
                          label={fire.confidence} 
                          size="small"
                          color={fire.confidence === 'h' ? 'error' : fire.confidence === 'm' ? 'warning' : 'success'}
                        />
                      )}
                    </TableCell>
                    <TableCell>{fire.frp?.toFixed(2) || 'N/A'}</TableCell>
                    <TableCell>{fire.bright_ti4?.toFixed(2) || fire.bright_t31?.toFixed(2) || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {fireData.length > 50 && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              Showing first 50 records of {fireData.length.toLocaleString()} total records
            </Typography>
          )}
        </Paper>
      )}
    </Container>
  );
}
