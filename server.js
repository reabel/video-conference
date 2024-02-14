// server.js
const express = require("express");
const os = require("os");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});
const { ExpressPeerServer } = require("peer");

const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.use("/peerjs", peerServer);
app.use(express.static("public"));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
  //need to update this with modern express bindings
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId, userName) => {
    socket.join(roomId);
    setTimeout(() => {
      console.log("info", roomId, userId, userName);
      socket.to(roomId).emit("user-connected", userId || "test");
    }, 1000);
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message, userName);
    });
  });
});
const port = 3030;
const address = os.networkInterfaces();
//  os.networkInterfaces().eth0?.address || os.networkInterfaces().lo.address;
server.listen(port);
console.log(JSON.stringify(os.networkInterfaces()));
console.log(`listening on ${address["Ethernet"][0].address}:${port} `);
