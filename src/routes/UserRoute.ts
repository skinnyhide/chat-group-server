import { Router } from "express";
import UserController from "../controllers/UserController.js";

const UserRoute = Router();

UserRoute.get("/checkUsernameExist/:username", UserController.checkUsernameExist);
UserRoute.get("/all", UserController.getAll);
UserRoute.get("/id/:userId", UserController.get);
UserRoute.get("/username/:username", UserController.getByUsername);

UserRoute.post("/create", UserController.create);
UserRoute.post("/changeName", UserController.changeName);
UserRoute.post("/changeUsername", UserController.changeUsername);
UserRoute.post("/changePassword", UserController.changePassword);

UserRoute.delete("/remove/:userId", UserController.remove);

export default UserRoute;
