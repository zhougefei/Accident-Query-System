var express = require("express");
var router  = express.Router();
var passport = require("passport");
var oracledb = require("oracledb");
var NodeGeocoder = require('node-geocoder');
//var User = require("../models/user");

var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: 'You-google-api-key',
  formatter: null
};
var geocoder = NodeGeocoder(options);

var dbConfig = {
    user:     "process.env.USERNAME",
    password: "process.env.PASSWORD",
    connectString : "*****"
};

router.get("/", function(req, res){
    res.render("index");
});

// show accidents information
router.get("/queries/trends", function(req, res){
   res.render("queries/trends");
});
router.get("/queries/trends/accident_in_state", function(req, res){
   res.render("queries/trends/accident_in_state");
});
router.get("/queries/trends/severity_in_state", function(req, res){
   res.render("queries/trends/severity_in_state");
});
router.get("/queries/trends/trend_of_more_than2", function(req, res){
   res.render("queries/trends/trend_of_more_than2");
});
router.get("/queries/trends/trend_of_weather", function(req, res){
   res.render("queries/trends/trend_of_weather");
});
router.get("/queries/trends/result_trend_of_weather", function(req, res){
   res.render("queries/trends/result_trend_of_weather");
});
router.get("/queries/statistics", function(req, res){
   res.render("queries/statistics");
});
router.get("/queries/statistics/top_10_states", function(req, res){
    var state = [];
    var number = [];
    var sql = "Select * From (Select Location.state, Count(*) AS Number_of_Accidents From Accident, Location, Weather Where Accident.ID = Location.ID AND Weather.ID = Accident.ID Group By Location.state Order by count(*) DESC) Where rownum <= 10";
    oracledb.getConnection(dbConfig, function(err, query) {
   	    if (err) {
            console.log(err.message);
   		    return;
   	    }
   		query.execute(sql, function(err, result) {
             if (err) {
                  console.error(err);
                  return;
             }
             result.rows.forEach(function(item) {
                 state.push(item[0]);
                 number.push(item[1]);
             });
             res.render("queries/statistics/top_10_states_show", { title: 'The top 10 states with the high accident occurrence', state: state, number: number});
        });
    });
});
router.get("/queries/statistics/percentage_of_accident", function(req, res){
   res.render("queries/statistics/percentage_of_accident");
});
router.get("/queries/statistics/effect_of_visibility", function(req, res){
   res.render("queries/statistics/effect_of_visibility");
});
router.get("/queries/statistics/average_visibility", function(req, res){
   res.render("queries/statistics/average_visibility");
});
router.get("/queries/statistics/percentage_in_day_night", function(req, res){
   res.render("queries/statistics/percentage_in_day_night");
});
router.get("/queries/maps", function(req, res){
   res.render("queries/maps", {page: 'maps'});
});

