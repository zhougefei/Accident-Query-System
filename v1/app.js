var express              = require("express"),
    app                  = express(),
    bodyParser           = require("body-parser"),
    oracledb             = require("oracledb"),
	mongoose             = require("mongoose"),
	flash                = require("connect-flash"),
	passport             = require("passport"),
	cookieParser         = require("cookie-parser"),
	LocalStrategy        = require("passport-local"),
	methodOverride       = require("method-override"),
	User                 = require("./models/user");

// requiring routes

var indexRoutes = require("./routes/index"),
	userRoutes = require("./routes/user");

oracledb.getConnection(
	{user             : "",
	 password         : "",
	 connectionString : ""
     },
	function(err, connection) {
		if (err) {
             console.log(err.message);
			return;
		}
		// use connection......
		conncetion.close(
			function(err) {
				if (err) {
                    console.log(err.message);
		        }
			}
		);
	}
);
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
// assign mongoose promise library and connect to database
mongoose.Promise = global.Promise;
var url = process.env.DATABASEURL || "mongodb://localhost/yelp_camp_final";
mongoose.connect(url);



app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(cookieParser('secret'));
//require moment
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
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

app.use("/", indexRoutes);
app.use("/users", userRoutes);

app.listen(4000, process.env.IP, function() {
	console.log("The Accident Query System Server Has Started!!!");
});