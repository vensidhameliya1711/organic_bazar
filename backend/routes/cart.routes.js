import express from "express";
import { updateCart ,getCart} from "../controllers/cart.controller.js";
import { authUser } from "../middlewares/auth.middleware.js";


const router = express.Router();

// Update the cart for logged-in user
router.post("/update", authUser, updateCart);
router.get("/get", authUser, getCart);



export default router;
