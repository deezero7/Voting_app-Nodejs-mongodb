const express = require('express');
const router = express.Router();
const PartyCandidate = require('../models/partyCandidate');
const User = require('../models/user');
const {jwtAuthMiddleware, generateToken} = require('../jwt');

const checkAdminRole = async(userId) =>{
    try{
        const user =  await User.findById(userId);
        return user.role ==='admin';
    }catch(err){
        return false;
    }
}

// POST route to add a candidate
router.post('/',jwtAuthMiddleware, async (req, res) =>{
    try{
        // checkadminrole lambda func is async func so you need await for right data to fetch cauz it takes timesS
        if(! await checkAdminRole(req.user.id)){
            //console.log("admin role not found")
            return res.status(403).json({message: 'user has no admin Role'});
        }

        const data = req.body // Assuming the request body contains the candidate data

        // Create a new user document using the Mongoose model
        const newpartyCandidate = new PartyCandidate(data);

        // Save the new user to the database
        const response = await newpartyCandidate.save();
        console.log('data saved');


        res.status(200).json({response: response});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})


// route for changing partycandidate data
router.put('/:candidateID',jwtAuthMiddleware, async (req, res)=>{
    try{

        if(! await checkAdminRole(req.user.id)){
            return res.status(403).json({message: 'user has not admin Role'});
        }

        const partyCandidateId = req.params.partyCandidateId; // Extract the id from the url parameter
        const updatepartyCandidateIdData = req.body; // update data for the candidate

        const response = await PartyCandidate.findByIdAndUpdate(candidateID, updatepartyCandidateIdData, {
            new: true, // return the updated document
            runValidatiors: true // run mongoose validation
        })

        if(!response){
            return res.status(404).json({error: 'candidate not found'});
        }

        console.log('candidate not found');
        res.status(200).json(response);
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Not able to change the partyCandidate, Server error '});
    }
})

// route for deleting partycandidate data
router.delete('/:candidateID',jwtAuthMiddleware, async (req, res)=>{
    try{

        if(! await checkAdminRole(req.user.id)){
            return res.status(403).json({message: 'user has not admin Role'});
        }

        const partyCandidateId = req.params.partyCandidateId; // Extract the id from the url parameter

        const response = await PartyCandidate.findByIdAndDelete(candidateID);

        if(!response){
            return res.status(404).json({error: 'candidate not found'});
        }

        console.log('candidate deleted');
        res.status(200).json(response);
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Not able to Delete the partyCandidate, Server error '});
    }
})

// voting route to vote for a candidate
router.post('/vote/:candidateID', jwtAuthMiddleware, async(req, res) =>{
    // no admin vote
    // voter can vote once

    candidateId = req.params.partyCandidateId;
    userId = req.user.id;

    try{
        // find the candidate document with the specified candidateId
        const candidate = await PartyCandidate.findById(candidateId);
            if(!candidate){
                return res.status(404).json({ message: 'Candidate not found' });
                }

            const user = await User.findById(userId);
            if(!user){
                return res.status(404).json({ message: 'user not found' });
                }
            if(user.role == 'admin'){
                return res.status(403).json({ message: 'admin is not allowed'});
                }
            if(user.isVoted){
                return res.status(400).json({ message: 'You have already voted' });
                }

            // Update the Candidate document to record the vote
            candidate.votes.push({user: userId})
            candidate.voteCount++;
            await candidate.save();

            // update the user document
            user.isVoted = true
            await user.save();

            return res.status(200).json({ message: 'Vote recorded successfully' });
        }
        catch(err){
            console.log(err);
            return res.status(500).json({error: 'Internal Server Error'});
        }
})

// vote count route
// route for getting vote count for all candidates
router.get('/vote/count', async (req, res) => {
    try{
        // Find all candidates and sort them by voteCount in descending order
        const candidate = await PartyCandidate.find().sort({voteCount: 'desc'});

        // Map the candidates to only return their name and voteCount
        const voteRecord = candidate.map((data)=>{
            return {
                party: data.party,
                count: data.voteCount
            }
        });

        return res.status(200).json(voteRecord);
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

// route for getting all candidates
router.get('/', async(req, res) =>{

      
    try{
        // Find all candidates and sort them by voteCount in descending order
        const candidates = await PartyCandidate.find({}, 'name party _id');
        
        return res.status(200).json(candidates);
        }
        catch{
            console.log(err);
            res.status(500).json({error: 'Internal Server Error'});
        }
})

module.exports = router;
