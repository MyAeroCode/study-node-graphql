### Dependency Injection

의존성 주입은 강하게 결합된 요소들을 `decoupling` 하는데 매우 효과적인 패턴입니다. 여기서는 `typedi`를 사용하여 `Inversion of Control(IoC)`를 구현하는 방법을 공부합니다.

---

### IoC

세부 구현의 종속에서 벗어나는 것을 `의존성 역전(Inversion of Control)`이라고 합니다. 숫자 배열에서 `어떤 전략에 따라` 원소의 인덱스를 찾는 클래스를 생각해보겠습니다.

```ts
class SearchBox {
    constructor(private readonly array: number[]) {
        //
        //
    }

    //
    // 전략 번호가 0이면 정순으로 찾는다.
    // 전략 번호가 1이면 역순으로 찾는다.
    search(target: number, strategyNumber: number): number {
        let strategy: (array: number[], target: number) => number;

        //
        // 전략을 결정한다.
        if (strategyNumber === 0) {
            strategy = (array, target) => {
                return array.indexOf(target);
            };
        }

        if (strategyNumber === 1) {
            strategy = (array, target) => {
                return array.lastIndexOf(target);
            };
        }

        //
        // 해당 전략으로 원소를 찾는다.
        if (!strategy) throw new Error("No such strategy.");
        return strategy(this.array, target);
    }
}
```

문제는 `SearchBox`가 `strategy`를 너무 자세하게 알고있기 때문에 발생합니다. 만약 전략이 추가되거나 제거되면 `SearchBox`의 코드를 수정해야 하죠. `상위 요소(SearchBox)`가 `하위 요소(strategy)`에 종속되었기 때문입니다.

<br/>

문제를 해결하는 방법은 단순합니다. 외부에 별도의 `Container`를 생성하면 됩니다.

```ts
//
// strategy-container.ts
const strategyContainer: Map<
    number,
    (array: number[], target: number) => number
> = new Map();

//
// 정순으로 찾는 전략.
strategyContainer.set(0, (array, target) => {
    return array.indexOf(target);
});

//
// 역순으로 찾는 전략.
strategyContainer.set(0, (array, target) => {
    return array.lastIndexOf(target);
});
```

이제 `SearchBox`는 외부(`strategyContainer`)에서 전략을 찾을 수 있습니다.

```ts
//
// search-box.ts
class SearchBox {
    constructor(private readonly array: number[]) {
        //
        //
    }

    search(target: number, strategyNumber: number): number {
        //
        // 외부에서 전략을 찾는다.
        const strategy = strategyContainer.get(strategyNumber);

        //
        // 해당 전략으로 원소를 찾는다.
        if (!strategy) throw new Error("No such strategy.");
        return strategy(this.array, target);
    }
}
```

이제 `SearchBox`는 하위 요소인 `strategy`와 완벽하게 분리되었기 때문에, 새로운 전략이 추가되거나 삭제되어도 더 이상 `SearchBox`를 수정하지 않아도 됩니다. 이것을 의존성 역전(`IoC`)라고 합니다.

---

### DI (Dependency Injection)

위의 코드에서는 `SearchBox`가 스스로 전략을 찾아서 사용했지만, 클래스 외부에서 누군가가 전략을 할당해줄 수 있습니다. 아래의 코드는 `SearchBox`가 전략을 결정하지 않습니다.

```ts
class SearchBox {
    constructor(private readonly array: number[]) {
        //
        //
    }

    //
    // 사용할 전략
    strategy!: (array: number[], target: number) => number;

    //
    // 해당 전략으로 요소의 위치를 검색한다.
    search(target: number, strategyNumber: number): number {
        return this.strategy(this.array, target);
    }
}

const searchBox = new SearchBox([1, 2, 3, 2, 1]);
searchBox.strategy = ...; // 외부에서 주입.
searchBox.search(2);
```

이렇게 `SearchBox`가 의존하고 있는 요소인 `strategy`를 외부에서 주입하는 것을 `의존성 주입(Dependency Injection)`이라고 합니다.

---

### typedi

`typedi`는 의존성 주입을 위한 프레임워크입니다. `Map<any, any>` 처럼 사용할 수 있는 `Container`에 데이터를 저장하고 꺼내옵니다. 여기서는 간단한 사용방법만 설명합니다.

<br/>

##### 데이터 쓰기

`typedi`에 있는 컨테이너에 `key`를 사용하여 데이터를 쓰고, 다시 동일한 `key`를 사용하여 데이터를 꺼냅니다.

```ts
import { Container } from "typedi";

const pi = 3.14159;

//
// 컨테이너에 데이터 저장.
Container.set({ id: "my_float", factory: () => pi });

//
// 컨테이너에서 데이터 불러오기.
Container.get("my_float");
```

<br/>

##### 데이터 주입

컨테이너에 저장된 값을 `Class Field` 또는 `Constructor Argument`에 주입시킬 수 있습니다. 다만 `Class Field`은 생성자가 종료된 뒤에 주입되는 것에 주의해야 합니다.

```ts
Container.set({ id: "my_float", factory: () => 3.14159 });

class FloatBox {
    @Inject("my_float")
    injectedField!: number;

    constructor(
        @Inject("my_float")
        injectedArg: number
    ) {
        console.log(injectedField); // undefined;
        console.log(injectedArg); // 3.14159
    }

    getValue() {
        return this.injectedField; // 3.14159
    }
}
```

하지만, 다음과 같이 선언하면 바로 필드에 주입할 수 있습니다.

