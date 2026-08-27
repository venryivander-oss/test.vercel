import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
  const [summary, setSummary] = useState({ sales: 0, purchases: 0, lowStock: 0 });
  const [mutations, setMutations] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const sumRes = await api.get('/reports/summary');
      if (sumRes && sumRes.data) {
        setSummary({
          sales: sumRes.data.sales || 0,
          purchases: sumRes.data.purchases || 0,
          lowStock: sumRes.data.lowStock || 0
        });
      }
      const mutRes = await api.get('/reports/mutations');
      if (mutRes && Array.isArray(mutRes.data)) {
        setMutations(mutRes.data);
      } else {
        setMutations([]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data', error);
      setMutations([]);
    }
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number || 0);
  };

  const safeMutations = Array.isArray(mutations) ? mutations : [];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm flex items-center space-x-4 border-l-4 border-green-500 border border-gray-200 dark:border-gray-700">
          <div className="p-3 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-full">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Total Penjualan</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{formatRupiah(summary.sales)}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm flex items-center space-x-4 border-l-4 border-blue-500 border border-gray-200 dark:border-gray-700">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Total Pengeluaran (Restock)</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{formatRupiah(summary.purchases)}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm flex items-center space-x-4 border-l-4 border-red-500 border border-gray-200 dark:border-gray-700">
          <div className="p-3 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-full">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Produk Stok Menipis</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{summary.lowStock || 0} Produk</p>
          </div>
        </div>
      </div>

      {/* Mutations Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Riwayat Mutasi Stok Terbaru</h3>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 text-sm border-b border-gray-200 dark:border-gray-700">
                <th className="p-4">Tanggal</th>
                <th className="p-4">Produk</th>
                <th className="p-4">Tipe</th>
                <th className="p-4">Qty</th>
                <th className="p-4">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {safeMutations.map((m) => (
                <tr key={m.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-sm text-gray-800 dark:text-gray-200">
                  <td className="p-4">{m.created_at ? new Date(m.created_at).toLocaleString('id-ID') : '-'}</td>
                  <td className="p-4 font-medium">{m.product_name || 'Produk'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      m.type === 'IN' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300' :
                      m.type === 'OUT' ? 'bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-300' :
                      'bg-orange-100 text-orange-700 dark:bg-orange-900/60 dark:text-orange-300'
                    }`}>
                      {m.type || 'INFO'}
                    </span>
                  </td>
                  <td className="p-4 font-semibold">{m.qty || 0}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{m.description || '-'}</td>
                </tr>
              ))}
              {safeMutations.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-gray-500 dark:text-gray-400">Belum ada mutasi stok.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
