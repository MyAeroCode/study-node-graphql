### Generic

`TypeGraphQL`에서 `Generic`을 사용하여 코드를 더욱 재사용하는 방법을 공부합니다.

---

### 베이스 클래스를 생성하는 제네릭 함수 만들기

아쉽게도 현재 `Generic Class`와 `Decorator`는 조화롭게 동작하지 않기 때문에 `특별한 패턴`을 사용하여 제네릭과 같은 효과를 얻어야 합니다. 구체적으로는 클래스 객체(`TClass`)를 명시적으로 넘겨서, 해당 클래스에 대한 `Base Class`를 반환하는 함수를 생성합니다.

```ts
function createPaginatedResponseClass<T>(TClass: ClassType<T>) {
    @ObjectType({ isAbstract: true })
    abstract class PaginatedResponseClass {
        @Field((type) => [TClass])
        items!: T[];

        @Field(() => Int)
        total!: number;

        @Field(() => Boolean)
        hasMore!: boolean;
    }
    return PaginatedResponseClass;
}
```

여기서 주목해야 할 것은 `{ isAbstract : true }` 옵션입니다. 이것은 해당 클래스가 스키마에 등록되지 않도록 방지하는데, `Base Class`가 스키마에 등록되면 곤란하기 때문에 필수로 적용해야 합니다... 하지만, 지금은 없어도 잘 동작하는 것을 보니 개선된 모양이네요. 그래도 알아두면 좋습니다.

---

### 베이스 클래스로 마구 찍어내기

`createPaginatedResponseClass<T>()`에서 얻은 `Base Class`를 사용하여 `Target Class`를 찍어낼 수 있습니다. 아래의 타입에 대한 `PaginatedResponse`를 생성하겠습니다.

```ts
@ObjectType()
class Box {
    @Field(() => Int)
    value!: number;
}

@ObjectType()
class Cat {
    @Field(() => String)
    name!: string;
}
```

이제 `Base Class`를 이용하여 `Target Class`를 찍어냅니다. 이 때, 고유 필드도 정의할 수 있습니다.

```ts
@ObjectType()
class PaginatedBoxResponse extends createPaginatedResponseClass(Box) {
    // Own Field.
    @Field(() => String)
    x!: string;
}

@ObjectType()
class PaginatedCatResponse extends createPaginatedResponseClass(Cat) {
    // Own Field.
    @Field(() => String)
    y!: string;
}
```

위의 코드는 다음 스키마를 생성합니다.

```graphql
type PaginatedBoxResponse {
    items: [Box!]!
    total: Int!
    hasMore: Boolean!
    x: String!
}

type PaginatedCatResponse {
    items: [Cat!]!
    total: Int!
    hasMore: Boolean!
    y: String!
}
```

위의 두 오브젝트는 `Base Class`의 구조만 같고 아무런 관련성은 없다는 것을 눈치채야 합니다. 애초에 `PaginatedResponse`가 스키마에 등록될 수 없기 때문에 `Interface`처럼 관리할 수 없습니다.

<br/>

따라서, 리졸버도 각각의 타입에 대해 별도로 정의해야 합니다.

```ts
@Resolver()
class PaginatedResponseResolver {
    @Query(() => PaginatedBoxResponse)
    boxes(): PaginatedBoxResponse {
        return ...
    }

    @Query(() => PaginatedCatResponse)
    cats(): PaginatedCatResponse {
        return ...
    }
}
```
