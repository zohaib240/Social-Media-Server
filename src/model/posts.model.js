import mongoose from "mongoose";
import { type } from "os";



const postsSchema = new mongoose.Schema({
    title: {
      type: String,
      required: [true, "title is required"],
    },
    description: {
      type: String,
      required: [true, "description is required"],
    },
    postImage: {
        type: String,
        required: [true, "image is required"],
      },
     postedBy:{ type: mongoose.Schema.Types.ObjectId, 
     ref: "User",
     required: true
     },
     likes: [{ type: mongoose.Schema.Types.ObjectId,
       ref: "User" 
      }],// Array of users who liked
    comments:[{
      user : {type: mongoose.Schema.Types.ObjectId,ref:"User"},
      text : {type: String , required: true},
      createdAt:{ type: Date, default: Date.now },
    }],
    shares: [
      {
        sharedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
        sharedAt: { type: Date, default: Date.now }, 
      },
    ],
},
{ timestamps: true }
);


export default mongoose.model("posts", postsSchema);








