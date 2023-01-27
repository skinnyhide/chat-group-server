import { Request, Response } from "express";
import validObjectId from "../fns/validObjectId.js";
import Channel from "../models/Channel.js";
import User from "../models/User.js";

async function create(req: Request, res: Response) {
  const { name, username, description, creatorId, type } = req.body;

  if (!(name && username && description && creatorId && type)) {
    return res.status(400).send({ message: "Some keys is missing" });
  }
  const exist = (await User.findOne({ username })) || (await Channel.findOne({ username }));

  if (exist) {
    return res.status(409).send({ message: "Username is not available" });
  }
  if (!validObjectId(creatorId)) {
    return res.status(400).send({ message: "Creator id is not valid" });
  }
  const newChannel = await new Channel({
    name,
    username,
    totalMembers: 1,
    admins: [],
    moderators: [],
    inviteLinks: [],
    description,
    creator: creatorId,
    type,
  }).save();

  return res.send(newChannel);
}

async function remove(req: Request, res: Response) {
  const username = req.params.username;
  const channel = await Channel.findOne({ username });

  if (!channel) {
    return res.status(404).send({ message: "Channel is not exist" });
  }
  return res.send(await Channel.deleteOne({ _id: channel._id }));
}

async function join(req: Request, res: Response) {
  const { userId, channelId } = req.body;

  if (!validObjectId(userId)) {
    return res.status(400).send({ message: "User id is not valid" });
  }
  if (!validObjectId(channelId)) {
    return res.status(400).send({ message: "Channel id is not valid" });
  }
  const channel = await Channel.findOne({ _id: channelId });

  if (!channel) {
    return res.status(404).send({ message: "Channel is not exist" });
  }
  const user = await User.findOne({ _id: userId });

  if (!user) {
    return res.status(404).send({ message: "User is not exist" });
  }
  if (user.channels.includes(channel._id)) {
    return res.status(409).send({ message: "Already join channel" });
  }
  await Channel.updateOne({ _id: channelId }, { $inc: { totalMembers: 1 } });

  return res.send(
    await User.updateOne({ _id: user._id }, { $push: { channels: channel._id } })
      .select("-password")
      .select("-channels")
  );
}

async function left(req: Request, res: Response) {
  const { userId, channelId } = req.body;

  if (!validObjectId(userId)) {
    return res.status(400).send({ message: "User id is not valid" });
  }
  if (!validObjectId(channelId)) {
    return res.status(400).send({ message: "Channel id is not valid" });
  }
  const channel = await Channel.findOne({ _id: channelId });

  if (!channel) {
    return res.status(404).send({ message: "Channel is not exist" });
  }
  const user = await User.findOne({ _id: userId });

  if (!user) {
    return res.status(404).send({ message: "User is not exist" });
  }
  if (!user.channels.includes(channel._id)) {
    return res.status(404).send({ message: "User is not member of the channel" });
  }
  await Channel.updateOne({ _id: channelId }, { $inc: { totalMembers: -1 } });

  return res.send(
    await User.updateOne({ _id: user._id }, { $pull: { channels: channel._id } })
      .select("-password")
      .select("-channels")
  );
}

async function getPublicChannels(req: Request, res: Response) {
  return res.send(await Channel.find({ type: "public" }));
}

async function getChannel(req: Request, res: Response) {
  const { userId, username } = req.body;
  const channel = await Channel.findOne({ username });

  if (!channel) {
    return res.status(404).send({ message: "Channel is not exist" });
  }
  if (channel.type === "public") {
    return res.send(channel);
  }
  if (!validObjectId(userId)) {
    return res.status(400).send({ message: "User id is not valid" });
  }
  const user = await User.findOne({ _id: userId });

  if (!user) {
    return res.status(404).send({ message: "User is not exist" });
  }
  if (!user.channels.includes(channel._id)) {
    return res.status(403).send({ message: "Channel is private" });
  }
  return res.send(channel);
}

async function getChannelMembers(req: Request, res: Response) {
  const { userId, username } = req.body;
  const channel = await Channel.findOne({ username });

  if (!channel) {
    return res.status(404).send({ message: "Channel is not exist" });
  }
  if (channel.type === "public") {
    return res.send(await User.find({ channels: channel._id }).select("-password").select("-channels"));
  }
  if (!validObjectId(userId)) {
    return res.status(400).send({ message: "User id is not valid" });
  }
  const user = await User.findOne({ _id: userId });

  if (!user) {
    return res.status(404).send({ message: "User is not exist" });
  }
  if (!user.channels.includes(channel._id)) {
    return res.status(403).send({ message: "Channel is private" });
  }
  return res.send(await User.find({ channels: channel._id }).select("-password").select("-channels"));
}

async function update(req: Request, res: Response) {
  const { userId, username } = req.body;
  const channel = await Channel.findOne({ username });

  if (!channel) {
    return res.status(404).send({ message: "Channel is not exist" });
  }
  if (!channel.admins.includes(userId)) {
    return res.status(403).send({ message: "You are not admin of the channel" });
  }
  return res.send(await Channel.updateOne({ _id: channel._id }, req.body));
}

