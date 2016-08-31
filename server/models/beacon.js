// Pulls Mongoose dependency for creating schemas
var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;

// Creates a User Schema. This will be the basis of how user data is stored in the db
var BeaconSchema = new Schema({
    phoneId: {type: String, required: true},
    beaconId: {type: Number, required: true},
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});

// Sets the created_at parameter equal to the current time
BeaconSchema.pre('save', function(next){
    now = new Date();
    this.updated_at = now;
    if(!this.created_at) {
        this.created_at = now
    }
    next();
});

// Exports the BeaconSchema for use elsewhere. Sets the MongoDB collection to be used as: "point"
module.exports = mongoose.model('beacon', BeaconSchema);
