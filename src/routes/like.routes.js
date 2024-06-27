import { Router } from "express";
import {toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos} from "../controllers/like.controller"
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router()

router.use(verifyJWT)

router.route("/togglr/v/:videoId").post(toggleVideoLike);
router.route("/toggle/c/:commentId").post(toggleCommentLike);
router.route("/togglr/t/:tweetId").post(toggleTweetLike);
router.route("/videos").get(getLikedVideos);

export default router