import express from 'express';
import { upload } from "../middleware/multer.middleware.js";
import { postUser ,likePost, comment, share, allPost } from '../controller/posts.controller.js';

const postrouter = express.Router()


postrouter.post('/post', upload.single('image'),postUser)
postrouter.post("/like", likePost);
postrouter.post("/comment", comment)
postrouter.post("/share", share)
postrouter.get("/allPost", allPost)


export default postrouter