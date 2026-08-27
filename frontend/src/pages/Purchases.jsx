import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2 } from 'lucide-react';

const Purchases = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [showForm, setShowForm] = useState(false);
  
  const [invoice, setInvoice] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [supplierId, setSupplierId] = useState('');
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [qty, setQty] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [supRes, prodRes, purRes] = await Promise.all([
        api.get('/suppliers'),
        api.get('/products'),
        api.get('/purchases')
      ]);
      setSuppliers(supRes.data);
      setProducts(prodRes.data);
      setPurchases(purRes.data);
    } catch (error) { console.error(error); }
  };

  const handleAddToCart = () => {
    if (!selectedProduct || qty <= 0) return;
    const product = products.find(p => p.id === parseInt(selectedProduct));
    if (!product) return;

    const existing = cart.find(item => item.product_id === product.id);
    if (existing) {
      setCart(cart.map(item => item.product_id === product.id 
        ? { ...item, qty: item.qty + parseInt(qty), subtotal: (item.qty + parseInt(qty)) * item.price }
        : item
      ));
    } else {
      setCart([...cart, {
        product_id: product.id,
        name: product.name,
        price: product.selling_price || 0,
        qty: parseInt(qty),
        subtotal: parseInt(qty) * (product.selling_price || 0)
      }]);
    }
    setSelectedProduct('');
    setQty(1);
  };

  const removeCartItem = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.subtotal, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return alert('Keranjang kosong');
    if (!supplierId || !invoice || !date) return alert('Data tidak lengkap. Harap isi No. Faktur, Tanggal, dan pilih Supplier.');

    try {
      await api.post('/purchases', {
        invoice_number: invoice,
        date,
        supplier_id: supplierId,
        total_price: totalPrice,
        items: cart
      });
      alert('Restock berhasil disimpan!');
      setShowForm(false);
      setCart([]);
      setInvoice('');
      setSupplierId('');
      fetchData();
    } catch (error) {
      alert(error.response?.data?.error || 'Gagal menyimpan pembelian');
    }
  };

  const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Transaksi Pembelian (Restock)</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-sm"
        >
          <Plus size={18} /> <span>Restock Baru</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">No. Faktur</label>
              <input type="text" placeholder="Misal: RES-CPCY-1" className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500" value={invoice} onChange={e=>setInvoice(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal</label>
              <input type="date" className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500" value={date} onChange={e=>setDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Supplier *</label>
              <select required className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500" value={supplierId} onChange={e=>setSupplierId(e.target.value)}>
                <option value="">-- Pilih Supplier --</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/40 p-4 rounded-lg mb-6 flex gap-4 items-end border border-gray-200 dark:border-gray-700">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pilih Barang</label>
              <select className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500" value={selectedProduct} onChange={e=>setSelectedProduct(e.target.value)}>
                <option value="">-- Pilih Barang --</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stok: {p.stock})</option>)}
              </select>
            </div>
            <div className="w-28">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Jumlah Qty</label>
              <input type="number" min="1" className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500" value={qty} onChange={e=>setQty(e.target.value)} />
            </div>
            <button onClick={handleAddToCart} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded h-10 font-semibold shadow-sm">Tambah</button>
          </div>

          {cart.length > 0 && (
            <div className="mb-6">
              <table className="w-full text-left border border-gray-200 dark:border-gray-700">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 text-sm">
                    <th className="p-3">Barang</th>
                    <th className="p-3 text-right">Harga Satuan</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Subtotal</th>
                    <th className="p-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((c, i) => (
                    <tr key={i} className="border-t border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-sm">
                      <td className="p-3 font-medium">{c.name}</td>
                      <td className="p-3 text-right">{formatRupiah(c.price)}</td>
                      <td className="p-3 text-center font-bold">{c.qty}</td>
                      <td className="p-3 text-right font-semibold text-blue-600 dark:text-blue-400">{formatRupiah(c.subtotal)}</td>
                      <td className="p-3 text-center text-red-600 dark:text-red-400"><button onClick={() => removeCartItem(c.product_id)}><Trash2 size={16}/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="text-right text-xl font-bold mt-4 text-gray-800 dark:text-gray-100">Total: {formatRupiah(totalPrice)}</div>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">Batal</button>
            <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold">Simpan Restock</button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 text-sm">
              <th className="p-4">Tanggal</th>
              <th className="p-4">No. Faktur</th>
              <th className="p-4">Supplier</th>
              <th className="p-4 text-right">Total Nominal</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map(p => (
              <tr key={p.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-800 dark:text-gray-200 text-sm">
                <td className="p-4">{p.date}</td>
                <td className="p-4 font-mono font-medium">{p.invoice_number}</td>
                <td className="p-4">{p.supplier_name || 'Tidak Ada'}</td>
                <td className="p-4 text-right font-semibold text-blue-600 dark:text-blue-400">{formatRupiah(p.total_price)}</td>
              </tr>
            ))}
            {purchases.length === 0 && (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-400 dark:text-gray-500">Belum ada riwayat pembelian/restock.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Purchases;
