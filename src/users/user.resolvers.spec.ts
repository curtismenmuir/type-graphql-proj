import "reflect-metadata";
import { graphql } from "graphql";
import "jest";
import { UserResolver } from "./user.resolvers";
import { buildSchema } from "type-graphql";
import { customAuthChecker } from "../auth";
var secrets = require("../../secrets.json");
var jwt = require("jsonwebtoken");

describe("User.Resolver Query testing", () => {
  var schema;
  var secret;
  beforeAll(async () => {
    schema = await buildSchema({
      resolvers: [UserResolver],
      authChecker: customAuthChecker
    });
    secret = Buffer.from(secrets["jwt"]).toString("base64");
  });

  it("Get a user returns user object with valid username", async () => {
    //language=GraphQL
    const GET_USER_QUERY = `
        query{
            user(username:"User1"){
                username
            }
        }
    `;
    var result = await graphql(schema, GET_USER_QUERY);
    expect(result.data).toHaveProperty("user");
    expect(result.data.user).not.toEqual(null);
    expect(result.data.user).toHaveProperty("username");
  });

  it("Get a user returns user object with invalid username", async () => {
    const GET_USER_QUERY = `
        query{
            user(username:"NotRealUser"){
                username
            }
        }
    `;
    var result = await graphql(schema, GET_USER_QUERY);
    expect(result.data).toHaveProperty("user");
    expect(result.data.user).toEqual(null);
  });

  it("Get all users returns a collection of users", async () => {
    const GET_ALL_USERS_QUERY = `
      query {
        users {
          username
        }
      }
    `;
    var result = await graphql(schema, GET_ALL_USERS_QUERY);
    expect(result.data).toHaveProperty("users");

    for (var user of result.data.users) {
      expect(user).toHaveProperty("username");
      expect(user.username).not.toEqual(null);
    }
  });

  it("Valid user login returns JWT token", async () => {
    const LOGIN_USER_QUERY = `
    query{
      loginUser(user:{
        username:"User1",
        password:"Password123"
      })
    }
    `;
    var result = await graphql(schema, LOGIN_USER_QUERY);
    expect(result.data).toHaveProperty("loginUser");
    expect(result.data.loginUser).not.toEqual("Login Failed");

    var decodedToken = jwt.verify(result.data.loginUser, secret);
    expect(decodedToken).toHaveProperty("exp");
    expect(decodedToken).toHaveProperty("data");
    expect(decodedToken).toHaveProperty("iat");
    expect(decodedToken.data).toHaveProperty("accountType");
    expect(decodedToken.data).toHaveProperty("username");
    expect(decodedToken.data.accountType).not.toEqual(null);
    expect(decodedToken.data.username).not.toEqual(null);
  });

  it("Invalid user login returns error message", async () => {
    //language=GraphQL
    const LOGIN_USER_QUERY = `
    query{
      loginUser(user:{
        username:"NotRealUsername",
        password:"SomePassword123"
      })
    }
    `;
    var result = await graphql(schema, LOGIN_USER_QUERY);
    expect(result.data).toHaveProperty("loginUser");
    expect(result.data.loginUser).toEqual("Login Failed");
  });
});
