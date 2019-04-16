import { registerEnumType } from "type-graphql";

export enum AccountTypes {
  "Admin",
  "Instructor",
  "Customer",
  "Visitor"
}

registerEnumType(AccountTypes, {
  name: "AccountTypes",
  description: "Supported Account Types"
});
