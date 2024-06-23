import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, logoutUser, refreshAccessToken, registerUser, updateAvatarImage, updateCoverImage, updateUserAccountDetails } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router()

router.route("/register").post(
    upload.fields(
        [
            {
                name: "avatar",
                maxCount: 1
            },
            {
                name: "coverImage",
                maxCount: 1
            }
    ]
),
    registerUser)

router.route("/login").post(loginUser)

// secure routes
router.route("/logout").post(
    verifyJWT,
    logoutUser
)
router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateUserAccountDetails)
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateAvatarImage)
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage") ,updateCoverImage)
// when we are getting details from params we need to specify endpoints ref like this /c/:param_name
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)

router.route("/history").get(verifyJWT, getWatchHistory)
export default router