const Whiteboard = require('../../database/models/whiteboard');

const createWhiteboard = async (req, res) => {
  const { userId, drawingData } = req.body;
  try {
    const whiteboard = new Whiteboard({ drawedBy: userId, drawingData });
    await whiteboard.save();
    res.status(200).json({ success: true, whiteboard });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateWhiteboard = async (req, res) => {
    const { id, userId, drawingData } = req.body;
    try {
      await Whiteboard.addDrawing(userId, drawingData);
      const whiteboard = await Whiteboard.findById(id);
      res.status(200).json({ success: true, whiteboard });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  };
  
  const clearWhiteboard = async (req, res) => {
    const { id } = req.body;
    try {
      await Whiteboard.clearBoard();
      const whiteboard = await Whiteboard.findById(id);
      res.status(200).json({ success: true, whiteboard });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

module.exports = {
  createWhiteboard,
  updateWhiteboard,
  clearWhiteboard
};