import express from "express";
import cors from "cors";
import dayjs from "dayjs";
import { stripHtml } from "string-strip-html";
import Joi from "joi";

const app = express();
app.use(express.json());
app.use(cors());

let users = [];
let messages = [];

const userSchema = Joi.object({
  name: Joi.string().min(1).required(),
});

const messageSchema = Joi.object({
  to: Joi.string().min(1).required(),
  text: Joi.string().min(1).required(),
  status: Joi.string().valid("message", "private_message").required(),
});

// participants route

app.post("/participants", (req, res) => {
  if (userSchema.validate(req.body).error !== undefined) {
    res.sendStatus(400);
  } else {
    const user = {
      name: stripHtml(req.body.name).result.trim(),
      lastStatus: Date.now(),
    };
    const message = {
      from: stripHtml(req.body.name).result.trim(),
      to: "Todos",
      text: "entra na sala...",
      type: "status",
      time: dayjs().format("HH:MM:SS"),
    };
    users.push(user);
    messages.push(message);
    res.sendStatus(200);
  }
});

app.get("/participants", (req, res) => {
  res.send(users);
});

// messages route

app.post("/messages", (req, res) => {
  if (
    messageSchema.validate(req.body).error !== undefined ||
    users.find((user) => user.name === req.body.from) === undefined
  ) {
    res.sendStatus(400);
  } else {
    const message = {
      from: stripHtml(req.header.User).result.trim(),
      to: stripHtml(req.body.to).result.trim(),
      text: stripHtml(req.body.text).result.trim(),
      type: stripHtml(req.body.type).result.trim(),
      time: dayjs().format("HH:MM:SS"),
    };
    messages.push(message);
    res.sendStatus(200);
  }
});

app.get("/messages", (req, res) => {
  const currentUser = req.header.User;
  const userMessages = messages.filter(
    (message) =>
      message.to === "Todos" ||
      message.to === currentUser ||
      message.from === currentUser
  );
  let limit = req.query.limit;

  if (limit === undefined) {
    res.send(userMessages);
  } else {
    res.send(userMessages.slice(-limit));
  }
});

// status route
app.post("/status", (req, res) => {
  let auxArray = users;
  setInterval(function () {
    users = auxArray.filter((user) => Date.now() - user.lastStatus > 10000);
    if (users !== auxArray) {
      const message = {
        from: stripHtml(req.header.User).result.trim(),
        to: "Todos",
        text: "sai na sala...",
        type: "status",
        time: dayjs().format("HH:MM:SS"),
      };
      messages.push(message);
      res.sendStatus(200);
    }
  });
});

app.listen(4000, () => {
  console.log("Servidor rodando na porta 4001");
});
