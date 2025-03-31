const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// define the person schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type:Number,
        required: true
    },
    email: {
        type:String
    },
    mobile: {
        type: Number
    },
    address: {
        type: String,
        required: true
    },
    aadharCardNumber: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['voter', 'admin'],
        default: 'voter'
    },
    isVoted: {
        type: Boolean,
        default: false
    }
    
});

// hash password before saving to database
// The pre('save') middleware is a function that runs before a document is saved to the database. In this case, it hashes the password before saving it.
userSchema.pre('save', async function(next){
    const person = this;

    // Hash the password only if it has been modified (or is new)
    if(!person.isModified('password')) return next();

    try{
        // hash password generation
        const salt = await bcrypt.genSalt(10);

        // hash password
        const hashedPassword = await bcrypt.hash(person.password, salt);
        
        // Override the plain password with the hashed one
        person.password = hashedPassword;
        next();
    }catch(err){
        return next(err);
    }
})

// The comparePassword method is an instance method that compares a candidate password with the hashed password stored in the database. It uses bcrypt's compare function to check if the passwords match.
// This method is typically used during the login process to verify the user's password or change the password.s
userSchema.methods.comparePassword = async function(candidatePassword){
    try{
        // Use bcrypt to compare the provided password with the hashed password
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        return isMatch;
    }catch(err){
        throw err;
    }
}

// create person model
const user = mongoose.model('User', userSchema);
module.exports = user;
