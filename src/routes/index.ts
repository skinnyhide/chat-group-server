import { Router } from "express";
import AuthRoute from "./AuthRoute.js";
import UserRoute from "./UserRoute.js";

const routes = Router();

routes.use("/auth", AuthRoute);
routes.use("/users", UserRoute);

export default routes;
