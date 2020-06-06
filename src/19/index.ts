import {
    Resolver,
    Query,
    buildSchemaSync,
    Directive,
    MiddlewareFn,
    UseMiddleware,
} from "type-graphql";
import { ApolloServer } from "apollo-server";

function CacheControl(
    maxAge: number,
    scope: "PUBLIC" | "PRIVATE"
): MiddlewareFn {
    return async ({ info: { cacheControl } }, next) => {
        cacheControl.setCacheHint({ maxAge, scope: scope as any });
        return next();
    };
}

@Resolver()
class CacheControlResolver {
    @Query(() => String)
    hello(): string {
        return "world!";
    }

    @Directive("@cacheControl(maxAge: 19, scope: PUBLIC)")
    @Query(() => String)
    publicHello(): string {
        return "world!";
    }

    @Query(() => String)
    @UseMiddleware(CacheControl(60, "PRIVATE"))
    privateHello(): string {
        return "world!";
    }
}

const schema = buildSchemaSync({ resolvers: [CacheControlResolver] });

export const server = new ApolloServer({
    schema,
    cacheControl: {
        defaultMaxAge: 100,
    },
});
