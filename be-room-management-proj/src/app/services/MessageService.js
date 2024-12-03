const { Server } = require("socket.io");

const Chat = require("../models/Chat.model");
const User = require("../models/User.model");

let messageBuffer = [];
let updating = false;
const BUFFER_LIMIT = 100;

const flushBuffer = async () => {
  console.log("Flush");
  const cache = [...messageBuffer];
  messageBuffer = [];
  if (updating)
    return;

  try {
    if (cache.length > 0) {
      updating = true;
      await Chat.insertMany(cache);
    }
  } catch (error) {
    console.log(`[MESSAGE SERVICE]: ERROR ${error} MessageService.js (func flush)`);
  } finally {
    updating = false;
  }
}

module.exports.runMessageService = (server) => {
  const io = new Server(server, {
    cors: {
      origin: ["http://127.0.0.1:3000", "http://localhost:3000", 
        "http://127.0.0.1:5000", "http://localhost:5000", 
        "http://127.0.0.1:7000", "http://localhost:7000"],
    },
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000,
      skipMiddlewares: true,
    }
  });

  io.on("connection", (socket) => {
    const time = new Date();
    console.log(`A user connected - ${time.getDate()}/${time.getMonth() + 1}/${time.getFullYear()} ${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`);
    socket.user = {};
    
    socket.on('disconnect', async () => {
      await flushBuffer();
      if (socket.user.uid)
        await User.updateOne({ _id: socket.user.uid }, {
          online: false,
          onlineAt: Date.now(),
        });
      console.log(`User with ID ${socket.user.uid} left room`);
    });
  
    socket.on("online", async (uid) => {
      socket.user.uid = uid;
      console.log(`${uid} online!`);
      await flushBuffer();
      await User.updateOne({ _id: uid }, {
        online: true,
        onlineAt: Date.now(),
      });
      console.log(`User with ID ${uid} joined room`);
    });

    socket.on("load", async ({ owner, friend }) => {
      try {
        console.log(`${socket.user.uid} load!`);
        socket.user.chatWithFid = friend;
        socket.join(owner + "<->" + friend);
        await flushBuffer();
        const messages = await Chat.find({
          $or: [
            { $and: [ { senderId: owner }, { receiverId: friend } ] },
            { $and: [ { senderId: friend }, { receiverId: owner } ] },
          ]
        }).select("_id senderId receiverId content sentAt");

        io.to(owner + "<->" + friend).emit("receiver", {
          load: true,
          messages: messages,
        });
      } catch (error) {
        console.log(`[MESSAGE SERVICE]: ERROR ${error} MessageService.js (on load)`);
      }
    });

    socket.on("leave", async () => {
      console.log(`${socket.user.uid} left!`);
      flushBuffer();
      socket.leave(socket.user.uid + "<->" + socket.user.chatWithFid);
    });
  
    socket.on("sender", ({senderId, receiverId, content, sentAt=Date.now() }) => {
      console.log(senderId, receiverId, content, socket.user.chatWithFid);
      try {
        const payload = {
          senderId,
          receiverId,
          content,
          sentAt,
        };
        messageBuffer.push(payload);

        if (messageBuffer.length >= BUFFER_LIMIT)
          flushBuffer();

        io.to(receiverId + "<->" + senderId).emit("receiver", [{ 
          _id: Date.now(),
          ...payload,
          load: false,
        }]);
      } catch (error) {
        console.log(`[MESSAGE SERVICE]: ERROR ${error} MessageService.js (on sender)`);
      }
    });

    if (socket.recovered) {
      console.log("Recovered!");
    } else {
      console.log("New connection!");
    }
  });
}