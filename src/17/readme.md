### Custom Decorator

`Middleware`도 코드를 재사용할 수 있는 강력한 기능이지만, 유연한 확장을 위해 `Custom Decorator`도 사용할 수 있습니다. `method` 또는 `parameter`에 적용할 수 있습니다.

<br/>

다음 예제로부터 시작해봅시다. `[min, max)` 사이의 랜덤한 정수를 하나 얻어오는 코드입니다.

```ts
@Resolver()
class RandomIntegerGeneratorResolver {
    /**
     * get random integer from [min, max)
     */
    @Query(() => Int)
    getRandomInteger(
        @Arg("min", () => Int) min: number,
        @Arg("max", () => Int) max: number
    ): number {
        const generatedRandom = Math.floor(Math.random() * (max - min) + min);
        console.log("generated random", generatedRandom);
        return generatedRandom;
    }
}
```

---

### Method Decorator

`Reusable Middleware`와 매우 유사합니다. `args`를 받고, `next()`로 값을 얻거나, 임의의 값으로 대체시킬 수 있죠.

<br/>

##### 인자 유효성 검사

먼저 위의 코드에서 인자의 유효성을 검사하는 데코레이터를 만들어봅시다. 범위는 `[min, max)`이기 때문에 `max`는 항상 `min`보다 커야합니다.

```ts
import { createMethodDecorator } from "type-graphql";

function ValidateArg(): MethodDecorator {
    return createMethodDecorator(async ({ args }, next) => {
        console.log("[call] validateArg");
        if (args.max <= args.min) {
            throw new Error(`max must be greater than min.`);
        }
        return next();
    });
}
```

<br/>

##### 결과값 대체

또는 결과값을 중간에 낚아챌 수 있습니다. 결과값이 짝수라면 에러를 발생시키고, 홀수라면 1000을 더하여 반환합니다.

```ts
import { createMethodDecorator } from "type-graphql";

function ErrorIfEven(): MethodDecorator {
    return createMethodDecorator(async ({ args }, next) => {
        console.log("[call] errorIfEven");
        const num = await next();
        if (num % 2 === 0) {
            throw new Error(`even error.`);
        } else {
            return num + 1000;
        }
    });
}
```

<br/>

##### 실행 순서

여러개의 데코레이터가 쓰인 경우 `위에서 아래로` 실행됩니다.

```ts
@Resolver()
class RandomIntegerGeneratorResolver {
    /**
     * get random integer from [srt, end)
     */
    @ValidateArg()
    @ErrorIfEven()
    @Query(() => Int)
    getRandomInteger(
        @Arg("min", () => Int) min: number,
        @Arg("max", () => Int) max: number
    ): number {
        const generatedRandom = Math.floor(Math.random() * (max - min) + min);
        console.log("generated random", generatedRandom);
        return generatedRandom;
    }
}
```

```ts
[example output]
    [call] validateArg
    [call] errorIfEven
    generated random 1005
```

---

### Parameter Decorator

얼핏보면 `Method Decorator`나 `Middleware`와 비슷한 것 같지만 `Parameter Decorator`는 인자에 값을 주입할 수 있습니다.

```ts
import { createParamDecorator } from "type-graphql";

/**
 * inject random integer from [srt, end)
 */
function InjectRandomNumber(min: number, max: number): ParameterDecorator {
    return createParamDecorator(({ root, args, context, info }) => {
        return Math.floor(Math.random() * (max - min) + min);
    });
}
```

이제 `getRandomInteger`에 새로운 파라미터를 만들고, 여기에 난수를 주입하겠습니다.

```ts
@Resolver()
class RandomIntegerGeneratorResolver {
    /**
     * get random integer from [srt, end)
     */
    @Query(() => Int)
    getRandomInteger(
        @Arg("min", () => Int) min: number,
        @Arg("max", () => Int) max: number,
        @InjectRandomNumber(50, 100) injectedRandom: number
    ): number {
        const generatedRandom = Math.floor(Math.random() * (max - min) + min);
        console.log("injected random", injectedRandom);
        console.log("generated random", generatedRandom);
        return generatedRandom;
    }
}
```