// handle the accident query logic about statistics
router.post("/queries/statistics/percentage_of_accident", function(req, res){
   var state = req.body.state;
   var month = req.body.month;
   var show = req.body.show;
   var severity_number = [];
   var total = 0;
   var pie_number = [];
   var sql = ''.concat("Select Accident.Severity, Count(Location.ID) As Numbers From Accident Left Join Location On Accident.ID = Location.ID AND Location.state = '", state, "' AND Accident.Month = '", month, "' Group By Accident.Severity Order By Accident.Severity ASC");
   oracledb.getConnection(dbConfig, function(err, query) {
        if (err) {
             console.log(err.message);
         	 return;
        }
        query.execute(sql, function(err, result) {
             if (err) {
                  console.error(err);
                  return;
             }
             result.rows.forEach(function(item) {
                 severity_number.push(item[1]);
                 total += item[1];
             });
             severity_number.forEach(function(number) {
                  pie_number.push(number / total);
             });
             res.render("queries/statistics/percentage_of_accident_show", {show : show, pie_number: pie_number, severity_number: severity_number});
        });
   });
});
router.post("/queries/statistics/effect_of_visibility", function(req, res){
   var state = req.body.state;
   var visibility_range = ['0-2', '2-4', '4-6', '6-8', '8-10', '>10'];
   var accident_visibility = [];
   var sql = ''.concat("Select v.range as Visibility_Range, count(Location.ID) as Numbers From (Select weather.ID, Case When weather.visibility between 0 and 2 then '0-2' When weather.visibility between 2 and 4 then '2-4' When weather.visibility between 4 and 6 then '4-6' When weather.visibility between 6 and 8 then '6-8' When weather.visibility between 8 and 10 then '8-10' Else '>10' end as range From Weather Where Weather.visibility is not null) v Left Join Location On Location.ID = v.ID AND Location.state = '", state, "' Group By v.range Order By v.range ASC");
   oracledb.getConnection(dbConfig, function(err, query) {
        if (err) {
             console.log(err.message);
         	 return;
        }
        query.execute(sql, function(err, result) {
             if (err) {
                  console.error(err);
                  return;
             }
             //console.log(result.rows);
             result.rows.forEach(function(item) {
                 accident_visibility.push(item[1]);
             });
             res.render("queries/statistics/effect_of_visibility_show", {visibility_range: visibility_range, accident_visibility: accident_visibility});
        });
   });
});
router.post("/queries/statistics/average_visibility", function(req, res){
   var state = req.body.state;
   var avg_visibility = [];
   var sql = ''.concat("Select Accident.Severity, AVG(A.Visibility) As Avg_Visibility From Accident Left Join (Select Location.ID, Weather.Visibility From Location, Weather Where Location.ID = Weather.ID AND Location.state = '", state, "' AND Weather.Visibility is not null) A On Accident.ID = A.ID Group By Accident.Severity Order By Accident.Severity ASC");
   oracledb.getConnection(dbConfig, function(err, query) {
        if (err) {
             console.log(err.message);
         	 return;
        }
        query.execute(sql, function(err, result) {
             if (err) {
                  console.error(err);
                  return;
             }
             result.rows.forEach(function(item) {
                 avg_visibility.push(item[1]);
             });
             res.render("queries/statistics/average_visibility_show", {avg_visibility: avg_visibility});
        });
   });
});
router.post("/queries/statistics/percentage_in_day_night", function(req, res){
   var state = req.body.state;
   var day_night = [];
   var sql = ''.concat("Select Weather.Civil_Twilight, Count(Location.ID) As Numbers From Location Inner Join Weather On Location.ID = Weather.ID And Location.state = '", state, "' And Weather.Civil_Twilight is not null Group By Weather.Civil_Twilight");
   oracledb.getConnection(dbConfig, function(err, query) {
        if (err) {
            console.log(err.message);
      	    return;
        }
        query.execute(sql, function(err, result) {
            if (err) {
                 console.error(err);
                 return;
            }
            result.rows.forEach(function(item) {
                day_night.push(item[1]);
            });
            res.render("queries/statistics/percentage_in_day_night_show", {title: 'Percentage of Accident in Day/Night', day_night: day_night});
        });
   });
});

router.get("/queries/maps", function(req, res){
   res.render("queries/maps");
});
router.post("/queries/maps", function(req, res){
   var location = req.body.location;
   var locArray = location.split(", ");
   var city = locArray[0];
   var state = locArray[1];
   var month = req.body.month;
   var Number_of_Accidents;
   var lat_of_state;
   var lng_of_state;
   geocoder.geocode(location, function (err, data) {
        if (err || !data.length) {
            req.flash('error', 'Invalid state address');
            return res.redirect('back');
        }
        lat_of_state = data[0].latitude;
        lng_of_state = data[0].longitude;
   });
    var month_interest;
    switch (Number(month)) {
        case 3:
            month_interest = "March";
            break;
        case 4:
            month_interest = "April";
            break;
        case 5:
            month_interest = "May";
            break;
        case 6:
            month_interest = "June";
            break;
        case 7:
            month_interest = "July";
            break;
        case 8:
            month_interest = "August";
            break;
        case 9:
            month_interest = "September";
            break;
        case 10:
            month_interest = "October";
            break;
        case 11:
            month_interest = "November";
            break;
        case 12:
            month_interest = "December";
            break;
    }
   var sql = ''.concat("Select Count(Accident.ID) AS Number_of_Accidents From Accident, Location Where Accident.ID = Location.ID AND Accident.month = '", month, "' AND Location.state = '", state, "' AND Location.city = '", city, "'");
   oracledb.getConnection(dbConfig, function(err, query) {
        if (err) {
            console.log(err.message);
      	    return;
        }
        query.execute(sql, function(err, result) {
            if (err) {
                 console.error(err);
                 return;
            }
            Number_of_Accidents = result.rows[0][0];
            res.render("queries/maps_show", {location : location, month_interest : month_interest, Number_of_Accidents : Number_of_Accidents, lat_of_state : lat_of_state, lng_of_state : lng_of_state});
        });
   });
});

