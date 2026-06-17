import { Router } from "express";
import { register, login, logout, getMe } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";

export const authRoutes = Router();

authRoutes.post("/register", register);
authRoutes.post("/login",    login);
authRoutes.post("/logout",   logout);
authRoutes.get("/me",        authenticate, getMe);
