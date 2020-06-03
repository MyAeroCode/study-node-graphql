import {
    registerEnumType,
    Resolver,
    Query,
    Int,
    Arg,
    buildSchemaSync,
    Mutation,
} from "type-graphql";
import { ApolloServer } from "apollo-server";

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
class CounterResolver {
    private cnt: number = 0;

    @Mutation(() => Int)
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

    @Query(() => String)
    hello(): string {
        return "world!";
    }
}

const schema = buildSchemaSync({
    resolvers: [CounterResolver],
    validate: false,
});

export const server = new ApolloServer({ schema });
