import { AuthChecker } from "type-graphql";
import { Context } from "./context";
import { AccountTypes } from "./enums/AccountTypes";
var secrets = require("../secrets.json");
var jwt = require("jsonwebtoken");

export const customAuthChecker: AuthChecker<Context> = (
  { root, args, context: { token }, info },
  roles
) => {
  console.log("Authenticating");
  console.log("==============================");
  console.log("Function: " + info.fieldName);
  console.log("Args: " + JSON.stringify(args));
  console.log("Token: " + token);
  console.log("Roles: " + JSON.stringify(roles));
  if (token === undefined || token === "") {
    return false;
  }
  var secret = Buffer.from(secrets["jwt"]).toString("base64");
  var decodedToken = jwt.verify(token, secret, function(error, decoded) {
    if (error) {
      console.log("JWT error: " + JSON.stringify(error));
      return false;
    } else {
      return decoded;
    }
  });
  console.log("Decoded Token: " + JSON.stringify(decodedToken));
  var result = false;
  if (decodedToken) {
    if (roles.length === 0) {
      // Verify user?
      result = true;
    } else {
      try {
        for (var role of roles) {
          if (role === AccountTypes[decodedToken["data"]["accountType"]]) {
            // included username in token, verify token against user in db?
            result = true;
            break;
          }
        }
      } catch (Exception) {
        result = false;
      }
    }
  }
  console.log("Authorized: " + result);
  console.log("==============================");
  return result;
};
