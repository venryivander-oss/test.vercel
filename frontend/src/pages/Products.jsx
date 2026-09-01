import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import Barcode from 'react-barcode';
import { Plus, Edit2, Trash2, AlertCircle, Search, Tag, Layers, X } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  
  const [showForm, setShowForm] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newUnitName, setNewUnitName] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);

  const [formData, setFormData] = useState({
    sku: '', barcode: '', name: '', category: 'ALAT TULIS', unit: 'Pcs', selling_price: 0, min_stock: 0, stock: 0, supplier_id: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
    fetchCategories();
    fetchUnits();
    searchInputRef.current?.focus();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (error) { console.error(error); }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await api.get('/suppliers');
      setSuppliers(res.data);
    } catch (error) { console.error(error); }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (error) { console.error(error); }
  };

  const fetchUnits = async () => {
    try {
      const res = await api.get('/units');
      setUnits(res.data);
    } catch (error) { console.error(error); }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      const res = await api.post('/categories', { name: newCategoryName });
      const addedName = res.data?.name || newCategoryName.trim().toUpperCase();
      alert(`✅ Kategori "${addedName}" berhasil ditambahkan!`);
      setNewCategoryName('');
      setShowCategoryModal(false);
      fetchCategories();
      setFormData(prev => ({ ...prev, category: addedName }));
    } catch (error) {
      alert(error.response?.data?.error || 'Gagal menambahkan kategori');
    }
  };

  const handleAddUnit = async (e) => {
    e.preventDefault();
    if (!newUnitName.trim()) return;
    try {
      const res = await api.post('/units', { name: newUnitName });
      const addedName = res.data?.name || newUnitName.trim();
      alert(`✅ Satuan "${addedName}" berhasil ditambahkan!`);
      setNewUnitName('');
      setShowUnitModal(false);
      fetchUnits();
      setFormData(prev => ({ ...prev, unit: addedName }));
    } catch (error) {
      alert(error.response?.data?.error || 'Gagal menambahkan satuan');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Yakin ingin menghapus kategori ini?')) {
      try {
        await api.delete(`/categories/${id}`);
        fetchCategories();
      } catch (error) {
        alert(error.response?.data?.error || 'Gagal menghapus kategori');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        category: formData.category || 'ALAT TULIS',
        unit: formData.unit || 'Pcs',
        selling_price: Number(formData.selling_price) || 0,
        min_stock: Number(formData.min_stock) || 0,
        stock: Number(formData.stock) || 0,
        supplier_id: (formData.supplier_id === "" || formData.supplier_id === undefined) ? null : Number(formData.supplier_id)
      };

      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
      } else {
        await api.post('/products', payload);
      }
      
      setShowForm(false);
      setEditingId(null);
      setFormData({ sku: '', barcode: '', name: '', category: 'ALAT TULIS', unit: 'Pcs', selling_price: 0, min_stock: 0, stock: 0, supplier_id: '' });
      fetchProducts();
    } catch (error) {
      alert(error.response?.data?.error || 'Error saving product');
    }
  };

  const handleEdit = (product) => {
    setFormData({
      sku: product.sku || '',
      barcode: product.barcode || '',
      name: product.name || '',
      category: product.category || 'ALAT TULIS',
      unit: product.unit || 'Pcs',
      selling_price: product.selling_price || 0,
      min_stock: product.min_stock || 0,
      stock: product.stock || 0,
      supplier_id: product.supplier_id || ''
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin hapus produk ini?')) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (error) { alert(error.response?.data?.error || 'Error deleting'); }
    }
  };

  const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);

  const filteredProducts = products.filter(p => 
    (p.barcode && p.barcode.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {/* Header and Action Buttons */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Master Barang</h2>
        <div className="flex flex-wrap gap-2">
          {/* Button Tambah Kategori */}
          <button 
            onClick={() => setShowCategoryModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 shadow-sm transition-colors font-medium text-sm"
          >
            <Tag size={18} /> <span>Tambah Kategori</span>
          </button>

          {/* Button Tambah Satuan */}
          <button 
            onClick={() => setShowUnitModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 shadow-sm transition-colors font-medium text-sm"
          >
            <Layers size={18} /> <span>Tambah Satuan</span>
          </button>
          
          {/* Button Tambah Barang */}
          <button 
            onClick={() => { 
              setShowForm(!showForm); setEditingId(null); 
              setFormData({ sku: '', barcode: '', name: '', category: 'ALAT TULIS', unit: 'Pcs', selling_price: 0, min_stock: 0, stock: 0, supplier_id: '' });
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 shadow-sm transition-colors font-medium text-sm"
          >
            <Plus size={18} /> <span>Tambah Barang</span>
          </button>
        </div>
      </div>

      {/* Modal Tambah Kategori */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3 border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <Tag size={20} className="text-purple-600 dark:text-purple-400" /> Kelola Kategori Barang
              </h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Nama Kategori Baru (misal: SNEAKERS)"
                required
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 uppercase text-sm font-semibold"
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
              />
              <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm">
                Simpan
              </button>
            </form>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Daftar Kategori Tersedia</label>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1 border rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                {categories.map(cat => (
                  <span key={cat.id} className="bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 text-xs px-3 py-1 rounded-full flex items-center gap-1.5 font-bold border border-purple-200 dark:border-purple-800">
                    {cat.name}
                    <button type="button" onClick={() => handleDeleteCategory(cat.id)} className="text-purple-500 hover:text-red-600 ml-1">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setShowCategoryModal(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-semibold">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Satuan */}
      {showUnitModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3 border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <Layers size={20} className="text-emerald-600 dark:text-emerald-400" /> Tambah Satuan Barang
              </h3>
              <button onClick={() => setShowUnitModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddUnit} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Nama Satuan Baru (misal: Renceng, Lusin)"
                required
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 text-sm font-semibold"
                value={newUnitName}
                onChange={e => setNewUnitName(e.target.value)}
              />
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm">
                Simpan
              </button>
            </form>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Daftar Satuan Tersedia</label>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                {units.map(u => (
                  <span key={u.id} className="bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs px-3 py-1 rounded-full font-bold border border-emerald-200 dark:border-emerald-800">
                    {u.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setShowUnitModal(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-semibold">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* Scanner & Search Input Field */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input 
            ref={searchInputRef}
            type="text"
            autoFocus
            placeholder="Scan Barcode atau ketik nama/SKU/kategori..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 italic">
          *Pastikan kursor berada di kolom input di atas saat menggunakan scanner barcode fisik.
        </p>
      </div>

      {/* Add / Edit Form Modal */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">{editingId ? 'Edit Barang' : 'Tambah Barang Baru'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">SKU</label>
              <input required className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 font-mono" value={formData.sku} onChange={e=>setFormData({...formData, sku: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Barcode (No. Barcode)</label>
              <input className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 font-mono" value={formData.barcode} onChange={e=>setFormData({...formData, barcode: e.target.value})} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Nama Barang</label>
              <input required className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} />
            </div>
            
            {/* Category Dropdown Selection */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Kategori Barang</label>
              <select className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 font-semibold" value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})}>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                {categories.length === 0 && <option value="ALAT TULIS">ALAT TULIS</option>}
              </select>
            </div>

            {/* Dynamic Units Dropdown Selection */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Satuan Barang</label>
              <select className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 font-semibold" value={formData.unit} onChange={e=>setFormData({...formData, unit: e.target.value})}>
                {units.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                {units.length === 0 && (
                  <>
                    <option value="Pcs">Pcs</option>
                    <option value="Box">Box</option>
                    <option value="Kg">Kg</option>
                    <option value="Liter">Liter</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Supplier</label>
              <select className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500" value={formData.supplier_id} onChange={e=>setFormData({...formData, supplier_id: e.target.value})}>
                <option value="">Pilih Supplier</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Harga Jual (Rp)</label>
              <input type="number" required className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500" value={formData.selling_price} onChange={e=>setFormData({...formData, selling_price: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Stok Barang</label>
              <input type="number" required className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500" value={formData.stock} onChange={e=>setFormData({...formData, stock: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Min. Stok</label>
              <input type="number" className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500" value={formData.min_stock} onChange={e=>setFormData({...formData, min_stock: e.target.value})} />
            </div>
            
            <div className="col-span-4 flex justify-end space-x-2 mt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">Batal</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">Simpan Produk</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 text-sm">
              <th className="p-4">SKU & Info</th>
              <th className="p-4">Nama Barang</th>
              <th className="p-4 text-center">Kategori</th>
              <th className="p-4 text-center">Satuan</th>
              <th className="p-4 text-center">Visual Barcode</th>
              <th className="p-4 text-right">Harga Jual</th>
              <th className="p-4 text-center">Stok</th>
              <th className="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(p => (
              <tr key={p.id} className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-800 dark:text-gray-200 ${p.stock <= p.min_stock ? 'bg-red-50 dark:bg-red-950/30' : ''}`}>
                <td className="p-4">
                  <div className="font-medium font-mono text-sm">{p.sku}</div>
                </td>
                <td className="p-4">
                  <div className="font-medium text-gray-900 dark:text-gray-100">{p.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{p.supplier_name ? `Supplier: ${p.supplier_name}` : ''}</div>
                </td>
                <td className="p-4 text-center">
                  <span className="px-2.5 py-1 bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-md border border-purple-200 dark:border-purple-800">
                    {p.category || 'ALAT TULIS'}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-md border border-emerald-200 dark:border-emerald-800">
                    {p.unit || 'Pcs'}
                  </span>
                </td>
                <td className="p-4 text-center">
                  {p.barcode ? (
                    <div className="inline-block bg-white p-1 rounded border border-gray-200 shadow-xs">
                      <Barcode
                        value={p.barcode}
                        width={1.2}
                        height={35}
                        fontSize={12}
                        displayValue={true}
                        background="#ffffff"
                        lineColor="#000000"
                      />
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 italic">Belum ada barcode</span>
                  )}
                </td>
                <td className="p-4 text-right font-medium text-blue-600 dark:text-blue-400">{formatRupiah(p.selling_price)}</td>
                <td className="p-4 text-center">
                  <div className={`font-bold ${p.stock <= p.min_stock ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    {p.stock} {p.unit || 'Pcs'}
                  </div>
                  {p.stock <= p.min_stock && (
                    <div className="text-xs text-red-500 dark:text-red-400 flex items-center justify-center gap-1">
                      <AlertCircle size={12}/> Menipis
                    </div>
                  )}
                </td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => handleEdit(p)} className="text-blue-600 dark:text-blue-400 p-1 hover:bg-blue-50 dark:hover:bg-gray-700 rounded" title="Edit"><Edit2 size={18} /></button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600 dark:text-red-400 p-1 hover:bg-red-50 dark:hover:bg-gray-700 rounded" title="Hapus"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan="8" className="p-8 text-center text-gray-400 dark:text-gray-500">
                  {searchQuery ? `Tidak ada barang dengan query "${searchQuery}"` : 'Belum ada barang di database. Klik "Tambah Barang" untuk memulai.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Products;
