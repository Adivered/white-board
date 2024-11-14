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

WhiteboardSchema.methods.toJSON = function () {
    var whiteboard = this;
    var whiteboardObject = whiteboard.toObject();

    return {
        _id: whiteboardObject._id,
        drawedBy: whiteboardObject.drawedBy,
        drawingData: whiteboardObject.drawingData,
        timestamp: whiteboardObject.timestamp
    };
};

WhiteboardSchema.statics.findByID = function (id) {
    var whiteboard = this;

    return Whiteboard.findById({_id}).then((whiteboard) => {
        if (!whiteboard) {
            return Promise.reject(new Error('Invalid whiteboard id'));
        }
        return whiteboard;
    });
}

WhiteboardSchema.methods.addDrawing = async function (userId, drawingData) {
    this.drawedBy = userId;
    this.drawingData.push(drawingData);
    this.timestamp = Date.now();
    return this.save();
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
