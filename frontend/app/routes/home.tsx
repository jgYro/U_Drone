import type { Route } from "./+types/home";
import { Link } from "react-router";
import { Container, Typography, Box, Paper, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import ApiIcon from '@mui/icons-material/Api';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "React + Flask App" },
    { name: "description", content: "Simple React frontend with Flask backend" },
  ];
}

export default function Home() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom color="primary">
          Welcome to React + Flask App
        </Typography>
        <Typography variant="h6" color="text.secondary">
          This is a simple React frontend with Flask backend.
        </Typography>
      </Paper>
      
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Navigation
        </Typography>
        <List>
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/">
              <ListItemIcon>
                <HomeIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Home" secondary="Main landing page" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/about">
              <ListItemIcon>
                <InfoIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="About" secondary="Learn more about this app" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/api-demo">
              <ListItemIcon>
                <ApiIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="API Demo" secondary="Test the backend API connection" />
            </ListItemButton>
          </ListItem>
        </List>
      </Paper>
    </Container>
  );
}
