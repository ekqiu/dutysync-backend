const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const port = process.env.PORT;
const uri = process.env.MONGODB_URI;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect(uri).catch((err) => {
  console.error("MongoDB connection error:", err.message); // Log connection errors
});

const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB database connection established successfully");
});

const workspaceSchema = new mongoose.Schema({
  name: String,
  owner: String,
  members: Array,
});

const Workspace = mongoose.model("Workspace", workspaceSchema);

const allocationSchema = new mongoose.Schema({
  workspace: String,
  date: String,
  time: String,
  deployment: [
    {
      name: String,
      member: String,
    },
  ],
});

const Allocation = mongoose.model("Allocation", allocationSchema);

app.post("/workspaces", async (req, res) => {
  const workspace = new Workspace(req.body);
  workspace.save((err) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send("Workspace created successfully");
    }
  });
});

app.get("/workspaces/:id", async (res, req) => {
  const { id } = req.params;
  const workspace = await Workspace.findById(id);
  res.json(workspace);
});

app.get("/allocations/:workspace", async (res, req) => {
  const { workspace } = req.params;
  const allocation = await Allocation.findOne({ workspace });
  res.json(allocation);
});

app.get("/workspaces/:owner", async (res, req) => {
  const { owner } = req.params;
  const allocation = await Allocation.findOne({ owner });
  res.json(allocation);
});

app.get("/workspaces/:member", async (res, req) => {
  const { member } = req.params;
  const allocation = await Allocation.findOne({ member });
  res.json(allocation);
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
