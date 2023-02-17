const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

const TIMEOUT = 10000;

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// users
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.path}`);
  next();
});

const dbAPI = require("./db");
app.post("/api/users", (req, res, next) => {
  let t = setTimeout(() => {
    next({ message: "timeout" });
  }, TIMEOUT);
  dbAPI.AddUser(req.body.username, (err, doc) => {
    clearTimeout(t);
    if (err) {
      return next(err);
    }
    console.log(doc);
    res.send(doc);
  });
});
app.get("/api/users", (req, res, next) => {
  let t = setTimeout(() => {
    next({ message: "timeout" });
  }, TIMEOUT);
  dbAPI.FindUsers((err, docs) => {
    clearTimeout(t);
    if (err) return next(err);
    console.log("FindUsers res:");
    console.log(docs);
    res.send(docs);
  });
});

// exercises

app.post("/api/users/:uid/exercises", (req, res, next) => {
  let t = setTimeout(() => {
    next({ message: "timeout" });
  }, TIMEOUT);
  const uid = req.params.uid;
  const description = req.body.description;
  const duration = req.body.duration;
  const date = new Date(req.body.date);
  console.log({ uid, description, duration, date });

  dbAPI.AddExercise({ uid, description, duration, date }, (err, docs) => {
    clearTimeout(t);
    if (err) return next(err);
    res.send(docs);
  });
});

app.get("/api/users/:uid/logs", (req, res, next) => {
  const uid = req.params.uid;
  const from = req.query.from;
  const to = req.query.to;
  const limit = req.query.limit;
  let t = setTimeout(() => {
    next({ message: "timeout" });
  }, TIMEOUT);

  dbAPI.FindUsersById(uid, (err, doc) => {
    if (err) return next(err);
    const username = doc.username;
    const params = { uid, from, to, limit };
    console.log(params);
    dbAPI.FindExercise(params, (err, docs) => {
      clearTimeout(t);
      if (err) return next(err);
      let exercises = docs.map((item) => ({
        description: item.description,
        duration: item.duration,
        date: item.date.toDateString(),
      }));
      res.send({
        username,
        _id: uid,
        count: exercises.length,
        log: exercises,
      });
    });
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
