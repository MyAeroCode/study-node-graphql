import "reflect-metadata";

import { Resolver, Query, buildSchemaSync } from "type-graphql";
import { ApolloServer } from "apollo-server";
import { ApolloServer as ApolloLambda } from "apollo-server-lambda";

@Resolver()
class HelloResolver {
    @Query(() => String)
    hello(): string {
        return "world!";
    }
}

const schema = buildSchemaSync({ resolvers: [HelloResolver] });

//
// for npm start 26
export const server = new ApolloServer({ schema });

//
// for lambda
const lambdaServer = new ApolloLambda({ schema });
export const handler = lambdaServer.createHandler({});
