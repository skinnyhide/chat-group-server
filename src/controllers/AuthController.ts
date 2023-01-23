import { Request, Response } from "express";
import generateToken from "../fns/generateToken.js";
import getLocation from "../fns/getLocation.js";
import hashPassword from "../fns/hashPassword.js";
import validObjectId from "../fns/validObjectId.js";
import Session from "../models/Session.js";
import User from "../models/User.js";

async function login(req: Request, res: Response) {
  const { username, password } = req.body;

  if (!(username && password)) {
    return res.status(400).send({ message: "Some keys is missing" });
  }
  const user = await User.findOne({ username });

  if (!user) {
    return res.status(404).send({ message: "User is not exist" });
  }
  const verified = (await hashPassword(password)) === user.password;

  if (!verified) {
    return res.status(403).send({ message: "Wrong password" });
  }
  const userIpAddress = req.ip;
  const userLocation = await getLocation(userIpAddress);
  const token = await generateToken();

  const newSession = new Session({
    user: user._id,
    token,
    ip: userIpAddress,
    cityName: userLocation.city,
    countryName: userLocation.country_name,
    timezone: userLocation.time_zone,
  });

  return res.send(await newSession.save());
}

async function logout(req: Request, res: Response) {
  const { userId, token } = req.body;

  if (!(userId && token)) {
    return res.status(400).send({ message: "Some keys is missing" });
  }
  if (!validObjectId(userId)) {
    return res.status(400).send({ message: "User id is not valid" });
  }
  const user = await User.findOne({ _id: userId });

  if (!user) {
    return res.status(404).send({ message: "User is not exist" });
  }
  const session = await Session.findOne({ token, user: userId });

  if (!session) {
    return res.status(404).send({ message: "Session is not exist" });
  }
  return res.send(await Session.deleteOne({ _id: session._id }));
}

export default { login, logout };
