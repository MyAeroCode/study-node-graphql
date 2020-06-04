import Container from "typedi";
import { buildSchemaSync, ResolverData } from "type-graphql";
import { StackResolver } from "./di-stack";
import { DataResolver } from "./di-data";
import { ApolloServer } from "apollo-server";
import { ScopedDataResolver } from "./di-scoped-data";

interface MyContext {
    container_scope?: any;
}

const schema = buildSchemaSync({
    resolvers: [DataResolver, ScopedDataResolver, StackResolver],
    container: ({ context }: ResolverData<MyContext>) => {
        if (context.container_scope) {
            return Container.of(context.container_scope);
        } else {
            return Container;
        }
    },
});

export const server = new ApolloServer({
    schema,
    context: ({ req }): MyContext => {
        return {
            container_scope: req.headers.container_scope,
        };
    },
});
