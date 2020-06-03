### EnumType

`TypeGraphQL`에서 열거형을 사용하는 방법을 공부합니다.

---

##### 1. 열거형 생성하기

먼저 `TypeScript`로 `Enum`을 생성합니다.

```ts
//
// implicit value 0, 1, 2, 3
enum CounterCommand {
    UP, // 0
    DOWN, // 1
}

//
// or explicit values
enum CounterCommand {
    UP = "up",
    DOWN = "down",
}
```

<br/>

##### 2. 열거형 등록하기

열거형을 `GraphQL`에 등록합니다.

```ts
import { registerEnumType } from "type-graphql";

registerEnumType(CounterCommand, {
    name: "CounterCommand",
    description: "카운터 명령어", // optional
});
```

위의 코드의 결과로 다음 스키마가 생성됩니다.

```ddl
enum CounterCommand {
  UP
  DOWN
}
```

<br/>

##### 3. 열거형 사용하기

이후로는 일반 타입처럼 열거형을 사용할 수 있습니다.

```ts
@Resolver()
class CounterResolver {
    private cnt: number = 0;

    @Mutation(() => Int)
    //                                 v
    count(@Arg("command", () => CounterCommand) command: CounterCommand) {
        switch (command) {
            case CounterCommand.UP: {
                this.cnt++;
                break;
            }
            case CounterCommand.DOWN: {
                this.cnt--;
                break;
            }
            default: {
                throw new Error(`Unknown command : ${command}`);
            }
        }
        return this.cnt;
    }
}
```

<br/>

쿼리에서는 다음처럼 사용할 수 있습니다.

```gql
query {
    count(command: UP)
}
```
