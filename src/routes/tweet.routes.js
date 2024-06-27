import { Router } from "express";
import {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
} from "../controllers/tweet.controller"
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router()
router.use(verifyJWT)
router.route("/").post( createTweet);
router.route("/user/:userId").get( getUserTweets);
router.route("/:tweetId").patch( updateTweet).delete( deleteTweet);

export default router