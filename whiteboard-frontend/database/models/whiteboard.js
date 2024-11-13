const mongoose = require('mongoose');
const {User} = require('./user');

// Define the Whiteboard schema
const WhiteboardSchema = new mongoose.Schema({
    drawedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    drawingData: {
      type: Array,
      required: true,
    },
  }, { timestamps: true });

WhiteboardSchemaSchema.methods.toJSON = function () {
    var whiteboard = this;
    var whiteboardObject = whiteboard.toObject();

    return {
        _id: whiteboardObject._id,
        drawedBy: whiteboardObject.drawedBy,
        drawingData: whiteboardObject.drawingData,
        timestamp: whiteboardObject.timestamp
    };
};

WhiteboardSchema.statics.addDrawing = async function (userId, drawingData) {
    var whiteboard = this;
    return whiteboard.update({
        $push: {
            drawedBy: userId,
            drawingData: drawingData,
            timestamp: Date.now(),
        },
    });
}

WhiteboardSchema.statics.clearBoard = async function () {
    var whiteboard = this;
    return whiteboard.update({
        $set: {
            drawedBy: [],
            drawingData: [],
            timestamp: [],
        },
    });
}
// Create and export the Whiteboard model
var Whiteboard = mongoose.model('Whiteboard', WhiteboardSchema, "Whiteboard");

module.exports = { Whiteboard };
