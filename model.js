var thinky = require("thinky")({
  db: "enem_distance",
  host: "localhost",
  port: 28015
});
var type = thinky.type;
const uuidv1 = require("uuid/v1");

var User = thinky.createModel("user", {
  id: type.string().default(uuidv1()),
  name: type.string().required(),
  email: type.string().required(),
  locomotion: type.string().required(),
  // city,country,state,street,number
  lat: type.number().required(),
  lng: type.number().required()
});

var Distance = thinky.createModel("distance", {
  userId: type.string().required(),
  localId: type.string().required(),
  distance: type.number().required()
});

var Local = thinky.createModel("local", {
  id: type.string().default(uuidv1()),
  name: type.string().required(),
  capacity: type.number().required(),
  // city,country,state,street,number
  lat: type.number().required(),
  lng: type.number().required()
});

User.hasMany(Distance, "rotas", "id", "userId");
Local.hasMany(Distance, "rotas", "id", "localId");
Distance.belongsTo(Local, "local", "localId", "id");
Distance.belongsTo(User, "user", "userId", "id");

module.exports = {
  User,
  Local,
  Distance
};
