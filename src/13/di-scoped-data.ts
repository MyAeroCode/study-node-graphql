import { Resolver, Query, Int, Float } from "type-graphql";
import { Inject } from "typedi";
import { Key } from "./data";

@Resolver()
export class ScopedDataResolver {
    @Inject(Key.FLOAT)
    injectedField!: number;

    @Query(() => Float)
    getFloat(): number {
        this.injectedField += 1;
        return this.injectedField;
    }
}
