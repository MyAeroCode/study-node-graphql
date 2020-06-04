### Extension

`graphql-js` 라이브러리는 각 `GraphQL Type`에 대해 `extensions`라는 속성을 가지는 것을 허용하고 있습니다. 여기에 데이터를 정의하고 `Middleware`에서 이것을 활용하는 방법에 대해 공부합니다.

---

### Write Extensions Data

`@Extensions` 데코레이터를 사용하면 `extensions`에 해당 데이터를 `assign`할 수 있습니다.

```ts
@Resolver()
class ExtensionResolver {
    @Query(() => String)
    @Extensions({ myMessage: "Hello, World!" })
    hello(): string {
        return "world!";
    }
}
```

여러번 사용하면 반복하여 `assign` 할 수 있습니다. 프로퍼티 이름이 겹치지 않는다면, 이전에 대입된 내용이 유지됩니다.

```ts
@Resolver()
class ExtensionResolver {
    @Query(() => String)
    @Extensions({ myMessage: "Byebye! See you again!" })
    @Extensions({ myRandom: Math.random() }) // only once.
    byebye(): string {
        return "see you again!";
    }
}
```

`Math.random()`을 주목해주세요. `byebye`가 호출될 때 마다 다른 값을 가질 것 같지만, 계산은 처음 한번만 이루어집니다.

---

### Read Extensions Data

필드의 `extensions` 프로퍼티에 해당 내용이 저장되어 있습니다. `extensions`에 저장된 내용을 출력하는 미들웨어를 작성하겠습니다.

```ts
const PrintExtension: MiddlewareFn = async ({ info }, next) => {
    const thisField = info.parentType.getFields()[info.fieldName];
    const { extensions } = thisField;
    console.log(extensions);
    return await next();
};
```

---

### Supported Field Type

`@Extensions` 데코레이터는 다음 필드와 함께 사용할 수 있습니다.

-   `@ObjectType`
-   `@InputType`
-   `@Field`
-   `@Query`
-   `@Mutation`
-   `@FieldResolver`

---

### Reserved Property

`extensions`은 `complexity`라는 프로퍼티가 예약되어 있습니다. 쿼리의 복잡도를 계산하는데 사용됩니다. 쿼리 복잡도 챕터에서 자세하게 설명하겠습니다.
