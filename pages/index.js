"use client";

import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import Papa from "papaparse";

const CATEGORY_COLORS = {
  Food: "#FF6384",
  Rent: "#36A2EB",
  Transport: "#FFCE56",
  Entertainment: "#AA336A",
  Salary: "#33AA99",
  Other: "#FF8042",
};

export default function Home() {
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Other");
  const [darkMode, setDarkMode] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    const savedTransactions = localStorage.getItem("transactions");
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));

    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode === "true") setDarkMode(true);
  }, []);

  // Save to LocalStorage
  useEffect(() => localStorage.setItem("transactions", JSON.stringify(transactions)), [transactions]);
  useEffect(() => localStorage.setItem("darkMode", darkMode), [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const income = transactions.filter((tx) => tx.amount > 0).reduce((acc, tx) => acc + tx.amount, 0);
  const expenses = transactions.filter((tx) => tx.amount < 0).reduce((acc, tx) => acc + tx.amount, 0);
  const balance = income + expenses;

  const expenseByCategory = transactions
    .filter((tx) => tx.amount < 0)
    .reduce((acc, tx) => {
      if (acc[tx.category]) acc[tx.category] += Math.abs(tx.amount);
      else acc[tx.category] = Math.abs(tx.amount);
      return acc;
    }, {});

  const chartData = Object.keys(expenseByCategory).map((key) => ({
    name: key,
    value: expenseByCategory[key],
  }));

  const handleExportCSV = () => {
    const csv = Papa.unparse(transactions);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "transactions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const importedTransactions = results.data.map((tx) => ({
          description: tx.description,
          amount: parseFloat(tx.amount),
          category: tx.category || "Other",
        }));
        setTransactions(importedTransactions);
      },
    });
  };

  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!description || !amount) return;
    setTransactions([...transactions, { description, amount: parseFloat(amount), category }]);
    setDescription("");
    setAmount("");
    setCategory("Other");
  };

  const handleDeleteTransaction = (index) => {
    setTransactions(transactions.filter((_, i) => i !== index));
  };

  return (
    <main className={`${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-black"} min-h-screen`}>
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md">
        <div className="max-w-md sm:max-w-3xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-white">💰 Expense Tracker</h1>
            <p className="text-blue-100 mt-1">Track your spending effortlessly</p>
          </div>
          <button
            onClick={toggleDarkMode}
            className="ml-4 bg-white text-indigo-600 px-4 py-2 rounded-lg hover:scale-105 transform transition"
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </header>

      {/* Content */}
      <section className="max-w-md sm:max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div className="p-5 rounded-2xl bg-gradient-to-r from-green-100 to-green-200 shadow-lg transform transition hover:scale-105">
            <p className="text-sm text-gray-600">Income</p>
            <p className="text-2xl font-bold text-green-700">R {income.toFixed(2)}</p>
          </motion.div>
          <motion.div className="p-5 rounded-2xl bg-gradient-to-r from-red-100 to-red-200 shadow-lg transform transition hover:scale-105">
            <p className="text-sm text-gray-600">Expenses</p>
            <p className="text-2xl font-bold text-red-700">R {Math.abs(expenses).toFixed(2)}</p>
          </motion.div>
          <motion.div className="p-5 rounded-2xl bg-gradient-to-r from-blue-100 to-blue-200 shadow-lg transform transition hover:scale-105">
            <p className="text-sm text-gray-600">Balance</p>
            <p className="text-2xl font-bold">R {balance.toFixed(2)}</p>
          </motion.div>
        </div>

        {/* Export / Import */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition flex-1"
          >
            Export CSV
          </button>
          <label className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 cursor-pointer transition flex-1 text-center">
            Import CSV
            <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
          </label>
        </div>

        {/* Add Transaction */}
        <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow space-y-4">
          <h2 className="text-xl font-semibold">Add Transaction</h2>
          <form className="space-y-4" onSubmit={handleAddTransaction}>
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-700 dark:text-white"
            />
            <input
              type="number"
              placeholder="Amount (negative for expense)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-3 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-700 dark:text-white"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-700 dark:text-white"
            >
              <option>Other</option>
              <option>Food</option>
              <option>Rent</option>
              <option>Transport</option>
              <option>Entertainment</option>
              <option>Salary</option>
            </select>
            <button className="w-full bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition transform hover:scale-105">
              Add Transaction
            </button>
          </form>
        </div>

        {/* Transactions List */}
        <AnimatePresence>
          <div className="space-y-3 mt-4 max-h-96 overflow-y-auto">
            {transactions.map((tx, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.3 }}
                className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-xl shadow hover:scale-105 transform transition"
              >
                <div>
                  <p className="font-semibold">{tx.description}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-300">{tx.category}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={tx.amount < 0 ? "text-red-500 font-bold" : "text-green-500 font-bold"}>
                    R {tx.amount.toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleDeleteTransaction(i)}
                    className="text-red-500 hover:text-red-700 p-2 rounded-lg"
                  >
                    ❌
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        {/* Pie Chart */}
        {chartData.length > 0 && (
          <motion.div
            className="rounded-2xl bg-gradient-to-r from-indigo-100 to-indigo-200 p-4 shadow mt-6"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="font-semibold mb-4 text-gray-800">Expenses by Category</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || "#8884d8"} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </section>
    </main>
  );
}










