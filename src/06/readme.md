### InterfaceType

`TypeGraphQL`에서 `Interface`를 다루는 방법을 공부합니다.

---

### 인터페이스 생성

아이러니하지만 `TypeGraphQL`에서 인터페이스는 `Abstract Class`를 정의됩니다. `TypeScript`의 명세에 의하면 `Interface`는 컴파일 시간에만 존재하기 때문입니다. 반면에 `Abstract Class`는 런타임 시간에도 실체가 유지되기 때문에 이것을 사용하여 인터페이스를 구현하게 됩니다.

```ts
@InterfaceType()
abstract class IBook {
    @Field(() => ID)
    isbn!: string;

    @Field(() => String)
    title!: string;

    @Field(() => String)
    author!: string;
}
```

위의 코드는 다음 스키마를 생성합니다.

```graphql
interface IBook {
    isbn: ID!
    title: String!
    author: String!
}
```

---

### 인터페이스 구현

`@ObjectType`에서 `{ implements: [IBook, ...] }` 형태로 인터페이스를 넘길 수 있습니다. 만약 구현할 인터페이스가 하나밖에 없다면 `{ implements: IBook }`도 허용됩니다.

##### 구현할 인터페이스가 여러개인 경우

```ts
//                           v
@ObjectType({ implements: [IBook] })
class TextBook implements IBook {
    //
    // Implemented.
    isbn!: string;
    title!: string;
    author!: string;

    //
    // Own.
    @Field(() => String)
    subject!: string;
}
```

##### 구현할 인터페이스가 하나인 경우

```ts
//                          v
@ObjectType({ implements: IBook })
class ComicBook implements IBook {
    //
    // Implemented.
    isbn!: string;
    title!: string;
    author!: string;

    //
    // Own.
    @Field(() => String)
    genre!: string;
}
```

---

### 객체 반환 & 타입 결정

이제 평소대로 리졸버를 작성하면 됩니다.

```ts
@Resolver()
class BookResolver {
    @Query(() => IBook)
    getRandomBook() {
        ...
    }
}
```

단, 주의해야 사항이 하나 있습니다. `PureObject`를 반환하는 경우에는 `resolveType()`이 명시적으로 구현되어야 한다는 것입니다. 먼저 아래와 같은 경우를 살펴봅시다.

```ts
@Resolver()
class BookResolver {
    @Query(() => IBook)
    getRandomBook() {
        const textBook: TextBook = Object.assign(new TextBook(), {
            isbn: "xxx-x-xx-xxxxxx-x",
            title: "지구과학Ⅱ",
            author: "xxx",
            subject: "geoscience",
        });

        const comicBook: ComicBook = Object.assign(new ComicBook(), {
            isbn: "yyy-y-yy-yyyyyy-y",
            title: "신의 탑",
            author: "yyy",
            genre: "fantasy",
        });

        //
        // Nothing is needed.
        return Math.random() < 0.5 ? textBook : comicBook;
    }
}
```

여기서 `textBook`과 `comicBook`는 `new` 연산자를 통해 생성되었기 때문에, 객체에 클래스 정보가 포함되어 있습니다. `TypeGraphQL`은 이것을 사용하여 `IBook`의 정확한 타입을 유추합니다.

<br/>

이번에는 다음 경우를 살펴보겠습니다.

```ts
@Resolver()
class BookResolver {
    @Query(() => IBook)
    getRandomBook() {
        const textBook: TextBook = {
            isbn: "xxx-x-xx-xxxxxx-x",
            title: "지구과학Ⅱ",
            author: "xxx",
            subject: "geoscience",
        };

        const comicBook: ComicBook = {
            isbn: "yyy-y-yy-yyyyyy-y",
            title: "신의 탑",
            author: "yyy",
            genre: "fantasy",
        };

        //
        // Nothing is needed.
        return Math.random() < 0.5 ? textBook : comicBook;
    }
}
```

여기서는 `textBook`과 `comicBook`에 클래스 정보를 가지고 있지 않습니다. 이런 경우에는 `TypeGraphQL`이 `IBook`의 정확한 타입을 유추할 수 없기 때문에, 프로그래머가 `@InterfaceType`에서 `resolveType()`을 명시적으로 구현해야 합니다. 여기서는 `subject`가 있다면 `TextBook`으로, `genre`가 있다면 `ComicBook`으로 결정하면 되겠군요.

```ts
@InterfaceType({
    resolveType: (value: any) => {
        if ("subject" in value) {
            // or return "TextBook"
            return TextBook;
        }
        if ("genre" in value) {
            // or return  "ComicBook"
            return ComicBook;
        }
    },
})
abstract class IBook {
    @Field(() => ID)
    isbn!: string;

    @Field(() => String)
    title!: string;

    @Field(() => String)
    author!: string;
}
```

---

### 인터페이스 구현 타입을 스키마에서 숨기기

`Interface`를 구현한 타입들은 자동적으로 스키마에 등록됩니다. 설녕 한번도 사용되지 않는 타입이라도 말이지요. 이런 문제를 해결하기 위해 `@InterfaceType()`에 `{ autoRegisterImplementations: false }` 옵션을 넘길 수 있습니다.

```ts
@InterfaceType({ autoRegisterImplementations : false })
abstract class IBook {
    ...
}

@ObjectType({ implements: [IBook] })
class TextBook implements IBook {
    ...
}

@ObjectType({ implements: IBook })
class ComicBook implements IBook {
    ...
}
```

이제 `buildSchema`에서 `orphanedTypes`를 통해 명시적으로 타입을 넘겨주지 않는 한 `schema`에 포함되지 않습니다. 예를 들어, 아래의 코드는 `ComicBook`을 제외하고 스키마를 생성합니다.

```ts
const schema = await buildSchema({
    orphanedTypes: [TextBook],
});
```
