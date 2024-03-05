require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const bodyParser = require("body-parser");

const { connectDB } = require("../config/db");
const authRoutes = require("../routes/authRoutes");
const userRoutes = require("../routes/userRoutes");
const crudRoutes = require("../routes/crudRoutes");
const stripeRoutes = require("../routes/stripeRoutes");
const cloudinaryRoutes = require("../routes/cloudinaryRoutes");
const garbageRoutes = require("../routes/garbageRoutes");
const strapiRoutes = require("../routes/strapiRoutes");
const statsRoutes = require("../routes/statsRoutes");
const placeRoutes = require("../routes/addressPlacesRoute");
const dashboardRoutes = require("../routes/dashboardRoutes");

connectDB();
const app = express();

// We are using this for the express-rate-limit middleware
// See: https://github.com/nfriedly/express-rate-limit
// app.enable('trust proxy');
app.set("trust proxy", 1);

app.use((req, res, next) => {
  if (req.originalUrl.includes("/stripe/webhook")) {
    bodyParser.text({ type: "application/json" })(req, res, next);
  } else {
    express.json({ limit: "10mb" })(req, res, next);
  }
});

app.use(helmet());
app.use(cors());

//root route
app.get("/", (req, res) => {
  res.send("App works properly!");
});

app.use(async (req, res, next) => {
  if (
    !!req.headers?.access_token &&
    req.headers?.access_token !== "undefined" &&
    req.headers?.access_token !== "null"
  ) {
    // Do general verification later (ban, admin, etc.)
  }
  next();
});

//this for route will need for store front, also for admin dashboard
app.use("/api/auth/", authRoutes);
app.use("/api/user/", userRoutes);
app.use("/api/crud/", crudRoutes);
app.use("/api/stripe/", stripeRoutes);
app.use("/api/cloudinary/", cloudinaryRoutes);
app.use("/api/garbage/", garbageRoutes);
app.use("/api/strapi/", strapiRoutes);
app.use("/api/stats/", statsRoutes);
app.use("/api/place/", placeRoutes);
app.use("/api/dashboard/", dashboardRoutes);

//if you not use admin dashboard then these two route will not needed.

// Use express's default error handling middleware
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  res.status(400).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => console.log(`server running on port ${PORT}`));

app.listen(PORT, () => console.log(`server running on port ${PORT}`));
