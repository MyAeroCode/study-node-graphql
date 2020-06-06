### Cache Control

단일 `GraphQL Request`로 인해 여러개의 `Resolver`가 호출될 수 있으며, 각 `Resolver`는 각기다른 `caching semantic`을 가질 수 있습니다. 이 중에서 어떤 필드는 캐싱할 수 없고, 어떤 필드는 짧은 시간동안만 유효할 수 있고, 어떤 필드는 몇 시간에 해당하는 긴 시간동안 유효할 수 있습니다.

<br/>

`HTTP Response`에서 `cacheControl`를 설정하면 클라이언트에게 캐싱할 수 있는 기간을 넌지시 알려줄 수 있으며, 이러한 매커니즘을 지원하기 위한 3가지 방법을 지원합니다.

-   `@cacheControl`
-   `info.cacheControl.setCacheHint`
-   `defaultCachaControl`

<br/>

`cacheControl`은 절대적인 것이 아님에 주의해야 합니다. 클라이언트가 이를 무시하고 서버에 최신값을 요청할 수 있기 때문입니다.

---

### `@CacheControl`

다음과 같이 지시어를 사용하여 `cache-control`을 설정할 수 있습니다. `max-age`는 초 단위의 정수이고, `scope`는 `"PUBLIC" | "PRIVATE"` 형식의 문자열입니다.

```ts
@Resolver()
class CacheResolver {
    @Directive("@cacheControl(maxAge: 19, scope: PUBLIC)")
    @Query(() => String)
    publicHello(): string {
        console.log("call hello");
        return "world!";
    }
}
```

---

### `info.cacheControl.setCacheHint`

미들웨어 같은 함수에서 `info.cacheControl`을 조작하여 설정할 수 있습니다.

```ts
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
    @UseMiddleware(CacheControl(60, "PRIVATE"))
    privateHello(): string {
        console.log("call hello");
        return "world!";
    }
}
```

---

### `defaultCacheControl`

서버 객체를 생성할 때 `maxAge`를 설정할 수 있습니다.

```ts
export const server = new ApolloServer({
    schema,
    cacheControl: {
        defaultMaxAge: 100,
    },
});
```

---

### Resolve Cache-Control

각기다른 `Cache-Control`을 갖는 필드들을 요청하면, 다음 전략에 따라 최종 `Cache-Control`이 결정됩니다.

-   `max-age`는 가장 낮은 값을 사용합니다.
-   `private`와 `public`이 혼용되었다면, `private`를 사용합니다.
