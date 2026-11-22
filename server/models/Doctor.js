const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  // ✅ Nayi field: Doctor login account ko link karne ke liye (sparse: true se purane dummy/seeded doctors par error nahi aayega)
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, sparse: true },
  
  name: { type: String, required: true },
  qualification: { type: String, required: true },
  specialization: { type: String, required: true },
  hospitalName: { type: String, required: true },
  location: { type: String, required: true },
  fees: { type: Number, required: true },
  phone: { type: String, default: '' },
  
  //  Profile Image aur Bio ke liye
  profileImage: { type: String, default: '' }, //  string ya Image URL store karne ke liye
  bio: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);