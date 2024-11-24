let {Room} = require('../../database/models/room');
let {Whiteboard} = require('../../database/models/whiteboard');


let generateRoomController = async (req, res) => {
    const userId = req.session.uid;
    console.log("Creating room for user", req.session.name);
    try {
        let roomId = await Room.randomizeRoomId();
        let whiteboard = new Whiteboard();
        await whiteboard.save();

        let room = new Room({ roomId, participants: [userId], whiteboard });
        await room.save();
        room = await room.populate('participants', 'name _id');
        console.log('Room was created by', req.session.name, 'with ID', roomId);
        return room;

    } catch (e) {
        console.error('Error during room creation:', e);
        res.status(400).json({ msg: 'Error during room creation', error: e.message });
    }
}



let joinRoomController = async (req, res, roomIdObj) => {
    const { roomId } = roomIdObj;
    const userId = req.session.uid;
    console.log("Adding user", req.session.name, "to room #", roomId);
    try {
        let room = await Room.findOne({ roomId });
        if (!room) throw new Error('Room does not exist'); 
        await room.addParticipant(userId);
        room = await Room.findOne({ roomId }).populate('participants', 'name _id').lean();
        return room;

    } catch (e) {
        console.error('Error during joining room:', e);
        res.status(400).json({ msg: 'Error during joining room', error: e.message });
    }
}

let exitRoomController = async (req, res) => {
  if (!req.session.room) {
    console.log("No room in session to exit.");
    return;
  }
  console.log("Exitting room", req.session.room.roomId, "for user", req.session.name);
  let roomId = req.session.room._id;
  let userId = req.session.uid;
  try {
      const room = await Room.findById(roomId);
      await room.removeParticipant(userId);
  
  } catch (error) {
      console.log("Error : ", error);
      res.status(400).json({ success: false, message: error.message });
  }
}

  
  let fetchRoomController = async (req, res) => {
    const name = req.session.name;
    console.log("Updating room for", name , "in room #", req.session.room.roomId);
    try {
      let room = await Room.findOne({roomId: req.session.room.roomId});
      room = await room.populate('participants', 'name _id');
      room.whiteboard = await Whiteboard.findById(room.whiteboard._id);
      return room;

    } catch (error) {
      console.log("Error : ", error);
      res.status(400).json({ success: false, message: error.message });
    }
  };

  module.exports = {
    generateRoomController,
    joinRoomController,
    exitRoomController,
    fetchRoomController,
  };