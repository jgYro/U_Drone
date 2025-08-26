import { Link } from "react-router";
import { Container, Typography, Paper, List, ListItem, ListItemIcon, ListItemText, Button, Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function About() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom color="primary">
          About This Application
        </Typography>
        <Typography variant="body1" paragraph>
          This is a simple full-stack application demonstrating:
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="success" />
            </ListItemIcon>
            <ListItemText 
              primary="React Frontend" 
              secondary="Built with React Router for seamless navigation"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="success" />
            </ListItemIcon>
            <ListItemText 
              primary="Flask Backend" 
              secondary="RESTful API with CORS support for cross-origin requests"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="success" />
            </ListItemIcon>
            <ListItemText 
              primary="Material-UI Design" 
              secondary="Modern, responsive interface using Material Design principles"
            />
          </ListItem>
        </List>
        
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
      </Paper>
    </Container>
  );
}