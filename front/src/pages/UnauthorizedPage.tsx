import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2,
      }}
    >
      <Paper
        elevation={10}
        sx={{
          p: 4,
          maxWidth: 400,
          width: '100%',
          borderRadius: 2,
          textAlign: 'center',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom color="error">
          🚫 Доступ запрещен
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          У вас нет прав для доступа к панели администратора.
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/login')}
        >
          Вернуться к авторизации
        </Button>
      </Paper>
    </Box>
  );
};

export default UnauthorizedPage;