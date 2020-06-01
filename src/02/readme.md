### DataTypes

`TypeGraphQL`에서 다양한 `DataType`을 사용합니다.

---

### Primitive Types

`GraphQL`에서 사용되는 기본 자료형입니다.

```ts
@ObjectType()
class PrimitiveTypes {
    //
    // Int!
    @Field(() => Int)
    intValue(): number {
        //
        // A signed 32-bit integer.
        return 123;
    }
}
```

<br/>

##### 기본 타입

| type    | desc                                                                                                                                                                                                          |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Int     | 부호화된 `32bit` 정수입니다.                                                                                                                                                                                  |
| Float   | `IEEE754`로 알려진 배정밀도 부동 소수점입니다. 해당 표현에서 유효숫자에 할당된 비트 수는 `53`개 이므로, 가장 안전하게 저장할 수 있는 큰 숫자는 `2**53-1`입니다.                                               |
| String  | `UTF-8` 문자의 배열입니다.                                                                                                                                                                                    |
| Boolean | `true` 또는 `false`입니다.                                                                                                                                                                                    |
| ID      | 각 오브젝트를 유일하게 식별할 수 있는 `Key`값 입니다. 어떤 데이터를 다시 가져오는데 사용됩니다. 내부적으로 `String`으로 직렬화되어 표현되지만, 사람이 편하게 읽을 수 있는 문자열은 아닙니다. ex) `ek54nakq72` |

<br/>

##### ID 필드는 자동적으로 할당되지 않는다.

위의 설명만 읽어보면 `ID` 타입의 값은 오브젝트마다 자동적으로 부여되는 것 처럼 보이지만, `ID` 값도 프로그래머가 직접 `Resolve`해야 사용할 수 있습니다. 내부적으로 살펴보면 `ID`와 `String`은 다를바가 없기 때문에 `String`을 써도 상관 없습니다. 하지만 명시적으로 `ID` 타입을 사용하면 `이 필드는 식별자야!`라는 문맥을 전달할 수 있습니다.

<br/>

##### Nullable Field

해당 필드가 `null`을 반환할 수 있다면 `Field` 데코레이터에 `{nullable: true}`를 함께 넘겨주면 됩니다. 아래 필드는 각각 `50%`의 확률로 `null` 또는 `Int`를 반환합니다.

```ts
@ObjectType()
class PrimitiveTypes {
    //
    // Int
    @Field(() => Int, { nullable: true })
    nullableIntValue(): number | null {
        return Math.random() < 0.5 ? null : Math.floor(Math.random() * 100);
    }
}
```

---

### Array Type

`[Int]`처럼 자료형을 대괄호로 감싸면 됩니다.

```ts
@ObjectType()
class ArrayType {
    //
    // [Int!]!
    @Field(() => [Int])
    list(): number[] {
        return [1, 2, 3, 4, 5];
    }
}
```

<br/>

##### Nullable Array

`List` 또는 `Item`에 각각 `nullable`을 지정할 수 있습니다.

-   `List` only

데코레이터에 `{ nullable: true }`를 넘깁니다.

```ts
@ObjectType()
class ArrayType {
    //
    // [Int!]
    @Field(() => [Int], { nullable: true })
    nullableList(): number[] | null {
        return Math.random() < 0.5 ? null : [1, 2, 3, 4, 5];
    }
}
```

<br/>

-   `Item` only

데코레이터에 `{ nullable: "items" }`를 넘깁니다.

```ts
@ObjectType()
class ArrayType {
    //
    // [Int]!
    @Field(() => [Int], { nullable: "items" })
    nullableItemsList(): (number | null)[] {
        return [null, 2, 3, 4, 5];
    }
}
```

<br/>

-   `Both`

데코레이터에 `{ nullable: "itemsAndList" }`를 넘깁니다.

```ts
@ObjectType()
class ArrayType {
    //
    // [Int]
    @Field(() => [Int], { nullable: "itemsAndList" })
    nullableItemsAndList(): (number | null)[] | null {
        return Math.random() < 0.5 ? null : [null, 2, 3, 4, 5];
    }
}
```

---

### User-Defined Type

`ObjectType`으로 데코레이트된 클래스는 `Type`으로도 사용할 수 있습니다. `List`와 함께 사용할 수 있고, `{nullable: ???}`도 사용할 수 있습니다.

```ts
@ObjectType()
class UserDefinedType {
    //
    // PrimitiveTypes!
    @Field(() => PrimitiveTypes)
    primitive(): PrimitiveTypes {
        return new PrimitiveTypes();
    }

    //
    // ArrayType!
    @Field(() => ArrayType)
    array(): ArrayType | null {
        return new ArrayType();
    }
}
```
