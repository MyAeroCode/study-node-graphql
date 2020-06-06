### Cache

서버측에도 `redis`나 `memcached`를 사용하여 캐시를 둘 수 있습니다.

---

### Via Redis

##### Redis 시작하기

`docker`를 이용하여 `redis`를 시작하겠습니다.

```bash
$ docker pull redis
$ docker run --name redis -d -p 6379:6379 redis
```

<br/>

##### RedisCache 객체 생성하기

`apollo-server-cache-redis`를 사용하여 객체를 생성합니다.

```ts
import { RedisCache } from "apollo-server-cache-redis";

const cache = new RedisCache({
    host: "localhost",
    port: 6379,
});

//
// 생성된 객체를 이용하여 Redis에 접근할 수 있습니다.
await cache.get(KEY);
await cache.set(KEY, VAL);
```

이제 다음과 같은 방식으로 캐싱할 수 있습니다.

```ts
@Resolver()
class CacheResolver {
    @Query(() => Int)
    async factorial(@Arg("n", () => Int) n: number): Promise<number> {
        const cache: string | undefined = await cache.get(n.toString());
        if (cache) {
            return Number(cache);
        } else {
            let ans = 1;
            for (let i = 1; i <= n; i++) {
                ans *= i;
            }
            await cache.set(n.toString(), ans.toString());
            return ans;
        }
    }
}
```

---

### Via Memcached

##### Memcached 시작하기

이번에도 `docker`를 이용하여 `memcached`를 시작하겠습니다.

```bash
$ docker pull memcached
$ docker run --name memcache -d -p 11211:11211 memcached memcached -m 64
```

<br/>

##### MemcachedCache 객체 생성하기

`apollo-server-cache-memcached`를 사용하여 객체를 생성합니다.

```ts
import { MemcachedCache } from "apollo-server-cache-memcached";

const cache = new MemcachedCache(["localhost"]);
```

이제 다음과 같은 방식으로 캐싱할 수 있습니다.

```ts
@Resolver()
class CacheResolver {
    @Query(() => Int)
    async factorial(@Arg("n", () => Int) n: number): Promise<number> {
        const cache: string | undefined = await cache.get(n.toString());
        if (cache) {
            return Number(cache);
        } else {
            let ans = 1;
            for (let i = 1; i <= n; i++) {
                ans *= i;
            }
            await cache.set(n.toString(), ans.toString());
            return ans;
        }
    }
}
```

---

### Via Elasticache (\*TODO)

`Elasticache`를 이용하여 `Redis`와 `Memcached` 인스턴스를 만들 수 있지만 같은 `VPC`에 존재하는 `EC2`에서만 사용할 수 있도록 설계되었기 때문에 외부에서 접근하기가 힘듭니다. 방법을 알아내는대로 업데이트하겠습니다.

---

### ResponseCachePlugin

`apollo-server-plugin-response-cache`을 사용하면 `@cache-control`이 적용된 데이터는 자동으로 캐시에 저장되도록 도와줍니다. `@cache-control`이 무엇인지 모르겠다면 `chapter 19`를 참조해주세요. 캐싱된 데이터는 `maxAge`(초) 만큼 데이터베이스에 머물다가 삭제됩니다.

```ts
import { RedisCache } from "apollo-server-cache-redis";
import { MemcachedCache } from "apollo-server-cache-memcached";
import responseCachePlugin from "apollo-server-plugin-response-cache";

export const server = new ApolloServer({
    schema,
    plugins: [responseCachePlugin],

    //
    // Redis를 이용하고 있다면...
    cache: new RedisCache({
        host: "localhost",
        port: 6379,
    }),

    //
    // Memcached를 이용하고 있다면...
    cache: new MemcachedCache(["localhost"]),
});
```

아래의 코드에서 `factorial(n)`은 30초 동안, `fibonacci(n)`는 10초 동안 유지됩니다. 캐싱된 값이 만료되고 나서야, 값이 다시 계산될 수 있습니다.

```ts
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
```
