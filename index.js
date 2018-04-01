var express = require("express")();
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
express.post("/postlocal", (req, res) => {
  console.log(req.body.local);
  Local.save(req.body.local).then(newLocal => {
    ga(data => (bestOne = data));
  });
  res.send("ok");
});
express.post("/postuser", (req, res) => {
  console.log(req.body.user);
  User.save(req.body.user).then(newUser => {
    ga(data => (bestOne = data));
  });
  res.send("ok");
});
express.get("/getBest", (req, res) => {
  console.log("olha ai, chegou");
  res.setHeader("Content-Type", "application/json");
  res.json(bestOne);
});
express.listen(3001, () => console.log("subiu o server"));
setTimeout(() => ga(data => (bestOne = data)), 2000);