```ts
Container.set({ id: "my_float", factory: () => 3.14159 });

class FloatBox {
    constructor(
        @Inject("my_float")
        private readonly injectedField: number,

        @Inject("my_float")
        injectedArg: number
    ) {
        console.log(injectedField); // 3.14159;
        console.log(injectedArg); // 3.14159
    }

    getValue() {
        return this.injectedField; // 3.14159
    }
}
```

`@Inject`로 주입된 필드를 수정하면 `Container`에도 영향이 갑니다.

```ts
Container.set({ id: "my_float", factory: () => 3.14159 });

class FloatBox {
    constructor(
        @Inject("my_float")
        private readonly injectedField: number
    ) {
        //
        //
    }

    getValue() {
        this.injectedField; // 3.14159
        this.injectedField += 1; // 4.14159
        Container.get("my_float"); // 4.14159
    }
}
```

<br/>

##### 클래스 쓰기 (서비스 생성)

클래스 위에 `@Service` 데코레이터를 사용하면, 해당 클래스의 인스턴스가 컨테이너에 저장됩니다.

```ts
@Service()
class FloatBoxService {
    constructor(
        @Inject("my_float")
        private readonly injectedField: number
    ) {
        //
        //
    }

    hello(): string {
        return "world!";
    }
}
```

<br/>

##### 클래스 주입 (서비스 주입)

컨테이너에 있는 클래스를 오브젝트로 만들어 주입할 수 있습니다. 이 경우에는 `Key`값이 필요하지 않은데, `@Service`로 정의된 것들 중에서 클래스 타입이 일치하는 인스턴스를 주입하기 때문입니다.

```ts
class FloatBoxWorker {
    constructor(
        @Inject()
        private readonly injectedService: FloatBoxService
    ) {
        //
        //
        injectedService.hello(); // world!
    }
}
```

<br/>

##### etc...

더 자세한 기능은 [`typedi readme`](https://github.com/typestack/typedi)를 참조해주세요.

---

### typedi With TypeGraphQL

`typedi`은 `TypeGraphQL`과 함께 사용할 수 있습니다. 이 조합을 사용하여 `Stack`을 만들어보겠습니다.

<br/>

##### 스키마 구조 정의하기

먼저 `ObjectType`를 사용하여 클라이언트가 볼 스키마 구조를 정의합니다.

```ts
@ObjectType()
class Stack {
    array!: number[];

    @Field(() => Int, { nullable: true })
    top?: number;

    @Field(() => Stack)
    pop!: Stack;

    @Field(() => Stack)
    push!: Stack;
}
```

<br/>

##### 서비스 생성하기

위에서 정의한 `Stack`은 구조에 불과합니다. 해당 `Stack`의 기능을 구현하는 `Service`를 생성합니다. 아래의 코드가 `Stack`의 핵심입니다.

```ts
@Service()
class StackService {
    private readonly array: number[] = [];

    top(): number | undefined {
        return this.array[this.array.length - 1];
    }

    pop(): StackService {
        this.array.pop();
        return this;
    }

    push(n: number): StackService {
        this.array.push(n);
        return this;
    }
}
```

<br/>

##### 기본값 정의하기

`Injection with Key`를 사용하면 기본값도 주입할 수 있습니다.

```ts
@Service()
class StackService {
    constructor(
        @Inject("sample_array")
        private readonly array: number[]
    ) {
        //
        //
    }

    ...
}
```

<br/>

##### 스키마와 서비스 연결하기

`@Resolver(()=>Stack)`과 `@FieldResolver`를 사용하여 `Service`와 `ObjectType`를 연결합니다.

```ts
@Resolver((of) => Stack)
export class StackResolver {
    constructor(
        //
        // Search for a matching service in the container and inject it.
        private readonly service: StackService
    ) {
        //
        //
    }

    @FieldResolver(() => Int)
    top(): number | undefined {
        return this.service.top();
    }

    @FieldResolver(() => Stack)
    push(@Arg("n", () => Int) n: number) {
        return this.service.push(n);
    }

    @FieldResolver(() => Stack)
    pop() {
        return this.service.pop();
    }

    @Query(() => Stack)
    getStack() {
        return Container.get(StackService);
    }
}
```

<br/>

##### TypeGraphQL에 컨테이너 넘기기

컨테이너 정보를 `buildSchema`에 넘깁니다.

```ts
import Container from "typedi";

const schema = buildSchemaSync({
    resolvers: [DataResolver, ScopedDataResolver, StackResolver],
    container: Container,
});
```

---

### Selective Container

`Context`을 사용하면 `Container`를 동적으로 선택할 수 있습니다.

```ts
//
// 먼저 문맥을 넘깁니다.
export const server = new ApolloServer({
    schema,
    context: ({ req }): MyContext => {
        return {
            container_scope: req.headers.container_scope,
        };
    },
});

//
// "special" 컨테이너에 3.141592를 저장합니다.
Container.of("special").set({ id: Key.FLOAT, factory: () => 3.141592 });

//
// 문맥을 읽고, 특정 컨테이너를 기본값으로 사용합니다.
const schema = buildSchemaSync({
    resolvers: [DataResolver, ScopedDataResolver, StackResolver],
    container: ({ context }: ResolverData<MyContext>) => {
        if (context.container_scope) {
            return Container.of(context.container_scope);
        } else {
            return Container;
        }
    },
});

//
// "container_scope"가 "special"일 때만 주입이 성공적으로 이루어집니다.
// 그 외의 경우에 getFloat를 쿼리하면 null이 반환됩니다.
@Resolver()
export class ScopedDataResolver {
    @Inject(Key.FLOAT)
    injectedField!: number;

    @Query(() => Float)
    getFloat(): number {
        return this.injectedField;
    }
}
```
