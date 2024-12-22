import express from 'express';
import { registerUser , loginUser , logoutUser , refreshToken ,uploadImage} from '../controller/users.controller.js';
import { upload } from "../middleware/multer.middleware.js";

const router = express.Router()


router.post ('/registerUser', registerUser)
router.post ('/loginUser', loginUser)
router.post ('/logoutUser', logoutUser)
router.post ('/refreshToken', refreshToken)
router.post('/register', upload.single('image'), registerUser);

export default router







