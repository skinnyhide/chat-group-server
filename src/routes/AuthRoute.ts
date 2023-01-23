import { Router } from "express";
import AuthController from "../controllers/AuthController.js";

const AuthRoute = Router();

AuthRoute.post("/login", AuthController.login);
AuthRoute.post("/logout", AuthController.logout);

export default AuthRoute;
