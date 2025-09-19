// front/src/pages/UsersPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Alert,
} from '@mui/material';
import { MoreVert, Block, CheckCircle, AdminPanelSettings } from '@mui/icons-material';
import { User } from '../types';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<'user' | 'admin' | 'owner'>('user');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const usersData = await apiService.getUsers();
        setUsers(usersData);
      } catch (error) {
        console.error('Ошибка загрузки пользователей:', error);
        showSnackbar('Ошибка загрузки пользователей', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, user: User) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleToggleStatus = async () => {
    if (!selectedUser) return;
    
    try {
      await apiService.toggleUserStatus(selectedUser.id);
      await refreshUsers();
      showSnackbar(
        `Пользователь ${selectedUser.isActive ? 'заблокирован' : 'разблокирован'}`,
        'success'
      );
    } catch (error) {
      console.error('Ошибка изменения статуса:', error);
      showSnackbar('Ошибка изменения статуса', 'error');
    }
    
    handleMenuClose();
  };

  const handleRoleChange = async () => {
    if (!selectedUser) return;
    
    // Дополнительная защита - нельзя изменить роль владельца
    if (selectedUser.role === 'owner') {
      showSnackbar('Роль владельца нельзя изменить', 'error');
      setRoleDialogOpen(false);
      return;
    }
    
    try {
      await apiService.updateUserRole(selectedUser.id, newRole);
      await refreshUsers();
      showSnackbar(`Роль пользователя изменена на ${newRole}`, 'success');
    } catch (error) {
      console.error('Ошибка изменения роли:', error);
      showSnackbar('Ошибка изменения роли', 'error');
    }
    
    setRoleDialogOpen(false);
    handleMenuClose();
  };

  const refreshUsers = async () => {
    try {
      const usersData = await apiService.getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Ошибка обновления пользователей:', error);
    }
  };

  const canManageRole = (user: User | null) => {
    if (!user || !currentUser) return false;
    return currentUser.role === 'owner' && user.id !== currentUser.id && user.role !== 'owner';
  };
  

  const canManageStatus = (user: User | null) => {
    if (!user || !currentUser) return false;
    if (user.id === currentUser.id) return false; // Нельзя блокировать себя
    if (currentUser.role === 'owner') return true; // Owner может управлять всеми
    if (currentUser.role === 'admin' && user.role === 'user') return true; // Admin может блокировать только пользователей
    return false;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return '👑';
      case 'admin': return '⚡';
      case 'user': return '👤';
      default: return '��';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'error';
      case 'admin': return 'warning';
      case 'user': return 'default';
      default: return 'default';
    }
  };

  if (loading) {
    return <Typography>Загрузка...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Пользователи
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Пользователь</TableCell>
              <TableCell>Telegram ID</TableCell>
              <TableCell>Телефон</TableCell>
              <TableCell>Роль</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Дата регистрации</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 2 }}>
                      {user.firstName?.[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2">
                        {user.firstName} {user.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        @{user.username}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{user.telegramId}</TableCell>
                <TableCell>{user.phone || 'Не указан'}</TableCell>
                <TableCell>
                  <Chip
                    icon={<span>{getRoleIcon(user.role)}</span>}
                    label={user.role}
                    color={getRoleColor(user.role) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    icon={user.isActive ? <CheckCircle /> : <Block />}
                    label={user.isActive ? 'Активен' : 'Заблокирован'}
                    color={user.isActive ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={(e) => handleMenuClick(e, user)}
                    disabled={user.id === currentUser?.id}
                  >
                    <MoreVert />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Меню действий */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {canManageRole(selectedUser) && (
          <MenuItem onClick={() => setRoleDialogOpen(true)}>
            <AdminPanelSettings sx={{ mr: 1 }} />
            Изменить роль
          </MenuItem>
        )}
        {canManageStatus(selectedUser) && (
          <MenuItem onClick={handleToggleStatus}>
            {selectedUser?.isActive ? (
              <>
                <Block sx={{ mr: 1 }} />
                Заблокировать
              </>
            ) : (
              <>
                <CheckCircle sx={{ mr: 1 }} />
                Разблокировать
              </>
            )}
          </MenuItem>
        )}
      </Menu>

      {/* Диалог изменения роли */}
      <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)}>
        <DialogTitle>Изменить роль пользователя</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Пользователь: {selectedUser?.firstName} {selectedUser?.lastName}
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Роль</InputLabel>
            <Select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as 'user' | 'admin' | 'owner')}
              label="Роль"
            >
              <MenuItem value="user">�� Пользователь</MenuItem>
              <MenuItem value="admin">⚡ Администратор</MenuItem>
              {/* Убираем возможность выбора роли владельца */}
              {selectedUser?.role !== 'owner' && (
                <MenuItem value="owner" disabled>
                  �� Владелец (недоступно)
                </MenuItem>
              )}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleRoleChange} variant="contained">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Уведомления */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UsersPage;