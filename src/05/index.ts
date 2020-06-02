import { ApolloServer } from "apollo-server";
import { buildSchemaSync } from "type-graphql";
import { Point3DResolver } from "./inheritance";
import { BinaryOperatorQueryResolver } from "./inheritance-override";
import { DataMapperQueryResolver } from "./inheritance-abstract";

const schema = buildSchemaSync({
    resolvers: [
        Point3DResolver,
        BinaryOperatorQueryResolver,
        DataMapperQueryResolver,
    ],
    validate: false,
});

export const server = new ApolloServer({
    schema,
});
