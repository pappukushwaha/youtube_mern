import { Router } from "express";
import { registerUser, loginUser, logoutUser, refreshAccessToken } from "../controllers/user.controller.js";
import { upload } from "../middleswares/multer.middleware.js";
import { verifyJWT } from "../middleswares/auth.middleware.js";

const router = Router();

router.route('/register').post(
    upload.fields(
        [
            {
                name: 'avatar',
                maxCount: 1
            },
            {
                name: 'coverImage',
                maxCount: 1
            }
        ]
    ),
    registerUser
)

router.route('/login').post(loginUser)

router.route('/logout').post(
    verifyJWT,
    //logoutUser
    logoutUser
)

router.route('/refresh-token').post(
    //refreshToken
    refreshAccessToken
)


export default router;