var express              = require("express"),
    app                  = express(),
    bodyParser           = require("body-parser"),
    oracledb             = require("oracledb"),
	User                 = require("./models/user");

// requiring routes

var indexRoutes = require("./routes/index"),
	userRoutes = require("./routes/user");

oracledb.getConnection(
	{user             : "lazhou",
	 password         : "5962390zyx",
	 connectionString : "oracle.cise.ufl.edu/orcl",
     },
	function(err, connection) {
		if (err) {
            console.log(err.message);
			return;
		}
		console.log("connected to the oracle database");
		connection.execute(
			  "select count(*)"
		    + "from accident"
			+ "where severity = 3",
			function(err, result) {
				if (err) {
                    console.log(err.message);
			        return;
		        }
				console.log(result.row);
			}
		);
	}
);