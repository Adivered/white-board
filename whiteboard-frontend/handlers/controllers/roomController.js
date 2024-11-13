let {Room} = require('../../database/models/room');
let {User} = require('../../database/models/user');

let generateRoomController = async (req, res) => {
    console.log('Room Generation request received');
    const { userId } = req.body;
    try {
        const roomId = await getNextRoomId(); // Assuming you have a function to get the next room ID
        const room = new Room({ roomId, participants: [userId] });
        await room.save();

        req.session.room = room;
        res.status(200).json({ success: true, room });
    } catch (e) {
        console.error('Error during room creation:', e);
        res.status(400).json({ msg: 'Error during room creation', error: e.message });
    }
}



let joinRoomController = async (req, res) => {
    console.log('Request to join room received');
    const { roomId, userId } = req.body;
    try {
        const room = await Room.findOne({ roomId });
        if (!room) throw new Error('Room does not exist');  
        await room.addParticipant(userId);
        const updatedRoom = await Room.findOne({ roomId }); 
        res.status(200).json({ success: true, updatedRoom });
    } catch (e) {
        console.error('Error during joining room:', e);
        res.status(400).json({ msg: 'Error during joining room', error: e.message });
    }
}

let exitRoomController = async (req, res) => {
    const { roomId, userId } = req.body;
    try {
      const room = await Room.findOne({ roomId });
      if (!room) throw new Error("Room not found");

      await room.removeParticipant(userId);
      const updatedRoom = await Room.findOne({ roomId });

      res.status(200).json({ success: true, updatedRoom });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  };
  
  let getWhiteboardController = async (req, res) => {
    const { roomId } = req.params;
    try {
      const room = await Room.isRoomExist(roomId);
      res.status(200).json({ success: true, whiteboard: room.whiteboard });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  
  let getActiveUsersController = async (req, res) => {
    const { roomId } = req.params;
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
    getWhiteboardController,
    getActiveUsersController,
  };