import Container, { Inject, Service } from "typedi";
import { Key } from "./data";
import {
    Resolver,
    Query,
    ObjectType,
    Field,
    Int,
    FieldResolver,
    Arg,
} from "type-graphql";

@ObjectType()
class Stack {
    array!: number[];

    @Field(() => Int, { nullable: true })
    top!: number;

    @Field(() => Stack)
    pop!: Stack;

    @Field(() => Stack)
    push!: Stack;
}

@Service()
class StackService {
    constructor(
        @Inject(Key.ARRAY)
        private readonly array: number[]
    ) {
        //
        //
    }

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
