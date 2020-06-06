import { Resolver, Query, buildSchemaSync } from "type-graphql";
import { ApolloServer } from "apollo-server";

@Resolver()
class HelloResolver {
    @Query(() => String)
    hello(): string {
        return "world!";
    }

    @Query(() => String)
    byebye(): string {
        return "See you again!";
    }
}

const schema = buildSchemaSync({ resolvers: [HelloResolver] });

export const server = new ApolloServer({
    schema,
    plugins: [
        {
            // Fires whenever a GraphQL request is received from a client.
            requestDidStart(requestContext) {
                console.log(
                    "Request started! Query:\n" + requestContext.request.query
                );

                return {
                    // Fires whenever Apollo Server will parse a GraphQL
                    // request to create its associated document AST.
                    parsingDidStart(requestContext) {
                        console.log("Parsing started!");
                    },

                    // Fires whenever Apollo Server will validate a
                    // request's document AST against your GraphQL schema.
                    validationDidStart(requestContext) {
                        console.log("Validation started!");
                    },
                };
            },
        },
    ],
});
