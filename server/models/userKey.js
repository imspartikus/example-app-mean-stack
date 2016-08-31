// Pulls Mongoose dependency for creating schemas
var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;

//run this out of api
// var newUserKey = new UserKey({'userkey':'what'});
//     newUserKey.save(function(err){
//         if (err) { 
//             handleError(res, err);
//         } else {
//             console.log("saved:");
//         }
//     });

// Creates a userkey Schema. We just store one of these per customer
var UserKeySchema = new Schema({
    userkey: {type: String, required: true},
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});

// Sets the created_at parameter equal to the current time
UserKeySchema.pre('save', function(next){
    now = new Date();
    this.updated_at = now;
    if(!this.created_at) {
        this.created_at = now
    }
    next();
});

// Exports the PuserKeySchema for use elsewhere. Sets the MongoDB collection to be used as: "userkey"
module.exports = mongoose.model('userkey', UserKeySchema);
