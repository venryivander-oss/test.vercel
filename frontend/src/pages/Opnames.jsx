import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ClipboardCheck } from 'lucide-react';

const Opnames = () => {
  const [opnames, setOpnames] = useState([]);
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [productId, setProductId] = useState('');
  const [systemStock, setSystemStock] = useState(0);
  const [physicalStock, setPhysicalStock] = useState(0);
  const [reason, setReason] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [opRes, prodRes] = await Promise.all([
        api.get('/opnames'),
        api.get('/products')
      ]);
      setOpnames(opRes.data);
      setProducts(prodRes.data);
    } catch (error) { console.error(error); }
  };

  const handleProductSelect = (e) => {
    const id = e.target.value;
    setProductId(id);
    if (id) {
      const prod = products.find(p => p.id === parseInt(id));
      setSystemStock(prod ? prod.stock : 0);
      setPhysicalStock(prod ? prod.stock : 0);
    } else {
      setSystemStock(0);
      setPhysicalStock(0);
    }
  };

  const difference = physicalStock - systemStock;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId || !reason) return alert('Pilih produk dan isi keterangan');
    
    if (difference === 0) return alert('Tidak ada selisih stok (fisik = sistem).');

    try {
      await api.post('/opnames', {
        date,
        product_id: productId,
        physical_stock: physicalStock,
        reason
      });
      alert('Stock Opname berhasil disimpan!');
      setShowForm(false);
      setProductId('');
      setReason('');
      fetchData();
    } catch (error) {
      alert(error.response?.data?.error || 'Gagal menyimpan opname');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Penyesuaian Stok (Stock Opname)</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-sm"
        >
          <ClipboardCheck size={18} /> <span>Buat Opname</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6 border border-gray-200 dark:border-gray-700 w-full md:w-2/3">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal</label>
                <input type="date" className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500" value={date} onChange={e=>setDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Produk</label>
                <select className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500" value={productId} onChange={handleProductSelect}>
                  <option value="">-- Pilih Produk --</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stok: {p.stock})</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-700/40 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400">Stok Sistem</label>
                <input type="number" readOnly className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-100 font-bold" value={systemStock} />
              </div>
              <div>
                <label className="block text-sm font-bold text-blue-600 dark:text-blue-400">Stok Fisik</label>
                <input type="number" className="w-full border-2 border-blue-300 dark:border-blue-500 p-2 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 font-bold" 
                  value={physicalStock} onChange={e=>setPhysicalStock(parseInt(e.target.value) || 0)} />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400">Selisih</label>
                <input type="text" readOnly className={`w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-gray-200 dark:bg-gray-800 font-bold ${difference < 0 ? 'text-red-500 dark:text-red-400' : difference > 0 ? 'text-green-500 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`} 
                  value={difference > 0 ? `+${difference}` : difference} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Keterangan (Wajib)</label>
              <input type="text" placeholder="Misal: Barang rusak, hilang, dll" required className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500" 
                value={reason} onChange={e=>setReason(e.target.value)} />
            </div>

            <div className="flex justify-end space-x-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">Batal</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold">Simpan Opname</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 text-sm">
              <th className="p-4">Tanggal</th>
              <th className="p-4">Produk</th>
              <th className="p-4 text-center">Stok Sistem</th>
              <th className="p-4 text-center">Stok Fisik</th>
              <th className="p-4 text-center">Selisih</th>
              <th className="p-4">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {opnames.map(o => (
              <tr key={o.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-800 dark:text-gray-200 text-sm">
                <td className="p-4">{o.date}</td>
                <td className="p-4 font-medium">{o.product_name}</td>
                <td className="p-4 text-center">{o.system_stock}</td>
                <td className="p-4 text-center font-bold text-blue-600 dark:text-blue-400">{o.physical_stock}</td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 rounded font-medium ${o.difference < 0 ? 'bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400' : 'bg-green-100 dark:bg-green-950/60 text-green-600 dark:text-green-400'}`}>
                    {o.difference > 0 ? '+' : ''}{o.difference}
                  </span>
                </td>
                <td className="p-4">{o.reason}</td>
              </tr>
            ))}
            {opnames.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-400 dark:text-gray-500">Belum ada riwayat stock opname.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Opnames;
