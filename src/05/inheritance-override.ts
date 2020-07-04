import {
    ObjectType,
    Field,
    Int,
    Resolver,
    Query,
    Arg,
    Float,
} from "type-graphql";

//
// ObjectType Inheritance - Override
@ObjectType()
class BinaryOperatorObject {
    @Field(() => String)
    operatorName(): string {
        throw new Error("'operatorName()' not implemented.");
    }

    @Field(() => Float)
    exec(
        @Arg("a", () => Int) a: number,
        @Arg("b", () => Int) b: number
    ): number {
        throw new Error("'exec()' not implemented.");
    }
}

@ObjectType()
class AdderObject extends BinaryOperatorObject {
    operatorName(): string {
        return "add";
    }

    exec(a: number, b: number): number {
        return a + b;
    }
}

@ObjectType()
class SubtractorObject extends BinaryOperatorObject {
    operatorName(): string {
        return "subtract";
    }

    @Field(() => Float) // Wrong usage.
    exec(a: number, b: number): number {
        return a - b;
    }
}

//
// Resolver Inheritance - Override
@Resolver()
class BaseBinaryOperatorQueryResolver {
    @Query(() => BinaryOperatorObject)
    randomOperator(): BinaryOperatorObject {
        throw new Error("'randomOperator()' not implemented.");
    }

    @Query(() => AdderObject)
    adderOperator(): AdderObject {
        throw new Error("'adderOperator()' not implemented.");
    }

    @Query(() => SubtractorObject)
    subtracterOperator(): SubtractorObject {
        throw new Error("'subtracterOperator()' not implemented.");
    }
}

@Resolver()
export class BinaryOperatorQueryResolver extends BaseBinaryOperatorQueryResolver {
    randomOperator(): BinaryOperatorObject {
        return Math.random() < 0.5 ? new AdderObject() : new SubtractorObject();
    }

    adderOperator(): AdderObject {
        return new AdderObject();
    }

    subtracterOperator(): SubtractorObject {
        return new SubtractorObject();
    }
}
