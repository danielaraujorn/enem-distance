var express = require("express")();
var http = require("http").Server(express);
var io = require("socket.io")(http);
var bodyParser = require("body-parser");
var { ga, calcularDistancia } = require("./ga.js");
var path = require("path");
var { User, Local, Distance } = require("./model.js");
var bestOne;
// setTimeout(() => {
//   ga
//     .run(options)
//     .then(result => {
//       bestOne = result.best.individual.map(item => {
//         return {
//           pessoa: pessoas[item.pessoa],
//           escola: escolas[item.escola],
//           escolaIndex: item.escola
//         };
//       });
//       console.log("Best individual's fitness: " + result.best.fitness);
//       console.log("Best individual: " + JSON.stringify(result.best.individual));
//       // console.log("Last population: %j", result.population);
//     })
//     .catch(err => {
//       console.log("Oops: " + err);
//     });
// }, 4000);

express.use(bodyParser());
express.get("/", function(req, res) {
  res.sendFile(path.join(__dirname + "/index.html"));
});
express.get("/postuser", function(req, res) {
  res.sendFile(path.join(__dirname + "/postuser.html"));
});
express.get("/postlocal", function(req, res) {
  res.sendFile(path.join(__dirname + "/postlocal.html"));
});
express.post("/postlocal", async (req, res) => {
  await Local.save(req.body.local).then(() => res.sendStatus(200));
  console.log(req.body.local.name);
  ga(data => {
    bestOne = data;
    io.emit("returnGetBest", data);
  });
});
express.post("/postuser", async (req, res) => {
  await User.save(req.body.user).then(() => res.sendStatus(200));
  console.log(req.body.user.name);
  ga(data => {
    bestOne = data;
    io.emit("returnGetBest", data);
  });
});
express.get("/getBest", (req, res) => {
  console.log("olha ai, chegou");
  res.setHeader("Content-Type", "application/json");
  res.json(bestOne);
});

io.on("connection", function(socket) {
  socket.on("getBest", () => {
    // console.log("pediu os melhores");
    socket.emit("returnGetBest", bestOne);
  });
  // console.log("a user is connected");
});
var port = process.env.PORT || 3001;
http.listen(port, function() {
  console.log("listening on *:" + port);
});
ga(data => {
  bestOne = data;
  io.emit("returnGetBest", data);
});
