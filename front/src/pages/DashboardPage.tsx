import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ShoppingCart,
  Inventory,
  People,
  TrendingUp,
} from '@mui/icons-material';
import { useApi } from '../hooks/useApi';
import { apiService } from '../services/api';

const DashboardPage: React.FC = () => {
  const { data: stats, loading, error } = useApi(() => apiService.getStats());

  const statCards = [
    {
      title: 'Всего заказов',
      value: stats?.totalOrders || 0,
      icon: <ShoppingCart />,
      color: '#1976d2',
    },
    {
      title: 'Продуктов в каталоге',
      value: stats?.totalProducts || 0,
      icon: <Inventory />,
      color: '#388e3c',
    },
    {
      title: 'Пользователей',
      value: stats?.totalUsers || 0,
      icon: <People />,
      color: '#f57c00',
    },
    {
      title: 'Общая выручка',
      value: `${(stats?.totalRevenue || 0).toLocaleString()} ₽`,
      icon: <TrendingUp />,
      color: '#d32f2f',
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Дашборд
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        {statCards.map((card, index) => (
          <Box key={index} sx={{ minWidth: 250, flex: '1 1 250px' }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      backgroundColor: card.color,
                      color: 'white',
                      mr: 2,
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Typography variant="h6" component="div">
                    {card.title}
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Последние заказы
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Здесь будет таблица с последними заказами
        </Typography>
      </Paper>
    </Box>
  );
};

export default DashboardPage;