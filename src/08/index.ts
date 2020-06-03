import { buildSchemaSync } from "type-graphql";
import { ApolloServer } from "apollo-server";
import { MessageResolver } from "./sub-chat";
import { CounterResolver } from "./sub-counter";

const schema = buildSchemaSync({
    resolvers: [CounterResolver, MessageResolver],
    validate: false,
});

export const server = new ApolloServer({ schema });
