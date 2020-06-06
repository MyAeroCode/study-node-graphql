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

export const server = new ApolloServer({ schema });