// handle the accident query logic about trends
router.post("/queries/trends/accident_in_state", function(req, res){
   var location = req.body.location.split(", ");
   var city = location[0];
   var state = location[1];
   var show = req.body.show;
   var month_accident = [];
   var hour_accident = [];
   var hours = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
   var sql = ''.concat("Select Accident.", show, ", Count(Location.ID) AS Number_of_Accidents From Accident Left Join Location On Accident.ID = Location.ID AND Location.state = '", state, "' AND Location.city = '", city, "' Group By Accident.", show, " Order By Accident.", show, " ASC");
   oracledb.getConnection(dbConfig, function(err, query) {
        if (err) {
            console.log(err.message);
      	    return;
        }
        query.execute(sql, function(err, result) {
            if (err) {
                 console.error(err);
                 return;
            }
            if (show === 'month') {
                 result.rows.forEach(function(item) {
                      month_accident.push(item[1]);
                 });
                 res.render("queries/trends/accident_in_state_show_in_month", {month_accident : month_accident});
            } else {
                 result.rows.forEach(function(item) {
                      hour_accident.push(item[1]);
                 });
                 res.render("queries/trends/accident_in_state_show_in_hour", {hours : hours, hour_accident : hour_accident});
            }
        });
   });
});
router.post("/queries/trends/trend_of_more_than2", function(req, res){
   var location = req.body.location.split(", ");
   var city = location[0];
   var state = location[1];
   var up3 = [];
   var NUMBER_OF_ACCIDENTS_S4 = [];
   var sql = ''.concat("Select month, count(Location.ID) As S4_Accidents, Case When count(Location.ID) > 2 Then 'Yes' Else 'No' End As Up3 From Accident LEFT OUTER JOIN Location On Accident.ID = Location.ID AND Severity = 4 AND state = '", state, "' AND city = '", city, "' Group By month Order By month");
   oracledb.getConnection(dbConfig, function(err, query) {
        if (err) {
            console.log(err.message);
      	    return;
        }
        query.execute(sql, function(err, result) {
            if (err) {
                 console.error(err);
                 return;
            }
            result.rows.forEach(function(item) {
                 NUMBER_OF_ACCIDENTS_S4.push(item[1]);
                 up3.push(item[2]);
            });
            res.render("queries/trends/trend_of_more_than2_show", {NUMBER_OF_ACCIDENTS_S4 : NUMBER_OF_ACCIDENTS_S4, up3 : up3 });
        });
   });
});
router.post("/queries/trends/trend_of_weather", function(req, res){
   var location = req.body.location.split(", ");
   var city = location[0];
   var state = location[1];
   var weather = req.body.weather;
   var S1_number = [];
   var S2_number = [];
   var S3_number = [];
   var S4_number = [];
   var sql1 = ''.concat("Select Location.ID From Location, Weather Where Location.ID = Weather.ID AND Location.state = '", state, "' AND Location.city = '", city, "' AND Weather.weather_condition Like '%", weather, "%'");
   var sql = "Select Accident.Month, Count(A.ID) As S1_Numbers, Count(B.ID) As S2_Numbers, "
                  + "Count(C.ID) As S3_Numbers, Count(D.ID) As S4_Numbers, "
                  + "Case When Count(A.ID)>0 AND Count(B.ID)>0 AND Count(C.ID)>0 AND Count(D.ID) > 0 "
                  + "     Then 'Yes' "
                  + "Else 'No' "
                  + "End As ContainedAll "
          + " From   Accident Left Join (" + sql1 + ") A On "
          + "                            Accident.ID = A.ID AND Accident.Severity = 1 "
          + "                 Left Join (" + sql1 + ") B On "
          + "                            Accident.ID = B.ID AND Accident.Severity = 2 "
          + "                 Left Join (" + sql1 + ") C On "
          + "                            Accident.ID = C.ID AND Accident.Severity = 3 "
          + "                 Left Join (" + sql1 + ") D On "
          + "                            Accident.ID = D.ID AND Accident.Severity = 4 "
          + " Group By Accident.Month "
          + " Order By Accident.Month"
   oracledb.getConnection(dbConfig, function(err, query) {
        if (err) {
            console.log(err.message);
      	    return;
        }
        query.execute(sql, function(err, result) {
            if (err) {
                 console.error(err);
                 return;
            }
            result.rows.forEach(function(item) {
                 S1_number.push(item[1]);
                 S2_number.push(item[2]);
                 S3_number.push(item[3]);
                 S4_number.push(item[4]);
            });
            res.render("queries/trends/trend_of_weather_show", {weather : weather, S1_number : S1_number, S2_number : S2_number, S3_number : S3_number, S4_number : S4_number});
        });
   });
});

// show register form
router.get("/register", function(req, res){
   res.render("register", {page: 'register'});
});

//handle sign up logic
router.post("/register", function(req, res){

});

//show login form
router.get("/login", function(req, res){
    res.render("login", {page: 'login'});
});

//handling login logic
router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/",
        failureRedirect: "/login",
	    failureFlash: true,
        successFlash: 'Welcome to Accident Query System!'
    }), function(req, res){
});

// logout route
router.get("/logout", function(req, res){
   req.logout();
   req.flash("success", "Logged you out!");
   res.redirect("/");
});

module.exports = router;
