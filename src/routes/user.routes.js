import { Router } from "express";
import { regiterUser } from "../controllers/user.controller.js";

const router=Router()

router.route('/register').post(regiterUser)

// router.route('login').post(loginUser)

export default router;