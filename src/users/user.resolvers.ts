import { Resolver, Query, Arg, Mutation, Authorized } from "type-graphql";
import { plainToClass } from "class-transformer";
import { User } from "./user";
import { LoginUserInput, CreateUserInput } from "./user.inputs";
import { createUserSamples } from "./user.samples";
var secrets = require("../../secrets.json");
var jwt = require("jsonwebtoken");

@Resolver(of => User)
export class UserResolver {
  private readonly userCollection: User[] = createUserSamples();

  /**
  query{
    user(username:"User1"){
      username
    }
  }
  **/

  @Query(returns => User, {
    nullable: true,
    description: "Get User by username"
  })
  async user(@Arg("username") username: string): Promise<User | undefined> {
    return await this.userCollection.find(user => user.username === username);
  }

  /**
  query{
    users{
      username
    }
  }
  **/
  @Query(returns => [User], {
    description: "Get all Users"
  })
  async users(): Promise<User[]> {
    return await this.userCollection;
  }

  /**
  query{
    loginUser(user:{
      username:"User1",
      password:"Password123"
    })
  }
  **/
  @Query(returns => String, { description: "User Login" })
  async loginUser(@Arg("user") userInput: LoginUserInput): Promise<string> {
    try {
      if (
        this.userCollection.find(
          user =>
            user.username === userInput.username &&
            user.password === userInput.password
        )
      ) {
        var secret = Buffer.from(secrets["jwt"]).toString("base64");
        return jwt.sign(
          {
            exp: Math.floor(Date.now() / 1000) + 60 * 60, // 60 * 60 === 1hr expiry date
            data: {
              accountType: this.userCollection.find(
                user => user.username === userInput.username
              ).accountType,
              username: userInput.username
            }
          },
          secret
        );
      } else {
        return "Login Failed";
      }
    } catch (Exception) {
      return "Login Failed";
    }
  }

  /**
  mutation{
    addUser(
      user: {
        username: "NewUser2",
        password: "Password123",
        accountType: 0
      }
    ){
      username
    }
  }

  NOTE: 
  Must include admin user token in header: 
    {"authorization": "UserLoginToken"}
  **/
  @Authorized("Admin")
  @Mutation(returns => User, {
    description: "Add new user. Requires admin access token."
  })
  async addUser(@Arg("user") userInput: CreateUserInput): Promise<User> {
    var id = this.userCollection.length + 1;
    const user = plainToClass(User, {
      id: id,
      username: userInput.username,
      password: userInput.password,
      accountType: userInput.accountType
    });
    await this.userCollection.push(user);
    return user;
  }

  /**
  mutation {
    removeUser(username: "NewUser3")
  }

  NOTE: 
  Must include admin user token in header: 
    {"authorization": "UserLoginToken"}
  **/
  @Authorized("Admin")
  @Mutation(returns => Boolean, {
    description: "Delete user. Requires admin access token."
  })
  async removeUser(@Arg("username") username: string): Promise<Boolean> {
    var result = false;
    try {
      for (var [index, user] of this.userCollection.entries()) {
        if (user.username === username) {
          this.userCollection.splice(index, 1);
          result = true;
          break;
        }
      }
    } catch (Exception) {
      result = false;
    }
    return result;
  }
}
