import { Field, ObjectType, ID } from "type-graphql";
import { AccountTypes } from "../enums/AccountTypes";

@ObjectType({ description: "Object representing a users account details" })
export class User {
  @Field(type => ID)
  id: number;

  @Field(type => String)
  username: string;

  @Field({
    description: "password"
  })
  password: string;

  @Field(type => AccountTypes, {
    description: "AccountType"
  })
  accountType: AccountTypes;
}
