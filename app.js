var http = require("http");
var socketIO = require("socket.io");
const mongoose = require("mongoose");
var messages = require("./models/messagesModel");

var server = http.createServer().listen(process.env.PORT, function () {
  console.log("Socket.IO server started at %s:%s!");
});

mongoose.connect(
  "mongodb+srv://tranducgiang:aWML2HcX33qhalVn@cluster0-afnwl.mongodb.net/FoodDelivery?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false },
  (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Connect database success!");
    }
  }
);

io = socketIO.listen(server);
var users = {};

var run = function (socket) {
  console.log("co ng ket noi");
  socket.on("new_user", function (name) {
    if (name in users) {
    } else {
      socket.nickname = name;
      users[socket.nickname] = socket;
    }
  });

  socket.on("send_message", function (data, sendto) {
    const message = new messages({
      id_Mess: data._id,
      text: data.text,
      createdAt: new Date(data.createdAt),
      user: {
        ...data.user,
      },
      to: {
        ...data.to,
      },
    });

    message.save((err, data) => {
      if (err) console.log("Save faild", err);
      else console.log("Save Success");
    });
    if (users[sendto]) users[sendto].emit("new_message", data);
    else {
      console.log("User ko online");
    }
  });

  socket.on("disconnect", () => {
    console.log(socket.id + " Ngat ket noi");
    if (!socket.nickname) return;
    delete users[socket.nickname];
  });

  socket.on("client_send_disconect", (id) => {
    console.log(id + " Ngat ket noi");
    delete users[socket.nickname];
  });
};

io.sockets.on("connection", run);
