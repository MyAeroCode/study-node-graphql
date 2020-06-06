import { RedisCache } from "apollo-server-cache-redis";
import { MemcachedCache } from "apollo-server-cache-memcached";
import { Resolver, Query, Int, Arg, buildSchemaSync } from "type-graphql";
import { ApolloServer } from "apollo-server";
@Resolver()
class CacheResolver {
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
    persistedQueries: {
        //
        // With Redis
        cache: new RedisCache({
            host: "localhost",
            port: 6379,
        }),

        //
        // With Memcached
        // cache: new MemcachedCache(["localhost"]),
    },
});
