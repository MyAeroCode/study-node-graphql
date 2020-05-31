### Hello, Apollo!

`TypeGraphQL`의 `Decorator`를 사용하여 `Schema`를 생성합니다.

---

### Decorators

-   `ObjectType`
-   `Field`
-   `Resolver`
-   `Query`
-   `Mutation`

---

-   ##### ObjectType

클래스를 `GraphQL Object` 객체로 정의합니다.

```ts

@ObjectType()
class HelloObject {
    ...
}
```

-   ##### Field

`Object`로 정의된 클래스의 각 프로퍼티는 `Field`로 사용될 수 있습니다.
`(type) => String`은 해당 필드의 자료형이 `String!` 이라는 것을 가르킵니다.

```ts
@ObjectType()
class HelloObject {
    @Field((type) => String)
    hello_q!: string;
}
```

-   ##### Resolver

`Resolver`를 사용하여 `hello_q`의 값을 결정합니다.
`(of) => HelloObject`는 해당 리졸버가 `HelloObject`의 필드값을 결정할 것임을 가르킵니다.

```ts
@Resolver((of) => HelloObject)
class HelloObjectQueryResolver {
    @Query((type) => String)
    hello_q(): string {
        return "TypeGraphQL! on Query";
    }
}
```

-   ##### Query, Mutation

특정 `Field`를 `Query`나 `Mutation`의 진입점으로 정의합니다.
아래 쿼리문에서 `hello_q`가 쿼리의 진입점으로 사용된 것을 볼 수 있습니다.

```gql
query {
    hello_q
}
```

마찬가지로 `hello_m`은 뮤테이션의 진입점으로 사용할 수 있습니다.

```gql
mutation {
    hello_m
}
```

쿼리든 뮤테이션이든 `Field`이므로 그 본질은 같습니다. 단순히 `Entry Point`가 다른 것 뿐입니다.
