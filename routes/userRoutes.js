const express = require('express');
const router = express.Router();
const User = require('./../models/user');
const {jwtAuthMiddleware, generateToken} = require('./../jwt');

// POST route to add a person
router.post('/signup', async (req, res) =>{
    try{

        const data = req.body // Assuming the request body contains the user data

        //check for admin and it should be one only
        const adminExist = await User.findOne({ role: 'admin'});
        if(data.role === 'admin' && adminExist){
            return res.status(400).json({ error: 'Admin user already exits'});
        }

        // validate aadhar card number should have 12 digit
        if(!/^\d{12}$/.test(data.aadharCardNumber)){
            return res.status(400).json({ error: 'Aadhar Card Number must be exactly 12 digits'});
        }

        // check if a user with the same aadhar card number alerady exist
        const existingUser = await User.findOne({ aadharCardNumber: data.aadharCardNumber});
        if(existingUser){
            return res.status(400).json({ error: 'User with the same aadhar card number already exists'});
        }

        // Create a new user document using the Mongoose model
        const newUser = new User(data);

        // Save the new user to the database
        const response = await newUser.save();
        console.log('data saved');

        /* a payload is the data that is encoded into the token. This data is typically used to store information about the user or entity that the token represents. The payload is a JSON object that is signed by the server using a secret key, ensuring that the data cannot be tampered with. */
        const payload = {
            id: response.id,
            //username: response.username
        }
        console.log(JSON.stringify(payload));
        const token = generateToken(payload);
        console.log("Token is : ", token);

        res.status(200).json({response: response, token: token});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

// Login Route
router.post('/login', async(req, res) => {
    try{
        // Extract aadharCardNumber and password from request body
        const {aadharCardNumber, password} = req.body;

        // Find the user by aadharCardNumber
        const user = await User.findOne({aadharCardNumber: aadharCardNumber});

        // If user does not exist or password does not match, return error
        if( !user || !(await user.comparePassword(password))){
            return res.status(401).json({error: 'Invalid username or password'});
        }

        // generate Token 
        const payload = {
            id: user.id,
            //username: user.username
        }
        const token = generateToken(payload);

        // return token as response
        res.json({token})
    }catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Profile route
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try{
        const userData = req.user;
        console.log("User Data: ", userData);

        const userId = userData.id;
        const user = await User.findById(userId);

        res.status(200).json({user});
    }catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

// route for changing password
router.put('/profile/password',jwtAuthMiddleware, async (req, res)=>{
    try{
        const userId = req.user.id; // Extract the id from the token
        const {currentPassword, newPassword} = req.body; // extract current and new password form requested body
        
        // Check if currentPassword and newPassword are present in the request body
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Both currentPassword and newPassword are required' });
        }
        
        // find the user by userID
        const user = await User.findById(userId);

        // If user does not exist or password does not match, return error
        if( !user || !(await user.comparePassword(currentPassword))){
            return res.status(401).json({error: 'Invalid username or password'});
        }

        // update the user password
        user.password = newPassword;
        await user.save();

        console.log('password updated');
        res.status(200).json({message:"password updated"});
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})



module.exports = router;

