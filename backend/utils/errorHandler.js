class SocketError extends Error {
    constructor(message, code = 'SOCKET_ERROR') {
      super(message);
      this.code = code;
    }
  }
  
  module.exports = {
    SocketError,
    handleError: (error, socket, eventName) => {
      console.error(`Error in ${eventName}:`, error);
      socket.emit('error', {
        message: error.message,
        code: error.code || 'UNKNOWN_ERROR'
      });
    }
  };