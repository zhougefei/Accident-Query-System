var oracledb = require("oracledb");

var UserSchema = CREATE Schema User("username" VARCHAR2 (40 BYTE),
	                                "password" VARCHAR2 (40 BYTE),
	                                "email"    VARCHAR2 (40 BYTE)
                                    );

module.exports = oracledb.model("User", UserSchema);