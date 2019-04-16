import "reflect-metadata";
import { ApolloServer } from "apollo-server";
import * as path from "path";
import { buildSchema } from "type-graphql";
import { RecipeResolver } from "./src/recipes/recipe.resolvers";
import { UserResolver } from "./src/users/user.resolvers";
import { customAuthChecker } from "./src/auth";
import { Context } from "./src/context";

async function bootstrap() {
  // build TypeGraphQL executable schema
  const schema = await buildSchema({
    resolvers: [RecipeResolver, UserResolver],
    // automatically create `schema.gql` file with schema definition in current folder
    emitSchemaFile: path.resolve(__dirname, "schema.gql"),
    // JWT authentication function
    authChecker: customAuthChecker
  });

  // Create GraphQL server
  const server = new ApolloServer({
    schema,
    playground: true, // enable GraphQL Playground
    context: ({ req }) => {
      const ctx: Context = {
        token: req.headers.authorization // HTTP Header: {"authorization": "GeneratedToken"}
      };
      return ctx;
    }
  });

  // Start the server
  const { url } = await server.listen(4000);
  console.log(`Server is running, GraphQL Playground available at ${url}`);
}

bootstrap();
