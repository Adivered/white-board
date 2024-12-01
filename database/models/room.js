const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  roomId: {
    type: String,
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
    if (roomObject.participants && roomObject.participants.length > 0 && typeof roomObject.participants[0] === 'object') {
      roomObject.participants = roomObject.participants.map((user) => {
        return user.toJSON ? user.toJSON() : user;
      });
    }

    return {
        _id: roomObject._id,
        roomId: roomObject.roomId,
        participants: roomObject.participants,
        whiteboard: roomObject.whiteboard,
        createdAt: roomObject.createdAt,
        updatedAt: roomObject.updatedAt,
    };
}

RoomSchema.statics.randomizeRoomId = async function () {
  const generateRandomId = () => {
    const digits = '0123456789';
    const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowerCase = 'abcdefghijklmnopqrstuvwxyz';

    const getRandomChar = (chars) => chars[Math.floor(Math.random() * chars.length)];

    let roomId = [
      getRandomChar(digits), getRandomChar(digits),
      getRandomChar(upperCase), getRandomChar(upperCase),
      getRandomChar(lowerCase), getRandomChar(lowerCase)
    ];

    return roomId.sort(() => 0.5 - Math.random()).join('');
  };

  let roomId;
  let isUnique = false;

  while (!isUnique) {
    roomId = generateRandomId();
    isUnique = !(await this.isRoomExist(roomId).catch(() => false)); // Check uniqueness
  }

  return roomId;
};



RoomSchema.methods.addParticipant = async function (userId) {
  // Check if the user is already in the participants list
  if (this.participants.some(participant => participant.toString() === userId.toString())) {
      return;
  }

  this.participants.push(userId);
  await this.save();
};


RoomSchema.methods.removeParticipant = async function (userId) {
  this.participants = this.participants.filter(participant => participant.toString() !== userId.toString());
  await this.save();
};

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

module.exports = {Room};