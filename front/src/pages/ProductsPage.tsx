import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  FormControlLabel,
  Switch,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Inventory as InventoryIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
} from '@mui/icons-material';
import { apiService } from '../services/api';
import { Product, Category, Subcategory } from '../types';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Фильтры
  const [filters, setFilters] = useState({
    search: '',
    categoryId: '',
    subcategoryId: '',
    isAvailable: '',
  });

  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    priceBase: '1',
    categoryId: '',
    subcategoryId: '',
    isAvailable: true,
    image: '',
    minQuantity: 1,
    unit: 'кг',
    step: 1,
  });

  // Меню действий
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Уведомления
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const loadProducts = useCallback(async () => {
    try {
      setProductsLoading(true);
      
      // Подготавливаем фильтры для API
      const apiFilters: any = {};
      if (filters.search.trim()) apiFilters.search = filters.search.trim();
      if (filters.categoryId) apiFilters.categoryId = parseInt(filters.categoryId);
      if (filters.subcategoryId) apiFilters.subcategoryId = parseInt(filters.subcategoryId);
      if (filters.isAvailable !== '') apiFilters.isAvailable = filters.isAvailable === 'true';

      const productsData = await apiService.getProducts(apiFilters);
      setProducts(productsData);
    } catch (error) {
      console.error('Ошибка загрузки продуктов:', error);
      setError('Ошибка загрузки продуктов');
      showSnackbar('Ошибка загрузки продуктов', 'error');
    } finally {
      setProductsLoading(false);
    }
  }, [filters.search, filters.categoryId, filters.subcategoryId, filters.isAvailable]);

  // Загрузка данных при первом рендере
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        const [categoriesData, subcategoriesData] = await Promise.all([
          apiService.getCategories(),
          apiService.getSubcategories(),
        ]);
        
        setCategories(categoriesData);
        setSubcategories(subcategoriesData);
        
        // Загружаем продукты без фильтров
        const productsData = await apiService.getProducts();
        setProducts(productsData);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        setError('Ошибка загрузки данных');
        showSnackbar('Ошибка загрузки данных', 'error');
      } finally {
    setLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  // Загрузка продуктов при изменении фильтров
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev, [field]: value };
      
      // Если изменилась категория, сбрасываем подкатегорию
      if (field === 'categoryId') {
        newFilters.subcategoryId = '';
      }
      
      return newFilters;
    });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      categoryId: '',
      subcategoryId: '',
      isAvailable: '',
    });
  };

  const handleOpen = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        priceBase: ((product as any).priceBase || 1).toString(),
        categoryId: product.categoryId.toString(),
        subcategoryId: product.subcategoryId?.toString() || '',
        isAvailable: product.isAvailable,
        image: product.image || '',
        minQuantity: product.minQuantity || 1,
        unit: (product as any).unit || 'кг',
        step: (product as any).step || 1,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        priceBase: '1',
        categoryId: '',
        subcategoryId: '',
        isAvailable: true,
        image: '',
        minQuantity: 1,
        unit: 'кг',
        step: 1,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingProduct(null);
  };

  const handleSave = async () => {
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        priceBase: parseInt(formData.priceBase) || 1,
        categoryId: parseInt(formData.categoryId),
        subcategoryId: formData.subcategoryId ? parseInt(formData.subcategoryId) : undefined,
      };

      if (editingProduct) {
        await apiService.updateProduct(editingProduct.id, productData);
        showSnackbar('Продукт обновлен', 'success');
      } else {
        await apiService.createProduct(productData);
        showSnackbar('Продукт создан', 'success');
      }
      
    handleClose();
      // Перезагружаем продукты с текущими фильтрами
      loadProducts();
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      showSnackbar('Ошибка сохранения', 'error');
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const readAsDataURL = (f: File) => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });

    const compressDataUrl = (dataUrl: string, maxSize = 1024, quality = 0.75): Promise<string> =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          const scale = Math.min(1, maxSize / Math.max(width, height));
          width = Math.round(width * scale);
          height = Math.round(height * scale);
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Canvas context not available'));
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        };
        img.onerror = reject;
        img.src = dataUrl;
      });

    try {
      const original = await readAsDataURL(file);
      const compressed = await compressDataUrl(original, 1024, 0.75);
      setFormData(prev => ({ ...prev, image: compressed }));
      showSnackbar('Изображение оптимизировано и добавлено', 'success');
    } catch (err) {
      console.error('Ошибка обработки изображения', err);
      showSnackbar('Ошибка обработки изображения', 'error');
    }
  };

  const handleDelete = async (product: Product) => {
    if (window.confirm(`Удалить товар "${product.name}"?`)) {
      try {
        await apiService.deleteProduct(product.id);
        showSnackbar('Продукт удален', 'success');
        // Перезагружаем продукты с текущими фильтрами
        loadProducts();
      } catch (error) {
        console.error('Ошибка удаления:', error);
        showSnackbar('Ошибка удаления', 'error');
      }
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, product: Product) => {
    setAnchorEl(event.currentTarget);
    setSelectedProduct(product);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProduct(null);
  };

  const filteredSubcategories = subcategories.filter(
    sub => !filters.categoryId || sub.categoryId === parseInt(filters.categoryId)
  );

  const hasActiveFilters = filters.search || filters.categoryId || filters.subcategoryId || filters.isAvailable !== '';

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Продукты ({products.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Добавить продукт
        </Button>
      </Box>

      {/* Фильтры */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterListIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Фильтры</Typography>
          {hasActiveFilters && (
            <Button
              size="small"
              startIcon={<ClearIcon />}
              onClick={clearFilters}
              sx={{ ml: 'auto' }}
            >
              Очистить
            </Button>
          )}
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {/* Поиск */}
          <Box sx={{ flex: '1 1 300px', minWidth: 250 }}>
            <TextField
              fullWidth
              placeholder="Поиск по названию..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Категория */}
          <Box sx={{ flex: '1 1 200px', minWidth: 180 }}>
            <FormControl fullWidth>
              <InputLabel>Категория</InputLabel>
              <Select
                value={filters.categoryId}
                onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                label="Категория"
              >
                <MenuItem value="">Все категории</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Подкатегория */}
          <Box sx={{ flex: '1 1 200px', minWidth: 180 }}>
            <FormControl fullWidth>
              <InputLabel>Подкатегория</InputLabel>
              <Select
                value={filters.subcategoryId}
                onChange={(e) => handleFilterChange('subcategoryId', e.target.value)}
                label="Подкатегория"
                disabled={!filters.categoryId}
              >
                <MenuItem value="">Все подкатегории</MenuItem>
                {filteredSubcategories.map((subcategory) => (
                  <MenuItem key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Доступность */}
          <Box sx={{ flex: '1 1 150px', minWidth: 120 }}>
            <FormControl fullWidth>
              <InputLabel>Доступность</InputLabel>
              <Select
                value={filters.isAvailable}
                onChange={(e) => handleFilterChange('isAvailable', e.target.value)}
                label="Доступность"
              >
                <MenuItem value="">Все</MenuItem>
                <MenuItem value="true">В наличии</MenuItem>
                <MenuItem value="false">Нет в наличии</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Paper>

      {/* Таблица продуктов */}
      {productsLoading ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Загрузка продуктов...
          </Typography>
        </Paper>
      ) : products.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            {hasActiveFilters ? 'Продукты не найдены' : 'Продукты не добавлены'}
          </Typography>
          {hasActiveFilters && (
            <Button onClick={clearFilters} sx={{ mt: 2 }}>
              Очистить фильтры
            </Button>
          )}
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Продукт</TableCell>
                <TableCell>Категория</TableCell>
                <TableCell>Цена</TableCell>
                <TableCell>Ед./Шаг</TableCell>
                <TableCell>Мин. заказ</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Дата создания</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product: Product) => {
                const category = categories.find(cat => cat.id === product.categoryId);
                const subcategory = subcategories.find(sub => sub.id === product.subcategoryId);
                
                return (
                  <TableRow key={product.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {product.image ? (
                          <Avatar 
                            variant="rounded" 
                            src={product.image} 
                            sx={{ mr: 2, width: 48, height: 48 }}
                          />
                        ) : (
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main', width: 48, height: 48 }}>
                            <InventoryIcon />
                          </Avatar>
                        )}
                        <Box>
                          <Typography variant="subtitle2">
                  {product.name}
                </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {product.description || 'Без описания'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Chip
                          icon={<span>{category?.icon}</span>}
                          label={category?.name || 'Неизвестно'}
                          size="small"
                          sx={{ mb: 0.5 }}
                        />
                        {subcategory && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            {subcategory.name}
                </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold" color="primary">
                    {product.price} ₽
                  </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {(product as any).unit || 'кг'} / {(product as any).step || 1}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {product.minQuantity || 1}
                      </Typography>
                    </TableCell>
                    <TableCell>
                  <Chip
                        icon={product.isAvailable ? <CheckCircleIcon /> : <BlockIcon />}
                    label={product.isAvailable ? 'В наличии' : 'Нет в наличии'}
                    color={product.isAvailable ? 'success' : 'error'}
                    size="small"
                  />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(product.createdAt).toLocaleDateString('ru-RU')}
                      </Typography>
                <Typography variant="caption" color="text.secondary">
                        {new Date(product.createdAt).toLocaleTimeString('ru-RU', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, product)}
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
      )}

      {/* Меню действий */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (selectedProduct) {
            handleOpen(selectedProduct);
          }
          handleMenuClose();
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Редактировать</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedProduct) {
            handleDelete(selectedProduct);
          }
          handleMenuClose();
        }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Удалить</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingProduct ? 'Редактировать продукт' : 'Добавить продукт'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Описание"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Цена"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="База цены (за сколько единиц)"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.priceBase}
            onChange={(e) => setFormData({ ...formData, priceBase: e.target.value })}
            inputProps={{ min: 1 }}
            sx={{ mb: 2 }}
            helperText="Например: 1 (за 1 кг/шт), 100 (за 100 г)"
          />
          <TextField
            margin="dense"
            label="Минимальное количество"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.minQuantity}
            onChange={(e) => setFormData({ ...formData, minQuantity: parseInt(e.target.value) || 1 })}
            inputProps={{ min: 1 }}
            sx={{ mb: 2 }}
            helperText="Минимальное количество для заказа (по умолчанию 1)"
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Категория</InputLabel>
            <Select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value, subcategoryId: '' })}
            label="Категория"
            >
            {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Подкатегория</InputLabel>
            <Select
              value={formData.subcategoryId}
              onChange={(e) => setFormData({ ...formData, subcategoryId: e.target.value })}
              label="Подкатегория"
              disabled={!formData.categoryId}
            >
              {formData.categoryId && subcategories
                .filter(sub => sub.categoryId === parseInt(formData.categoryId))
                .map((subcategory) => (
                  <MenuItem key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <TextField
            margin="dense"
            label="Единица измерения"
            fullWidth
            variant="outlined"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            sx={{ mb: 2 }}
            helperText="Например: кг, шт., грамм, лоток"
          />

          <TextField
            margin="dense"
            label="Шаг заказа"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.step}
            onChange={(e) => setFormData({ ...formData, step: parseInt(e.target.value) || 1 })}
            inputProps={{ min: 1 }}
            sx={{ mb: 2 }}
            helperText="Например: 1 для шт./кг, 100 для 100 грамм"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={formData.isAvailable}
                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
              />
            }
            label="Доступен для заказа"
          />

          {/* Загрузка изображения */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Изображение товара</Typography>
            <Button variant="outlined" component="label">
              Загрузить файл
              <input hidden type="file" accept="image/*" onChange={handleImageChange} />
            </Button>
            {formData.image && (
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar variant="rounded" src={formData.image} sx={{ width: 64, height: 64 }} />
                <Button color="error" onClick={() => setFormData(prev => ({ ...prev, image: '' }))}>Удалить</Button>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Отмена</Button>
          <Button onClick={handleSave} variant="contained">
            {editingProduct ? 'Сохранить' : 'Добавить'}
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

export default ProductsPage;