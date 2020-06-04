import {
    Resolver,
    Query,
    Extensions,
    MiddlewareFn,
    buildSchemaSync,
} from "type-graphql";
import { ApolloServer } from "apollo-server";

const PrintExtension: MiddlewareFn = async ({ info }, next) => {
    const thisField = info.parentType.getFields()[info.fieldName];
    const { extensions } = thisField;
    console.log(extensions);
    return await next();
};

@Resolver()
class ExtensionResolver {
    @Query(() => String)
    @Extensions({ myMessage: "Hello, World!" })
    hello(): string {
        return "world!";
    }

    @Query(() => String)
    @Extensions({ myMessage: "Byebye! See you again!" })
    @Extensions({ myRandom: Math.random() }) // only once.
    byebye(): string {
        return "see you again!";
    }
}

const schema = buildSchemaSync({
    resolvers: [ExtensionResolver],
    globalMiddlewares: [PrintExtension],
});

export const server = new ApolloServer({ schema });
