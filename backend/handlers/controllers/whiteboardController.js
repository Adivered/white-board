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
      let whiteboard = await Whiteboard.findById(req.session.room.whiteboard);
      await whiteboard.addDrawing(data);
      whiteboard = await Whiteboard.findById(req.session.room.whiteboard);
      return whiteboard;
    } catch (error) {
      console.log("Failed to add drawing: ", error);
    }
  };

  const removeDrawingFromWhiteboard = async (req, res, data) => {
    try {
      let whiteboard = await Whiteboard.findById(req.session.room.whiteboard);
      await whiteboard.removeDrawing(data);
      whiteboard = await Whiteboard.findById(req.session.room.whiteboard);
      return whiteboard;
    } catch (error) {
      console.log("Failed to remove drawing: ", error);
    }
  }
  

module.exports = {
  getWhiteboardByInstance,
  updateWhiteboard,
  removeDrawingFromWhiteboard,
};