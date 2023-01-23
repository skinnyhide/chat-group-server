import { Request, Response } from "express";
import mongoose from "mongoose";
import hashPassword from "../fns/hashPassword.js";
import validObjectId from "../fns/validObjectId.js";
import Channel from "../models/Channel.js";
import User from "../models/User.js";

const ObjectId = mongoose.Types.ObjectId;

async function create(req: Request, res: Response) {
  const { name, username, password } = req.body;

  if (!(name && username && password)) {
    return res.status(400).send({ message: "Some keys is missing" });
  }
  const exist = (await User.findOne({ username })) || (await Channel.findOne({ username }));

  if (exist) {
    return res.status(409).send({ message: "Username is not available" });
  }
  const newUser = await new User({
    name,
    username,
    password: await hashPassword(password),
    channels: [],
  }).save();

  const { password: _password, ...responseUser } = newUser;
  return res.send(responseUser);
}

async function remove(req: Request, res: Response) {
  const userId = req.params.userId;

  if (!validObjectId(userId)) {
    return res.status(400).send({ message: "User id is not valid" });
  }
  const user = await User.findOne({ _id: new ObjectId(userId) });

  if (!user) {
    return res.status(404).send({ message: "User is not exist" });
  }
  return res.send(await User.deleteOne({ _id: user._id }));
}

async function get(req: Request, res: Response) {
  const userId = req.params.userId;

  if (!validObjectId(userId)) {
    return res.status(400).send({ message: "User id is not valid" });
  }
  return res.send(
    await User.findOne({ _id: new ObjectId(userId) })
      .select("-password")
      .select("-channels")
  );
}

async function getByUsername(req: Request, res: Response) {
  const username = req.params.username;
  return res.send(await User.findOne({ username }).select("-password").select("-channels"));
}

async function getAll(req: Request, res: Response) {
  return res.send(await User.find().select("-password").select("-channels"));
}

async function changeName(req: Request, res: Response) {
  const { userId, newName } = req.body;

  if (!validObjectId(userId)) {
    return res.status(400).send({ message: "User id is not valid" });
  }
  const user = await User.findOne({ _id: new ObjectId(userId) });

  if (!user) {
    return res.status(404).send({ message: "User is not exist" });
  }
  return res.send(
    await User.updateOne({ _id: user._id }, { name: newName }, { new: true }).select("-password").select("-channels")
  );
}

async function changeUsername(req: Request, res: Response) {
  const { userId, newUsername } = req.body;

  if (!validObjectId(userId)) {
    return res.status(400).send({ message: "User id is not valid" });
  }
  const user = await User.findOne({ _id: new ObjectId(userId) });

  if (!user) {
    return res.status(404).send({ message: "User is not exist" });
  }
  const owned = await User.findOne({ username: newUsername });

  if (owned && owned.username !== user.username) {
    return res.status(409).send({ message: "Username is not available" });
  }
  return res.send(
    await User.updateOne({ _id: user._id }, { username: newUsername }, { new: true })
      .select("-password")
      .select("-channels")
  );
}

async function checkUsernameExist(req: Request, res: Response) {
  const username = req.params.username;
  const exist = Boolean(await User.findOne({ username }));

  return res.send(exist);
}

async function changePassword(req: Request, res: Response) {
  const { userId, currentPassword, newPassword } = req.body;

  if (!(userId && currentPassword && newPassword)) {
    return res.status(400).send({ message: "Some keys is missing" });
  }
  if (!validObjectId(userId)) {
    return res.status(400).send({ message: "User id is not valid" });
  }
  const user = await User.findOne({ _id: new ObjectId(userId) });

  if (!user) {
    return res.status(404).send({ message: "User is not exist" });
  }
  const hashedPassword = await hashPassword(currentPassword);

  if (hashedPassword !== user.password) {
    return res.status(403).send({ message: "Wrong password" });
  }
  return res.send(
    await User.updateOne({ _id: user._id }, { password: newPassword }, { new: true })
      .select("-password")
      .select("-channels")
  );
}

async function joinChannel(req: Request, res: Response) {
  const { userId, channelId } = req.body;

  if (!validObjectId(channelId)) {
    return res.status(400).send({ message: "Channel id is not valid" });
  }
  if (!validObjectId(userId)) {
    return res.status(400).send({ message: "User id is not valid" });
  }
  const channel = await Channel.findOne({ _id: new ObjectId(channelId) });

  if (!channel) {
    return res.status(404).send({ message: "Channel is not exist" });
  }
  const user = await User.findOne({ _id: new ObjectId(userId) });

  if (!user) {
    return res.status(404).send({ message: "User is not exist" });
  }
  if (user.channels.includes(channel._id)) {
    return res.status(409).send({ message: "Already join channel" });
  }
  return res.send(
    await User.updateOne({ _id: user._id }, { $push: { channels: channel._id } })
      .select("-password")
      .select("-channels")
  );
}

async function leftChannel(req: Request, res: Response) {
  const { userId, channelId } = req.body;

  if (!validObjectId(channelId)) {
    return res.status(400).send({ message: "Channel id is not valid" });
  }
  if (!validObjectId(userId)) {
    return res.status(400).send({ message: "User id is not valid" });
  }
  const channel = await Channel.findOne({ _id: new ObjectId(channelId) });

  if (!channel) {
    return res.status(404).send({ message: "Channel is not exist" });
  }
  const user = await User.findOne({ _id: new ObjectId(userId) });

  if (!user) {
    return res.status(404).send({ message: "User is not exist" });
  }
  if (!user.channels.includes(channel._id)) {
    return res.status(404).send({ message: "User is not member of the channel" });
  }
  return res.send(
    await User.updateOne({ _id: user._id }, { $pull: { channels: channel._id } })
      .select("-password")
      .select("-channels")
  );
}

export default {
  create,
  remove,
  get,
  getByUsername,
  getAll,
  changeName,
  changeUsername,
  checkUsernameExist,
  changePassword,
  joinChannel,
  leftChannel,
};
