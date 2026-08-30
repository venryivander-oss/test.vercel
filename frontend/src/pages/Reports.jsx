import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Calendar, DollarSign, ShoppingCart, ShoppingBag, Filter, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('sales'); // 'sales' or 'purchases'
  
  const today = new Date().toISOString().split('T')[0];
  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(today);

  const [salesReport, setSalesReport] = useState({ sales: [], totalRevenue: 0, totalTransactions: 0 });
  const [purchasesReport, setPurchasesReport] = useState({ purchases: [], totalExpenditure: 0, totalRestocks: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, [activeTab]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'sales') {
        const res = await api.get(`/reports/sales?startDate=${startDate}&endDate=${endDate}`);
        if (res && res.data) {
          setSalesReport({
            sales: Array.isArray(res.data.sales) ? res.data.sales : (Array.isArray(res.data) ? res.data : []),
            totalRevenue: res.data.totalRevenue || 0,
            totalTransactions: res.data.totalTransactions || 0
          });
        }
      } else {
        const res = await api.get(`/reports/purchases?startDate=${startDate}&endDate=${endDate}`);
        if (res && res.data) {
          setPurchasesReport({
            purchases: Array.isArray(res.data.purchases) ? res.data.purchases : (Array.isArray(res.data) ? res.data : []),
            totalExpenditure: res.data.totalExpenditure || 0,
            totalRestocks: res.data.totalRestocks || 0
          });
        }
      }
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchReportData();
  };

  const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number || 0);

  const safeSales = Array.isArray(salesReport?.sales) ? salesReport.sales : [];
  const safePurchases = Array.isArray(purchasesReport?.purchases) ? purchasesReport.purchases : [];

  return (
    <div className="space-y-6">
      {/* Header and Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Laporan Transaksi per Tanggal</h2>
        
        {/* Tab Selection Buttons */}
        <div className="flex bg-gray-200 dark:bg-gray-800 p-1 rounded-lg border border-gray-300 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center gap-2 transition-colors ${
              activeTab === 'sales'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <ShoppingBag size={18} /> Laporan Penjualan
          </button>
          <button
            onClick={() => setActiveTab('purchases')}
            className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center gap-2 transition-colors ${
              activeTab === 'purchases'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <ShoppingCart size={18} /> Laporan Pembelian (Restock)
          </button>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <form onSubmit={handleFilterSubmit} className="flex flex-col md:flex-row gap-4 items-end justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Tanggal Mulai</label>
              <input
                type="date"
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Tanggal Akhir</label>
              <input
                type="date"
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-semibold text-sm shadow-sm transition-colors"
          >
            <Filter size={18} /> Filter Laporan
          </button>
        </form>
      </div>

      {/* Summary Cards according to active tab */}
      {activeTab === 'sales' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 border-l-4 border-l-green-500 flex items-center space-x-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-full">
              <ArrowDownLeft size={24} />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase">Total Pendapatan Penjualan</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatRupiah(salesReport.totalRevenue)}</p>
              <p className="text-xs text-gray-400 mt-0.5">Periode {startDate} s/d {endDate}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 border-l-4 border-l-blue-500 flex items-center space-x-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full">
              <ShoppingBag size={24} />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase">Total Transaksi Kasir</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{salesReport.totalTransactions || 0} Transaksi</p>
              <p className="text-xs text-gray-400 mt-0.5">Nota Penjualan Terbit</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 border-l-4 border-l-orange-500 flex items-center space-x-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 rounded-full">
              <ArrowUpRight size={24} />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase">Total Pengeluaran Restock</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{formatRupiah(purchasesReport.totalExpenditure)}</p>
              <p className="text-xs text-gray-400 mt-0.5">Periode {startDate} s/d {endDate}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 border-l-4 border-l-blue-500 flex items-center space-x-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full">
              <ShoppingCart size={24} />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase">Total Faktur Restock</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{purchasesReport.totalRestocks || 0} Faktur</p>
              <p className="text-xs text-gray-400 mt-0.5">Surat Jalan/Faktur Masuk</p>
            </div>
          </div>
        </div>
      )}

      {/* Reports Data Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100">
            {activeTab === 'sales' ? 'Daftar Nota Penjualan Kasir' : 'Daftar Faktur Restock Pembelian'}
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Rentang Tanggal: <span className="font-semibold">{startDate}</span> s/d <span className="font-semibold">{endDate}</span>
          </span>
        </div>

        <div className="p-0 overflow-x-auto">
          {activeTab === 'sales' ? (
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 text-sm">
                  <th className="p-4">Tanggal</th>
                  <th className="p-4">No. Invoice / Nota</th>
                  <th className="p-4 text-right">Diskon</th>
                  <th className="p-4 text-right">Uang Bayar</th>
                  <th className="p-4 text-right">Kembalian</th>
                  <th className="p-4 text-right">Total Netto</th>
                </tr>
              </thead>
              <tbody>
                {safeSales.map((s) => (
                  <tr key={s.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-800 dark:text-gray-200 text-sm">
                    <td className="p-4">{s.date}</td>
                    <td className="p-4 font-mono font-semibold text-blue-600 dark:text-blue-400">{s.invoice_number}</td>
                    <td className="p-4 text-right">{formatRupiah(s.discount || 0)}</td>
                    <td className="p-4 text-right">{formatRupiah(s.paid_amount || 0)}</td>
                    <td className="p-4 text-right text-gray-500">{formatRupiah(s.change_amount || 0)}</td>
                    <td className="p-4 text-right font-bold text-green-600 dark:text-green-400">{formatRupiah(s.total_price)}</td>
                  </tr>
                ))}
                {safeSales.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-400 dark:text-gray-500">
                      {loading ? 'Memuat data...' : `Tidak ada penjualan ditemukan untuk periode ${startDate} s/d ${endDate}`}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 text-sm">
                  <th className="p-4">Tanggal</th>
                  <th className="p-4">No. Faktur</th>
                  <th className="p-4">Supplier</th>
                  <th className="p-4 text-right">Total Pengeluaran</th>
                </tr>
              </thead>
              <tbody>
                {safePurchases.map((p) => (
                  <tr key={p.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-800 dark:text-gray-200 text-sm">
                    <td className="p-4">{p.date}</td>
                    <td className="p-4 font-mono font-semibold text-blue-600 dark:text-blue-400">{p.invoice_number}</td>
                    <td className="p-4 font-medium">{p.supplier_name || 'Tidak Ada Supplier'}</td>
                    <td className="p-4 text-right font-bold text-orange-600 dark:text-orange-400">{formatRupiah(p.total_price)}</td>
                  </tr>
                ))}
                {safePurchases.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-gray-400 dark:text-gray-500">
                      {loading ? 'Memuat data...' : `Tidak ada pembelian/restock ditemukan untuk periode ${startDate} s/d ${endDate}`}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
