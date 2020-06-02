import {
    ObjectType,
    Field,
    Int,
    Resolver,
    Query,
    InputType,
    Arg,
    ArgsType,
} from "type-graphql";

//
// ObjectType Inheritance
@ObjectType()
class Point2D {
    @Field(() => Int)
    x!: number;

    @Field(() => Int)
    y!: number;
}

@ObjectType()
class Point3D extends Point2D {
    @Field(() => Int)
    z!: number;
}

//
// InputType Inheritance
@InputType()
class Point2DInput {
    @Field(() => Int)
    x!: number;

    @Field(() => Int)
    y!: number;
}

@InputType()
class Point3DInput extends Point2DInput {
    @Field(() => Int)
    z!: number;
}

//
// ArgsType Inheritance
@ArgsType()
class Point2DArgs {
    @Field(() => Int)
    x!: number;

    @Field(() => Int)
    y!: number;
}

@ArgsType()
class Point3DArgs extends Point2DArgs {
    @Field(() => Int)
    z!: number;
}

//
// Resolver Inheritance
@Resolver()
export class Point2DResolver {
    @Query(() => Point2D)
    point2d(@Arg("point", () => Point2DInput) input: Point3DInput): Point2D {
        return input;
    }
}

@Resolver()
export class Point3DResolver extends Point2DResolver {
    @Query(() => Point3D)
    point3d(@Arg("point", () => Point3DInput) input: Point3DInput): Point3D {
        return input;
    }
}
