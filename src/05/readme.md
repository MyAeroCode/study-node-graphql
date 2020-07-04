### Inheritance

상속을 사용하여 `TypeGraphQL`에서 각 `Type`을 확장하는 방법에 대해 공부합니다. 아래의 3가지 관점에서 살펴봅니다.

-   일반 클래스 상속
-   추상 클래스 상속
-   오버라이딩

---

### 일반 클래스 상속

평범하게 `extends`를 사용하면 기존 타입에서 확장할 수 있습니다.

```ts
@ObjectType()
class Point2D {
    @Field(() => Int)
    x!: number;

    @Field(() => Int)
    y!: number;
}

@ObjectType()
class Point3D extends Point2D {
    @Field(() => Int)
    z!: number;
}
```

위의 코드의 결과로 다음 스키마가 생성됩니다.

```ddl
type Point2D {
  x: Int!
  y: Int!
}

type Point3D {
  x: Int!
  y: Int!
  z: Int!
}
```

위와 같은 스타일로 아래의 타입들을 확장할 수 있습니다. 단, 동일 타입에 대해서만 `extends` 할 수 있다는 것을 기억해주세요.

-   `ObjectType`
-   `InputType`
-   `ArgsType`
-   `Resolver`

---

### 추상 클래스 상속

추상 클래스는 일반적으로 `OutputType`에 대해서만 사용하기 때문에 `InputType`과 `Resolver`에 대해서는 생각하지 않겠습니다. 즉, 아래의 타입에 대해서만 생각해보겠습니다.

-   `ObjectType`

<br/>

먼저 정수형 데이터를 보관하고, 특정 로직으로 `map()`을 수행하는 오브젝트 타입을 정의하겠습니다. `TypeScript`에서는 `Abstract Method`에 데코레이터를 사용할 수 없기 때문에 `getMapped()`를 별도로 만들어 사용했습니다.

```ts
@ObjectType()
abstract class DataMapper {
    protected items: number[] = [];

    //
    // 아직 결정되지 않음.
    // 추상 메소드에는 데코레이터를 사용할 수 없음.
    abstract map(): number[];

    @Field(() => [Float])
    getMapped(): number[] {
        return this.map();
    }
}
```

여기서 `DataMapper`를 상속받아 `TwiceMapper`와 `HalfMapper`를 구현합니다. `getMapped()`는 부모 클래스에서 얻어오기 때문에 괜찮습니다.

```ts
@ObjectType()
class TwiceMapper extends DataMapper {
    constructor() {
        super();
        this.items = [1, 2, 3, 4, 5];
    }

    map() {
        return this.items.map((v) => v * 2);
    }
}

@ObjectType()
class HalfMapper extends DataMapper {
    constructor() {
        super();
        this.items = [1, 2, 3, 4, 5];
    }

    map() {
        return this.items.map((v) => v * 0.5);
    }
}
```

위의 코드의 결과로 다음 스키마가 생성됩니다.

```ddl
type DataMapper {
  getMapped: [Float!]!
}

type TwiceMapper {
  getMapped: [Float!]!
}

type HalfMapper {
  getMapped: [Float!]!
}
```

---

### 오버라이딩

일반 클래스를 상속하고 부모의 `Field`를 오버라이딩 할 수 있습니다. 먼저, 2개의 숫자를 받아 어떤 연산을 수행하는 오브젝트를 생성해보겠습니다.

```ts
@ObjectType()
class BinaryOperatorObject {
    @Field(() => String)
    operatorName(): string {
        throw new Error("'operatorName()' not implemented.");
    }

    @Field(() => Float)
    exec(
        @Arg("a", () => Int) a: number,
        @Arg("b", () => Int) b: number
    ): number {
        throw new Error("'exec()' not implemented.");
    }
}
```

그리고, 다음과 같이 `AdderObject`와 `SubtractorObject`를 정의합니다. 이 때, 한 쪽에는 `exec`위에 `@Field()`를 달아놓고, 나머지 한 쪽에는 달지 않겠습니다.

```ts
@ObjectType()
class AdderObject extends BinaryOperatorObject {
    operatorName(): string {
        return "add";
    }

    exec(a: number, b: number): number {
        return a + b;
    }
}

@ObjectType()
class SubtractorObject extends BinaryOperatorObject {
    operatorName(): string {
        return "subtract";
    }

    @Field(() => Float) // Wrong usage.
    exec(a: number, b: number): number {
        return a - b;
    }
}
```

위의 코드의 결과로 다음 스키마가 생성됩니다.

```ddl
type BinaryOperatorObject {
  operatorName: String!
  exec(a: Int!, b: Int!): Float!
}

type AdderObject {
  operatorName: String!
  exec(a: Int!, b: Int!): Float!
}

type SubtractorObject {
  operatorName: String!
  exec: Float!
}
```

<br/>

스키마를 보면 `AdderObject`와 `SubtractorObject`의 차이점이 확연하게 드러납니다. `@Field()`를 사용하지 않았던 `AdderObject`는 부모의 `Field`를 그대로 가져온 반면에, `@Field()`를 다시 사용한 `SubtractorObject`는 부모에서 정의한 `@Arg` 데코레이터가 손실되었죠.

<br/>

만약 부모가 사용한 정의를 그대로 적용해야 한다면, 자식에서는 데코레이터를 명시적으로 다시 적지 말아야 합니다.
