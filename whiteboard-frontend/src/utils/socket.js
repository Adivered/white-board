import { io } from "socket.io-client";

const socket = io("http://172.20.10.2:5000"); // Adjust the URL if your backend runs on a different port

export default socket;