import { Router } from "express";
import AuthRoute from "./AuthRoute.js";
import ChannelRoute from "./ChannelRoute.js";
import UserRoute from "./UserRoute.js";

const routes = Router();

routes.use("/auth", AuthRoute);
routes.use("/users", UserRoute);
routes.use("/channels", ChannelRoute);

export default routes;
