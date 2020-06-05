import {
    createMethodDecorator,
    Resolver,
    Query,
    Int,
    buildSchemaSync,
    Arg,
    createParamDecorator,
} from "type-graphql";
import { ApolloServer } from "apollo-server";

function ValidateArg(): MethodDecorator {
    return createMethodDecorator(async ({ args }, next) => {
        console.log("[call] validateArg");
        if (args.max <= args.min) {
            throw new Error(`max must be greater than min.`);
        }
        return next();
    });
}

function ErrorIfEven(): MethodDecorator {
    return createMethodDecorator(async ({ args }, next) => {
        console.log("[call] errorIfEven");
        const num = await next();
        if (num % 2 === 0) {
            throw new Error(`even error.`);
        } else {
            return num + 1000;
        }
    });
}

/**
 * inject random integer from [srt, end)
 */
function InjectRandomNumber(min: number, max: number): ParameterDecorator {
    return createParamDecorator(() => {
        return Math.floor(Math.random() * (max - min) + min);
    });
}

@Resolver()
class RandomIntegerGeneratorResolver {
    /**
     * get random integer from [srt, end)
     */
    @ValidateArg()
    @ErrorIfEven()
    @Query(() => Int)
    getRandomInteger(
        @Arg("min", () => Int) min: number,
        @Arg("max", () => Int) max: number,
        @InjectRandomNumber(50, 100) injectedRandom: number
    ): number {
        const generatedRandom = Math.floor(Math.random() * (max - min) + min);
        console.log("injected random", injectedRandom);
        console.log("generated random", generatedRandom);
        return generatedRandom;
    }
}

const schema = buildSchemaSync({ resolvers: [RandomIntegerGeneratorResolver] });

export const server = new ApolloServer({ schema });
