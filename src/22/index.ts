import { Resolver, Query, Mutation, Arg, buildSchemaSync } from "type-graphql";
import { ApolloServer } from "apollo-server";
import { GraphQLBuffer } from "./buffer-type";
import fs from "fs";

@Resolver()
class FileUploadResolver {
    @Query(() => GraphQLBuffer)
    download(@Arg("name", () => String) name: string): Buffer {
        return fs.readFileSync(`./src/22/${name}`);
    }

    @Mutation(() => Boolean)
    upload(
        @Arg("buffer", () => GraphQLBuffer)
        buffer: Buffer,

        @Arg("name", () => String)
        name: string
    ): Boolean {
        try {
            fs.writeFileSync(`./src/22/${name}`, buffer);
            return true;
        } catch (e) {
            return false;
        }
    }
}

const schema = buildSchemaSync({
    resolvers: [FileUploadResolver],
    validate: false,
});

export const server = new ApolloServer({
    schema,
    uploads: true,
});
