import React from 'react';
import { Box, Typography } from '@mui/material';

function Dashboard() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" color="primary" gutterBottom>
        Welcome to Starfire CAD Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary">
        This is your main dashboard. More features coming soon!
      </Typography>
    </Box>
  );
}

export default Dashboard; 