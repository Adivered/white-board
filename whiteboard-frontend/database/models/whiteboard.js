const mongoose = require('mongoose');
const {User} = require('./user');

// Define the Whiteboard schema
const WhiteboardSchema = new mongoose.Schema({
    drawedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    drawingData: [{
      x0: Number,
      y0: Number,
        x1: Number,
        y1: Number,
        color: String
    }],
  }, { timestamps: true });

WhiteboardSchema.methods.toJSON = function () {
    var whiteboard = this;
    var whiteboardObject = whiteboard.toObject();

    return {
        _id: whiteboardObject._id,
        drawedBy: whiteboardObject.drawedBy,
        createdAt: whiteboardObject.createdAt,
        updatedAt: whiteboardObject.updatedAt,
        timestamp: whiteboardObject.timestamp
    };
};

WhiteboardSchema.methods.addDrawing = async function (data) {
    this.drawedBy = data.drawedBy;
    this.drawingData.push({
        x0: data.x0,
        y0: data.y0,
        x1: data.x1,
        y1: data.y1,
        color: data.color,
    });
    return this.save();
}

WhiteboardSchema.statics.clearBoard = async function () {
    var whiteboard = this;
    return whiteboard.update({
        $set: {
            drawedBy: [],
            drawingData: [],
        },
    });
}
// Create and export the Whiteboard model
var Whiteboard = mongoose.model('Whiteboard', WhiteboardSchema, "whiteboard");

module.exports = { Whiteboard };
