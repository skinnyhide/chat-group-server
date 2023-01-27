import { Router } from "express";
import ChannelController from "../controllers/ChannelController.js";

const ChannelRoute = Router();

ChannelRoute.get("/public", ChannelController.getPublicChannels);
ChannelRoute.get("/find", ChannelController.getChannel);
ChannelRoute.get("/members", ChannelController.getChannelMembers);

ChannelRoute.post("/create", ChannelController.create);
ChannelRoute.post("/update", ChannelController.update);
ChannelRoute.post("/add/admin", ChannelController.addAdmin);
ChannelRoute.post("/add/mod", ChannelController.addModerator);

ChannelRoute.delete("/remove/admin", ChannelController.removeAdmin);
ChannelRoute.delete("/remove/mod", ChannelController.removeModerator);
ChannelRoute.delete("/remove/:username", ChannelController.remove);

export default ChannelRoute;
