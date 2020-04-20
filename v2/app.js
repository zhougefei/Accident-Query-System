var express              = require("express"),
    app                  = express(),
    bodyParser           = require("body-parser"),
    oracledb             = require("oracledb"),
	flash                = require("connect-flash"),
	passport             = require("passport"),
	cookieParser         = require("cookie-parser"),
	LocalStrategy        = require("passport-local"),
	methodOverride       = require("method-override");
	//User                 = require("./models/user");

 app.use(bodyParser.urlencoded({extended: true}));
 app.set("view engine", "ejs");
 app.use(express.static(__dirname + "/public"));
 app.use(methodOverride("_method"));
 app.use(cookieParser('secret'));
 app.locals.moment = require("moment");

 // PASSPORT CONFIGURATION
 app.use(require("express-session")({
 	secret: "Once again Rusty wins cutest dog!",
 	resave: false,
 	saveUninitialized: false
 }));

 app.use(flash());
 app.use(passport.initialize());
 app.use(passport.session());
 //passport.use(new LocalStrategy(User.authenticate()));
 //passport.serializeUser(User.serializeUser());
 //passport.deserializeUser(User.deserializeUser());

 app.use(function(req, res, next){
 	res.locals.currentUser = req.user;
 	res.locals.error = req.flash("error");
 	res.locals.success = req.flash("success");
 	next();
 });

// requiring routes
var indexRoutes = require("./routes/index");
	//userRoutes = require("./routes/user");

 app.use("/", indexRoutes);
// app.use("/users", userRoutes);

 app.listen(4000, process.env.IP, function() {
 	console.log("The Accident Query System Server Has Started!!!");
 });