import OrderSession from "../model/OrderSession.js";

// ✅ Create new khata/session
export const createSession = async (req, res) => {
  try {
    const { customerName, contactNumber, items } = req.body;

    const updatedItems = items.map(it => ({
      ...it,
      total: it.price * it.quantity
    }));

    const grandTotal = updatedItems.reduce((acc, it) => acc + it.total, 0);

    const newSession = new OrderSession({
      user: req.user._id,   // 👈 attach logged-in user
      customerName,
      contactNumber,
      items: updatedItems,
      grandTotal
    });

    await newSession.save();
    res.status(201).json(newSession);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get all sessions of a particular customer
export const deleteSessionById = async (req, res) => {
  try {
    const deleted = await OrderSession.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }
    res.json({ success: true, message: "Session deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Get single session by ID
export const getSessionById = async (req, res) => {
  try {
    const session = await OrderSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: "Session not found" });
    res.status(200).json({ success: true, session });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get ALL customers' sessions (for dashboard)
export const getAllSessions = async (req, res) => {
  try {
    const sessions = await OrderSession.find({ user: req.user._id }) // 👈 only logged-in user's sessions
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// PATCH /api/sessions/:id/add-amount
// PATCH /api/sessions/:id/add-amount
// PATCH /api/sessions/:id/add-amount
// PATCH /api/sessions/:id/add-amount
export const addAmountToSession = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ success: false, message: "Valid amount is required" });
    }

    const session = await OrderSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    // ✅ Only add to remaining
    session.remaining = (session.remaining ?? 0) + Number(amount);

    await session.save();

    res.json({ success: true, message: "Amount added to remaining successfully", session });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};




// PATCH /api/sessions/:id/pay
export const paySession = async (req, res) => {
  try {
    const { amount } = req.body;
    const session = await OrderSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    session.remaining = (session.remaining ?? session.grandTotal) - amount;
    if (session.remaining < 0) session.remaining = 0;

    await session.save();
    res.json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// PATCH /api/sessions/:id/add-item
export const addItemToSession = async (req, res) => {
  try {
    const { item, quantity, price } = req.body;
    const session = await OrderSession.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: "Session not found" });

    const total = quantity * price;
    session.items.push({ item, quantity, price, total, createdAt: new Date() });
    session.grandTotal = (session.grandTotal || 0) + total;
    session.remaining = (session.remaining || 0) + total;

    await session.save();
    res.json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE /api/sessions/:sessionId/items/:itemId
export const deleteItemFromSession = async (req, res) => {
  try {
    const { sessionId, itemId } = req.params;

    const session = await OrderSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    // Find the item inside items array
    const itemIndex = session.items.findIndex(it => it._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: "Item not found in session" });
    }

    const item = session.items[itemIndex];

    // Subtract item total from grandTotal and remaining
    session.grandTotal = (session.grandTotal || 0) - (item.total || (item.quantity * item.price));
    if (session.grandTotal < 0) session.grandTotal = 0;

    session.remaining = (session.remaining || 0) - (item.total || (item.quantity * item.price));
    if (session.remaining < 0) session.remaining = 0;

    // Remove the item
    session.items.splice(itemIndex, 1);

    await session.save();

    res.json({ success: true, message: "Item deleted successfully", session });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
