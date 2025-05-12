import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

function Navbar() {
  return (
    <AppBar position="static" color="default">
      <Toolbar>
        <Box component="img" src="/starfire-logo.png" alt="Starfire Hosting" sx={{ height: 40, mr: 2 }} />
        <Typography variant="h6" color="inherit" noWrap>
          Starfire CAD
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 