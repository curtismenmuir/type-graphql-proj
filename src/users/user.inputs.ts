import { User } from "./user";
import { InputType, Field } from "type-graphql";
import { Length, MaxLength, Min, Max, IsInt, MinLength } from "class-validator";
import { AccountTypes } from "../enums/AccountTypes";

@InputType()
export class LoginUserInput implements Partial<User> {
  @Field()
  @MaxLength(50)
  username: string;

  @Field()
  @MinLength(10)
  password: string;
}

@InputType()
export class CreateUserInput implements Partial<User> {
  @Field()
  @MaxLength(50)
  username: string;

  @Field()
  @MinLength(10)
  password: string;

  @Field()
  accountType: AccountTypes;
}
