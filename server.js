require("dotenv").config();
const express = require("express");
const user = require("./routes/user");
const admin = require("./routes/admin");
const auth = require("./routes/auth");
const payment = require("./routes/payment");
const referral = require("./routes/referrals");
const dispute = require("./routes/dispute");
const wallet = require("./routes/wallet");
const transaction = require("./routes/transaction");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const { ErrorHandler } = require("./middlewares/error");
const Logger = require("./middlewares/log");
const ErrorResponse = require("./utils/errorResponse");
const { User } = require("./models/Users");
const { Transaction } = require("./models/Transaction");
//const Notification = require("../models/Notification");
// const {
//   sendNotification,
// } = require("../utils/Notification/push-notification.service");
const crypto = require("crypto");
const { Notifications } = require("./models/Notifications");
const http = require("http");

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(express.urlencoded({ extended: true }));

//parse application/json
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
// Logger middleware
app.use(Logger.logRequest);

const EndpointHead = process.env.Endpoint;
console.log(EndpointHead, "endpoint checker");

app.use(`${EndpointHead}/auth`, auth);
app.use(`${EndpointHead}/payment`, payment);
app.use(`${EndpointHead}/transaction`, transaction);
app.use(`${EndpointHead}/user`, user);
app.use(`${EndpointHead}/referral`, referral);
app.use(`${EndpointHead}/dispute`, dispute);
app.use(`${EndpointHead}/wallet`, wallet);
app.use(`${EndpointHead}/admin`, admin);
// app.use(`${EndpointHead}/webhook`, webhook);

app.get("/Admin/PayBeforeService", (req, res, next) => {
  console.log("how then");

  res.status(200).json({ message: "Welcome to the API" });
})


// Error handler middleware
app.use(ErrorHandler);

//ini my database
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "PayBService",
  })
  .then(() => {
    console.log("Database Connection is ready...");
  })
  .catch((err) => {
    console.log(err);
  });

server.listen(8000, function () {
  console.log(`App is Listening http://localhost:8000${EndpointHead}`);
});
