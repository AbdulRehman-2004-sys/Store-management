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

  // UI States
  const [showAddAmountInput, setShowAddAmountInput] = useState(false);
  const [extraAmount, setExtraAmount] = useState("");
  const [showPayInput, setShowPayInput] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ item: "", quantity: "", price: "" });

  const fetchById = async () => {
    setDetailLoading(true);
    try {
      const res = await axios.get(`http://localhost:8080/api/sessions/${id}`,
        {
          headers: {
            "Content-Type": "application/json"
          },
          withCredentials: true,
        } // 👈 allow cookies to be sent
      );
      if (res.data.success) {
        setSession(res.data.session);
      }
    } catch (err) {
      console.error("Fetch session error:", err.response?.data || err.message);
      alert("Failed to load session");
    } finally {
      setDetailLoading(false);
    }
  };


  useEffect(() => {
    if (id) {
      fetchById();
    }
  }, [id]);

  const downloadReceipt = () => {
    if (!session) return;
    const doc = new jsPDF();

    // === Title ===
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.text("Customer Receipt", pageWidth / 2, 20, { align: "center" });

    // === Draw border ===
    doc.setDrawColor(0); // black
    doc.setLineWidth(0.5);
    doc.rect(10, 10, pageWidth - 20, 270); // rectangle border

    // === Customer Info ===
    doc.setFontSize(12);
    let y = 40;

    const addField = (key, value) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${key}:`, 20, y);
      doc.setFont("helvetica", "normal");
      doc.text(value?.toString() || "", 60, y);
      // underline value
      const textWidth = doc.getTextWidth(value?.toString() || "");
      doc.line(60, y + 1, 60 + textWidth, y + 1);
      y += 10;
    };

    addField("Customer Name", session.customerName);
    addField("Contact", session.contactNumber);
    addField("Date", new Date(session.createdAt).toLocaleString());

    // === Items Section ===
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.text("Items:", 20, y);
    y += 10;

    session.items.forEach((it, i) => {
      doc.setFont("helvetica", "normal");
      doc.text(
        `${i + 1}. ${it.item} - ${it.quantity} x ${it.price} = ${it.quantity * it.price
        }`,
        25,
        y
      );
      y += 8;
    });

    // === Totals ===
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text(`Grand Total:`, 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(`${session.grandTotal}`, 60, y);
    doc.line(60, y + 1, 60 + doc.getTextWidth(`${session.grandTotal}`), y + 1);

    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text(`Remaining:`, 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(`${session.remaining ?? 0}`, 60, y);
    doc.line(
      60,
      y + 1,
      60 + doc.getTextWidth(`${session.remaining ?? 0}`),
      y + 1
    );

    // === Save File ===
    doc.save(`${session.customerName}_receipt.pdf`);
  };


  // ✅ Handle Add Amount
  const handleAddAmount = async () => {
    if (!extraAmount || isNaN(extraAmount)) return alert("Enter valid amount");
    setLoading(true)
    try {
      const res = await axios.patch(`http://localhost:8080/api/sessions/${id}/add-amount`, { amount: Number(extraAmount) },
        {
          headers: {
            "Content-Type": "application/json"
          },
          withCredentials: true,
        } // 👈 allow cookies to be sent
      );
      if (res.data.success) {
        setSession(res.data.session);
        setExtraAmount("");
        setShowAddAmountInput(false);
      }
    } catch (err) {
      console.error("Add amount error:", err.response?.data || err.message);
      alert("Failed to add amount");
    } finally {
      setLoading(false)
    }
  };

  // ✅ Handle Payment
  const handlePay = async () => {
    if (!payAmount || isNaN(payAmount)) return alert("Enter valid amount");
    setLoading(true)
    try {
      const res = await axios.patch(`http://localhost:8080/api/sessions/${id}/pay`, { amount: Number(payAmount) },
        {
          headers: {
            "Content-Type": "application/json"
          },
          withCredentials: true,
        } // 👈 allow cookies to be sent
      )
      if (res.data.success) {
        setSession(res.data.session);
        setPayAmount("");
        setShowPayInput(false);
      }
    } catch (err) {
      console.error("Payment error:", err.response?.data || err.message);
      alert("Failed to record payment");
    } finally {
      setLoading(false)
    }
  };

  // ✅ Handle Add Item
  const handleAddItem = async () => {
    if (!newItem.item || !newItem.quantity || !newItem.price) return alert("Fill all fields");
    setLoading(true)
    try {
      const res = await axios.patch(`http://localhost:8080/api/sessions/${id}/add-item`, newItem,
        {
          headers: {
            "Content-Type": "application/json"
          },
          withCredentials: true,
        } // 👈 allow cookies to be sent
      );
      if (res.data.success) {
        setSession(res.data.session);
        setNewItem({ item: "", quantity: "", price: "" });
        setShowAddForm(false);
      }
    } catch (err) {
      console.error("Add item error:", err.response?.data || err.message);
      alert("Failed to add item");
    } finally {
      setLoading(false)
    }
  };

  // Delete an item from a session
  const deleteItem = async (sessionId, itemId, setSession) => {
    try {
      alert("Are you sure you want to delete this item?");
      const res = await axios.delete(
        `http://localhost:8080/api/sessions/${sessionId}/items/${itemId}`,
        {
          headers: {
            "Content-Type": "application/json"
          },
          withCredentials: true,
        } // 👈 allow cookies to be sent
      );

      if (res.data.success) {
        toast.success("Item deleted successfully");
        setSession(res.data.session); // update UI with new session data
      }
    } catch (err) {
      console.error("Delete item error:", err.response?.data || err.message);
      toast.error("Failed to delete item");
    }
  };

  if (detailLoading) return <div className="w-full h-screen flex items-center justify-center z-50 "><h1 className="text-xl font-bold">Loading...</h1></div>;
  if (!session) return <p className="p-4">No session found.</p>;

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-8">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-blue-600"
        >
          ← Back
        </button>
        <button
          onClick={downloadReceipt}
          className="px-4 py-2 bg-purple-600 text-white rounded-md w-full sm:w-auto"
        >
          Download Receipt
        </button>
      </div>

      {/* Title */}
      <h2 className="text-lg sm:text-xl font-bold mt-4 break-words">
        {session.customerName} — {session.contactNumber}
      </h2>
      <p className="text-xs sm:text-sm text-gray-500 mb-4">
        Created: {new Date(session.createdAt).toLocaleString()}
      </p>

      {/* Items List */}
      <div className="space-y-3">
        {session.items.map((it) => (
          <div
            key={it._id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 border rounded-md bg-gray-50"
          >
            <div className="flex-1">
              <div className="font-medium">{it.item}</div>
              <div className="text-xs sm:text-sm text-gray-600">
                Weight / Quantity: {it.quantity}
              </div>
            </div>
            <div className="text-right text-sm sm:text-base">
              <div>{it.quantity} × {it.price}</div>
              <div className="font-semibold">
                Item Total: {it.total ?? it.quantity * it.price}
              </div>
            </div>
            <button
              onClick={() => deleteItem(session._id, it._id, setSession)}
              className="px-3 py-1 rounded-md text-xs sm:text-sm bg-red-600 text-white self-end sm:self-auto"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="mt-4 p-4 border rounded-md bg-white space-y-2">
        <div className="flex justify-between items-center text-sm sm:text-base">
          <span className="font-semibold">Grand Total</span>
          <span className="font-bold">{session.grandTotal ?? session.total ?? 0}</span>
        </div>
        <div className="flex justify-between items-center text-sm sm:text-base">
          <span className="font-semibold">Remaining</span>
          <span className="font-bold text-red-600">{session.remaining ?? session.total ?? 0}</span>
        </div>
      </div>

      {/* Add Amount */}
      <div className="mt-4">
        {!showAddAmountInput ? (
          <button
            onClick={() => setShowAddAmountInput(true)}
            className="px-4 py-2 font-bold bg-red-600 text-white rounded w-full sm:w-auto"
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
              className="px-4 py-2 bg-blue-600 text-white rounded w-full sm:w-auto"
            >
              {loading ? "adding..." : "Submit"}
            </button>
            <button
              onClick={() => setShowAddAmountInput(false)}
              className="px-4 py-2 bg-gray-400 text-white rounded w-full sm:w-auto"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Pay Section */}
      <div className="mt-4">
        {!showPayInput ? (
          <button
            onClick={() => setShowPayInput(true)}
            className="px-4 py-2 bg-yellow-500 text-black font-bold rounded w-full sm:w-auto"
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
              className="px-4 py-2 bg-blue-600 text-white rounded w-full sm:w-auto"
            >
              {loading ? "paying..." : "Submit"}
            </button>
            <button
              onClick={() => setShowPayInput(false)}
              className="px-4 py-2 bg-gray-400 text-white rounded w-full sm:w-auto"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Add Item */}
      <div className="mt-4">
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="px-7 py-2 font-bold bg-purple-600 text-white rounded w-full sm:w-auto"
          >
            Add Item
          </button>
        ) : (
          <div className="space-y-2 p-3 border rounded-md bg-gray-50 mt-2">
            <input
              type="text"
              placeholder="Item name"
              value={newItem.item}
              onChange={(e) => setNewItem({ ...newItem, item: e.target.value })}
              className="border p-2 rounded w-full"
            />
            <input
              type="number"
              placeholder="Quantity / Weight"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
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
                className="px-4 py-2 bg-blue-600 text-white rounded w-full sm:w-auto"
              >
                {loading ? "item-adding..." : "Submit"}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded w-full sm:w-auto"
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
