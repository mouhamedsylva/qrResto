import React, { useEffect, useMemo, useRef, useState } from 'react';
import Layout from '../components/Layout';
import {
  Plus, Search, MoreHorizontal, Pencil, Trash2, X, Check,
  Copy, Package, GripVertical, Eye, EyeOff, Sun, Download,
  Upload, Flame, Clock, Zap, AlertCircle, ChevronLeft, ChevronRight,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { useConfirm } from '../components/ConfirmModal';

// ─── ALLERGENS ────────────────────────────────────────────────────────────
const ALLERGENS = [
  { key: 'gluten',    label: 'Gluten',    emoji: '🌾' },
  { key: 'lactose',   label: 'Lactose',   emoji: '🥛' },
  { key: 'nuts',      label: 'Noix',      emoji: '🥜' },
  { key: 'eggs',      label: 'Œufs',      emoji: '🥚' },
  { key: 'fish',      label: 'Poisson',   emoji: '🐟' },
  { key: 'shellfish', label: 'Crustacés', emoji: '🦐' },
  { key: 'soy',       label: 'Soja',      emoji: '🫘' },
  { key: 'sesame',    label: 'Sésame',    emoji: '🌱' },
];

const DIETARY = [
  { key: 'vegan',       label: 'Vegan',       color: '#16a34a', bg: 'rgba(22,163,74,0.12)'  },
  { key: 'vegetarian',  label: 'Végétarien',  color: '#15803d', bg: 'rgba(21,128,61,0.12)'  },
  { key: 'halal',       label: 'Halal',       color: '#0891b2', bg: 'rgba(8,145,178,0.12)'  },
  { key: 'gluten-free', label: 'Sans Gluten', color: '#d97706', bg: 'rgba(217,119,6,0.12)'  },
];

const DAYS_SHORT = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

// ─── TYPES ────────────────────────────────────────────────────────────────
type MenuItem = {
  id: string;
  name: string;
  description?: string;
  price: number | string;
  imageUrl?: string;
  badgeLabel?: string;
  badgeColor?: string;
  stockQty?: number;
  lowStockThreshold?: number;
  displayOrder?: number;
  isActive?: boolean;
  isDishOfDay?: boolean;
  prepTime?: number;
  calories?: number;
  allergens?: string[];
  dietaryLabels?: string[];
  availableDays?: number[];
  ordersCount?: number;
  subCategory?: { id: string; name: string };
  createdAt?: string;
};

type SubCategory = {
  id: string;
  name: string;
  order: number;
  isActive: boolean;
};

type Category = {
  id: string;
  name: string;
  items: MenuItem[];
  subCategories?: SubCategory[];
  order: number;
};

type CreatedCategory = { id: string; name: string };

type ItemSettings = {
  badgeLabel: string;
  badgeColor: string;
  stockQty: number;
  lowStockThreshold: number;
  displayOrder: number;
  isActive: boolean;
  isDishOfDay: boolean;
  prepTime: number;
  calories: number;
  allergens: string[];
  dietaryLabels: string[];
  availableDays: number[];
  ordersCount: number;
  subCategoryId: string;
};

type NewItemState = {
  name: string; price: string; imageUrl: string; description: string;
  categoryId: string; badgeLabel: string; badgeColor: string;
  stockQty: string; lowStockThreshold: string;
  prepTime: string; calories: string;
  allergens: string[]; dietaryLabels: string[];
  availableDays: number[]; subCategoryId: string;
};

// ─── CSV HELPERS ──────────────────────────────────────────────────────────
const exportCSV = (
  items: (MenuItem & { categoryName: string })[],
  settings: Record<string, ItemSettings>,
) => {
  const header = [
    'Nom','Catégorie','Sous-catégorie','Prix','Description',
    'Badge','Stock','Actif','Plat du jour',
    'Temps prep (min)','Calories','Allergènes','Labels diét.','Jours dispo',
  ];
  const rows = items.map(item => {
    const s = settings[item.id];
    return [
      item.name, item.categoryName, item.subCategory?.name ?? '',
      item.price, item.description ?? '', s?.badgeLabel ?? '',
      s?.stockQty ?? '', s?.isActive ? 'oui' : 'non',
      s?.isDishOfDay ? 'oui' : 'non', s?.prepTime ?? '',
      s?.calories ?? '',
      (s?.allergens ?? []).join('|'),
      (s?.dietaryLabels ?? []).join('|'),
      (s?.availableDays ?? []).map(d => DAYS_SHORT[d]).join('|'),
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
  });
  const csv = [header.join(','), ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'menu_export.csv'; a.click();
  URL.revokeObjectURL(url);
};

// ─── COMPONENT ────────────────────────────────────────────────────────────
const MenuManagement: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { currencyConfig } = useCurrency();
  const restaurantId = user?.restaurant?.id;

  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(null);
  const [activeView, setActiveView] = useState('all'); // 'all' | 'dish-of-day'
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, activeSubCategory, activeView, search]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [openActionsItemId, setOpenActionsItemId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedPreviewItem, setSelectedPreviewItem] = useState<(MenuItem & { categoryName: string }) | null>(null);
  const { confirm } = useConfirm();
  const [itemSettings, setItemSettings] = useState<Record<string, ItemSettings>>({});
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [bulkBadgeLabel, setBulkBadgeLabel] = useState('Best seller');
  const [bulkBadgeColor, setBulkBadgeColor] = useState('#9b2c49');
  const [categoryName, setCategoryName] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragItemId = useRef<string | null>(null);

  // Category and Subcategory Drag & Drop
  const [dragOverCategoryId, setDragOverCategoryId] = useState<string | null>(null);
  const dragCategoryId = useRef<string | null>(null);
  const [dragOverSubCategoryId, setDragOverSubCategoryId] = useState<string | null>(null);
  const dragSubCategoryId = useRef<string | null>(null);

  const handleCategoryDragStart = (id: string) => {
    dragCategoryId.current = id;
  };

  const handleCategoryDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (dragCategoryId.current !== id) setDragOverCategoryId(id);
  };

  const handleCategoryDrop = async (targetId: string) => {
    const sourceId = dragCategoryId.current;
    if (!sourceId || sourceId === targetId) { setDragOverCategoryId(null); return; }
    
    const newCategories = [...categories];
    const sourceIndex = newCategories.findIndex(c => c.id === sourceId);
    const targetIndex = newCategories.findIndex(c => c.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) return;

    // Remove source and insert at target
    const [removed] = newCategories.splice(sourceIndex, 1);
    newCategories.splice(targetIndex, 0, removed);

    const updatedCategories = newCategories.map((cat, idx) => ({ ...cat, order: idx + 1 }));
    setCategories(updatedCategories);
    setDragOverCategoryId(null);
    dragCategoryId.current = null;

    try {
      await api.post('/menus/categories/reorder', {
        orders: updatedCategories.map((c, idx) => ({ id: c.id, order: idx + 1 }))
      });
    } catch (error) { console.error("Erreur reorder categories", error); }
  };

  const handleSubCategoryDragStart = (id: string) => {
    dragSubCategoryId.current = id;
  };

  const handleSubCategoryDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (dragSubCategoryId.current !== id) setDragOverSubCategoryId(id);
  };

  const handleSubCategoryDrop = async (targetId: string) => {
    const sourceId = dragSubCategoryId.current;
    if (!sourceId || sourceId === targetId) { setDragOverSubCategoryId(null); return; }
    
    const activeCat = categories.find(c => c.id === activeCategory);
    if (!activeCat || !activeCat.subCategories) return;

    const newSubCategories = [...activeCat.subCategories];
    const sourceIndex = newSubCategories.findIndex(sc => sc.id === sourceId);
    const targetIndex = newSubCategories.findIndex(sc => sc.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) return;

    // Remove source and insert at target
    const [removed] = newSubCategories.splice(sourceIndex, 1);
    newSubCategories.splice(targetIndex, 0, removed);

    const updatedSubCategories = newSubCategories.map((sc, idx) => ({ ...sc, order: idx + 1 }));

    // Update locally
    setCategories(prev => prev.map(c => 
      c.id === activeCategory ? { ...c, subCategories: updatedSubCategories } : c
    ));
    
    setDragOverSubCategoryId(null);
    dragSubCategoryId.current = null;

    try {
      await api.post('/menus/subcategories/reorder', {
        orders: updatedSubCategories.map((sc, idx) => ({ id: sc.id, order: idx + 1 }))
      });
    } catch (error) { console.error("Erreur reorder subcategories", error); }
  };

  const csvInputRef = useRef<HTMLInputElement>(null);

  // Subcategory management state
  const [subCategoryName, setSubCategoryName] = useState('');
  const [isAddingSubCategory, setIsAddingSubCategory] = useState(false);

  const defaultNewItem: NewItemState = {
    name: '', price: '', imageUrl: '', description: '',
    categoryId: '', badgeLabel: 'Signature', badgeColor: '#6d28d9',
    stockQty: '20', lowStockThreshold: '5',
    prepTime: '15', calories: '',
    allergens: [], dietaryLabels: [],
    availableDays: [0, 1, 2, 3, 4, 5, 6],
    subCategoryId: '',
  };
  const [newItem, setNewItem] = useState<NewItemState>(defaultNewItem);

  const loadMenus = async () => {
    if (!restaurantId) { setIsLoading(false); return; }
    setIsLoading(true);
    try {
      const response = await api.get<Category[]>(`/menus/categories/${restaurantId}`);
      setCategories(response.data);
    } catch (error) {
      console.error('Erreur chargement menus', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void loadMenus(); }, [restaurantId]);

  const categoryPills = useMemo(() => {
    // Deduplicate categories by ID or name to avoid visual artifacts
    const uniqueCats = categories.filter((c, index, self) => 
      index === self.findIndex((t) => t.id === c.id)
    );
    const allCount = uniqueCats.reduce((sum, c) => sum + (c.items?.length || 0), 0);
    return [
      { id: 'all', label: t('menu.all'), count: allCount },
      ...uniqueCats.map(c => ({ id: c.id, label: c.name, count: c.items?.length || 0 })),
    ];
  }, [categories, t]);

  const getTagStyle = (price: number) => {
    if (price >= 20) return { label: t('menu.bestSeller'), css: 'is-hot' };
    if (price <= 10) return { label: t('menu.new'), css: 'is-new' };
    return { label: t('menu.signature'), css: 'is-signature' };
  };

  const getStockVisual = (itemId: string) => {
    const s = itemSettings[itemId];
    if (!s) return { label: `${t('menu.stock')}: --`, color: '#475569', bg: 'rgba(71,85,105,0.12)' };
    if (s.stockQty <= 0) return { label: t('menu.outOfStock'), color: '#b91c1c', bg: 'rgba(185,28,28,0.14)' };
    if (s.stockQty <= s.lowStockThreshold) return { label: `${t('menu.lowStock')} (${s.stockQty})`, color: '#b45309', bg: 'rgba(245,158,11,0.14)' };
    return { label: `${t('menu.stock')}: ${s.stockQty}`, color: '#047857', bg: 'rgba(16,185,129,0.14)' };
  };

  const filteredItems = useMemo(() => {
    const source =
      activeCategory === 'all'
        ? categories.flatMap(c => (c.items || []).map(item => ({ ...item, categoryName: c.name, categoryId: c.id })))
        : (categories.find(c => c.id === activeCategory)?.items?.map(item => ({
            ...item,
            categoryName: categories.find(c => c.id === activeCategory)?.name ?? '',
            categoryId: activeCategory
          })) ?? []);

    return source
      .filter(item => {
        const text = `${item.name} ${item.description ?? ''} ${item.categoryName} ${item.subCategory?.name ?? ''}`.toLowerCase();
        const matchSearch = text.includes(search.toLowerCase());
        const matchView = activeView === 'all' || itemSettings[item.id]?.isDishOfDay;
        const matchSubCategory = !activeSubCategory || itemSettings[item.id]?.subCategoryId === activeSubCategory;
        return matchSearch && matchView && matchSubCategory;
      })
      .sort((a, b) => (itemSettings[a.id]?.displayOrder ?? 0) - (itemSettings[b.id]?.displayOrder ?? 0));
  }, [categories, activeCategory, search, itemSettings, activeView, activeSubCategory]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage, ITEMS_PER_PAGE]);

  useEffect(() => {
    const allItems = categories.flatMap(c => c.items || []);
    setItemSettings(prev => {
      const next = { ...prev };
      allItems.forEach((item, index) => {
        const fallbackTag = getTagStyle(Number(item.price));
        next[item.id] = {
          badgeLabel: item.badgeLabel || prev[item.id]?.badgeLabel || fallbackTag.label,
          badgeColor: item.badgeColor || prev[item.id]?.badgeColor ||
            (fallbackTag.css === 'is-hot' ? '#b91c1c' : fallbackTag.css === 'is-new' ? '#047857' : '#6d28d9'),
          stockQty: item.stockQty ?? prev[item.id]?.stockQty ?? 20,
          lowStockThreshold: item.lowStockThreshold ?? prev[item.id]?.lowStockThreshold ?? 5,
          displayOrder: item.displayOrder ?? prev[item.id]?.displayOrder ?? index + 1,
          isActive: item.isActive ?? prev[item.id]?.isActive ?? true,
          isDishOfDay: item.isDishOfDay ?? prev[item.id]?.isDishOfDay ?? false,
          prepTime: item.prepTime ?? prev[item.id]?.prepTime ?? 15,
          calories: item.calories ?? prev[item.id]?.calories ?? 0,
          allergens: item.allergens ?? prev[item.id]?.allergens ?? [],
          dietaryLabels: item.dietaryLabels ?? prev[item.id]?.dietaryLabels ?? [],
          availableDays: (item.availableDays ?? prev[item.id]?.availableDays ?? [0,1,2,3,4,5,6]).map(Number),
          ordersCount: item.ordersCount ?? prev[item.id]?.ordersCount ?? 0,
          subCategoryId: item.subCategory?.id ?? (item as any).subCategoryId ?? prev[item.id]?.subCategoryId ?? '',
        };
      });
      return next;
    });
  }, [categories]);

  // ─── HANDLERS ──────────────────────────────────────────────────────────
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId || !categoryName.trim()) return;
    try {
      const response = await api.post<CreatedCategory>('/menus/categories', { name: categoryName.trim(), restaurantId });
      const created = response.data;
      setCategories(prev => [...prev, { ...created, items: [], order: prev.length + 1 }]);
      setNewItem(prev => ({ ...prev, categoryId: created.id }));
      setActiveCategory(created.id);
      setCategoryName('');
      setSuccessMessage(t('menu.categoryCreated'));
      await loadMenus();
    } catch (error) { console.error('Erreur creation categorie', error); }
  };


  const handleDeleteCategory = async (id: string, name: string) => {
    const isConfirmed = await confirm({
      title: t('menu.deleteCategory'),
      message: t('menu.deleteCategoryConfirm', { name }),
      type: 'danger'
    });

    if (!isConfirmed) return;

    try {
      await api.delete(`/menus/categories/${id}`);
      setCategories(prev => prev.filter(c => c.id !== id));
      if (activeCategory === id) setActiveCategory('all');
      setSuccessMessage(t('menu.categoryDeleted'));
    } catch (error) { console.error('Erreur suppression categorie', error); }
  };

  const handleCreateSubCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const categoryId = activeCategory !== 'all' ? activeCategory : newItem.categoryId;
    if (!categoryId || !subCategoryName.trim()) return;
    try {
      await api.post('/menus/sub-categories', {
        name: subCategoryName.trim(),
        categoryId,
      });
      setSubCategoryName('');
      setIsAddingSubCategory(false);
      setSuccessMessage(t('menu.subcategoryCreated'));
      await loadMenus();
    } catch (error) { console.error('Erreur creation sous-categorie', error); }
  };

  const handleDeleteSubCategory = async (id: string, name: string) => {
    const isConfirmed = await confirm({
      title: t('menu.deleteSubCategory'),
      message: t('menu.deleteSubCategoryConfirm', { name }),
      type: 'danger'
    });

    if (!isConfirmed) return;

    try {
      await api.delete(`/menus/sub-categories/${id}`);
      setSuccessMessage(t('menu.subcategoryDeleted'));
      await loadMenus();
    } catch (error) { console.error('Erreur suppression sous-categorie', error); }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPrice = String(newItem.price).replace(',', '.').replace(/[^\d.]/g, '');
    if (!newItem.name.trim() || !newItem.categoryId || !cleanPrice) return;

    try {
      const payload = {
        name: newItem.name.trim(),
        description: newItem.description.trim() || undefined,
        imageUrl: newItem.imageUrl.trim() || undefined,
        price: Number(cleanPrice),
        categoryId: newItem.categoryId,
        badgeLabel: newItem.badgeLabel.trim() || undefined,
        badgeColor: newItem.badgeColor.trim() || undefined,
        stockQty: Number(newItem.stockQty),
        lowStockThreshold: Number(newItem.lowStockThreshold),
        prepTime: Number(newItem.prepTime),
        calories: newItem.calories ? Number(newItem.calories) : undefined,
        allergens: newItem.allergens,
        dietaryLabels: newItem.dietaryLabels,
        availableDays: newItem.availableDays,
        subCategoryId: newItem.subCategoryId || undefined,
      };

      if (editingItemId) {
        await api.put(`/menus/items/${editingItemId}`, payload);
        setItemSettings(prev => ({
          ...prev,
          [editingItemId]: {
            ...(prev[editingItemId] || { displayOrder: Object.keys(prev).length + 1, ordersCount: 0 }),
            badgeLabel: newItem.badgeLabel.trim() || 'Signature',
            badgeColor: newItem.badgeColor || '#6d28d9',
            stockQty: Number(newItem.stockQty) || 0,
            lowStockThreshold: Number(newItem.lowStockThreshold) || 0,
            prepTime: Number(newItem.prepTime) || 15,
            calories: Number(newItem.calories) || 0,
            allergens: newItem.allergens,
            dietaryLabels: newItem.dietaryLabels,
            availableDays: newItem.availableDays,
            subCategoryId: newItem.subCategoryId || '',
            isActive: prev[editingItemId]?.isActive ?? true,
            isDishOfDay: prev[editingItemId]?.isDishOfDay ?? false,
          },
        }));
        setSuccessMessage(t('menu.itemModified'));
      } else {
        const created = await api.post<{ id?: string }>('/menus/items', payload);
        if (created.data?.id) {
          setItemSettings(prev => ({
            ...prev,
            [created.data.id as string]: {
              badgeLabel: newItem.badgeLabel.trim() || 'Signature',
              badgeColor: newItem.badgeColor || '#6d28d9',
              stockQty: Number(newItem.stockQty) || 0,
              lowStockThreshold: Number(newItem.lowStockThreshold) || 0,
              displayOrder: Object.keys(prev).length + 1,
              isActive: true, isDishOfDay: false,
              prepTime: Number(newItem.prepTime) || 15,
              calories: Number(newItem.calories) || 0,
              allergens: newItem.allergens, dietaryLabels: newItem.dietaryLabels,
              availableDays: newItem.availableDays, ordersCount: 0,
              subCategoryId: newItem.subCategoryId || '',
            },
          }));
          setSuccessMessage(t('menu.itemCreated'));
        }
      }
      setNewItem({ ...defaultNewItem, categoryId: newItem.categoryId });
      setEditingItemId(null);
      setShowCreatePanel(false);
      await loadMenus();
    } catch (error) {
      console.error('Erreur creation article', error);
      setErrorMessage(t('menu.itemCreationError'));
    }
  };

  const startEditItem = (item: MenuItem & { categoryName: string }, categoryId: string) => {
    const s = itemSettings[item.id];
    setNewItem({
      name: item.name, price: String(item.price),
      imageUrl: item.imageUrl || '', description: item.description || '',
      categoryId,
      badgeLabel: item.badgeLabel || s?.badgeLabel || getTagStyle(Number(item.price)).label,
      badgeColor: item.badgeColor || s?.badgeColor || '#6d28d9',
      stockQty: String(item.stockQty ?? s?.stockQty ?? 20),
      lowStockThreshold: String(item.lowStockThreshold ?? s?.lowStockThreshold ?? 5),
      prepTime: String(s?.prepTime ?? 15),
      calories: String(s?.calories ?? ''),
      allergens: s?.allergens ?? [],
      dietaryLabels: s?.dietaryLabels ?? [],
      availableDays: (item.availableDays ?? s?.availableDays ?? [0,1,2,3,4,5,6]).map(Number),
      subCategoryId: item.subCategory?.id ?? s?.subCategoryId ?? '',
    });
    setEditingItemId(item.id);
    setShowCreatePanel(true);
    setOpenActionsItemId(null);
  };

  const handleDeleteItem = async (itemId: string, name: string) => {
    const isConfirmed = await confirm({
      title: t('menu.deleteItem'),
      message: t('menu.deleteItemConfirm', { name }),
      type: 'danger'
    });

    if (!isConfirmed) return;

    try {
      await api.delete(`/menus/items/${itemId}`);
      if (editingItemId === itemId) setEditingItemId(null);
      setItemSettings(prev => { const next = { ...prev }; delete next[itemId]; return next; });
      setSelectedItemIds(prev => prev.filter(id => id !== itemId));
      setOpenActionsItemId(null);
      setSuccessMessage(t('menu.itemDeleted'));
      await loadMenus();
    } catch (error) { console.error("Erreur suppression article", error); }
  };

  const handleImageUpload = async (file: File) => {
    // Validation de la taille côté client (ex: 5 Mo)
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage("L'image est trop lourde. La limite est de 5 Mo.");
      return;
    }

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post<{ imageUrl: string }>('/menus/items/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setNewItem(prev => ({ ...prev, imageUrl: response.data.imageUrl }));
    } catch (error: any) {
      console.error("Erreur upload image", error);
      setErrorMessage(error.response?.status === 413 
        ? "Le serveur a refusé l'image (trop volumineuse). Vérifiez la configuration de l'API." 
        : "Erreur lors de l'upload de l'image.");
    }
    finally { setIsUploadingImage(false); }
  };

  const handleDuplicateItem = async (item: MenuItem & { categoryName: string }, categoryId: string) => {
    try {
      await api.post('/menus/items', {
        name: `${item.name} (Copie)`,
        description: item.description || undefined,
        imageUrl: item.imageUrl || undefined,
        price: Number(item.price),
        categoryId,
      });
      setSuccessMessage(t('menu.itemDuplicated'));
      await loadMenus();
    } catch (error) { console.error("Erreur duplication", error); }
  };

  const toggleActiveItem = async (itemId: string) => {
    const newActive = !itemSettings[itemId]?.isActive;
    setItemSettings(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], isActive: newActive },
    }));
    try {
      await api.put(`/menus/items/${itemId}`, { isActive: newActive });
    } catch (error) { console.error("Erreur toggle actif", error); }
  };

  const toggleDishOfDay = async (itemId: string) => {
    const newVal = !itemSettings[itemId]?.isDishOfDay;
    setItemSettings(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], isDishOfDay: newVal },
    }));
    try {
      await api.put(`/menus/items/${itemId}`, { isDishOfDay: newVal });
    } catch (error) { console.error("Erreur toggle plat du jour", error); }
  };

  const applyBulkBadge = () => {
    if (!selectedItemIds.length) return;
    setItemSettings(prev => {
      const next = { ...prev };
      selectedItemIds.forEach((id, index) => {
        next[id] = {
          ...(next[id] || { stockQty: 20, lowStockThreshold: 5, displayOrder: index + 1, badgeLabel: 'Signature', badgeColor: '#6d28d9', isActive: true, isDishOfDay: false, prepTime: 15, calories: 0, allergens: [], dietaryLabels: [], availableDays: [0,1,2,3,4,5,6], ordersCount: 0, subCategoryId: '' }),
          badgeLabel: bulkBadgeLabel || 'Signature',
          badgeColor: bulkBadgeColor || '#6d28d9',
        };
      });
      return next;
    });
    setSuccessMessage(t('menu.badgeApplied'));
  };

  const applyBulkOutOfStock = () => {
    if (!selectedItemIds.length) return;
    setItemSettings(prev => {
      const next = { ...prev };
      selectedItemIds.forEach((id, index) => {
        next[id] = {
          ...(next[id] || { displayOrder: index + 1, lowStockThreshold: 5, badgeLabel: 'Signature', badgeColor: '#6d28d9', stockQty: 20, isActive: true, isDishOfDay: false, prepTime: 15, calories: 0, allergens: [], dietaryLabels: [], availableDays: [0,1,2,3,4,5,6], ordersCount: 0, subCategoryId: '' }),
          stockQty: 0,
        };
      });
      return next;
    });
    setSuccessMessage(t('menu.stockSetToZero'));
  };

  // ─── DRAG & DROP ────────────────────────────────────────────────────────
  const handleDragStart = (itemId: string) => {
    dragItemId.current = itemId;
  };

  const handleDragOver = (e: React.DragEvent, itemId: string) => {
    e.preventDefault();
    if (dragItemId.current !== itemId) setDragOverId(itemId);
  };

  const handleDrop = async (targetId: string) => {
    const sourceId = dragItemId.current;
    if (!sourceId || sourceId === targetId) { setDragOverId(null); return; }
    
    const source = [...filteredItems];
    const sourceIndex = source.findIndex(i => i.id === sourceId);
    const targetIndex = source.findIndex(i => i.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) return;

    // Remove source and insert at target
    const [removed] = source.splice(sourceIndex, 1);
    source.splice(targetIndex, 0, removed);

    // Update settings and prepare API call
    const newSettings = { ...itemSettings };
    const orders = source.map((item, idx) => {
      const order = idx + 1;
      newSettings[item.id] = { 
        ...(newSettings[item.id] || { 
          badgeLabel: 'Signature', badgeColor: '#6d28d9', stockQty: 20, 
          lowStockThreshold: 5, isActive: true, isDishOfDay: false, 
          prepTime: 15, calories: 0, allergens: [], dietaryLabels: [], 
          availableDays: [0,1,2,3,4,5,6], ordersCount: 0, subCategoryId: '' 
        }), 
        displayOrder: order 
      };
      return { id: item.id, order };
    });

    setItemSettings(newSettings);
    setDragOverId(null);
    dragItemId.current = null;
    
    try {
      await api.post('/menus/items/reorder', { orders });
    } catch (error) { console.error("Erreur reorder items", error); }
  };

  // ─── CSV IMPORT ─────────────────────────────────────────────────────────
  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text = ev.target?.result as string;
      const lines = text.replace(/\r/g, '').split('\n');
      const dataRows = lines.slice(1); // skip header
      
      for (const line of dataRows) {
        if (!line.trim()) continue;
        
        // Better CSV parser for quoted fields with commas
        const cols: string[] = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
              current += '"';
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            cols.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        cols.push(current.trim());

        const [name, catName, subCatName, price, description, badgeLabel, stock, , , prepTime, calories, allergens, dietaryLabels] = cols;
        if (!name || !price) continue;

        // Try to find category by name or use active/first
        let catId = newItem.categoryId || categories[0]?.id;
        if (catName) {
          const matchedCat = categories.find(c => c.name.toLowerCase() === catName.trim().toLowerCase());
          if (matchedCat) catId = matchedCat.id;
        }

        // Try to find subcategory by name
        let subId: string | undefined = undefined;
        if (subCatName && catId) {
          const cat = categories.find(c => c.id === catId);
          const matchedSub = cat?.subCategories?.find(sc => sc.name.toLowerCase() === subCatName.trim().toLowerCase());
          if (matchedSub) subId = matchedSub.id;
        }

        try {
          const normalizedPrice = Number(price.replace(',', '.').replace(/[^\d.]/g, ''));
          await api.post('/menus/items', {
            name: name.trim(),
            price: isNaN(normalizedPrice) ? 0 : normalizedPrice,
            description: description?.trim() || undefined,
            badgeLabel: badgeLabel?.trim() || undefined,
            categoryId: catId,
            subCategoryId: subId,
            stockQty: stock ? Number(stock) : undefined,
            prepTime: prepTime ? Number(prepTime) : undefined,
            calories: calories ? Number(calories) : undefined,
            allergens: allergens ? allergens.split('|').filter(Boolean).map(a => a.trim()) : [],
            dietaryLabels: dietaryLabels ? dietaryLabels.split('|').filter(Boolean).map(d => d.trim()) : [],
            availableDays: [0, 1, 2, 3, 4, 5, 6], // Default to all days for import
          });
        } catch (err) { console.error('Import ligne ignorée', err); }
      }
      setSuccessMessage(t('menu.csvImportComplete'));
      await loadMenus();
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  useEffect(() => {
    if (!successMessage) return;
    const t = setTimeout(() => setSuccessMessage(null), 1800);
    return () => clearTimeout(t);
  }, [successMessage]);

  useEffect(() => {
    if (!errorMessage) return;
    const t = setTimeout(() => setErrorMessage(null), 3000);
    return () => clearTimeout(t);
  }, [errorMessage]);

  const toggleAllergen = (key: string) => {
    setNewItem(prev => ({
      ...prev,
      allergens: prev.allergens.includes(key)
        ? prev.allergens.filter(a => a !== key)
        : [...prev.allergens, key],
    }));
  };

  const toggleDietary = (key: string) => {
    setNewItem(prev => ({
      ...prev,
      dietaryLabels: prev.dietaryLabels.includes(key)
        ? prev.dietaryLabels.filter(d => d !== key)
        : [...prev.dietaryLabels, key],
    }));
  };

  const toggleDay = (day: number) => {
    setNewItem(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day],
    }));
  };

  // ─── RENDER ─────────────────────────────────────────────────────────────
  return (
    <Layout title={t('menu.menuAndCards')} subtitle={t('menu.composeIrresistibleMenu')}>

      {/* ── HERO ── */}
      <section className="menu-hero">
        <div>
          <h2>{t('menu.yourMenuReady')}</h2>
          <p>{t('menu.addDishesOptimize')}</p>
        </div>
        <div className="menu-hero-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => exportCSV(filteredItems, itemSettings)}>
            <Download size={14} /> {t('menu.exportCsv')}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => csvInputRef.current?.click()}>
            <Upload size={14} /> {t('menu.importCsv')}
          </button>
          <input ref={csvInputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleCSVImport} />
          <button className="btn btn-primary" onClick={() => setShowCreatePanel(prev => !prev)}>
            <Plus size={14} /> {t('menu.addItem')}
          </button>
        </div>
      </section>

      {/* ── CREATE PANEL ── */}
      {showCreatePanel && (
        <section className="menu-toolbar" style={{ marginTop: -4 }}>
          <div className="menu-create-layout">
            {/* Nouvelle catégorie */}
            <form onSubmit={handleCreateCategory} className="menu-create-form">
              <h4>{t('menu.newCategory')}</h4>
              <label className="menu-field-label">
                {t('menu.categoryName')}
                <input placeholder={t('menu.categoryPlaceholder')} value={categoryName}
                  onChange={e => setCategoryName(e.target.value)} />
              </label>
              <button className="btn btn-primary btn-sm" type="submit">{t('menu.createCategory')}</button>
            </form>


            {/* Nouvel article */}
            <form onSubmit={handleCreateItem} className="menu-create-form">
              <h4>{editingItemId ? `✏️ ${t('menu.editItem')}` : t('menu.newItem')}</h4>
              <div className="menu-create-grid">
                {/* Nom + Prix */}
                <label className="menu-field-label">
                  {t('menu.itemName')}
                  <input placeholder={t('menu.itemNamePlaceholder')} value={newItem.name}
                    onChange={e => setNewItem(prev => ({ ...prev, name: e.target.value }))} />
                </label>
                <label className="menu-field-label">
                  {t('menu.priceEur')} ({currencyConfig.symbol} {currencyConfig.code})
                  <input type="number" min="0" step="0.01" placeholder={t('menu.pricePlaceholder')} value={newItem.price}
                    onChange={e => setNewItem(prev => ({ ...prev, price: e.target.value }))} />
                </label>

                {/* Badge */}
                <div style={{ display: 'flex', gap: 8, gridColumn: '1 / -1' }}>
                  <label className="menu-field-label" style={{ flex: 1 }}>
                    {t('menu.badgeLabel')}
                    <input placeholder={t('menu.badgePlaceholder')} value={newItem.badgeLabel}
                      onChange={e => setNewItem(prev => ({ ...prev, badgeLabel: e.target.value }))} />
                  </label>
                  <label className="menu-field-label" style={{ width: 80 }}>
                    {t('menu.color')}
                    <input type="color" value={newItem.badgeColor}
                      onChange={e => setNewItem(prev => ({ ...prev, badgeColor: e.target.value }))} />
                  </label>
                </div>

                {/* Stock */}
                <div style={{ display: 'flex', gap: 8, gridColumn: '1 / -1' }}>
                  <label className="menu-field-label" style={{ flex: 1 }}>
                    {t('menu.stockQuantity')}
                    <input type="number" min="0" placeholder={t('menu.stockPlaceholder')} value={newItem.stockQty}
                      onChange={e => setNewItem(prev => ({ ...prev, stockQty: e.target.value }))} />
                  </label>
                  <label className="menu-field-label" style={{ flex: 1 }}>
                    {t('menu.lowStockThreshold')}
                    <input type="number" min="0" placeholder={t('menu.thresholdPlaceholder')} value={newItem.lowStockThreshold}
                      onChange={e => setNewItem(prev => ({ ...prev, lowStockThreshold: e.target.value }))} />
                  </label>
                </div>

                {/* Prep time + Calories */}
                <div style={{ display: 'flex', gap: 8, gridColumn: '1 / -1' }}>
                  <label className="menu-field-label" style={{ flex: 1 }}>
                    {t('menu.prepTime')}
                    <input type="number" min="1" placeholder={t('menu.prepTimePlaceholder')} value={newItem.prepTime}
                      onChange={e => setNewItem(prev => ({ ...prev, prepTime: e.target.value }))} />
                  </label>
                  <label className="menu-field-label" style={{ flex: 1 }}>
                    {t('menu.calories')}
                    <input type="number" min="0" placeholder={t('menu.caloriesPlaceholder')} value={newItem.calories}
                      onChange={e => setNewItem(prev => ({ ...prev, calories: e.target.value }))} />
                  </label>
                </div>

                {/* Catégorie + Sous-catégorie */}
                 <label className="menu-field-label">
                  {t('menu.category')}
                  <select value={newItem.categoryId}
                    onChange={e => setNewItem(prev => ({ ...prev, categoryId: e.target.value, subCategoryId: '' }))}>
                    <option value="">{t('menu.chooseCategory')}</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </label>

                {newItem.categoryId && (
                  <label className="menu-field-label">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {t('menu.subcategory')}
                      <button type="button" className="btn btn-ghost btn-xs" onClick={() => { setActiveCategory(newItem.categoryId); setIsAddingSubCategory(true); }}>
                        <Plus size={10} /> {t('common.add')}
                      </button>
                    </div>
                    <select value={newItem.subCategoryId}
                      onChange={e => setNewItem(prev => ({ ...prev, subCategoryId: e.target.value }))}>
                      <option value="">{t('menu.all')}</option>
                      {categories.find(c => c.id === newItem.categoryId)?.subCategories?.map(sc => (
                        <option key={sc.id} value={sc.id}>{sc.name}</option>
                      ))}
                    </select>
                  </label>
                )}

                {/* Image */}
                <label className="menu-field-label menu-field-full">
                  {t('menu.dishImage')}
                  <input type="file" accept="image/*"
                    onChange={e => { const f = e.target.files?.[0]; if (f) void handleImageUpload(f); }} />
                </label>

                {/* Description */}
                <label className="menu-field-label menu-field-full">
                  {t('menu.description')}
                  <textarea placeholder={t('menu.descriptionPlaceholder')} value={newItem.description}
                    onChange={e => setNewItem(prev => ({ ...prev, description: e.target.value }))} />
                </label>

                {/* Allergènes */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <p className="menu-field-label" style={{ marginBottom: 6 }}>{t('menu.allergens')}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {ALLERGENS.map(a => (
                      <button key={a.key} type="button"
                        className={`menu-tag-toggle ${newItem.allergens.includes(a.key) ? 'active' : ''}`}
                        onClick={() => toggleAllergen(a.key)}>
                        {a.emoji} {a.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Labels diét. */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <p className="menu-field-label" style={{ marginBottom: 6 }}>{t('menu.dietaryLabels')}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {DIETARY.map(d => (
                      <button key={d.key} type="button"
                        className={`menu-tag-toggle ${newItem.dietaryLabels.includes(d.key) ? 'active' : ''}`}
                        style={newItem.dietaryLabels.includes(d.key) ? { background: d.bg, borderColor: d.color, color: d.color } : {}}
                        onClick={() => toggleDietary(d.key)}>
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Jours de disponibilité */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <p className="menu-field-label" style={{ marginBottom: 6 }}>{t('menu.availability')}</p>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {DAYS_SHORT.map((day, i) => (
                      <button key={i} type="button"
                        className={`menu-day-toggle ${newItem.availableDays.includes(i) ? 'active' : ''}`}
                        onClick={() => toggleDay(i)}>
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {isUploadingImage && <p style={{ fontSize: 12, color: 'var(--text-600)' }}>{t('menu.uploadInProgress')}</p>}
              {!!newItem.imageUrl && (
                <img src={newItem.imageUrl} alt="Preview"
                  style={{ width: 120, height: 72, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm" type="submit">
                  {editingItemId ? t('menu.updateItem') : t('menu.createItem')}
                </button>
                {editingItemId && (
                  <button className="btn btn-ghost btn-sm" type="button" onClick={() => {
                    setEditingItemId(null);
                    setNewItem({ ...defaultNewItem, categoryId: newItem.categoryId });
                  }}>
                    {t('common.cancel')}
                  </button>
                )}
              </div>
            </form>
          </div>
        </section>
      )}

      {/* ── TOOLBAR ── */}
      <section className="menu-toolbar">
        <div style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'center' }}>
          <div className="menu-search" style={{ flex: 1, marginBottom: 0 }}>
            <Search size={15} />
            <input placeholder={t('menu.searchPlaceholder')} value={search}
              onChange={e => setSearch(e.target.value)} />
          </div>
          <button
            className={`btn btn-sm ${activeView === 'all' ? 'btn-ghost' : 'btn-primary'}`}
            onClick={() => setActiveView(v => v === 'all' ? 'dish-of-day' : 'all')}
            title={t('menu.menuOfDay')}
          >
            <Sun size={14} /> {activeView === 'dish-of-day' ? t('menu.all') : t('menu.menuOfDay')}
          </button>
        </div>

        <div className="menu-category-pills">
          {categoryPills.map(cat => (
            <div key={cat.id} 
              className={`category-wrapper ${cat.id === activeCategory ? 'active' : ''} ${dragOverCategoryId === cat.id ? 'drag-over' : ''}`}
              draggable={cat.id !== 'all'}
              onDragStart={() => handleCategoryDragStart(cat.id)}
              onDragOver={(e) => cat.id !== 'all' && handleCategoryDragOver(e, cat.id)}
              onDragLeave={() => setDragOverCategoryId(null)}
              onDrop={() => cat.id !== 'all' && handleCategoryDrop(cat.id)}
            >
              <button
                className={`menu-pill ${cat.id === activeCategory ? 'active' : ''}`}
                onClick={() => { setActiveCategory(cat.id); setActiveSubCategory(null); }}>
                {cat.label}<span>{cat.count}</span>
              </button>
              {cat.id !== 'all' && (
                <button className="category-delete-btn"
                  onClick={e => { e.stopPropagation(); handleDeleteCategory(cat.id, cat.label); }}
                  title={t('common.delete')}><X size={10} /></button>
              )}
            </div>
          ))}
        </div>

        {/* Subcategory Management - Only show if a category is selected */}
        {activeCategory !== 'all' ? (
          <div className="subcategory-management" style={{ marginTop: 12, padding: 15, background: 'rgba(0,0,0,0.03)', borderRadius: 16, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Package size={14} style={{ color: 'var(--primary)' }} />
                <h5 style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>{t('menu.subcategories')}</h5>
              </div>
              <button className="btn btn-primary btn-xs" onClick={() => setIsAddingSubCategory(true)}>
                <Plus size={12} /> {t('common.add')}
              </button>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <div 
                className={`subcategory-tag ${!activeSubCategory ? 'active' : ''}`}
                onClick={() => setActiveSubCategory(null)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: 8, background: !activeSubCategory ? 'var(--primary)' : '#fff', 
                  color: !activeSubCategory ? '#fff' : 'var(--text-900)',
                  border: '1px solid var(--border)', padding: '5px 12px', borderRadius: 20, fontSize: 12, 
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 500
                }}>
                {t('menu.all')}
                <span style={{ 
                  marginLeft: 6, fontSize: 10, background: !activeSubCategory ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)', 
                  padding: '1px 6px', borderRadius: 10, color: !activeSubCategory ? '#fff' : 'var(--text-400)' 
                }}>
                  {categories.find(c => c.id === activeCategory)?.items?.length || 0}
                </span>
              </div>

              {categories.find(c => c.id === activeCategory)?.subCategories?.map(sc => {
                const subCount = categories.find(c => c.id === activeCategory)?.items?.filter(i => 
                  itemSettings[i.id]?.subCategoryId === sc.id
                ).length || 0;
                return (
                  <div 
                    key={sc.id} 
                    className={`subcategory-tag ${activeSubCategory === sc.id ? 'active' : ''} ${dragOverSubCategoryId === sc.id ? 'drag-over' : ''}`} 
                    draggable
                    onDragStart={() => handleSubCategoryDragStart(sc.id)}
                    onDragOver={(e) => handleSubCategoryDragOver(e, sc.id)}
                    onDragLeave={() => setDragOverSubCategoryId(null)}
                    onDrop={() => handleSubCategoryDrop(sc.id)}
                    onClick={() => setActiveSubCategory(sc.id)}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: 6, background: activeSubCategory === sc.id ? 'var(--primary)' : '#fff', 
                      color: activeSubCategory === sc.id ? '#fff' : 'var(--text-900)',
                      border: '1px solid var(--border)', padding: '5px 12px', borderRadius: 20, fontSize: 12, 
                      boxShadow: '0 1px 2px rgba(0,0,0,0.02)', cursor: 'pointer', transition: 'all 0.2s'
                    }}>
                    <span style={{ fontWeight: 500 }}>{sc.name}</span>
                    <span style={{ 
                      fontSize: 10, background: activeSubCategory === sc.id ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)', 
                      padding: '1px 6px', borderRadius: 10, color: activeSubCategory === sc.id ? '#fff' : 'var(--text-400)' 
                    }}>
                      {subCount}
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteSubCategory(sc.id, sc.name); }} style={{ color: activeSubCategory === sc.id ? '#fff' : 'var(--text-400)', border: 'none', background: 'none', padding: 0, cursor: 'pointer', display: 'flex', transition: 'color 0.2s', marginLeft: 2 }}>
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
              {(!categories.find(c => c.id === activeCategory)?.subCategories || categories.find(c => c.id === activeCategory)?.subCategories?.length === 0) && (
                <p style={{ margin: 0, fontSize: 12, color: 'var(--text-400)', fontStyle: 'italic' }}>
                  Aucune sous-catégorie pour le moment.
                </p>
              )}
            </div>

            {isAddingSubCategory && (
              <form onSubmit={handleCreateSubCategory} style={{ display: 'flex', gap: 10, marginTop: 12, padding: 10, background: '#fff', borderRadius: 12, border: '1px solid var(--border)' }}>
                <input 
                  autoFocus
                  placeholder={t('menu.subcategoryName')}
                  value={subCategoryName}
                  onChange={e => setSubCategoryName(e.target.value)}
                  style={{ flex: 1, height: 36, borderRadius: 8, border: '1px solid var(--border)', padding: '0 12px', fontSize: 13 }}
                />
                <button type="submit" className="btn btn-primary btn-sm">{t('common.save')}</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setIsAddingSubCategory(false); setSubCategoryName(''); }}>
                  {t('common.cancel')}
                </button>
              </form>
            )}
          </div>
        ) : (
          <div style={{ marginTop: 12, padding: "10px 15px", background: 'rgba(0,0,0,0.01)', borderRadius: 12, border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-400)' }}>
              💡 Cliquez sur une catégorie ci-dessus pour gérer ses sous-catégories.
            </span>
          </div>
        )}

        {/* Bulk actions */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text-400)' }}>{t('menu.selection')} ({selectedItemIds.length})</span>
          <button className="btn btn-ghost btn-sm" onClick={() => setSelectedItemIds(filteredItems.map(i => i.id))}>{t('menu.selectAll')}</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setSelectedItemIds([])}>{t('menu.clearSelection')}</button>
          <input value={bulkBadgeLabel} onChange={e => setBulkBadgeLabel(e.target.value)} placeholder={t('menu.badgeLabel')}
            style={{ height: 32, borderRadius: 8, border: '1px solid var(--border)', padding: '0 10px', fontSize: 12 }} />
          <input type="color" value={bulkBadgeColor} onChange={e => setBulkBadgeColor(e.target.value)}
            style={{ width: 38, height: 32, border: '1px solid var(--border)', borderRadius: 8, background: 'transparent', cursor: 'pointer' }} />
          <button className="btn btn-ghost btn-sm" onClick={applyBulkBadge}>{t('menu.applyBadge')}</button>
          <button className="btn btn-ghost btn-sm" onClick={applyBulkOutOfStock}>{t('menu.markOutOfStock')}</button>
        </div>
      </section>

      {/* ── GRID ── */}
      <section className="menu-grid">
        {paginatedItems.map(item => {
          const price = Number(item.price);
          const tag = getTagStyle(price);
          const s = itemSettings[item.id];
          const itemCategoryId = (item as any).categoryId;
          const isDishOfDay = s?.isDishOfDay ?? false;
          const isActive = s?.isActive ?? true;
          
          // Don't show "Never ordered" if the item was created less than 48h ago
          const isNewItem = item.createdAt ? (new Date().getTime() - new Date(item.createdAt).getTime()) < 48 * 60 * 60 * 1000 : true;
          const isNeverOrdered = (s?.ordersCount ?? 0) === 0 && !isNewItem;
          
          const allergenList = s?.allergens ?? [];
          const dietaryList = s?.dietaryLabels ?? [];
          const availDays = (s?.availableDays ?? [0,1,2,3,4,5,6]).map(Number);
          const prepTime = s?.prepTime ?? 15;
          const calories = s?.calories ?? 0;

          return (
            <article
              key={`${item.id}-${currentPage}`}
              className={`menu-item-card item-fade-in ${isDishOfDay ? 'dish-of-day' : ''} ${!isActive ? 'item-inactive' : ''} ${dragOverId === item.id ? 'drag-over' : ''}`}
              style={{ overflow: 'visible', opacity: 0, cursor: 'pointer' }}
              onClick={() => setSelectedPreviewItem(item)}
              draggable
              onDragStart={() => handleDragStart(item.id)}
              onDragOver={e => handleDragOver(e, item.id)}
              onDragLeave={() => setDragOverId(null)}
              onDrop={() => void handleDrop(item.id)}
            >
              {/* Image Section */}
              <div className="menu-item-image-wrap">
                <div className="menu-drag-handle" title={t('menu.dragToReorder')} onClick={e => e.stopPropagation()}>
                  <GripVertical size={14} />
                </div>

                <label className="menu-item-checkbox" onClick={e => e.stopPropagation()}>
                  <input 
                    type="checkbox" 
                    checked={selectedItemIds.includes(item.id)}
                    onChange={() => setSelectedItemIds(prev =>
                      prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]
                    )} 
                  />
                </label>

                {isDishOfDay && (
                  <div className="dish-of-day-badge">
                    <Flame size={11} /> {t('menu.dishOfDay')}
                  </div>
                )}

                {isNeverOrdered && (
                  <div className="never-ordered-badge" title={t('menu.neverOrdered')}>
                    <AlertCircle size={11} /> {t('menu.neverOrdered')}
                  </div>
                )}

                <img
                  src={item.imageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80'}
                  alt={item.name}
                  className="menu-item-image"
                  style={{ opacity: isActive ? 1 : 0.45 }}
                />

                <span className={`menu-item-tag ${tag.css}`} style={{ background: s?.badgeColor || undefined }}>
                  {s?.badgeLabel || tag.label}
                </span>
              </div>

              {/* Content Section */}
              <div className="menu-item-content" style={{ overflow: 'visible' }}>
                <div className="menu-item-main">
                  <p className="menu-item-category">
                    {item.categoryName}
                    {item.subCategory?.name && <span style={{ opacity: 0.6 }}> › {item.subCategory.name}</span>}
                  </p>
                  <h3 style={{ opacity: isActive ? 1 : 0.5, marginBottom: 0 }}>{item.name}</h3>
                </div>

                <div className="menu-item-meta" style={{ gap: '10px 14px' }}>
                  <span><Clock size={13} /> {prepTime}m</span>
                  {calories > 0 && <span><Zap size={13} /> {calories}</span>}
                  <span className="stock-level" style={{ color: getStockVisual(item.id).color }}>
                    <Package size={13} /> {getStockVisual(item.id).label}
                  </span>
                </div>

                {(allergenList.length > 0 || dietaryList.length > 0) && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '2px 0' }}>
                    {allergenList.length > 0 && (
                      <div className="menu-item-allergens">
                        {allergenList.map(key => {
                          const a = ALLERGENS.find(x => x.key === key);
                          return a ? <span key={key} title={a.label}>{a.emoji}</span> : null;
                        })}
                      </div>
                    )}
                    {dietaryList.length > 0 && (
                      <div className="menu-item-dietary">
                        {dietaryList.map(key => {
                          const d = DIETARY.find(x => x.key === key);
                          return d ? <span key={key} style={{ background: d.bg, color: d.color }}>{d.label}</span> : null;
                        })}
                      </div>
                    )}
                  </div>
                )}

                {availDays.length < 7 && (
                  <div className="menu-item-days">
                    {DAYS_SHORT.map((day, i) => (
                      <span key={i} className={availDays.includes(i) ? 'day-on' : 'day-off'}>{day}</span>
                    ))}
                  </div>
                )}

                <div className="menu-item-bottom" style={{ position: 'relative' }}>
                  <div className="menu-item-price">
                    {currencyConfig.symbol}{price.toFixed(2)}
                  </div>

                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      className={`icon-btn menu-item-toggle ${isActive ? 'toggle-active' : 'toggle-inactive'}`}
                      onClick={(e) => { e.stopPropagation(); void toggleActiveItem(item.id); }}
                      title={isActive ? t('menu.deactivate') : t('menu.activate')}
                    >
                      {isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    
                    <button
                      className={`icon-btn menu-item-toggle ${isDishOfDay ? 'toggle-dish' : ''}`}
                      onClick={(e) => { e.stopPropagation(); void toggleDishOfDay(item.id); }}
                      title={isDishOfDay ? t('menu.removeDishOfDay') : t('menu.setDishOfDay')}
                    >
                      <Flame size={14} />
                    </button>

                    <div style={{ position: 'relative' }}>
                      <button 
                        className="icon-btn menu-item-toggle"
                        onClick={(e) => { e.stopPropagation(); setOpenActionsItemId(prev => prev === item.id ? null : item.id); }}
                      >
                        <MoreHorizontal size={14} />
                      </button>
                      
                      {openActionsItemId === item.id && (
                        <div className="menu-item-actions" style={{ bottom: '100%', right: 0, top: 'auto', marginBottom: 8 }} onClick={e => e.stopPropagation()}>
                          <button onClick={() => startEditItem(item as MenuItem & { categoryName: string }, itemCategoryId)}>
                            <Pencil size={14} /> {t('common.edit')}
                          </button>
                          <button onClick={() => void handleDuplicateItem(item as MenuItem & { categoryName: string }, itemCategoryId)}>
                            <Copy size={14} /> {t('menu.duplicate')}
                          </button>
                          <button className="danger" onClick={() => { setOpenActionsItemId(null); handleDeleteItem(item.id, item.name); }}>
                            <Trash2 size={14} /> {t('common.delete')}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
        {!isLoading && filteredItems.length === 0 && (
          <div className="card" style={{ padding: 20, gridColumn: '1 / -1', textAlign: 'center' }}>
            {activeView === 'dish-of-day'
              ? 'Aucun plat du jour défini. Cliquez sur 🔥 sur une card pour l\'ajouter.'
              : 'Aucun article pour le moment. Créez une catégorie puis un article.'}
          </div>
        )}
      </section>

      {/* ── PAGINATION ── */}
      {totalPages > 1 && (
        <div className="pagination-container">
          <div className="pagination-info">
            {t('common.page')} {currentPage} / {totalPages}
          </div>

          <button 
            className="pagination-arrow" 
            disabled={currentPage === 1}
            onClick={() => { setCurrentPage(prev => Math.max(1, prev - 1)); window.scrollTo(0, 0); }}
            title={t('common.previous')}
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="pagination-pages">
            {[...Array(totalPages)].map((_, i) => {
              const pageNum = i + 1;
              // Only show some pages if many
              if (totalPages > 7) {
                if (pageNum !== 1 && pageNum !== totalPages && Math.abs(pageNum - currentPage) > 2) {
                  if (pageNum === currentPage - 3 || pageNum === currentPage + 3) return <span key={pageNum} style={{ padding: '0 4px', color: 'var(--text-300)' }}>...</span>;
                  return null;
                }
              }
              return (
                <button
                  key={pageNum}
                  className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                  onClick={() => { setCurrentPage(pageNum); window.scrollTo(0, 0); }}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button 
            className="pagination-arrow" 
            disabled={currentPage === totalPages}
            onClick={() => { setCurrentPage(prev => Math.min(totalPages, prev + 1)); window.scrollTo(0, 0); }}
            title={t('common.next')}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* ── PRODUCT DETAILS MODAL ── */}
      {selectedPreviewItem && (
        <div className="product-modal-backdrop" onClick={() => setSelectedPreviewItem(null)}>
          <div className="product-modal-content" onClick={e => e.stopPropagation()}>
            <button className="product-modal-close" onClick={() => setSelectedPreviewItem(null)}>
              <X size={20} />
            </button>
            
            <div className="product-modal-header">
              <img 
                src={selectedPreviewItem.imageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80'} 
                alt={selectedPreviewItem.name}
                className="product-modal-image"
              />
            </div>

            <div className="product-modal-body">
              <div className="product-modal-title-row">
                <div>
                  <p style={{ margin: 0, fontSize: 14, color: 'var(--text-400)', fontWeight: 600 }}>
                    {selectedPreviewItem.categoryName}
                    {selectedPreviewItem.subCategory?.name && <span> › {selectedPreviewItem.subCategory.name}</span>}
                  </p>
                  <h2>{selectedPreviewItem.name}</h2>
                </div>
                <div className="product-modal-price">
                  {currencyConfig.symbol}{Number(selectedPreviewItem.price).toFixed(2)}
                </div>
              </div>

              {selectedPreviewItem.description && (
                <div className="product-modal-section">
                  <div className="product-modal-section-title"><Search size={14} /> {t('menu.description')}</div>
                  <p className="product-modal-description">{selectedPreviewItem.description}</p>
                </div>
              )}

              <div className="product-modal-grid">
                <div className="product-modal-info-card">
                  <span className="product-modal-info-label">{t('menu.prepTime')}</span>
                  <span className="product-modal-info-value"><Clock size={14} style={{ marginRight: 4 }} /> {itemSettings[selectedPreviewItem.id]?.prepTime || 15} min</span>
                </div>
                <div className="product-modal-info-card">
                  <span className="product-modal-info-label">{t('menu.calories')}</span>
                  <span className="product-modal-info-value"><Zap size={14} style={{ marginRight: 4 }} /> {itemSettings[selectedPreviewItem.id]?.calories || 0} kcal</span>
                </div>
                <div className="product-modal-info-card">
                  <span className="product-modal-info-label">{t('menu.stock')}</span>
                  <span className="product-modal-info-value" style={{ color: getStockVisual(selectedPreviewItem.id).color }}>
                    <Package size={14} style={{ marginRight: 4 }} /> {getStockVisual(selectedPreviewItem.id).label}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div className="product-modal-section">
                  <div className="product-modal-section-title">Allergènes & Régimes</div>
                  <div className="product-modal-badges">
                    {(itemSettings[selectedPreviewItem.id]?.allergens || []).map(key => {
                      const a = ALLERGENS.find(x => x.key === key);
                      return a ? (
                        <div key={key} className="product-modal-badge" style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid var(--border)' }}>
                          {a.emoji} {a.label}
                        </div>
                      ) : null;
                    })}
                    {(itemSettings[selectedPreviewItem.id]?.dietaryLabels || []).map(key => {
                      const d = DIETARY.find(x => x.key === key);
                      return d ? (
                        <div key={key} className="product-modal-badge" style={{ background: d.bg, color: d.color, border: `1px solid ${d.color}20` }}>
                          {d.label}
                        </div>
                      ) : null;
                    })}
                    {!(itemSettings[selectedPreviewItem.id]?.allergens?.length) && !(itemSettings[selectedPreviewItem.id]?.dietaryLabels?.length) && (
                      <span style={{ fontSize: 13, color: 'var(--text-400)', fontStyle: 'italic' }}>Aucun label spécifié</span>
                    )}
                  </div>
                </div>

                <div className="product-modal-section">
                  <div className="product-modal-section-title">{t('menu.availability')}</div>
                  <div className="menu-item-days" style={{ gap: 4 }}>
                    {DAYS_SHORT.map((day, i) => {
                      const isOn = (itemSettings[selectedPreviewItem.id]?.availableDays || [0,1,2,3,4,5,6]).map(Number).includes(i);
                      return (
                        <span key={i} className={isOn ? 'day-on' : 'day-off'} style={{ padding: '4px 8px', fontSize: 11 }}>
                          {day}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SUCCESS ── */}
      {successMessage && (
        <div className="swal-success-backdrop">
          <div className="swal-success-card">
            <div className="swal-success-circle"><Check size={28} /></div>
            <h4>Succès</h4>
            <p>{successMessage}</p>
          </div>
        </div>
      )}

      {/* ── ERROR ── */}
      {errorMessage && (
        <div className="swal-error-backdrop">
          <div className="swal-error-card">
            <div className="swal-error-circle"><AlertCircle size={28} /></div>
            <h4>Erreur</h4>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default MenuManagement;