import React from 'react';
import { Box, Button, Card, CardContent, TextField, Typography } from '@mui/material';

function Register() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
      <Card sx={{ minWidth: 350, p: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
            <Box component="img" src="/starfire-logo.png" alt="Starfire Hosting" sx={{ height: 60, mb: 2 }} />
            <Typography variant="h5" sx={{ mb: 2 }}>Register</Typography>
            <TextField label="Email" type="email" fullWidth sx={{ mb: 2 }} />
            <TextField label="Password" type="password" fullWidth sx={{ mb: 2 }} />
            <Button variant="contained" color="primary" fullWidth sx={{ mb: 1 }}>Register</Button>
            <Button variant="outlined" color="primary" fullWidth href="/login">Login</Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Register; 