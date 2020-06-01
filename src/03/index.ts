import {
    InputType,
    Field,
    Resolver,
    Query,
    buildSchemaSync,
    Arg,
    Int,
    ArgsType,
    Args,
} from "type-graphql";
import { GraphQLScalarType, ValueNode, Kind } from "graphql";
import { ApolloServer } from "apollo-server";
import { Min, Max } from "class-validator";

class RGB {
    constructor(r: number, g: number, b: number) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
    r!: number;
    g!: number;
    b!: number;

    /**
     * "#xxxxxx" 형태로 값을 반환한다.
     */
    toHex(): string {
        function prettify(n: number): string {
            const value = n.toString(16);
            const prefix = value.length === 1 ? "0" : "";
            return prefix + value;
        }
        const r = prettify(this.r);
        const g = prettify(this.g);
        const b = prettify(this.b);
        return `#${r}${g}${b}`;
    }

    /**
     * "#xxxxxx" 형태의 값을 받아 RGB 객체를 생성한다.
     */
    static fromHex(hex: string): RGB {
        const r = parseInt(hex.substr(1, 2), 16);
        const g = parseInt(hex.substr(3, 2), 16);
        const b = parseInt(hex.substr(5, 2), 16);
        return new RGB(r, g, b);
    }

    /**
     * {r, g, b} 형태의 값을 받아 RGB 객체를 생성한다.
     */
    static fromRGB({ r, g, b }: { r: number; g: number; b: number }): RGB {
        return new RGB(r, g, b);
    }
}

/**
 * GraphQL에서 사용할 스칼라 타입을 정의한다.
 */
const RGBScalarType = new GraphQLScalarType({
    //
    // 클래스 명과 동일하지 않아도 괜찮다.
    name: "RGB",

    description: "My RGB Scalar Type.",

    /**
     * input-variables에서 인자를 받아 RGB를 생성한다.
     */
    parseValue(value: string): RGB {
        return RGB.fromHex(value);
    },

    /**
     * literal에서 인자를 받아 RGB를 생성한다.
     */
    parseLiteral(ast: ValueNode): RGB {
        if (ast.kind === Kind.STRING) {
            return RGB.fromHex(ast.value);
        }
        throw new Error(`문자열만 허용됩니다.`);
    },

    /**
     * RGB를 문자열로 직렬화한다.
     */
    serialize(value: RGB): string {
        return value.toHex();
    },
});

/**
 * InputType will generate a real GraphQLInputType type,
 * and should be used when we need a nested object in the args.
 *
 * @example
 * func(rgb:{
 *      r: 1
 *      g: 2
 *      b: 3
 * })
 */
@InputType()
class RGBInputType {
    @Field(() => Int)
    @Min(0)
    @Max(255)
    r!: number;

    @Field(() => Int)
    @Min(0)
    @Max(255)
    g!: number;

    @Field(() => Int)
    @Min(0)
    @Max(255)
    b!: number;
}

/**
 * ArgsType is virtual and it will be flattened in schema:
 *
 * @example
 * func(r: 1, g: 2, b: 3);
 */
@ArgsType()
class RGBArgsType {
    @Field(() => Int)
    @Min(0)
    @Max(255)
    r!: number;

    @Field(() => Int)
    @Min(0)
    @Max(255)
    g!: number;

    @Field(() => Int)
    @Min(0)
    @Max(255)
    b!: number;
}

/*
    OR

    @ArgsType()
    @InputType()
    class RGBInputArgsType {
        ...
    }
*/

@Resolver()
class ScalarAndInputResolver {
    /**
     * InputType을 사용하여 인자를 받는다.
     */
    @Query(() => RGBScalarType)
    viaInput(@Arg("rgb", () => RGBInputType) rgb: RGBInputType): RGB {
        return RGB.fromRGB(rgb);
    }

    /**
     * ArgsType을 사용하여 인자를 받는다.
     */
    @Query(() => RGBScalarType)
    viaArgs(@Args(() => RGBArgsType) rgb: RGBArgsType): RGB {
        return RGB.fromRGB(rgb);
    }

    /**
     * 인자로 받은 스칼라를 그대로 반환한다.
     */
    @Query(() => RGBScalarType)
    viaRGB(@Arg("rgb", () => RGBScalarType) rgb: RGB): RGB {
        return rgb;
    }
}

const schema = buildSchemaSync({
    resolvers: [ScalarAndInputResolver],
    scalarsMap: [{ type: RGB, scalar: RGBScalarType }],
});

export const server = new ApolloServer({ schema });
