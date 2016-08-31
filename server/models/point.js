// Pulls Mongoose dependency for creating schemas
var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;

// Creates a User Schema. This will be the basis of how user data is stored in the db
var PointSchema = new Schema({
    phoneId: {type: String, required: true},
    lat: {type: Number, required: true},
    lon: {type: Number, required: true},
    beaconArray: {type: [String], required: false},
    location: {type: [Number], required: true}, // [Long, Lat]
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});

// Sets the created_at parameter equal to the current time
PointSchema.pre('save', function(next){
    now = new Date();
    this.updated_at = now;
    if(!this.created_at) {
        this.created_at = now
    }
    console.log("calling next here"+now);
    next();
});

// Indexes this schema in geoJSON format (critical for running proximity searches)
PointSchema.index({location: '2dsphere'});

// Exports the PointSchema for use elsewhere. Sets the MongoDB collection to be used as: "point"
module.exports = mongoose.model('point', PointSchema);
