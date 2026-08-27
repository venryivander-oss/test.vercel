import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { ShoppingBag, Search, Trash2, CheckCircle, Zap, ScanLine, Check } from 'lucide-react';

const POS = () => {
  const [skuInput, setSkuInput] = useState('');
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [toastMessage, setToastMessage] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const skuInputRef = useRef(null);

  useEffect(() => {
    skuInputRef.current?.focus();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const handleCashierScanSubmit = async (e) => {
    e.preventDefault();
    const query = skuInput.trim();
    if (!query) return;

    try {
      const res = await api.get(`/products/search?q=${encodeURIComponent(query)}`);
      
      if (res.data && res.data.length > 0) {
        const product = res.data.find(p => 
          (p.sku && p.sku.toLowerCase() === query.toLowerCase()) || 
          (p.barcode && p.barcode.toLowerCase() === query.toLowerCase())
        ) || res.data[0];

        addToCart(product);
        showToast(`✅ ${product.name} (${formatRupiah(product.selling_price)}) masuk keranjang`);
      } else {
        alert(`❌ Produk dengan SKU / Barcode "${query}" tidak ditemukan!`);
      }
    } catch (err) {
      console.error(err);
      alert('Gagal mencari produk');
    }

    setSkuInput('');
    skuInputRef.current?.focus();
  };

  const handleManualSearch = async (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value.length >= 2) {
      try {
        const res = await api.get(`/products/search?q=${encodeURIComponent(e.target.value)}`);
        setSearchResults(res.data);
      } catch (err) { console.error(err); }
    } else {
      setSearchResults([]);
    }
  };

  const addToCart = (product) => {
    const existing = cart.find(c => c.product_id === product.id);
    if (existing) {
      if (existing.qty + 1 > product.stock) {
        alert(`⚠️ Stok ${product.name} tidak mencukupi! (Sisa: ${product.stock})`);
        return;
      }
      setCart(cart.map(c => c.product_id === product.id 
        ? { ...c, qty: c.qty + 1, subtotal: (c.qty + 1) * c.price }
        : c
      ));
    } else {
      if (product.stock < 1) {
         alert(`⚠️ Stok ${product.name} sedang habis! (Stok: 0)`);
         return;
      }
      setCart([...cart, {
        product_id: product.id,
        name: product.name,
        price: product.selling_price,
        qty: 1,
        subtotal: product.selling_price,
        stock: product.stock,
        sku: product.sku
      }]);
    }
    setSearchQuery('');
    setSearchResults([]);
    skuInputRef.current?.focus();
  };

  const removeCartItem = (id) => setCart(cart.filter(c => c.product_id !== id));

  const updateQty = (id, newQty) => {
    if (newQty < 1) return;
    setCart(cart.map(c => {
      if (c.product_id === id) {
        if (newQty > c.stock) {
          alert('⚠️ Melebihi batas stok tersedia!');
          return c;
        }
        return { ...c, qty: newQty, subtotal: newQty * c.price };
      }
      return c;
    }));
  };

  const subtotal = cart.reduce((sum, c) => sum + c.subtotal, 0);
  const total = Math.max(0, subtotal - discount);
  const change = paidAmount - total;

  const handleCheckout = async (customPaid = null) => {
    const finalPaid = customPaid !== null ? customPaid : paidAmount;
    if (cart.length === 0) return alert('Keranjang masih kosong');
    if (finalPaid < total) return alert('Uang bayar kurang!');

    const invoice_number = 'INV' + Date.now();
    const date = new Date().toISOString().split('T')[0];
    const finalChange = finalPaid - total;

    try {
      await api.post('/sales', {
        invoice_number,
        date,
        total_price: total,
        discount,
        paid_amount: finalPaid,
        change_amount: finalChange,
        items: cart
      });
      alert(`🎉 Transaksi Kasir Sukses!\nNo. Nota: ${invoice_number}\nTotal: ${formatRupiah(total)}\nBayar: ${formatRupiah(finalPaid)}\nKembalian: ${formatRupiah(finalChange)}`);
      setCart([]);
      setDiscount(0);
      setPaidAmount(0);
      skuInputRef.current?.focus();
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menyimpan transaksi kasir');
    }
  };

  const handleQuickDemoCheckout = () => {
    if (cart.length === 0) return alert('Pilih/Scan produk dulu ke dalam keranjang!');
    setPaidAmount(total);
    handleCheckout(total);
  };

  const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);

  return (
    <div className="flex h-full gap-6">
      {/* Left side - Cashier Cart & Input */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">
        
        {/* Main Cashier Input Header */}
        <div className="p-4 bg-blue-600 dark:bg-blue-700 text-white flex flex-col md:flex-row gap-3 items-center justify-between">
          <form onSubmit={handleCashierScanSubmit} className="flex-1 flex gap-2 w-full">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <ScanLine size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <input 
                ref={skuInputRef}
                type="text" 
                placeholder="Ketik SKU (misal: MKNN-CPCY) atau Scan Barcode, tekan Enter..." 
                className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 dark:text-gray-100 font-semibold border-2 border-blue-200 dark:border-blue-500 bg-white dark:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-inner"
                value={skuInput}
                onChange={e => setSkuInput(e.target.value)}
              />
            </div>
            <button type="submit" className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold px-5 py-3 rounded-lg flex items-center gap-1 shadow-sm">
              <Check size={18} /> Detect & Tambah
            </button>
          </form>
        </div>

        {/* Toast Feedback Notification */}
        {toastMessage && (
          <div className="bg-green-100 dark:bg-green-900/60 border-b border-green-300 dark:border-green-700 text-green-800 dark:text-green-300 px-4 py-2 text-sm font-semibold flex items-center gap-2 transition-all">
            {toastMessage}
          </div>
        )}

        {/* Manual Search Fallback Bar */}
        <div className="p-3 bg-gray-50 dark:bg-gray-700/40 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search size={16} />
            </div>
            <input 
              type="text" 
              placeholder="Cari Manual Nama Barang..." 
              className="w-full pl-9 pr-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={handleManualSearch}
            />
            {searchResults.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                {searchResults.map(p => (
                  <div key={p.id} onClick={() => addToCart(p)} className="p-3 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-gray-800 dark:text-gray-100">{p.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">SKU: <span className="font-mono">{p.sku}</span> | Barcode: {p.barcode || '-'}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-600 dark:text-blue-400">{formatRupiah(p.selling_price)}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Stok: {p.stock}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 hidden md:inline">*Kursor otomatis aktif di kolom SKU</span>
        </div>

        {/* Cart Items Table */}
        <div className="flex-1 overflow-y-auto p-0">
          <table className="w-full text-left">
            <thead className="bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 sticky top-0 text-sm">
              <tr>
                <th className="p-3">SKU & Barang</th>
                <th className="p-3 text-right">Harga Satuan</th>
                <th className="p-3 text-center">Jumlah (Qty)</th>
                <th className="p-3 text-right">Subtotal</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {cart.map(c => (
                <tr key={c.product_id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40 text-gray-800 dark:text-gray-200">
                  <td className="p-3">
                    <div className="font-bold text-gray-900 dark:text-gray-100">{c.name}</div>
                    <div className="text-xs text-gray-400 font-mono">{c.sku}</div>
                  </td>
                  <td className="p-3 text-right text-gray-700 dark:text-gray-300">{formatRupiah(c.price)}</td>
                  <td className="p-3 flex justify-center">
                    <input type="number" min="1" className="w-16 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-center rounded p-1 font-semibold" 
                      value={c.qty} onChange={e => updateQty(c.product_id, parseInt(e.target.value))} />
                  </td>
                  <td className="p-3 text-right font-bold text-blue-600 dark:text-blue-400">{formatRupiah(c.subtotal)}</td>
                  <td className="p-3 text-center">
                    <button onClick={() => removeCartItem(c.product_id)} className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-gray-700" title="Hapus">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {cart.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-gray-400 dark:text-gray-500">
                    <p className="text-base font-semibold mb-1">Keranjang Kasir Masih Kosong</p>
                    <p className="text-xs">Ketik SKU barang (contoh: <span className="font-mono bg-gray-100 dark:bg-gray-700 p-1 rounded">MKNN-CPCY</span>) lalu tekan <b>Enter</b>.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right side - Payment panel */}
      <div className="w-80 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 flex flex-col space-y-4 border border-gray-200 dark:border-gray-700">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-500 dark:text-gray-400 text-sm">Subtotal</span>
            <span className="font-semibold text-gray-800 dark:text-gray-100">{formatRupiah(subtotal)}</span>
          </div>
          <div className="flex justify-between mb-2 items-center">
            <span className="text-gray-500 dark:text-gray-400 text-sm">Diskon (Rp)</span>
            <input type="number" step="1000" min="0" className="w-28 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-right p-1 rounded focus:ring-2 focus:ring-blue-500 font-semibold" 
              value={discount} onChange={e => setDiscount(Number(e.target.value))} />
          </div>
          <hr className="my-2 border-gray-200 dark:border-gray-700"/>
          <div className="flex justify-between items-center text-xl font-bold">
            <span className="text-gray-800 dark:text-gray-100">Total Tagihan</span>
            <span className="text-blue-600 dark:text-blue-400">{formatRupiah(total)}</span>
          </div>
        </div>

        {/* Quick Cash Presets */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Uang Pas & Nominal Cepat</label>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button 
              type="button"
              onClick={() => setPaidAmount(total)}
              disabled={cart.length === 0}
              className="px-2 py-1.5 bg-green-50 dark:bg-green-950/60 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 rounded text-xs font-bold hover:bg-green-100 dark:hover:bg-green-900 disabled:opacity-50"
            >
              💵 Uang Pas
            </button>
            <button 
              type="button"
              onClick={() => setPaidAmount(20000)}
              disabled={cart.length === 0}
              className="px-2 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              Rp 20.000
            </button>
            <button 
              type="button"
              onClick={() => setPaidAmount(50000)}
              disabled={cart.length === 0}
              className="px-2 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              Rp 50.000
            </button>
            <button 
              type="button"
              onClick={() => setPaidAmount(100000)}
              disabled={cart.length === 0}
              className="px-2 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              Rp 100.000
            </button>
          </div>
        </div>

        <div>
          <label className="block text-gray-500 dark:text-gray-400 text-xs mb-1 font-medium">Uang Bayar Dari Pembeli (Rp)</label>
          <input 
            type="number" 
            step="1000" 
            min="0"
            placeholder="0"
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 p-3 rounded-lg text-xl text-right font-bold focus:ring-2 focus:ring-blue-500" 
            value={paidAmount || ''} 
            onChange={e => setPaidAmount(Number(e.target.value))} 
          />
          <p className="text-[10px] text-gray-400 dark:text-gray-400 mt-1 text-right">*Klik panah ▲/▼ untuk kelipatan Rp 1.000</p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
          <label className="block text-gray-500 dark:text-gray-400 text-xs mb-1">Uang Kembalian</label>
          <div className={`text-xl font-bold text-right ${change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
            {change >= 0 ? formatRupiah(change) : 'Uang Kurang'}
          </div>
        </div>

        {/* Regular Pay Button */}
        <button 
          onClick={() => handleCheckout()}
          disabled={cart.length === 0 || paidAmount < total}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white p-3.5 rounded-lg flex items-center justify-center space-x-2 font-bold text-base transition-colors shadow-sm"
        >
          <CheckCircle size={20} /> <span>Bayar Sekarang</span>
        </button>

        {/* Quick Demo Purchase Button */}
        <button 
          type="button"
          onClick={handleQuickDemoCheckout}
          disabled={cart.length === 0}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-200 dark:disabled:bg-gray-700 text-white p-2.5 rounded-lg flex items-center justify-center space-x-2 font-bold text-sm transition-colors shadow-xs"
        >
          <Zap size={16} /> <span>⚡ Demo Bayar Otomatis (Uang Pas)</span>
        </button>
      </div>
    </div>
  );
};

export default POS;
