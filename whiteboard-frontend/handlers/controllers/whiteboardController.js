const {Whiteboard} = require('../../database/models/whiteboard');

const getWhiteboardByInstance = async (req, res) => {
  console.log("Refreshing whiteboard for user", req.session.name);
  try {
    const whiteboard = await Whiteboard.findById(req.session.room.whiteboard);
    return whiteboard;

  } catch (error) {
    console.log("Error: ", error);
    res.status(400).json({ success: false, message: error.message });
  }
}

const updateWhiteboard = async (req, res, data) => {
    try {
      //console.log("Request: ", req.session.room.whiteboard);
      const whiteboard = await Whiteboard.findById(req.session.room.whiteboard);
      await whiteboard.addDrawing(data);
      await whiteboard.save();
      return whiteboard;
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