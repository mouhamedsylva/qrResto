import React, { useEffect, useMemo, useRef, useState } from 'react';
import Layout from '../components/Layout';
import {
  Plus, Search, MoreHorizontal, Pencil, Trash2, X, Check,
  Copy, Package, GripVertical, Eye, EyeOff, Sun, Download,
  Upload, Flame, Clock3, AlertCircle, Star, ChevronDown, ChevronUp,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

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
  subcategoryName?: string;
};

type Category = { id: string; name: string; items: MenuItem[] };
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
  subcategoryName: string;
};

type NewItemState = {
  name: string; price: string; imageUrl: string; description: string;
  categoryId: string; badgeLabel: string; badgeColor: string;
  stockQty: string; lowStockThreshold: string;
  prepTime: string; calories: string;
  allergens: string[]; dietaryLabels: string[];
  availableDays: number[]; subcategoryName: string;
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
      item.name, item.categoryName, s?.subcategoryName ?? '',
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
  const restaurantId = user?.restaurant?.id;

  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeView, setActiveView] = useState<'all' | 'dish-of-day'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [openActionsItemId, setOpenActionsItemId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState<{ id: string; name: string } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [itemSettings, setItemSettings] = useState<Record<string, ItemSettings>>({});
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [bulkBadgeLabel, setBulkBadgeLabel] = useState('Best seller');
  const [bulkBadgeColor, setBulkBadgeColor] = useState('#9b2c49');
  const [categoryName, setCategoryName] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragItemId = useRef<string | null>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const defaultNewItem: NewItemState = {
    name: '', price: '', imageUrl: '', description: '',
    categoryId: '', badgeLabel: 'Signature', badgeColor: '#6d28d9',
    stockQty: '20', lowStockThreshold: '5',
    prepTime: '15', calories: '',
    allergens: [], dietaryLabels: [],
    availableDays: [0, 1, 2, 3, 4, 5, 6],
    subcategoryName: '',
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
    const allCount = categories.reduce((sum, c) => sum + c.items.length, 0);
    return [
      { id: 'all', label: 'Tous', count: allCount },
      ...categories.map(c => ({ id: c.id, label: c.name, count: c.items.length })),
    ];
  }, [categories]);

  const getTagStyle = (price: number) => {
    if (price >= 20) return { label: 'Best seller', css: 'is-hot' };
    if (price <= 10) return { label: 'Nouveau', css: 'is-new' };
    return { label: 'Signature', css: 'is-signature' };
  };

  const getStockVisual = (itemId: string) => {
    const s = itemSettings[itemId];
    if (!s) return { label: 'Stock: --', color: '#475569', bg: 'rgba(71,85,105,0.12)' };
    if (s.stockQty <= 0) return { label: 'Rupture', color: '#b91c1c', bg: 'rgba(185,28,28,0.14)' };
    if (s.stockQty <= s.lowStockThreshold) return { label: `Stock faible (${s.stockQty})`, color: '#b45309', bg: 'rgba(245,158,11,0.14)' };
    return { label: `Stock: ${s.stockQty}`, color: '#047857', bg: 'rgba(16,185,129,0.14)' };
  };

  const filteredItems = useMemo(() => {
    const source =
      activeCategory === 'all'
        ? categories.flatMap(c => c.items.map(item => ({ ...item, categoryName: c.name })))
        : (categories.find(c => c.id === activeCategory)?.items.map(item => ({
            ...item,
            categoryName: categories.find(c => c.id === activeCategory)?.name ?? '',
          })) ?? []);

    return source
      .filter(item => {
        const text = `${item.name} ${item.description ?? ''} ${item.categoryName}`.toLowerCase();
        const matchSearch = text.includes(search.toLowerCase());
        const matchView = activeView === 'all' || itemSettings[item.id]?.isDishOfDay;
        return matchSearch && matchView;
      })
      .sort((a, b) => (itemSettings[a.id]?.displayOrder ?? 0) - (itemSettings[b.id]?.displayOrder ?? 0));
  }, [categories, activeCategory, search, itemSettings, activeView]);

  useEffect(() => {
    const allItems = categories.flatMap(c => c.items);
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
          availableDays: item.availableDays ?? prev[item.id]?.availableDays ?? [0,1,2,3,4,5,6],
          ordersCount: item.ordersCount ?? prev[item.id]?.ordersCount ?? 0,
          subcategoryName: item.subcategoryName ?? prev[item.id]?.subcategoryName ?? '',
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
      setCategories(prev => prev.some(c => c.id === created.id) ? prev : [...prev, { ...created, items: [] }]);
      setNewItem(prev => ({ ...prev, categoryId: created.id }));
      setActiveCategory(created.id);
      setCategoryName('');
      await loadMenus();
    } catch (error) { console.error('Erreur creation categorie', error); }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await api.delete(`/menus/categories/${categoryId}`);
      setCategories(prev => prev.filter(c => c.id !== categoryId));
      if (activeCategory === categoryId) setActiveCategory('all');
      setDeleteCategoryTarget(null);
      setSuccessMessage('Catégorie supprimée avec succès');
    } catch (error) { console.error('Erreur suppression categorie', error); }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name.trim() || !newItem.categoryId || !newItem.price) return;
    try {
      const payload = {
        name: newItem.name.trim(),
        description: newItem.description.trim() || undefined,
        imageUrl: newItem.imageUrl.trim() || undefined,
        price: Number(newItem.price),
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
        subcategoryName: newItem.subcategoryName.trim() || undefined,
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
            subcategoryName: newItem.subcategoryName,
            isActive: prev[editingItemId]?.isActive ?? true,
            isDishOfDay: prev[editingItemId]?.isDishOfDay ?? false,
          },
        }));
        setSuccessMessage('Article modifié avec succès');
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
              subcategoryName: newItem.subcategoryName,
            },
          }));
        }
      }
      setNewItem({ ...defaultNewItem, categoryId: newItem.categoryId });
      setEditingItemId(null);
      await loadMenus();
    } catch (error) { console.error('Erreur creation article', error); }
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
      availableDays: s?.availableDays ?? [0,1,2,3,4,5,6],
      subcategoryName: s?.subcategoryName ?? '',
    });
    setEditingItemId(item.id);
    setShowCreatePanel(true);
    setOpenActionsItemId(null);
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await api.delete(`/menus/items/${itemId}`);
      if (editingItemId === itemId) setEditingItemId(null);
      setItemSettings(prev => { const next = { ...prev }; delete next[itemId]; return next; });
      setSelectedItemIds(prev => prev.filter(id => id !== itemId));
      setOpenActionsItemId(null);
      setDeleteTarget(null);
      setSuccessMessage('Article supprimé avec succès');
      await loadMenus();
    } catch (error) { console.error("Erreur suppression article", error); }
  };

  const handleImageUpload = async (file: File) => {
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post<{ imageUrl: string }>('/menus/items/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setNewItem(prev => ({ ...prev, imageUrl: response.data.imageUrl }));
    } catch (error) { console.error("Erreur upload image", error); }
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
      setSuccessMessage('Article dupliqué avec succès');
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
          ...(next[id] || { stockQty: 20, lowStockThreshold: 5, displayOrder: index + 1, badgeLabel: 'Signature', badgeColor: '#6d28d9', isActive: true, isDishOfDay: false, prepTime: 15, calories: 0, allergens: [], dietaryLabels: [], availableDays: [0,1,2,3,4,5,6], ordersCount: 0, subcategoryName: '' }),
          badgeLabel: bulkBadgeLabel || 'Signature',
          badgeColor: bulkBadgeColor || '#6d28d9',
        };
      });
      return next;
    });
    setSuccessMessage('Badge appliqué en lot');
  };

  const applyBulkOutOfStock = () => {
    if (!selectedItemIds.length) return;
    setItemSettings(prev => {
      const next = { ...prev };
      selectedItemIds.forEach((id, index) => {
        next[id] = {
          ...(next[id] || { displayOrder: index + 1, lowStockThreshold: 5, badgeLabel: 'Signature', badgeColor: '#6d28d9', stockQty: 20, isActive: true, isDishOfDay: false, prepTime: 15, calories: 0, allergens: [], dietaryLabels: [], availableDays: [0,1,2,3,4,5,6], ordersCount: 0, subcategoryName: '' }),
          stockQty: 0,
        };
      });
      return next;
    });
    setSuccessMessage('Stock mis à rupture pour la sélection');
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
    const source = filteredItems;
    const sourceIndex = source.findIndex(i => i.id === sourceId);
    const targetIndex = source.findIndex(i => i.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) return;

    setItemSettings(prev => {
      const next = { ...prev };
      const sourceOrder = next[sourceId]?.displayOrder ?? sourceIndex + 1;
      const targetOrder = next[targetId]?.displayOrder ?? targetIndex + 1;
      next[sourceId] = { ...next[sourceId], displayOrder: targetOrder };
      next[targetId] = { ...next[targetId], displayOrder: sourceOrder };
      return next;
    });
    setDragOverId(null);
    dragItemId.current = null;
    try {
      await api.post('/menus/items/reorder', {
        orders: source.map((item, idx) => ({ id: item.id, order: idx + 1 })),
      });
    } catch (error) { console.error("Erreur reorder", error); }
  };

  // ─── CSV IMPORT ─────────────────────────────────────────────────────────
  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').slice(1); // skip header
      for (const line of lines) {
        if (!line.trim()) continue;
        const cols = line.split(',').map(c => c.replace(/^"|"$/g, '').replace(/""/g, '"'));
        const [name, , , price, description, badgeLabel, , , , prepTime, calories, allergens, dietaryLabels] = cols;
        if (!name || !price) continue;
        try {
          await api.post('/menus/items', {
            name, price: Number(price), description: description || undefined,
            badgeLabel: badgeLabel || undefined, categoryId: newItem.categoryId || categories[0]?.id,
            prepTime: prepTime ? Number(prepTime) : undefined,
            calories: calories ? Number(calories) : undefined,
            allergens: allergens ? allergens.split('|').filter(Boolean) : [],
            dietaryLabels: dietaryLabels ? dietaryLabels.split('|').filter(Boolean) : [],
          });
        } catch (err) { console.error('Import ligne ignorée', err); }
      }
      setSuccessMessage('Import CSV terminé');
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
    <Layout title="Menu & Cartes" subtitle="Composez une carte irrésistible pour votre service.">

      {/* ── HERO ── */}
      <section className="menu-hero">
        <div>
          <h2>Votre carte du jour est prête à performer</h2>
          <p>Ajoutez des plats, optimisez les prix et mettez en avant vos best sellers.</p>
        </div>
        <div className="menu-hero-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => exportCSV(filteredItems, itemSettings)}>
            <Download size={14} /> Exporter CSV
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => csvInputRef.current?.click()}>
            <Upload size={14} /> Importer CSV
          </button>
          <input ref={csvInputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleCSVImport} />
          <button className="btn btn-primary" onClick={() => setShowCreatePanel(prev => !prev)}>
            <Plus size={14} /> Ajouter un article
          </button>
        </div>
      </section>

      {/* ── CREATE PANEL ── */}
      {showCreatePanel && (
        <section className="menu-toolbar" style={{ marginTop: -4 }}>
          <div className="menu-create-layout">
            {/* Nouvelle catégorie */}
            <form onSubmit={handleCreateCategory} className="menu-create-form">
              <h4>Nouvelle catégorie</h4>
              <label className="menu-field-label">
                Nom
                <input placeholder="Ex: Entrées" value={categoryName}
                  onChange={e => setCategoryName(e.target.value)} />
              </label>
              <button className="btn btn-primary btn-sm" type="submit">Créer catégorie</button>
            </form>

            {/* Nouvel article */}
            <form onSubmit={handleCreateItem} className="menu-create-form">
              <h4>{editingItemId ? '✏️ Modifier l\'article' : 'Nouvel article'}</h4>
              <div className="menu-create-grid">
                {/* Nom + Prix */}
                <label className="menu-field-label">
                  Nom de l'article
                  <input placeholder="Ex: Burger Signature" value={newItem.name}
                    onChange={e => setNewItem(prev => ({ ...prev, name: e.target.value }))} />
                </label>
                <label className="menu-field-label">
                  Prix (EUR)
                  <input type="number" min="0" step="0.01" placeholder="Ex: 12.50" value={newItem.price}
                    onChange={e => setNewItem(prev => ({ ...prev, price: e.target.value }))} />
                </label>

                {/* Badge */}
                <div style={{ display: 'flex', gap: 8, gridColumn: '1 / -1' }}>
                  <label className="menu-field-label" style={{ flex: 1 }}>
                    Label du badge
                    <input placeholder="Ex: Best seller" value={newItem.badgeLabel}
                      onChange={e => setNewItem(prev => ({ ...prev, badgeLabel: e.target.value }))} />
                  </label>
                  <label className="menu-field-label" style={{ width: 80 }}>
                    Couleur
                    <input type="color" value={newItem.badgeColor}
                      onChange={e => setNewItem(prev => ({ ...prev, badgeColor: e.target.value }))} />
                  </label>
                </div>

                {/* Stock */}
                <div style={{ display: 'flex', gap: 8, gridColumn: '1 / -1' }}>
                  <label className="menu-field-label" style={{ flex: 1 }}>
                    Quantité en stock
                    <input type="number" min="0" placeholder="Ex: 20" value={newItem.stockQty}
                      onChange={e => setNewItem(prev => ({ ...prev, stockQty: e.target.value }))} />
                  </label>
                  <label className="menu-field-label" style={{ flex: 1 }}>
                    Seuil stock faible
                    <input type="number" min="0" placeholder="Ex: 5" value={newItem.lowStockThreshold}
                      onChange={e => setNewItem(prev => ({ ...prev, lowStockThreshold: e.target.value }))} />
                  </label>
                </div>

                {/* Prep time + Calories */}
                <div style={{ display: 'flex', gap: 8, gridColumn: '1 / -1' }}>
                  <label className="menu-field-label" style={{ flex: 1 }}>
                    Temps de préparation (min)
                    <input type="number" min="1" placeholder="Ex: 15" value={newItem.prepTime}
                      onChange={e => setNewItem(prev => ({ ...prev, prepTime: e.target.value }))} />
                  </label>
                  <label className="menu-field-label" style={{ flex: 1 }}>
                    Calories (kcal)
                    <input type="number" min="0" placeholder="Ex: 450" value={newItem.calories}
                      onChange={e => setNewItem(prev => ({ ...prev, calories: e.target.value }))} />
                  </label>
                </div>

                {/* Catégorie + Sous-catégorie */}
                <label className="menu-field-label">
                  Catégorie
                  <select value={newItem.categoryId}
                    onChange={e => setNewItem(prev => ({ ...prev, categoryId: e.target.value }))}>
                    <option value="">Choisir une catégorie</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </label>
                <label className="menu-field-label">
                  Sous-catégorie
                  <input placeholder="Ex: Chaudes, Froides…" value={newItem.subcategoryName}
                    onChange={e => setNewItem(prev => ({ ...prev, subcategoryName: e.target.value }))} />
                </label>

                {/* Image */}
                <label className="menu-field-label menu-field-full">
                  Image du plat
                  <input type="file" accept="image/*"
                    onChange={e => { const f = e.target.files?.[0]; if (f) void handleImageUpload(f); }} />
                </label>

                {/* Description */}
                <label className="menu-field-label menu-field-full">
                  Description
                  <textarea placeholder="Décrivez le plat (optionnel)" value={newItem.description}
                    onChange={e => setNewItem(prev => ({ ...prev, description: e.target.value }))} />
                </label>

                {/* Allergènes */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <p className="menu-field-label" style={{ marginBottom: 6 }}>Allergènes</p>
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
                  <p className="menu-field-label" style={{ marginBottom: 6 }}>Labels diététiques</p>
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
                  <p className="menu-field-label" style={{ marginBottom: 6 }}>Disponibilité</p>
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

              {isUploadingImage && <p style={{ fontSize: 12, color: 'var(--text-600)' }}>Upload en cours…</p>}
              {!!newItem.imageUrl && (
                <img src={newItem.imageUrl} alt="Preview"
                  style={{ width: 120, height: 72, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm" type="submit">
                  {editingItemId ? 'Mettre à jour' : 'Créer article'}
                </button>
                {editingItemId && (
                  <button className="btn btn-ghost btn-sm" type="button" onClick={() => {
                    setEditingItemId(null);
                    setNewItem({ ...defaultNewItem, categoryId: newItem.categoryId });
                  }}>
                    Annuler
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
            <input placeholder="Rechercher un article, une catégorie…" value={search}
              onChange={e => setSearch(e.target.value)} />
          </div>
          <button
            className={`btn btn-sm ${activeView === 'all' ? 'btn-ghost' : 'btn-primary'}`}
            onClick={() => setActiveView(v => v === 'all' ? 'dish-of-day' : 'all')}
            title="Voir le menu du jour"
          >
            <Sun size={14} /> {activeView === 'dish-of-day' ? 'Menu du jour' : 'Menu du jour'}
          </button>
        </div>

        <div className="menu-category-pills">
          {categoryPills.map(cat => (
            <div key={cat.id} className="category-wrapper">
              <button
                className={`menu-pill ${cat.id === activeCategory ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}>
                {cat.label}<span>{cat.count}</span>
              </button>
              {cat.id !== 'all' && (
                <button className="category-delete-btn"
                  onClick={e => { e.stopPropagation(); setDeleteCategoryTarget({ id: cat.id, name: cat.label }); }}
                  title="Supprimer la catégorie"><X size={10} /></button>
              )}
            </div>
          ))}
        </div>

        {/* Bulk actions */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text-400)' }}>Sélection ({selectedItemIds.length})</span>
          <button className="btn btn-ghost btn-sm" onClick={() => setSelectedItemIds(filteredItems.map(i => i.id))}>Tout sélect.</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setSelectedItemIds([])}>Vider</button>
          <input value={bulkBadgeLabel} onChange={e => setBulkBadgeLabel(e.target.value)} placeholder="Badge"
            style={{ height: 32, borderRadius: 8, border: '1px solid var(--border)', padding: '0 10px', fontSize: 12 }} />
          <input type="color" value={bulkBadgeColor} onChange={e => setBulkBadgeColor(e.target.value)}
            style={{ width: 38, height: 32, border: '1px solid var(--border)', borderRadius: 8, background: 'transparent', cursor: 'pointer' }} />
          <button className="btn btn-ghost btn-sm" onClick={applyBulkBadge}>Appliquer badge</button>
          <button className="btn btn-ghost btn-sm" onClick={applyBulkOutOfStock}>Marquer rupture</button>
        </div>
      </section>

      {/* ── GRID ── */}
      <section className="menu-grid">
        {filteredItems.map(item => {
          const price = Number(item.price);
          const tag = getTagStyle(price);
          const s = itemSettings[item.id];
          const categoryId = categories.find(c => c.name === item.categoryName)?.id ?? '';
          const isDishOfDay = s?.isDishOfDay ?? false;
          const isActive = s?.isActive ?? true;
          const isNeverOrdered = (s?.ordersCount ?? 0) === 0;
          const allergenList = s?.allergens ?? [];
          const dietaryList = s?.dietaryLabels ?? [];
          const availDays = s?.availableDays ?? [0,1,2,3,4,5,6];
          const prepTime = s?.prepTime ?? 15;
          const calories = s?.calories ?? 0;

          return (
            <article
              key={item.id}
              className={`menu-item-card ${isDishOfDay ? 'dish-of-day' : ''} ${!isActive ? 'item-inactive' : ''} ${dragOverId === item.id ? 'drag-over' : ''}`}
              style={{ overflow: 'visible' }}
              draggable
              onDragStart={() => handleDragStart(item.id)}
              onDragOver={e => handleDragOver(e, item.id)}
              onDragLeave={() => setDragOverId(null)}
              onDrop={() => void handleDrop(item.id)}
            >
              {/* Image */}
              <div className="menu-item-image-wrap">
                {/* Drag handle */}
                <div className="menu-drag-handle" title="Glisser pour réordonner">
                  <GripVertical size={14} />
                </div>

                {/* Checkbox */}
                <label className="menu-item-checkbox">
                  <input type="checkbox" checked={selectedItemIds.includes(item.id)}
                    onChange={() => setSelectedItemIds(prev =>
                      prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]
                    )} />
                </label>

                {/* Dish of day badge */}
                {isDishOfDay && (
                  <div className="dish-of-day-badge"><Flame size={11} /> Plat du jour</div>
                )}

                {/* Never ordered warning */}
                {isNeverOrdered && (
                  <div className="never-ordered-badge" title="Jamais commandé">
                    <AlertCircle size={11} /> Jamais commandé
                  </div>
                )}

                <img
                  src={item.imageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80'}
                  alt={item.name}
                  className="menu-item-image"
                  style={{ opacity: isActive ? 1 : 0.45 }}
                />

                {/* Badge */}
                <span className={`menu-item-tag ${tag.css}`}
                  style={{ background: s?.badgeColor || undefined }}>
                  {s?.badgeLabel || tag.label}
                </span>
              </div>

              {/* Content */}
              <div className="menu-item-content" style={{ overflow: 'visible' }}>
                {/* Top row */}
                <div className="menu-item-top">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="menu-item-category">
                      {item.categoryName}
                      {s?.subcategoryName ? <span style={{ opacity: 0.6 }}> › {s.subcategoryName}</span> : null}
                    </p>
                    <h3 style={{ opacity: isActive ? 1 : 0.5 }}>{item.name}</h3>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    {/* Active toggle */}
                    <button
                      className={`icon-btn menu-item-toggle ${isActive ? 'toggle-active' : 'toggle-inactive'}`}
                      onClick={() => void toggleActiveItem(item.id)}
                      title={isActive ? 'Désactiver' : 'Activer'}
                    >
                      {isActive ? <Eye size={13} /> : <EyeOff size={13} />}
                    </button>
                    {/* Dish of day toggle */}
                    <button
                      className={`icon-btn menu-item-toggle ${isDishOfDay ? 'toggle-dish' : ''}`}
                      onClick={() => void toggleDishOfDay(item.id)}
                      title={isDishOfDay ? 'Retirer du menu du jour' : 'Ajouter au menu du jour'}
                    >
                      <Flame size={13} />
                    </button>
                    {/* More */}
                    <button className="icon-btn menu-item-more"
                      onClick={() => setOpenActionsItemId(prev => prev === item.id ? null : item.id)}>
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                  {openActionsItemId === item.id && (
                    <div className="menu-item-actions">
                      <button onClick={() => startEditItem(item as MenuItem & { categoryName: string }, categoryId)}>
                        <Pencil size={14} /> Modifier
                      </button>
                      <button onClick={() => void handleDuplicateItem(item as MenuItem & { categoryName: string }, categoryId)}>
                        <Copy size={14} /> Dupliquer
                      </button>
                      <button className="danger" onClick={() => setDeleteTarget({ id: item.id, name: item.name })}>
                        <Trash2 size={14} /> Supprimer
                      </button>
                    </div>
                  )}
                </div>

                {/* Meta row */}
                <div className="menu-item-meta">
                  <span><Clock3 size={12} /> {prepTime} min</span>
                  {calories > 0 && <span>🔥 {calories} kcal</span>}
                  <span style={{
                    background: getStockVisual(item.id).bg,
                    color: getStockVisual(item.id).color,
                    borderRadius: 999, padding: '2px 7px', fontWeight: 700,
                    display: 'inline-flex', alignItems: 'center', gap: 3,
                  }}>
                    <Package size={11} /> {getStockVisual(item.id).label}
                  </span>
                </div>

                {/* Allergens row */}
                {allergenList.length > 0 && (
                  <div className="menu-item-allergens">
                    {allergenList.map(key => {
                      const a = ALLERGENS.find(x => x.key === key);
                      return a ? <span key={key} title={a.label}>{a.emoji}</span> : null;
                    })}
                  </div>
                )}

                {/* Dietary labels row */}
                {dietaryList.length > 0 && (
                  <div className="menu-item-dietary">
                    {dietaryList.map(key => {
                      const d = DIETARY.find(x => x.key === key);
                      return d ? (
                        <span key={key} style={{ background: d.bg, color: d.color }}>{d.label}</span>
                      ) : null;
                    })}
                  </div>
                )}

                {/* Day availability */}
                {availDays.length < 7 && (
                  <div className="menu-item-days">
                    {DAYS_SHORT.map((day, i) => (
                      <span key={i} className={availDays.includes(i) ? 'day-on' : 'day-off'}>{day}</span>
                    ))}
                  </div>
                )}

                {/* Price row */}
                <div className="menu-item-bottom">
                  <p className="menu-item-price" style={{ opacity: isActive ? 1 : 0.5 }}>
                    {price.toFixed(2)} EUR
                  </p>
                  {!isActive && (
                    <span style={{ fontSize: 11, color: 'var(--text-400)', fontWeight: 600 }}>Désactivé</span>
                  )}
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

      {/* ── DELETE MODALS ── */}
      {deleteTarget && (
        <div className="confirm-modal-backdrop">
          <div className="confirm-modal">
            <button className="confirm-close" onClick={() => setDeleteTarget(null)}><X size={16} /></button>
            <h3>Supprimer cet article ?</h3>
            <p>L'article <strong>{deleteTarget.name}</strong> sera retiré définitivement.</p>
            <div className="confirm-actions">
              <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)}>Annuler</button>
              <button className="btn btn-primary confirm-danger" onClick={() => void handleDeleteItem(deleteTarget.id)}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
      {deleteCategoryTarget && (
        <div className="confirm-modal-backdrop">
          <div className="confirm-modal">
            <button className="confirm-close" onClick={() => setDeleteCategoryTarget(null)}><X size={16} /></button>
            <h3 style={{ color: 'var(--danger)' }}>Supprimer la catégorie ?</h3>
            <p>La catégorie <strong>{deleteCategoryTarget.name}</strong> et <strong>TOUS ses articles</strong> seront supprimés.</p>
            <div className="confirm-actions">
              <button className="btn btn-ghost" onClick={() => setDeleteCategoryTarget(null)}>Annuler</button>
              <button className="btn btn-primary confirm-danger" onClick={() => void handleDeleteCategory(deleteCategoryTarget.id)}>Confirmer</button>
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
    </Layout>
  );
};

export default MenuManagement;