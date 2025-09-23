// front/src/components/Header.tsx
import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
} from '@mui/material';
import {
  Logout,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <AppBar position="static" sx={{ mb: 3 }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Панель администратора
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ mr: 2 }}>
            Привет, {user?.firstName}!
          </Typography>
          <Button
            color="inherit"
            startIcon={<Logout />}
            onClick={logout}
            sx={{ ml: 1 }}
          >
            Выйти
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;