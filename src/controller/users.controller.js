import jwt from "jsonwebtoken";
import User from  "../model/users.model.js"
import bcrypt from "bcrypt"
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";


// cloudinary image upload k lye

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

const generateAccesstoken = (user) =>{
  return jwt.sign({email : user.email},process.env.ACCESS_JWT_SECRET, {
   expiresIn : "6h"
  })
 }
 const generateRefreshtoken = (user) =>{
  return jwt.sign({email : user.email},process.env.REFRESH_JWT_SECRET, {
   expiresIn : "6h"
  })
 }

//  register User

const registerUser = async (req, res) => {
  const { userName, fullName, email, password } = req.body;

  if (!userName || !fullName || !email || !password) {
    return res.status(400).json({ error: "Email or password missing" });
  }
  
  try {
    const user = await User.findOne({ email });

    if (user) {
      return res.status(401).json({ message: "User already exists" });
    }

    // Check if image is uploaded
    if (!req.file) {
      return res.status(400).json({ error: "Profile image is required" });
    }
    const profileImage = req.file.path;
    console.log(profileImage);

    const profilePicture = await uploadImageToCloudinary(profileImage);
    console.log(profilePicture);
    
    const createUser = await User.create({
      userName,
      fullName,
      email,
      password,
      profilePicture,
    });

    res.json({
      message: "User registered successfully",
      data: createUser,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// login User

const loginUser = async (req,res) => {
const{email,password} = req.body
if (!email) return res.status(400).json({ message: "email required" });
if (!password) return res.status(400).json({ message: "password required" });

  // email mujood ha bhi ya nahi ha
const user = await User.findOne({email})
if(!user)return res.status(404).json({messege : "user no found"})

  // password compare krwayenga bcrypt
const ispasswordValid = bcrypt.compare(password,user.password)  
if(!ispasswordValid) return res.status().json({messege : "incorrect password"})

// token generate
const accessToken =generateAccesstoken(user)
const refreshToken =generateRefreshtoken(user)

res.cookie("refreshToken", refreshToken ,  { http: true, secure: false })
res.json({
message : "login successfully",
refreshToken,
accessToken,
data : user 
})
}


// logout user 

const logoutUser = (req,res) =>{
  res.clearCookie("refreshToken")
  res.json({
    message : "logout Successfully"
  })
}

// refreresh Token

const refreshToken = async (req,res)=>{
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken
  console.log("Cookies:", req.cookies); // Debug cookies
  console.log("Body:", req.body); 
  
  if(!refreshToken)
  return res.status(404).json({
    messege : "no token found"
  })
  
  const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET);
  
  const user = await User.findOne({email : decodedToken.email})
  
  if (!user) return res.status(404).json({ message: "invalid token" });
  
  const generateToken = generateAccesstoken(user)
  res.json({ message: "access token generated", accesstoken: generateToken ,decodedToken});
  
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
  console.log(uploadResult);
} 

// image ka url cloudinary se arha h

const uploadImage = async(req,res)=>{
  if (!req.file)
    return res.status(400).json({
      message: "no image file uploaded",
    });

    try {
      const uploadResult = await uploadImageToCloudinary(req.file.path);
      console.log(uploadResult);
      
      if(!uploadResult)
        res.json({
      messege : "err accurd while uploading"
      })

      res.json({
        message: "image uploaded successfully",
        url: uploadResult,
      });

    } catch (error) {
      res.status(500).json({
        message : "err accured while uploading image"
      })
    }
}


export {registerUser,loginUser,logoutUser,refreshToken,uploadImage}