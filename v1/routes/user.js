var express = require("express");
var router = express.Router({mergeParams: true});
var User = require("../models/user");

// show user route
router.get("/:id", function(req, res){
   User.findById(req.params.id, function(err, foundUser){
	   if (err) {
		   req.flash("error", "Something went wrong");
		   return res.redirect("/");
	   }
   });
});

// Edit user route
router.get("/:user_id/edit", function(req, res){
	User.findById(req.params.user_id, function(err, foundUser){
		if (err) {
			req.flash("error", "Something went wrong");
			res.redirect("back");
		} else {
			res.render("users/edit", {user: foundUser});
		}
	});
});

// Update user route
router.put("/:user_id", function(req, res){
	User.findByIdAndUpdate(req.params.user_id, req.body.user, function(err, updatedUser) {
		if (err) {
			res.redirect("back");
		} else {
			res.redirect("/users/" + req.params.user_id);
		}
	});
});

module.exports = router;