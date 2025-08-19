"use client";

import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Papa from "papaparse";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA336A", "#33AA99"];

export default function Home() {
  // Transactions and dark mode
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Other");
  const [darkMode, setDarkMode] = useState(false);

  // Load LocalStorage AFTER mount to avoid hydration errors
  useEffect(() => {
    const savedTransactions = localStorage.getItem("transactions");
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));

    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode === "true") setDarkMode(true);
  }, []);

  // Save transactions
  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  // Save dark mode
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Totals
  const income = transactions.filter((tx) => tx.amount > 0).reduce((acc, tx) => acc + tx.amount, 0);
  const expenses = transactions.filter((tx) => tx.amount < 0).reduce((acc, tx) => acc + tx.amount, 0);
  const balance = income + expenses;

  // Pie chart data
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

  // CSV Export
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

  // CSV Import
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

  return (
    <main className={`${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-black"} min-h-screen`}>
      {/* Header */}
      <header className="border-b bg-white dark:bg-gray-800">
        <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">💰 Expense Tracker</h1>
            <p className="text-gray-500 dark:text-gray-300">Track your spending easily.</p>
          </div>
          <button
            onClick={toggleDarkMode}
            className="ml-4 bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-600 transition"
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </header>

      {/* Content */}
      <section className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl bg-white dark:bg-gray-800 p-4 shadow">
            <p className="text-sm text-gray-500 dark:text-gray-300">Income</p>
            <p className="text-2xl font-semibold text-green-600">R {income.toFixed(2)}</p>
          </div>
          <div className="rounded-xl bg-white dark:bg-gray-800 p-4 shadow">
            <p className="text-sm text-gray-500 dark:text-gray-300">Expenses</p>
            <p className="text-2xl font-semibold text-red-600">R {Math.abs(expenses).toFixed(2)}</p>
          </div>
          <div className="rounded-xl bg-white dark:bg-gray-800 p-4 shadow">
            <p className="text-sm text-gray-500 dark:text-gray-300">Balance</p>
            <p className="text-2xl font-semibold">R {balance.toFixed(2)}</p>
          </div>
        </div>

        {/* Export/Import CSV */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={handleExportCSV}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
          >
            Export CSV
          </button>
          <label className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 cursor-pointer transition">
            Import CSV
            <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
          </label>
        </div>

        {/* Add Transaction Form */}
        <div className="rounded-xl bg-white dark:bg-gray-800 p-4 shadow space-y-4">
          <h2 className="text-lg font-semibold">Add Transaction</h2>

          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!description || !amount) return;

              setTransactions([
                ...transactions,
                { description, amount: parseFloat(amount), category },
              ]);

              setDescription("");
              setAmount("");
              setCategory("Other");
            }}
          >
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />

            <input
              type="number"
              placeholder="Amount (use negative for expenses)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="Other">Other</option>
              <option value="Food">Food</option>
              <option value="Rent">Rent</option>
              <option value="Transport">Transport</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Salary">Salary</option>
            </select>

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-500 text-white py-2 font-semibold hover:bg-blue-600 transition"
            >
              Add
            </button>
          </form>
        </div>

        {/* Transactions List */}
        <div className="mt-4 space-y-2">
          {transactions.map((tx, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-2 border-b border-gray-200 dark:border-gray-700"
            >
              <span>
                {tx.description} ({tx.category})
              </span>
              <div className="flex items-center gap-4">
                <span className={tx.amount < 0 ? "text-red-500" : "text-green-500"}>
                  R {tx.amount.toFixed(2)}
                </span>
                <button
                  onClick={() => setTransactions(transactions.filter((_, i) => i !== index))}
                  className="text-red-500 font-bold hover:text-red-700"
                >
                  ❌
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pie Chart */}
        {chartData.length > 0 && (
          <div className="rounded-xl bg-white dark:bg-gray-800 p-4 shadow mt-6">
            <h2 className="text-lg font-semibold mb-4">Expenses by Category</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </main>
  );
}







