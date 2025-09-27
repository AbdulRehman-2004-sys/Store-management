// src/components/SessionDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import jsPDF from "jspdf";

const SessionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const [showAddAmountInput, setShowAddAmountInput] = useState(false);
  const [extraAmount, setExtraAmount] = useState("");
  const [showPayInput, setShowPayInput] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ item: "", quantity: "", price: "" });

  // ✅ Fetch session by ID
  const fetchById = async () => {
    setDetailLoading(true);
    try {
      const res = await axios.get(
        `https://store-management-backend-hcpb.onrender.com/api/sessions/${id}`,
        { withCredentials: true }
      );
      if (res.data.success) setSession(res.data.session);
    } catch (err) {
      toast.error("Failed to load session");
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchById();
  }, [id]);

// ✅ Mobile-friendly Download PDF Receipt
const downloadReceipt = () => {
  if (!session) return;
  const doc = new jsPDF();
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();

  // === Header Styling ===
  doc.setFillColor(245, 245, 245);
  doc.rect(0, 0, w, h, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(0, 128, 0);
  doc.text("Taimoor Akram & Brothers", w / 2, 30, { align: "center" });

  doc.setDrawColor(255, 215, 0);
  doc.line(20, 40, w - 20, 40);
  doc.setFontSize(18);
  doc.setTextColor(0);
  doc.text("Customer Receipt", w / 2, 55, { align: "center" });

  let y = 70;
  const addField = (label, value) => {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(`${value || ""}`, 65, y);
    y += 10;
  };

  addField("Customer", session.customerName);
  addField("Contact", session.contactNumber);
  addField("Date", new Date(session.createdAt).toLocaleString());

  y += 5;
  doc.setFont("helvetica", "bold");
  doc.text("Items:", 20, y);
  y += 10;

  session.items.forEach((it, i) => {
    doc.setFont("helvetica", "normal");
    doc.text(
      `${i + 1}) ${it.item} — ${it.quantity} x ${it.price} = ${
        it.total ?? it.quantity * it.price
      }`,
      25,
      y
    );
    y += 8;
  });

  y += 10;
  doc.setFont("helvetica", "bold");
  doc.text(`Grand Total: ${session.grandTotal}`, 20, y);
  y += 8;
  doc.text(`Remaining: ${session.remaining ?? 0}`, 20, y);

  // === Mobile-Safe Download ===
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);

  // Use an anchor to trigger the download
  const a = document.createElement("a");
  a.href = url;
  a.download = `${session.customerName}_receipt.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Clean up the object URL
  URL.revokeObjectURL(url);
};


  // === CRUD Handlers ===
  const handleAddAmount = async () => {
    if (!extraAmount || isNaN(extraAmount)) return toast.error("Enter valid amount");
    setLoading(true);
    try {
      const res = await axios.patch(
        `https://store-management-backend-hcpb.onrender.com/api/sessions/${id}/add-amount`,
        { amount: Number(extraAmount) },
        { withCredentials: true }
      );
      if (res.data.success) {
        setSession(res.data.session);
        setExtraAmount("");
        setShowAddAmountInput(false);
      }
    } catch {
      toast.error("Failed to add amount");
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (!payAmount || isNaN(payAmount)) return toast.error("Enter valid amount");
    setLoading(true);
    try {
      const res = await axios.patch(
        `https://store-management-backend-hcpb.onrender.com/api/sessions/${id}/pay`,
        { amount: Number(payAmount) },
        { withCredentials: true }
      );
      if (res.data.success) {
        setSession(res.data.session);
        setPayAmount("");
        setShowPayInput(false);
      }
    } catch {
      toast.error("Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.item || !newItem.quantity || !newItem.price)
      return toast.error("Fill all fields");
    setLoading(true);
    try {
      const res = await axios.patch(
        `https://store-management-backend-hcpb.onrender.com/api/sessions/${id}/add-item`,
        newItem,
        { withCredentials: true }
      );
      if (res.data.success) {
        setSession(res.data.session);
        setNewItem({ item: "", quantity: "", price: "" });
        setShowAddForm(false);
      }
    } catch {
      toast.error("Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (itemId) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      const res = await axios.delete(
        `https://store-management-backend-hcpb.onrender.com/api/sessions/${id}/items/${itemId}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success("Item deleted");
        setSession(res.data.session);
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (detailLoading)
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <h1 className="text-xl font-bold">Loading...</h1>
      </div>
    );

  if (!session) return <p className="p-4">No session found.</p>;

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-6">
        <button onClick={() => navigate(-1)} className="text-blue-600 text-sm">
          ← Back
        </button>
        <button
          onClick={downloadReceipt}
          className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-md"
        >
          Download Receipt
        </button>
      </div>

      {/* Customer Info */}
      <h2 className="text-lg sm:text-xl font-bold mt-4 break-words">
        {session.customerName} — {session.contactNumber}
      </h2>
      <p className="text-xs sm:text-sm text-gray-500 mb-4">
        Created: {new Date(session.createdAt).toLocaleString()}
      </p>

      {/* Items */}
      <div className="space-y-3">
        {session.items.map((it) => (
          <div
            key={it._id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 border rounded-md bg-gray-50"
          >
            <div className="flex-1">
              <div className="font-medium">{it.item}</div>
              <div className="text-xs sm:text-sm text-gray-600">
                Qty: {it.quantity}
              </div>
            </div>
            <div className="text-right text-sm sm:text-base">
              <div>
                {it.quantity} × {it.price}
              </div>
              <div className="font-semibold">
                Total: {it.total ?? it.quantity * it.price}
              </div>
            </div>
            <button
              onClick={() => deleteItem(it._id)}
              className="self-end sm:self-auto px-3 py-1 rounded-md text-xs sm:text-sm bg-red-600 text-white"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="mt-4 p-4 border rounded-md bg-white space-y-2">
        <div className="flex justify-between text-sm sm:text-base">
          <span className="font-semibold">Grand Total</span>
          <span className="font-bold">{session.grandTotal ?? 0}</span>
        </div>
        <div className="flex justify-between text-sm sm:text-base">
          <span className="font-semibold">Remaining</span>
          <span className="font-bold text-red-600">
            {session.remaining ?? 0}
          </span>
        </div>
      </div>

      {/* Action Buttons (Responsive) */}
      <div className="space-y-4 mt-6">
        {/* Add Amount */}
        {!showAddAmountInput ? (
          <button
            onClick={() => setShowAddAmountInput(true)}
            className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-md font-semibold"
          >
            Add Amount
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="number"
              placeholder="Enter amount"
              value={extraAmount}
              onChange={(e) => setExtraAmount(e.target.value)}
              className="border p-2 rounded w-full sm:w-40"
            />
            <button
              onClick={handleAddAmount}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              {loading ? "Adding..." : "Submit"}
            </button>
            <button
              onClick={() => setShowAddAmountInput(false)}
              className="w-full sm:w-auto px-4 py-2 bg-gray-400 text-white rounded-md"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Pay Amount */}
        {!showPayInput ? (
          <button
            onClick={() => setShowPayInput(true)}
            className="w-full sm:w-auto px-4 py-2 bg-yellow-500 text-black rounded-md font-semibold"
          >
            Pay Amount
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="number"
              placeholder="Enter amount"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              className="border p-2 rounded w-full sm:w-40"
            />
            <button
              onClick={handlePay}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              {loading ? "Paying..." : "Submit"}
            </button>
            <button
              onClick={() => setShowPayInput(false)}
              className="w-full sm:w-auto px-4 py-2 bg-gray-400 text-white rounded-md"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Add Item */}
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-md font-semibold"
          >
            Add Item
          </button>
        ) : (
          <div className="space-y-2 p-3 border rounded-md bg-gray-50">
            <input
              type="text"
              placeholder="Item name"
              value={newItem.item}
              onChange={(e) => setNewItem({ ...newItem, item: e.target.value })}
              className="border p-2 rounded w-full"
            />
            <input
              type="number"
              placeholder="Quantity"
              value={newItem.quantity}
              onChange={(e) =>
                setNewItem({ ...newItem, quantity: e.target.value })
              }
              className="border p-2 rounded w-full"
            />
            <input
              type="number"
              placeholder="Price"
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
              className="border p-2 rounded w-full"
            />
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleAddItem}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                {loading ? "Adding..." : "Submit"}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="w-full sm:w-auto px-4 py-2 bg-gray-400 text-white rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionDetail;
