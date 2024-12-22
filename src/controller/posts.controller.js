import posts from "../model/posts.model.js";
import fs from "fs"
import { v2 as cloudinary } from "cloudinary";
import User from '../model/users.model.js'


// cloudinary image upload k lye

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
  });
  
// user post data 

const postUser = async (req,res) =>{
    const {title,description,postedBy} = req.body

    if (!title || !description || !postedBy) {
        return res.status(400).json({ error: "title or description or posted by required" });
      }
     

try {
   // Check if the user is registered
   const postUser = await User.findById(postedBy); // Verify user by their ID
   if (!postUser) {
     return res.status(404).json({ message: "User not found. Please register to post." });
   }
    if (!req.file) {
        return res.status(400).json({ error: "Profile image is required" });
      }
      const Image = req.file.path;
      console.log(Image);

//    upload image on  cloudinary and response url from cloudinary
      const postImage = await uploadImageToCloudinary(Image);
      console.log(postImage);

      const createPosts = await posts.create({
        title,
        description,
        postImage,
        postedBy
      });
      res.json({
        message: "post add successfully",
        data: createPosts,
      });
    
} catch (error) {
    res.status(500).json({ error: error.message });

}
}

 // image cloudinary p jaraha h or server se image delete horha h fs ki help se

 const uploadImageToCloudinary  = async (localpath)=>{
    try {const uploadResult = await cloudinary.uploader
       .upload(
        localpath,{
          resource_type: "auto",}
       )
       fs.unlinkSync(localpath);
    return uploadResult.url;
      }
       catch(error) {
           console.log(error);
       };
  } 



// like 

const likePost = async (req,res) => {

const {postId,userId} = req.body
try {
 // Find the user who is sharing
 const user = await User.findById(userId);
 if (!user) return res.status(404).json({ message: "User not found" });

 // Find the post to be shared
 const post = await posts.findById(postId);
 if (!post) return res.status(404).json({ message: "Post not found" });
  
  // Check if user has already liked the post
  const hasLiked = post.likes.includes(userId);

  if (hasLiked) {
    // If already liked, remove the userId (dislike)
    const dislike = await posts.findByIdAndUpdate(
      postId,
      { $pull: { likes: userId } }, // Remove userId from likes array
      { new: true } // Return updated post
    );
    return res.status(200).json({
      message: "Post disliked successfully",
      likes: dislike.likes, // Updated likes array
    });
  } else {
    // If not liked, add the userId (like)
    const like = await posts.findByIdAndUpdate(
      postId,
      { $push: { likes: userId } }, // Add userId to likes array
      { new: true } // Return updated post
    );
    return res.status(200).json({
      message: "Post liked successfully",
      likes: like.likes, // Updated likes array
    });
  }

} catch (error) {
    res.status(500).json({ error: error.message })
}
}

// comment

const comment = async (req,res) => {
  const {text,userId,postId} = req.body
  try {
      // Find the user who is sharing
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
  
      // Find the post to be shared
      const post = await posts.findById(postId);
      if (!post) return res.status(404).json({ message: "Post not found" });

    const commentsUser = await posts.findByIdAndUpdate(
      postId,
      { $push: { comments:{user: userId , text}} }, // Add userId and text to comments array
      { new: true } // Return updated post
    );
    return res.status(200).json({
      message: "comment successfully",
      comments: commentsUser.comments, // Updated comments array
    });

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}



// share 

const share = async (req,res)=>{
  const { userId , postId} = req.body; // Get postId and userId from the request body
  
  try {
    // Find the user who is sharing
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Find the post to be shared
    const post = await posts.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Add share information to the post
    const sharedPost = await posts.findByIdAndUpdate(
      postId,
      {
        $push: { shares: { user: userId, sharedAt: new Date() } }, // Add the user and timestamp
      },
      { new: true } // Return the updated post
    );

    return res.status(200).json({
      message: "Post shared successfully",
      shares: sharedPost.shares, // Return the updated shares array
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

  // get allPost

const allPost = async (req,res) =>{
  try {
    const allPost = await posts.find({})
    res.status(200).json(allPost)
  } catch (error) {
    console.log(error.message || error);
    res.status(500).json({
        message : "Something went wrong!"
    })
  }
  }



  export  {postUser,likePost,comment,share,allPost}