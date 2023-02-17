const mongoose = require("mongoose");
try {
  console.log("begin connecting mongodb...");
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
} catch (e) {
  console.log(e);
}

const UserModel = mongoose.model(
  "users",
  new mongoose.Schema({
    username: { type: String, require: true },
  })
);

const ExerciseModel = mongoose.model(
  "exercises",
  new mongoose.Schema({
    uid: { type: String },
    username: { type: String },
    description: { type: String },
    duration: { type: Number },
    date: { type: Date },
  })
);

const AddUser = (name, done) => {
  console.log(`name: ${name}`);
  const d = new UserModel({
    username: name,
  });
  d.save((err, res) => {
    if (err) return console.error(err);
    done(null, res);
  });
};

const FindUsers = (done) => {
  UserModel.find()
    .then((docs) => done(null, docs))
    .catch((err) => done(err, null));
};

const FindUsersById = (uid, done) => {
  UserModel.findOne({ _id: uid })
    .then((docs) => done(null, docs))
    .catch((err) => done(err, null));
};

const AddExercise = ({ uid, description, duration, date }, done) => {
  const d = new ExerciseModel({
    uid,
    description,
    duration,
    date,
  });
  d.save((err, res) => {
    if (err) return console.error(err);
    done(null, res);
  });
};

const FindExercise = ({ uid, limit, from, to }, done) => {
  const filter = { uid };
  const dateFilter = {};
  if (from) {
    dateFilter["$gte"] = new Date(from);
  }
  if (to) {
    dateFilter["$lte"] = new Date(to);
  }
  if (Object.keys(dateFilter).length) {
    filter["date"] = dateFilter;
  }
  console.log(filter);
  const query = ExerciseModel.find(filter).sort({ date: 1 });
  if (limit) {
    query.limit(limit);
  }

  query
    .exec()
    .then((docs) => done(null, docs))
    .catch((err) => done(err, null));
};

exports.AddUser = AddUser;
exports.FindUsers = FindUsers;
exports.AddExercise = AddExercise;
exports.FindExercise = FindExercise;
module.exports.FindUsersById = FindUsersById;
