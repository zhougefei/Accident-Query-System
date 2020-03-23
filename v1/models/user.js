var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
	username: {type: String, unique: true, require: true},
	password: String,
	email: {type: String, unique: true, require: true},
	resetPasswordToken: String,
	resetPasswordExpires: Date,
});

UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", UserSchema);