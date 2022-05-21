const mongoose = require('mongoose');

const PetSchema = new mongoose.Schema({
    petId: String,
    petName: String,
    petDOB: String,
    petDescription: String,
    petImage: String,
})

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    token: String,
    phone: String,
    address: String,
    userImage: String,
    pets: [PetSchema],
});

module.exports = new mongoose.model('User', UserSchema); 