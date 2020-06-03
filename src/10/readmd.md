### UnionType

`TypeGraphQL`에서 `Union`을 생성하는 방법을 공부합니다.

---

### Union 이란?

`Union`이란 어떤 값이 가질 수 있는 `Type`들의 모임입니다. 예제로 `영화 검색 API`를 생각해보겠습니다. 이 API는 이름을 인자로 받아, 해당 이름과 일치하는 `Movie` 또는 `Character`를 반환합니다. `TypeScript` 문법으로 생각하면 다음과 같습니다.

```ts
function search(name: string): Movie | Character {
    ...
}
```

---

### Union 생성하기

먼저 `UnionType`을 만들기에 앞서, 먼저 `Movie`와 `Character`를 정의하겠습니다.

```ts
@ObjectType()
class Movie {
    @Field(() => String)
    name!: string;

    @Field(() => Float)
    @Min(0.0)
    @Max(5.0)
    rating!: number;
}

@ObjectType()
class Character {
    @Field(() => String)
    name!: string;

    @Field(() => Int)
    @Min(0)
    age!: number;
}
```

그 다음 `createUnionType()`에 전달하여 `UnionType`을 생성하고, 그 결과를 타입처럼 사용할 수 있습니다.

```ts
import { createUnionType } from "type-graphql";

const SearchResult = createUnionType({
    name: "SearchResult",
    types: () => [Movie, Character],
});
```

```ts
@Resolver()
class UnionResolver {
    @Query(() => SearchResult, { nullable: true })
    search(@Arg("name", () => String) name: String) {
        if (name === "Gone With the Wind") {
            const movie: Movie = {
                name: "Gone With the Wind",
                rating: 5,
            };
            return Object.assign(new Movie(), movie);
        }
        if (name === "Doraemon") {
            const character: Character = {
                name: "Doraemon",
                age: 11,
            };
            return Object.assign(new Character(), character);
        }
        return null;
    }
}
```

---

### 타입 결정

위의 리졸버에서는 `new` 연산자로 생성된 객체를 반환했기 때문에 `클래스 정보`가 객체에 포함되어 있습니다. `TypeGraphQL`은 이것을 사용하여 `Union`의 정확한 타입을 결정합니다.

<br/>

반면에 단순한 `Object`를 반환한다면, 여기에는 클래스 정보가 없기 때문에, `resolveType()`을 명시적으로 전달하여, `Union`의 정확한 타입을 결정할 수 있도록 해야 합니다.

```ts
const SearchResult = createUnionType({
    name: "SearchResult",
    types: () => [Movie, Character],
    resolveType: (value) => {
        if ("rating" in value) return Movie;
        if ("age" in value) return Character;
    },
});
```