async function addAdmin(req: Request, res: Response) {
  const { userId, memberId, channelId } = req.body;

  if (!validObjectId(userId)) {
    return res.status(400).send({ message: "User id is not valid" });
  }
  if (!validObjectId(memberId)) {
    return res.status(400).send({ message: "Member id is not valid" });
  }
  if (!validObjectId(channelId)) {
    return res.status(400).send({ message: "Channel id is not valid" });
  }

  const channel = await Channel.findOne({ _id: channelId });

  if (!channel) {
    return res.status(404).send({ message: "Channel is not exist" });
  }
  if (!channel.admins.includes(userId)) {
    return res.status(403).send({ message: "You are not admin of the channel" });
  }
  const member = await User.findOne({ _id: memberId });

  if (!member) {
    return res.status(404).send({ message: "Member is not exist" });
  }
  if (!member.channels.includes(channelId)) {
    return res.status(404).send({ message: "The person you are trying to add is not a member of the channel" });
  }
  const user = await User.findOne({ _id: userId });

  if (!user) {
    return res.status(404).send({ message: "User is not exist" });
  }
  return res.send(await Channel.updateOne({ _id: channelId }, { $push: { admins: member._id } }));
}

async function addModerator(req: Request, res: Response) {
  const { userId, memberId, channelId } = req.body;

  if (!validObjectId(userId)) {
    return res.status(400).send({ message: "User id is not valid" });
  }
  if (!validObjectId(memberId)) {
    return res.status(400).send({ message: "Member id is not valid" });
  }
  if (!validObjectId(channelId)) {
    return res.status(400).send({ message: "Channel id is not valid" });
  }

  const channel = await Channel.findOne({ _id: channelId });

  if (!channel) {
    return res.status(404).send({ message: "Channel is not exist" });
  }
  if (!channel.admins.includes(userId)) {
    return res.status(403).send({ message: "You are not admin of the channel" });
  }
  const member = await User.findOne({ _id: memberId });

  if (!member) {
    return res.status(404).send({ message: "Member is not exist" });
  }
  if (!member.channels.includes(channelId)) {
    return res.status(404).send({ message: "The person you are trying to add is not a member of the channel" });
  }
  const user = await User.findOne({ _id: userId });

  if (!user) {
    return res.status(404).send({ message: "User is not exist" });
  }
  return res.send(await Channel.updateOne({ _id: channelId }, { $push: { moderators: member._id } }));
}

async function removeAdmin(req: Request, res: Response) {
  const { userId, memberId, channelId } = req.body;

  if (!validObjectId(userId)) {
    return res.status(400).send({ message: "User id is not valid" });
  }
  if (!validObjectId(memberId)) {
    return res.status(400).send({ message: "Member id is not valid" });
  }
  if (!validObjectId(channelId)) {
    return res.status(400).send({ message: "Channel id is not valid" });
  }

  const channel = await Channel.findOne({ _id: channelId });

  if (!channel) {
    return res.status(404).send({ message: "Channel is not exist" });
  }
  if (!channel.admins.includes(userId)) {
    return res.status(403).send({ message: "You are not admin of the channel" });
  }
  const member = await User.findOne({ _id: memberId });

  if (!member) {
    return res.status(404).send({ message: "Member is not exist" });
  }
  if (!member.channels.includes(channelId)) {
    return res.status(404).send({ message: "The person you are trying to remove is not a member of the channel" });
  }
  const user = await User.findOne({ _id: userId });

  if (!user) {
    return res.status(404).send({ message: "User is not exist" });
  }
  return res.send(await Channel.updateOne({ _id: channelId }, { $pull: { admins: member._id } }));
}

async function removeModerator(req: Request, res: Response) {
  const { userId, memberId, channelId } = req.body;

  if (!validObjectId(userId)) {
    return res.status(400).send({ message: "User id is not valid" });
  }
  if (!validObjectId(memberId)) {
    return res.status(400).send({ message: "Member id is not valid" });
  }
  if (!validObjectId(channelId)) {
    return res.status(400).send({ message: "Channel id is not valid" });
  }

  const channel = await Channel.findOne({ _id: channelId });

  if (!channel) {
    return res.status(404).send({ message: "Channel is not exist" });
  }
  if (!channel.admins.includes(userId)) {
    return res.status(403).send({ message: "You are not admin of the channel" });
  }
  const member = await User.findOne({ _id: memberId });

  if (!member) {
    return res.status(404).send({ message: "Member is not exist" });
  }
  if (!member.channels.includes(channelId)) {
    return res.status(404).send({ message: "The person you are trying to remove is not a member of the channel" });
  }
  const user = await User.findOne({ _id: userId });

  if (!user) {
    return res.status(404).send({ message: "User is not exist" });
  }
  return res.send(await Channel.updateOne({ _id: channelId }, { $pull: { moderators: member._id } }));
}

export default {
  create,
  remove,
  join,
  left,
  getPublicChannels,
  getChannel,
  getChannelMembers,
  update,
  addAdmin,
  addModerator,
  removeAdmin,
  removeModerator,
};
