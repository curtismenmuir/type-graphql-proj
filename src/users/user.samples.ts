import { plainToClass } from "class-transformer";
import { AccountTypes } from "../enums/AccountTypes";
import { User } from "./user";

export function createUserSamples() {
  return plainToClass(User, [
    {
      id: 1,
      username: "User1",
      password: "Password123",
      accountType: AccountTypes.Admin
    },
    {
      id: 2,
      username: "User2",
      password: "Password123",
      accountType: AccountTypes.Admin
    },
    {
      id: 3,
      username: "User3",
      password: "Password123",
      accountType: AccountTypes.Instructor
    }
  ]);
}
