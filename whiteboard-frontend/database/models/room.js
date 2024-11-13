const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  roomId: {
    type: Number,
    required: true,
    unique: true,
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  whiteboard: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Whiteboard',
  },
}, { timestamps: true });

RoomSchema.methods.toJSON = function () {
    var room = this;
    var roomObject = room.toObject();
    
    return {
        _id: roomObject._id,
        roomId: roomObject.roomId,
        participants: roomObject.participants,
        whiteboard: roomObject.whiteboard,
        createdAt: roomObject.createdAt,
        updatedAt: roomObject.updatedAt,
    };
}

RoomSchema.statics.addParticipant = async function (userId) { 
    var room = this;
    return room.update({
        $push: {
            participants: userId,
        },
    });
}

RoomSchema.statics.removeParticipant = async function (userId) {
    var room = this;
    return room.update({
        $pull: {
            participants: userId,
        },  
    });
}

RoomSchema.statics.isRoomExist = async function (roomId) {
  var Room = this;
  return Room.findOne({ roomId }).then((room) => {
    if (!room) {
      return Promise.reject(new Error('Room does not exist'));
    }
    return new Promise((resolve, reject) => {
        resolve(room);
    });
  });
};

const Room = mongoose.model('Room', RoomSchema, "Room");

module.exports = Room;