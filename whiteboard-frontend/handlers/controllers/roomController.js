let {Room} = require('../../database/models/room');
const { User } = require('../../database/models/user');
let {Whiteboard} = require('../../database/models/whiteboard');


let generateRoomController = async (req, res) => {
    const userId = req.session.uid;
    try {
        const roomId = await Room.randomizeRoomId();
        const whiteboard = new Whiteboard({ drawedBy: userId, drawingData: [] });
        await whiteboard.save();

        let room = new Room({ roomId, participants: [userId], whiteboard });
        await room.save();
        room = await Room.findById(room._id).populate('participants', 'name _id').lean();
        req.session.room = room;
        res.status(200).json({ success: true, session: req.session });

        console.log('Room was created by', req.session.name, 'with ID', roomId);
    } catch (e) {
        console.error('Error during room creation:', e);
        res.status(400).json({ msg: 'Error during room creation', error: e.message });
    }
}



let joinRoomController = async (req, res) => {
    const { roomId } = req.body;
    const userId = req.session.uid;
    console.log("Adding user", req.session.name, "to room #", roomId);
    try {
        let room = await Room.findOne({ roomId });
        if (!room) throw new Error('Room does not exist');  
        await room.addParticipant(userId);
        await room.save();
        room = await Room.findOne({ roomId }).populate('participants', 'name _id').lean();
        req.session.room = room;
        res.status(200).json({ success: true, session: req.session });
    } catch (e) {
        console.error('Error during joining room:', e);
        res.status(400).json({ msg: 'Error during joining room', error: e.message });
    }
}

let exitRoomController = async (req, res) => {
  console.log("Exitting room", req.session.room.roomId, "for user", req.session.name);
  let roomId = req.session.room._id;
  let userId = req.session.uid;
  try {
      const room = await Room.findById(roomId);
      //console.log("Room found: ", room);
      await room.removeParticipant(userId);
      await room.save();
      //console.log("Updated room: ", room);
      delete req.session.room
      res.status(200).json({ success: true, session: req.session });
  } catch (error) {
      console.log("Error : ", error);
      res.status(400).json({ success: false, message: error.message });
  }
};

  
  let fetchRoomController = async (req, res) => {
    const name = req.session.name;
    let room = req.session.room
    //console.log("Room: ", room);
    const whiteboardId = room.whiteboard;
    console.log("Updating whiteboard for", name , "in room #", room.roomId);
    try {
      //console.log("Whiteboard ID: ", whiteboardId);
      room = await Room.findById(room._id).populate('participants', 'name _id');
      room.whiteboard = await Whiteboard.findById(room.whiteboard._id);
      //console.log("New room: ", room);
      req.session.room = room;
      res.status(200).json({ success: true, session: req.session});
    } catch (error) {
      console.log("Error : ", error);
      res.status(400).json({ success: false, message: error.message });
    }
  };

  
  let getActiveUsersController = async (req, res) => {
    const { roomId } = req.body;
    try {
      const room = await Room.findOne({ roomId }).populate('participants');
      res.status(200).json({ success: true, participants: room.participants });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  };
  
  module.exports = {
    generateRoomController,
    joinRoomController,
    exitRoomController,
    fetchRoomController,
    getActiveUsersController,
  };