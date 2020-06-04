import { Resolver, Query, Int } from "type-graphql";
import Container, { Inject } from "typedi";
import { Key } from "./data";
import { deepStrictEqual, equal, notEqual } from "assert";

@Resolver()
export class DataResolver {
    constructor(
        @Inject(Key.ARRAY)
        private readonly injectedField: number[],

        @Inject(Key.ARRAY)
        injectedArg: number[]
    ) {
        const injectedVar = Container.get(Key.ARRAY);
        equal(this.injectedField, injectedArg);
        deepStrictEqual(injectedVar, injectedArg);
    }

    @Query(() => [Int])
    getArray(): number[] {
        const injectedVar = Container.get(Key.ARRAY);
        notEqual(this.injectedField, undefined);
        deepStrictEqual(this.injectedField, injectedVar);
        return this.injectedField;
    }
}
