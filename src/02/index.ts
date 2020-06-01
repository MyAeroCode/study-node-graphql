import { ApolloServer } from "apollo-server";
import {
    buildSchemaSync,
    Resolver,
    ObjectType,
    Query,
    Int,
    Float,
    ID,
    Field,
} from "type-graphql";

@ObjectType()
class PrimitiveTypes {
    //
    // Int!
    @Field(() => Int)
    intValue(): number {
        //
        // A signed 32-bit integer.
        return 123;
    }

    //
    // Float!
    @Field(() => Float)
    floatValue(): number {
        //
        // A signed double-precision floating-point value.
        // aka IEEE754.

        //
        // Warning!
        // 2**53 + 3 is not safe.
        return 2 ** 53 + 3;
    }

    //
    // String!
    @Field(() => String)
    stringValue(): string {
        //
        // A UTF-8 character sequence.
        return "123";
    }

    //
    // Boolean!
    @Field(() => Boolean)
    booleanValue(): boolean {
        //
        // true of false.
        return false;
    }

    //
    // ID!
    @Field(() => ID)
    idValue(): any {
        //
        // The ID type is serialized in the same way as a String;
        // however, defining it as an ID signifies that it is not intended to be human‐readable.
        return 1;
    }

    //
    // Int
    @Field(() => Int, { nullable: true })
    nullableIntValue(): number | null {
        return Math.random() < 0.5 ? null : Math.floor(Math.random() * 100);
    }
}

@ObjectType()
class ArrayType {
    //
    // [Int!]!
    @Field(() => [Int])
    list(): number[] {
        return [1, 2, 3, 4, 5];
    }

    //
    // [Int!]
    @Field(() => [Int], { nullable: true })
    nullableList(): number[] | null {
        return Math.random() < 0.5 ? null : [1, 2, 3, 4, 5];
    }

    //
    // [Int]!
    @Field(() => [Int], { nullable: "items" })
    nullableItemsList(): (number | null)[] {
        return [null, 2, 3, 4, 5];
    }

    //
    // [Int]
    @Field(() => [Int], { nullable: "itemsAndList" })
    nullableItemsAndList(): (number | null)[] | null {
        return Math.random() < 0.5 ? null : [null, 2, 3, 4, 5];
    }
}

@ObjectType()
class UserDefinedType {
    //
    // PrimitiveTypes!
    @Field(() => PrimitiveTypes)
    primitive(): PrimitiveTypes {
        return new PrimitiveTypes();
    }

    //
    // ArrayType!
    @Field(() => ArrayType)
    array(): ArrayType | null {
        return new ArrayType();
    }
}

@Resolver()
class DataTypesResolver {
    @Query(() => PrimitiveTypes)
    primitive(): PrimitiveTypes {
        return new PrimitiveTypes();
    }

    @Query(() => ArrayType)
    array(): ArrayType {
        return new ArrayType();
    }

    @Query(() => UserDefinedType)
    userdefined(): UserDefinedType {
        return new UserDefinedType();
    }
}

const schema = buildSchemaSync({
    resolvers: [DataTypesResolver],
});

export const server = new ApolloServer({ schema });
