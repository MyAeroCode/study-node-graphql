import {
    ClassType,
    ObjectType,
    Field,
    Int,
    Resolver,
    Query,
    buildSchemaSync,
} from "type-graphql";
import { ApolloServer } from "apollo-server";

function createPaginatedResponseClass<T>(TClass: ClassType<T>) {
    @ObjectType({ isAbstract: true })
    abstract class PaginatedResponseClass {
        @Field((type) => [TClass])
        items!: T[];

        @Field(() => Int)
        total!: number;

        @Field(() => Boolean)
        hasMore!: boolean;
    }
    return PaginatedResponseClass;
}

@ObjectType()
class Box {
    @Field(() => Int)
    value!: number;
}

@ObjectType()
class Cat {
    @Field(() => String)
    name!: string;
}

@ObjectType()
class PaginatedBoxResponse extends createPaginatedResponseClass(Box) {
    // Own Field.
    @Field(() => String)
    x!: string;
}

@ObjectType()
class PaginatedCatResponse extends createPaginatedResponseClass(Cat) {
    // Own Field.
    @Field(() => String)
    y!: string;
}

@Resolver()
class PaginatedResponseResolver {
    @Query(() => PaginatedBoxResponse)
    boxes(): PaginatedBoxResponse {
        return {
            items: [{ value: 1 }, { value: 2 }, { value: 3 }],
            total: 3,
            hasMore: false,
            x: "box",
        };
    }

    @Query(() => PaginatedCatResponse)
    cats(): PaginatedCatResponse {
        return {
            items: [{ name: "garfield" }, { name: "nyaong" }],
            total: 2,
            hasMore: false,
            y: "cat",
        };
    }
}

const schema = buildSchemaSync({ resolvers: [PaginatedResponseResolver] });

export const server = new ApolloServer({ schema });
