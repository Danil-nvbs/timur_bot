// front/src/pages/CategoriesPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Category as CategoryIcon,
  SubdirectoryArrowRight as SubcategoryIcon,
} from '@mui/icons-material';
import { useApi } from '../hooks/useApi';
import { apiService } from '../services/api';
import { Category, Subcategory } from '../types';

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Диалоги
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [subcategoryDialogOpen, setSubcategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  
  // Меню действий
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<Category | Subcategory | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<'category' | 'subcategory' | null>(null);
  
  // Формы
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    icon: '',
    isActive: true,
  });
  
  const [subcategoryForm, setSubcategoryForm] = useState({
    categoryId: '',
    name: '',
    description: '',
    isActive: true,
  });

  const { data: categoriesData, loading: categoriesLoading, error: categoriesError } = useApi(apiService.getCategories);
  const { data: subcategoriesData, loading: subcategoriesLoading, error: subcategoriesError } = useApi(apiService.getSubcategories);

  useEffect(() => {
    if (categoriesData) {
      setCategories(categoriesData);
    }
    if (subcategoriesData) {
      setSubcategories(subcategoriesData);
    }
    setLoading(categoriesLoading || subcategoriesLoading);
    setError(categoriesError || subcategoriesError);
  }, [categoriesData, subcategoriesData, categoriesLoading, subcategoriesLoading, categoriesError, subcategoriesError]);

  const handleCreateCategory = async () => {
    try {
      const newCategory = await apiService.createCategory(categoryForm);
      setCategories([...categories, newCategory]);
      setCategoryDialogOpen(false);
      resetCategoryForm();
    } catch (error) {
      console.error('Ошибка создания категории:', error);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    
    try {
      const updatedCategory = await apiService.updateCategory(editingCategory.id, categoryForm);
      setCategories(categories.map(cat => cat.id === editingCategory.id ? updatedCategory : cat));
      setCategoryDialogOpen(false);
      setEditingCategory(null);
      resetCategoryForm();
    } catch (error) {
      console.error('Ошибка обновления категории:', error);
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    if (window.confirm(`Удалить категорию "${category.name}"?`)) {
      try {
        await apiService.deleteCategory(category.id);
        setCategories(categories.filter(cat => cat.id !== category.id));
        setSubcategories(subcategories.filter(sub => sub.categoryId !== category.id));
      } catch (error) {
        console.error('Ошибка удаления категории:', error);
      }
    }
  };

  const handleCreateSubcategory = async () => {
    try {
      const newSubcategory = await apiService.createSubcategory({
        ...subcategoryForm,
        categoryId: parseInt(subcategoryForm.categoryId),
      });
      setSubcategories([...subcategories, newSubcategory]);
      setSubcategoryDialogOpen(false);
      resetSubcategoryForm();
    } catch (error) {
      console.error('Ошибка создания подкатегории:', error);
    }
  };

  const handleUpdateSubcategory = async () => {
    if (!editingSubcategory) return;
    
    try {
      const updatedSubcategory = await apiService.updateSubcategory(editingSubcategory.id, {
        ...subcategoryForm,
        categoryId: parseInt(subcategoryForm.categoryId),
      });
      setSubcategories(subcategories.map(sub => sub.id === editingSubcategory.id ? updatedSubcategory : sub));
      setSubcategoryDialogOpen(false);
      setEditingSubcategory(null);
      resetSubcategoryForm();
    } catch (error) {
      console.error('Ошибка обновления подкатегории:', error);
    }
  };

  const handleDeleteSubcategory = async (subcategory: Subcategory) => {
    if (window.confirm(`Удалить подкатегорию "${subcategory.name}"?`)) {
      try {
        await apiService.deleteSubcategory(subcategory.id);
        setSubcategories(subcategories.filter(sub => sub.id !== subcategory.id));
      } catch (error) {
        console.error('Ошибка удаления подкатегории:', error);
      }
    }
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      description: '',
      icon: '',
      isActive: true,
    });
  };

  const resetSubcategoryForm = () => {
    setSubcategoryForm({
      categoryId: '',
      name: '',
      description: '',
      isActive: true,
    });
  };

  const openCategoryDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        description: category.description || '',
        icon: category.icon || '',
        isActive: category.isActive,
      });
    } else {
      setEditingCategory(null);
      resetCategoryForm();
    }
    setCategoryDialogOpen(true);
  };

  const openSubcategoryDialog = (subcategory?: Subcategory) => {
    if (subcategory) {
      setEditingSubcategory(subcategory);
      setSubcategoryForm({
        categoryId: subcategory.categoryId.toString(),
        name: subcategory.name,
        description: subcategory.description || '',
        isActive: subcategory.isActive,
      });
    } else {
      setEditingSubcategory(null);
      resetSubcategoryForm();
    }
    setSubcategoryDialogOpen(true);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, item: Category | Subcategory, type: 'category' | 'subcategory') => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
    setSelectedItemType(type);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
    setSelectedItemType(null);
  };

  if (loading) {
    return (
      <Box p={3}>
        <Typography>Загрузка...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">Ошибка: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Управление категориями</Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<CategoryIcon />}
            onClick={() => openCategoryDialog()}
            sx={{ mr: 1 }}
          >
            Добавить категорию
          </Button>
          <Button
            variant="outlined"
            startIcon={<SubcategoryIcon />}
            onClick={() => openSubcategoryDialog()}
          >
            Добавить подкатегорию
          </Button>
        </Box>
      </Box>

      {/* Категории */}
      <Paper sx={{ mb: 3 }}>
        <Box p={2}>
          <Typography variant="h6" gutterBottom>
            Категории ({categories.length})
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Название</TableCell>
                  <TableCell>Описание</TableCell>
                  <TableCell>Иконка</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Подкатегории</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <Typography variant="subtitle2">{category.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {category.description || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {category.icon && (
                        <Typography variant="h6">{category.icon}</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={category.isActive ? 'Активна' : 'Неактивна'}
                        color={category.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={subcategories.filter(sub => sub.categoryId === category.id).length}
                        color="primary"
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, category, 'category')}
                        size="small"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>

      {/* Подкатегории */}
      <Paper>
        <Box p={2}>
          <Typography variant="h6" gutterBottom>
            Подкатегории ({subcategories.length})
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Название</TableCell>
                  <TableCell>Категория</TableCell>
                  <TableCell>Описание</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subcategories.map((subcategory) => {
                  const parentCategory = categories.find(cat => cat.id === subcategory.categoryId);
                  return (
                    <TableRow key={subcategory.id}>
                      <TableCell>
                        <Typography variant="subtitle2">{subcategory.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="primary">
                          {parentCategory?.name || 'Неизвестно'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="textSecondary">
                          {subcategory.description || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={subcategory.isActive ? 'Активна' : 'Неактивна'}
                          color={subcategory.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, subcategory, 'subcategory')}
                          size="small"
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>

      {/* Меню действий */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (selectedItemType === 'category') {
            openCategoryDialog(selectedItem as Category);
          } else {
            openSubcategoryDialog(selectedItem as Subcategory);
          }
          handleMenuClose();
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Редактировать</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedItemType === 'category') {
            handleDeleteCategory(selectedItem as Category);
          } else {
            handleDeleteSubcategory(selectedItem as Subcategory);
          }
          handleMenuClose();
        }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Удалить</ListItemText>
        </MenuItem>
      </Menu>

      {/* Диалог категории */}
      <Dialog open={categoryDialogOpen} onClose={() => setCategoryDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? 'Редактировать категорию' : 'Добавить категорию'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название"
            fullWidth
            variant="outlined"
            value={categoryForm.name}
            onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Описание"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={categoryForm.description}
            onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Иконка (эмодзи)"
            fullWidth
            variant="outlined"
            value={categoryForm.icon}
            onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
            sx={{ mb: 2 }}
            placeholder="🛒"
          />
          <FormControlLabel
            control={
              <Switch
                checked={categoryForm.isActive}
                onChange={(e) => setCategoryForm({ ...categoryForm, isActive: e.target.checked })}
              />
            }
            label="Активна"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryDialogOpen(false)}>Отмена</Button>
          <Button
            onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}
            variant="contained"
          >
            {editingCategory ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог подкатегории */}
      <Dialog open={subcategoryDialogOpen} onClose={() => setSubcategoryDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingSubcategory ? 'Редактировать подкатегорию' : 'Добавить подкатегорию'}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Категория"
            select
            fullWidth
            variant="outlined"
            value={subcategoryForm.categoryId}
            onChange={(e) => setSubcategoryForm({ ...subcategoryForm, categoryId: e.target.value })}
            sx={{ mb: 2 }}
          >
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.icon} {category.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            autoFocus
            margin="dense"
            label="Название"
            fullWidth
            variant="outlined"
            value={subcategoryForm.name}
            onChange={(e) => setSubcategoryForm({ ...subcategoryForm, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Описание"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={subcategoryForm.description}
            onChange={(e) => setSubcategoryForm({ ...subcategoryForm, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={subcategoryForm.isActive}
                onChange={(e) => setSubcategoryForm({ ...subcategoryForm, isActive: e.target.checked })}
              />
            }
            label="Активна"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubcategoryDialogOpen(false)}>Отмена</Button>
          <Button
            onClick={editingSubcategory ? handleUpdateSubcategory : handleCreateSubcategory}
            variant="contained"
          >
            {editingSubcategory ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoriesPage;
