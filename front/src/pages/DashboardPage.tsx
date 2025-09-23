import React from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  Divider,
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
      title: 'Выручка выполненные',
      value: `${(stats?.revenueCompleted || 0).toLocaleString()} ₽`,
      icon: <TrendingUp />,
      color: '#d32f2f',
    },
    {
      title: 'Выручка в работе',
      value: `${(stats?.revenueInProgress || 0).toLocaleString()} ₽`,
      icon: <TrendingUp />,
      color: '#1976d2',
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
            <Card sx={{ height: 160 }}>
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
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

      {/* Сводка заказов по статусам */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Заказы по статусам
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip label={`Ожидает: ${stats?.ordersByStatus?.pending || 0}`} />
            <Chip label={`Подтвержден: ${stats?.ordersByStatus?.confirmed || 0}`} />
            <Chip label={`Готовится: ${stats?.ordersByStatus?.preparing || 0}`} />
            <Chip label={`Готов к выдаче: ${stats?.ordersByStatus?.ready || 0}`} />
            <Chip label={`Доставлен: ${stats?.ordersByStatus?.delivered || 0}`} />
            <Chip label={`Отменен: ${stats?.ordersByStatus?.cancelled || 0}`} />
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ height: 16 }} />

      {/* Разбивка выручки выполненных */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Выручка выполненные — по периодам
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(160px, 1fr))', gap: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">Последние 24 часа</Typography>
              <Typography variant="h6">{`${(stats?.revenueCompletedBreakdown?.last24h || 0).toLocaleString()} ₽`}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Последние 3 дня</Typography>
              <Typography variant="h6">{`${(stats?.revenueCompletedBreakdown?.last3d || 0).toLocaleString()} ₽`}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Последние 7 дней</Typography>
              <Typography variant="h6">{`${(stats?.revenueCompletedBreakdown?.last7d || 0).toLocaleString()} ₽`}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Последние 30 дней</Typography>
              <Typography variant="h6">{`${(stats?.revenueCompletedBreakdown?.last30d || 0).toLocaleString()} ₽`}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Всего</Typography>
              <Typography variant="h6">{`${(stats?.revenueCompletedBreakdown?.all || 0).toLocaleString()} ₽`}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

    </Box>
  );
};

export default DashboardPage;