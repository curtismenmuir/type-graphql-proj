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

  it("Invalid username at login returns error message", async () => {
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

  it("Invalid password at login returns error message", async () => {
    const LOGIN_USER_QUERY = `
      query {
        loginUser(user: {
          username:"User1",
          password:"NotMyPassword123"
        })
      }
    `;
    var result = await graphql(schema, LOGIN_USER_QUERY);
    expect(result.data).toHaveProperty("loginUser");
    expect(result.data.loginUser).toEqual("Login Failed");
  });
});

describe("User.Resolver Mutation testing", () => {
  var schema;
  var secret;
  var ADMIN_TOKEN;
  var INSTRUCTOR_TOKEN;

  beforeAll(async () => {
    schema = await buildSchema({
      resolvers: [UserResolver],
      authChecker: customAuthChecker
    });
    secret = Buffer.from(secrets["jwt"]).toString("base64");
  });

  beforeEach(async () => {
    ADMIN_TOKEN = generateAdminToken(secret);
    INSTRUCTOR_TOKEN = generateInstructorToken(secret);
  });

  it("AddUser mutation fails when no authorization token", async () => {
    const ADD_USER_MUTATION = `
      mutation{
        addUser(
          user: {
            username: "SomeNewUser",
            password: "Password123",
            accountType: 0
          }
        ){
          username
        }
      }
    `;
    var result = await graphql(schema, ADD_USER_MUTATION);
    expect(result).toHaveProperty("errors");
    expect(result.errors).toHaveLength(1);
    expect(result.data).toBeNull();
  });

  it("AddUser mutation fails when adding a new user with non-admin JWT", async () => {
    const ADD_USER_MUTATION = `
      mutation{
        addUser(
          user: {
            username: "NewUser",
            password: "Password123",
            accountType: 0
          }
        ){
          username
        }
      }
    `;
    const context = {
      token: INSTRUCTOR_TOKEN
    };
    var result = await graphql(schema, ADD_USER_MUTATION, {}, context);
    expect(result).toHaveProperty("errors");
    expect(result.errors).toHaveLength(1);
    expect(result.data).toBeNull();
  });

  it("AddUser mutation succeeds when adding a new user with an admin JWT", async () => {
    const ADD_USER_MUTATION = `
      mutation{
        addUser(
          user: {
            username: "NewUser1",
            password: "Password123",
            accountType: 0
          }
        ){
          username
        }
      }
    `;
    const context = {
      token: ADMIN_TOKEN
    };
    var result = await graphql(schema, ADD_USER_MUTATION, {}, context);

    expect(result).not.toHaveProperty("errors");
    expect(result.data).not.toBeNull();
    expect(result.data).toHaveProperty("addUser");
    expect(result.data.addUser).toHaveProperty("username");
    expect(result.data.addUser.username).not.toEqual(null);
  });

  it("RemoveUser mutation fails with no JWT token", async () => {
    const DELETE_USER_MUTATION = `
      mutation {
        removeUser(username: "User1")
      }
    `;
    var result = await graphql(schema, DELETE_USER_MUTATION);

    expect(result).toHaveProperty("errors");
    expect(result.errors).toHaveLength(1);
    expect(result.data).toBeNull();
  });

  it("RemoveUser mutation fails with non-admin JWT token", async () => {
    const DELETE_USER_MUTATION = `
      mutation {
        removeUser(username: "User1")
      }
    `;
    const context = {
      token: INSTRUCTOR_TOKEN
    };
    var result = await graphql(schema, DELETE_USER_MUTATION, {}, context);
    expect(result).toHaveProperty("errors");
    expect(result.errors).toHaveLength(1);
    expect(result.data).toBeNull();
  });

  it("RemoveUser mutation returns false with invalid user and valid admin JWT token", async () => {
    const DELETE_USER_MUTATION = `
      mutation {
        removeUser(username: "NotRealUser")
      }
    `;
    const context = {
      token: ADMIN_TOKEN
    };
    var result = await graphql(schema, DELETE_USER_MUTATION, {}, context);
    expect(result).not.toHaveProperty("errors");
    expect(result.data).not.toBeNull();
    expect(result.data).toHaveProperty("removeUser");
    expect(result.data.removeUser).toEqual(false);
  });

  it("RemoveUser mutation passes with valid user and admin JWT token", async () => {
    const DELETE_USER_MUTATION = `
      mutation {
        removeUser(username: "User1")
      }
    `;
    const context = {
      token: ADMIN_TOKEN
    };
    var result = await graphql(schema, DELETE_USER_MUTATION, {}, context);
    expect(result).not.toHaveProperty("errors");
    expect(result.data).not.toBeNull();
    expect(result.data).toHaveProperty("removeUser");
    expect(result.data.removeUser).toEqual(true);
  });
});

function generateAdminToken(secret) {
  return jwt.sign(
    {
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 60 * 60 === 1hr expiry date
      data: {
        accountType: 0,
        username: "Admin"
      }
    },
    secret
  );
}

function generateInstructorToken(secret) {
  return jwt.sign(
    {
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 60 * 60 === 1hr expiry date
      data: {
        accountType: 1,
        username: "Instructor"
      }
    },
    secret
  );
}
