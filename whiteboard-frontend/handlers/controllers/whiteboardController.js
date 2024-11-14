const Whiteboard = require('../../database/models/whiteboard');

const getWhiteboardByInstance = async (req, res) => {
  console.log("Get whiteboard by instance");
  const { objectId } = req.params;  
  console.log("Object ID: ", objectId);
  try {
    const whiteboard = await Whiteboard.findOne({ _id: objectId });
    if (!whiteboard) {
      return res.status(404).json({ success: false, message: 'Whiteboard not found' });
    }
    res.status(200).json({ success: true, whiteboard: whiteboard.toJSON() });
  } catch (error) {
    console.log("Error: ", error);
    res.status(400).json({ success: false, message: error.message });
  }
}

const updateWhiteboard = async (req, res) => {
    const { id, userId, drawingData } = req.body;
    try {
      await Whiteboard.addDrawing(userId, drawingData);
      const whiteboard = await Whiteboard.findById(id);
      if (!whiteboard)
        return res.status(404).json({ success: false, message: 'Whiteboard not found' });
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
  getWhiteboardByInstance,
  updateWhiteboard,
  clearWhiteboard
};