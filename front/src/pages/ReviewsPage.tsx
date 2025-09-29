import React, { useEffect, useMemo, useState } from 'react';
import { Box, Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody, Chip, IconButton, Button, Snackbar, Alert, CircularProgress, FormControl, InputLabel, Select, MenuItem, TextField, Stack, Avatar } from '@mui/material';
import { VisibilityOff, Visibility } from '@mui/icons-material';
import { apiService } from '../services/api';

interface ReviewDto {
  id: number;
  userId: number;
  productId?: number;
  orderId?: number;
  rating: number;
  text?: string;
  photos?: string[];
  hidden: boolean;
  createdAt: string;
}

const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{open: boolean; message: string; severity: 'success' | 'error'}>({ open: false, message: '', severity: 'success' });
  const [filters, setFilters] = useState<{ rating: string; hidden: string; type: string; linkId: string }>({ rating: '', hidden: '', type: '', linkId: '' });

  const load = async (reset = false) => {
    try {
      setLoading(true);
      const res = await apiService.getLatestReviews({ offset: reset ? 0 : offset, limit: 20 });
      setReviews(reset ? res : [...reviews, ...res]);
      setOffset((reset ? 0 : offset) + res.length);
    } catch (e) {
      setSnackbar({ open: true, message: 'Ошибка загрузки отзывов', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(true); // initial
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    return reviews.filter(r => {
      if (filters.rating && String(r.rating) !== filters.rating) return false;
      if (filters.hidden !== '' && String(r.hidden) !== filters.hidden) return false;
      if (filters.type === 'product' && !r.productId) return false;
      if (filters.type === 'order' && !r.orderId) return false;
      if (filters.linkId) {
        const idNum = parseInt(filters.linkId);
        if (!isNaN(idNum)) {
          if (filters.type === 'product' && r.productId !== idNum) return false;
          if (filters.type === 'order' && r.orderId !== idNum) return false;
          if (!filters.type && !(r.productId === idNum || r.orderId === idNum)) return false;
        }
      }
      return true;
    });
  }, [reviews, filters]);

  const toggleHidden = async (r: ReviewDto) => {
    try {
      if (r.hidden) {
        await apiService.unhideReview(r.id);
      } else {
        await apiService.hideReview(r.id);
      }
      setReviews(reviews.map(x => x.id === r.id ? { ...x, hidden: !x.hidden } : x));
      setSnackbar({ open: true, message: 'Готово', severity: 'success' });
    } catch (e) {
      setSnackbar({ open: true, message: 'Ошибка сохранения', severity: 'error' });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Отзывы</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <FormControl sx={{ minWidth: 140 }}>
            <InputLabel>Рейтинг</InputLabel>
            <Select label="Рейтинг" value={filters.rating} onChange={(e) => setFilters({ ...filters, rating: e.target.value })}>
              <MenuItem value="">Любой</MenuItem>
              {[1,2,3,4,5].map(n => <MenuItem key={n} value={String(n)}>{n}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 160 }}>
            <InputLabel>Статус</InputLabel>
            <Select label="Статус" value={filters.hidden} onChange={(e) => setFilters({ ...filters, hidden: e.target.value })}>
              <MenuItem value="">Все</MenuItem>
              <MenuItem value="false">Показан</MenuItem>
              <MenuItem value="true">Скрыт</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel>Тип</InputLabel>
            <Select label="Тип" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value, linkId: '' })}>
              <MenuItem value="">Все</MenuItem>
              <MenuItem value="product">По товару</MenuItem>
              <MenuItem value="order">По заказу</MenuItem>
            </Select>
          </FormControl>
          <TextField label={filters.type === 'order' ? 'ID заказа' : filters.type === 'product' ? 'ID товара' : 'ID товара/заказа'} value={filters.linkId} onChange={(e) => setFilters({ ...filters, linkId: e.target.value })} />
          <Box sx={{ flex: 1 }} />
          <Button variant="outlined" onClick={() => { setFilters({ rating: '', hidden: '', type: '', linkId: '' }); }}>Сбросить</Button>
        </Stack>
      </Paper>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Фото</TableCell>
              <TableCell>Рейтинг</TableCell>
              <TableCell>Текст</TableCell>
              <TableCell>Привязка</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(r => (
              <TableRow key={r.id} hover>
                <TableCell>{r.id}</TableCell>
                <TableCell>
                  {r.photos && r.photos.length > 0 ? (
                    <Avatar variant="rounded" src={r.photos[0]} sx={{ width: 48, height: 48 }} />
                  ) : null}
                </TableCell>
                <TableCell>{'⭐'.repeat(r.rating)}</TableCell>
                <TableCell>{(r.text || '').slice(0, 120)}</TableCell>
                <TableCell>{r.productId ? `Товар #${r.productId}` : r.orderId ? `Заказ #${r.orderId}` : '-'}</TableCell>
                <TableCell>
                  <Chip size="small" label={r.hidden ? 'Скрыт' : 'Показан'} color={r.hidden ? 'warning' : 'success'} />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => toggleHidden(r)}>
                    {r.hidden ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
          {loading ? <CircularProgress size={24} /> : (
            <Button variant="outlined" onClick={() => load(false)}>Ещё</Button>
          )}
        </Box>
      </Paper>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ReviewsPage;


