const mongoose = require('mongoose');

const markerSchema = mongoose.Schema({
  location: { type:[Number], required: true},
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}
});

markerSchema.index({ location:'2dsphere'});

module.exports = mongoose.model('Marker', markerSchema);
