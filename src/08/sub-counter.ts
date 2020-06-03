import {
    registerEnumType,
    Resolver,
    Query,
    Int,
    Arg,
    Mutation,
    Subscription,
    Root,
    PubSub,
    PubSubEngine,
} from "type-graphql";

//
// implicit value 0, 1, 2, 3
// or explicit values
enum CounterCommand {
    UP = "up",
    DOWN = "down",
}

registerEnumType(CounterCommand, {
    name: "CounterCommand",
    description: "카운터 명령어", // optional
});

@Resolver()
export class CounterResolver {
    private cnt: number = 0;

    @Mutation(() => Int)
    async count(
        @Arg("command", () => CounterCommand) command: CounterCommand,
        @PubSub() pubsub: PubSubEngine
    ) {
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

        //
        // 카운터가 2의 배수가 된다면 "even" 이벤트를 배포.
        // 데이터(cnt)도 함께 넘긴다.
        if (this.cnt % 2 === 0) {
            const topic: string = "even";
            await pubsub.publish(topic, this.cnt);
        }
        return this.cnt;
    }

    @Subscription(() => Int, {
        topics: "even",
        filter: ({ payload }) => {
            const enabled = payload % 4 !== 0;
            return enabled;
        },
    })
    subscribeEven(@Root() cnt: number): number {
        return cnt;
    }

    @Query(() => String)
    hello(): string {
        return "world!";
    }
}
