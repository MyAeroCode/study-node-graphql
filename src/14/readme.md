### Middleware

미들웨어는 `Resolver` 또는 `Field`에 부착할 수 있는 `resuable` 코드입니다. `express.js`와 매우 유사하게 작동합니다.

---

### Simple Middleware

`MiddlewareFn`을 구현하는 함수는 미들웨어로 작동될 수 있습니다. 필드값을 구하는데 걸린 시간을 계산하는 미들웨어를 작성해보겠습니다.

```ts
import { MiddlewareFn } from "type-graphql";

const ElapsedTime: MiddlewareFn = async (
    { root, args, context, info },
    next
) => {
    const srt = Date.now();
    const val = await next(); // execute field then extract.
    const end = Date.now();
    const elapsed = end - srt;
    console.log(`${info.parentType.name}.${info.fieldName} [${elapsed} ms]`);
    return val;
};
```

`@UseMiddleware`를 사용하여 부착할 수 있습니다.

```ts
@Resolver()
class MyResolver {
    @Query(() => Int)
    @UseMiddleware(ElapsedTime)
    getInt(): number {
        return 1;
    }
}

@ObjectType()
class MyObject {
    @Field(() => Int)
    @UseMiddleware(ElapsedTime)
    value(): number {
        return 1;
    }
}
```

<br/>

### Reusable Middleware

`MiddlewareFn`을 반환하는 팩토리 함수를 생성하고 이것을 호출하면, 재사용가능한 미들웨어가 만들어집니다. 중간결과를 낚아채고 `n`만큼 곱하여 반환하는 미들웨어를 만들어보겠습니다.

```ts
function Multiplier(n: number): MiddlewareFn {
    return async ({ root, args, context, info }, next) => {
        //
        // get value of field.
        const res = await next();

        //
        // guard.
        if (typeof res !== "number") {
            throw new Error(`Only numbers are allowed.`);
        }

        //
        // intercept result.
        const multiplied = Number(res) * n;
        return multiplied;
    };
}
```

이제 다음과 같이 다양한 `n`에 대해 재사용 할 수 있습니다.

```ts
@Resolver()
class MyResolver {
    @Query(() => Int)
    @UseMiddleware(Multiplier(7))
    getInt(): number {
        //
        // will return 14
        return 2;
    }
}
```

<br/>

### Class-Based Middleware

미들웨어의 로직이 복잡하다면 클래스의 형태로 설계하는 것을 고려해보세요. `MiddlewareInterface<ContextType>`을 상속받는 클래스를 만들면 됩니다. 단, `constructor`에 데이터를 넘기기 위해서는 `typedi`를 사용해야 합니다.

```ts
//
// 컨테이너에 로그파일 이름을 저장한다.
Container.set({ id: "filename", factory: () => "my-log" });

//
// 클래스 형태의 미들웨어
class Logger implements MiddlewareInterface<any> {
    constructor(
        //
        // 컨테이너에서 로그파일 이름이 주입된다.
        @Inject("filename")
        private readonly fileName: string
    ) {}

    async use({ context, info }: ResolverData<any>, next: NextFn) {
        const rightnow = Date.now();
        const fullname = info.parentType.name + "." + info.fieldName;
        const logMessage = `${rightnow}:${fullname}\n`;
        const logPath = `./${this.fileName}.log`;
        appendFileSync(logPath, logMessage);
        return next();
    }
}

//
// 스키마를 빌드할 때 container도 함께 넘겨야 합니다.
const schema = buildSchemaSync({
    resolver: [...],

    //
    // For IoC.
    container: Container,
});
```

---

### Attach

##### 명시적으로 부착

`@UseMiddleware`는 3가지 스타일을 지원합니다.

```ts
//
// middleware[] 형태로 다중 미들웨어 부착.
@UseMiddleware([A, B, C])

//
// ...middleware 형태로 다중 미들웨어 부착.
@UseMiddleware(A, B, C)

//
// 단일 미들웨어 부착
@UseMiddleware(A)
```

<br/>

##### 전역으로 부착

`buildSchema`에 `{globalMiddlewares: []}` 옵션을 함께 넘기면, 미들웨어를 전역으로 부착할 수 있습니다. 모든 필드에서 해당 미들웨어가 함께 실행됩니다.

```ts
const schema = buildSchemaSync({
    resolvers: [MiddlewareResolver],

    //
    // Global Middleware List.
    globalMiddlewares: [ElapsedTime],
});
```
