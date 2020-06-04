import {
    MiddlewareFn,
    MiddlewareInterface,
    ResolverData,
    NextFn,
    Resolver,
    Query,
    ObjectType,
    Field,
    Int,
    Float,
    buildSchemaSync,
    UseMiddleware,
} from "type-graphql";
import { appendFileSync } from "fs";
import { ApolloServer } from "apollo-server";
import Container, { Inject } from "typedi";

//
// Simple Middleware.
const ElapsedTime: MiddlewareFn = async (
    { root, args, context, info },
    next
) => {
    const srt = Date.now();
    const val = await next(); // execute field then extract.
    const end = Date.now();
    const elapsed = end - srt;
    console.log(`${info.parentType.name}.${info.fieldName} [${elapsed} ms]`);
    return val;
};

//
// Reuseable Middleware.
function Multiplier(n: number): MiddlewareFn {
    return async ({ root, args, context, info }, next) => {
        //
        // get value of field.
        const res = await next();

        //
        // guard.
        if (typeof res !== "number") {
            throw new Error(`Only numbers are allowed.`);
        }

        //
        // intercept result.
        const multiplied = Number(res) * n;
        return multiplied;
    };
}

//
// Class-Based Complex Middleware.
// DI is required.
Container.set({ id: "filename", factory: () => "my-log" });
class Logger implements MiddlewareInterface<any> {
    constructor(
        @Inject("filename")
        private readonly fileName: string
    ) {}

    async use({ context, info }: ResolverData<any>, next: NextFn) {
        const rightnow = Date.now();
        const fullname = info.parentType.name + "." + info.fieldName;
        const logMessage = `${rightnow}:${fullname}\n`;
        const logPath = `./${this.fileName}.log`;
        appendFileSync(logPath, logMessage);
        return next();
    }
}

@ObjectType()
class DataBox {
    @Field(() => String)
    getString(): string {
        return "string";
    }

    @Field(() => Int)
    @UseMiddleware([Multiplier(7), Logger])
    // or
    // @UseMiddleware(Multiplier(7), Logger)
    getInt(): number {
        //
        // will return 21
        return 3;
    }

    @Field(() => Float)
    @UseMiddleware([Multiplier(100)])
    getFloat(): number {
        //
        // will return 314
        return 3.14;
    }
}

@Resolver()
class MiddlewareResolver {
    @Query(() => DataBox)
    getBox(): DataBox {
        return new DataBox();
    }

    @Query(() => Boolean)
    getBoolean(): boolean {
        return true;
    }
}

const schema = buildSchemaSync({
    resolvers: [MiddlewareResolver],

    //
    // Global Middleware List.
    globalMiddlewares: [ElapsedTime],

    //
    // For IoC.
    container: Container,
});

export const server = new ApolloServer({ schema });
