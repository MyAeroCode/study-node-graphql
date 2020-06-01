### Input, Args, Scalar

`TypeGraphQL`에서 인자를 받는 방법을 알아보고, 내친김에 `Custom Scalar`도 만들어봅니다.

---

### Input, Output

`GraphQL`에서 객체는 크게 2개로 분류됩니다.

-   `InputType` : 사용자에게 데이터를 `받을 때` 사용.
-   `OutputType` : 사용자에게 데이터를 `보낼 때` 사용.

<br/>

앞서 사용했던 `ObjectType`가 대표적인 `OutputType`이죠.

---

### Input, Args

`TypeGraphQL`은 `@InputType`과 `@ArgsType`을 사용하여 데이터 입력을 처리하고 있습니다. 어느 쪽을 사용해도 상관없지만, 약간의 차이점은 있습니다.

<br/>

##### InputType

`@InputType`은 실제로 `GraphQLInputType`을 생성하고 `flat`되지 않은 입력을 받는데 사용합니다. 함수 파라미터에 `@Arg(인자이름, ()=>타입)`을 사용합니다.

```ts
@InputType()
class PositionInput {
    @Field(() => Float)
    x!: number;

    @Field(() => Float)
    y!: number;

    @Field(() => Float)
    z!: number;
}

@Resolver()
class QueryResolver {
    @Query(() => String)
    echo(@Arg("position", () => PositionInput) pos: PositionInput): string {
        return `(${pos.x}, ${pos.y}, ${pos.z})`;
    }
}
```

```gql
qeury {
    echo (position: { x:1, y:5, z:999 })
}
```

<br/>

##### ArgsType

반면에 `@ArgsType`은 `TypeGraphQL`에서 지원하는 문법설탕입니다. `virtual`이기 때문에 실제 `GraphQLInputType`이 생성되지는 않으며, 각각의 필드를 `flatten` 합니다. 함수 파라미터에 `@Args(()=>타입)`을 사용합니다.

```ts
@ArgsType()
class PositionArgs {
    ...
}

@Resolver()
class QueryResolver {
    @Query(() => String)
    echo(@Args(() => PositionInput) pos: PositionInput): string {
        return `(${pos.x}, ${pos.y})`;
    }
}
```

```gql
query {
    echo(x: 1, y: 5, z: 999)
}
```

<br/>

##### both

둘 다 한꺼번에 적용할 수 있습니다.

```ts
@ArgsType()
@InputType()
class PositionArgsInput {
    ...
}
```

---

### Ways to get data from client

사용자가 `GQL`에서 사용되는 데이터를 전달하는 방법은 2가지가 있습니다.

-   `literal` : `Query`에 데이터를 삽입
-   `input-variables` : `Request Header`에 데이터를 삽입

<br/>

##### literal

쿼리에 직접 데이터를 삽입하는 방식입니다.

```gql
query($a: Int! = 1, $b: Int! = 17, $c: Int! = 255) {
    func(a: $a, b: $b, c: $c) {
        error
        data
    }
}
```

Request를 보면 이런 느낌입니다.

```ts
{
    body : `
        query($a: Int! = 1, $b: Int! = 16, $c: Int! = 256) {
            func(a: $a, b: $b, c: $c) {
            error
            data
            }
        }
    `,

    header : {

    }
}
```

<br/>

##### input-variables

데이터를 요청 헤더에 삽입하는 방식입니다. 쿼리문 구조는 `literal`와 거의 비슷하지만 데이터가 직접 나오지 않습니다. `r, g, b`를 요청 헤더에 삽입해야 합니다.

```gql
query($a: Int!, $b: Int!, $c: Int!) {
    func(a: $a, b: $b, c: $c) {
        error
        data
    }
}
```

Request를 보면 이런 느낌입니다.

```ts
{
    body : `
        query($a: Int!, $b: Int!, $c: Int!) {
            func(a: $a, b: $b, c: $c) {
            error
            data
            }
        }
    `,

    header : {
        a: 1,
        b: 16,
        c: 256
    }
}
```

---

### Scalar

필요하다면 유저가 직접 `primitive type`을 만들어 사용할 수 있습니다. 여기서는 `RGB` 스칼라 타입을 만들어보겠습니다.

<br/>

##### 1. 내부표현, 외부표현(`String`) 생각하기

먼저 `RGB`를 어떻게 디자인할지 생각해야 합니다.
내부적인 표현은 `구현`, 외부적인 표현은 `직렬화`에 관련됩니다.

<br/>

먼저 내부적으로는 다음과 같이 디자인하겠습니다.

```ts
class RGB {
    r: number;
    g: number;
    b: number;

    toHex(): string;
    static fromHex(hex: string): RGB;
    static fromRGB(rgb: { r: number; g: number; b: number }): RGB;
}
```

<br/>

외부적인 표현으로는 `hex`표현식을 사용하겠습니다.

```ts
(r: 0, g: 15, b: 255) => "#000fff";
```

<br/>

##### 2. 스칼라 생성하기

```ts
import { GraphQLScalarType, ValueNode, Kind } from "graphql";

class RGB {
    ...
}

const RGBScalarType = new GraphQLScalarType({
    //
    // 클래스 명과 동일하지 않아도 괜찮습니다.
    name: "RGB",
    description: "My RGB Scalar Type.",

    /**
     * input-variables에서 인자를 받아 RGB를 생성한다.
     */
    parseValue(value: string): RGB {
        return RGB.fromHex(value);
    },

    /**
     * literal에서 인자를 받아 RGB를 생성한다.
     */
    parseLiteral(ast: ValueNode): RGB {
        if (ast.kind === Kind.STRING) {
            //
            // 문자열 literal인 경우.
            return RGB.fromHex(ast.value);
        }
        throw new Error(`문자열만 허용됩니다.`);
    },

    /**
     * RGB를 문자열로 직렬화한다.
     */
    serialize(value: RGB): string {
        return value.toHex();
    },
});
```

<br/>

##### 3. 스칼라 등록하기

스키마를 빌드할 때 `scalarsMap`에 `실제 클래스`와 `스칼라 타입`을 넘깁니다. 이후로는 `Primitive` 자료형처럼 사용할 수 있습니다.

```ts
const schema = buildSchemaSync({
    resolvers: [...],
    scalarsMap: [{ type: RGB, scalar: RGBScalarType }],
});
```
