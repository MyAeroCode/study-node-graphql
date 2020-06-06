import { RedisCache } from "apollo-server-cache-redis";
import { MemcachedCache } from "apollo-server-cache-memcached";
import {
    Resolver,
    Query,
    Int,
    Arg,
    buildSchemaSync,
    Directive,
    MiddlewareFn,
    UseMiddleware,
} from "type-graphql";
import { ApolloServer } from "apollo-server";
import responseCachePlugin from "apollo-server-plugin-response-cache";

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
class CacheResolver {
    @Directive("@cacheControl(maxAge:30)")
    @Query(() => Int)
    async factorial(@Arg("n", () => Int) n: number): Promise<number> {
        let ans = 1;
        for (let i = 1; i <= n; i++) {
            ans *= i;
        }
        console.log("factorial", n, ans);
        return ans;
    }

    @Query(() => Int)
    @UseMiddleware(CacheControl(10, "PUBLIC"))
    async fibonacci(@Arg("n", () => Int) n: number): Promise<number> {
        const fibo: number[] = [];
        fibo[0] = 0;
        fibo[1] = 1;
        for (let i = 2; i <= n; i++) {
            fibo[i] = fibo[i - 1] + fibo[i - 2];
        }
        console.log("fibonacci", n, fibo[n]);
        return fibo[n];
    }
}

const schema = buildSchemaSync({
    resolvers: [CacheResolver],
});

export const server = new ApolloServer({
    schema,
    plugins: [responseCachePlugin],

    //
    // With Redis
    cache: new RedisCache({
        host: "localhost",
        port: 6379,
    }),

    //
    // With Memcached
    // cache: new MemcachedCache(["localhost"]),
});
