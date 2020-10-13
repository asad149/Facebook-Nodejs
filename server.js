// Importing Dependecies
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const multer = require("multer");
const pusher = require("pusher");
const Grid = require("gridfs-stream");

const mongoose = require("mongoose");
const GridFsStorage = require("multer-gridfs-storage");
const mongoURI = require("./config/keys").mongoURI;

Grid.mongo = mongoose.mongo;
// App config
const app = express();
const port = process.env.PORT || 9000;

// middlewares
app.use(bodyParser.json());
app.use(cors());

// DB Config

const conn = mongoose.createConnection(mongoURI, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connect(mongoURI, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once("open", () => {
  console.log("DB Connected");
});

let gfs;

conn.once("open", () => {
  console.log("DB Connected");

  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("images");
});

const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      {
        const filename = `image-${Date.now()}${path.extname(
          file.originalname
        )}`;
        const fileinfo = {
          filename: filename,
          bucketName: "images",
        };
        resolve(fileinfo);
      }
    });
  },
});

const upload = multer({ storage });

// Route
app.get("/", (req, res) => res.status(200).send("Hello World"));
app.post("/upload/image", upload.single("file"), (req, res) => {
  res.status(201).send(req.file);
});

app.get("/retrieve/image/single", (req, res) => {
  gfs.files.findOne({ filename: req.query.name }, (err, file) => {
    if (err) {
      res.status(500).send(err);
    } else {
      if (!file || file.length === 0) {
        res.status(404).json({ err: "File Not Found" });
      } else {
        const readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
      }
    }
  });
});
// Listen
app.listen(port, () => console.log(`App is running on port ${port}`));
