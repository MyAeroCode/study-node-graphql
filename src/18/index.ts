import { Resolver, Query, Arg, Directive, buildSchemaSync } from "type-graphql";
import { ApolloServer } from "apollo-server";
import { SchemaDirectiveVisitor } from "graphql-tools";
import { GraphQLField, GraphQLEnumValue, defaultFieldResolver } from "graphql";

class deprecatedDirective extends SchemaDirectiveVisitor {
    public visitFieldDefinition(field: GraphQLField<any, any>) {
        field.isDeprecated = true;
        field.deprecationReason = this.args.reason;
    }

    public visitEnumValue(value: GraphQLEnumValue) {
        value.isDeprecated = true;
        value.deprecationReason = this.args.reason;
    }
}

class myDirective extends SchemaDirectiveVisitor {
    visitFieldDefinition(field: GraphQLField<any, any>) {
        const { resolve = defaultFieldResolver } = field;

        //
        // return type casting
        // field.type = GraphQLInt;

        //
        // directive args
        // this.args;

        /**
         * ...args = (source, args, context, info)
         */
        field.resolve = async function (...args) {
            //
            // get params.
            const params = args[1];
            const { a, b } = params;

            //
            // get context (with extensions)
            const context = args[2];

            //
            // execute then extract result.
            const result = await resolve.apply(this, args);
            if (typeof result === "string") {
                //
                // replace result.
                return result.toUpperCase();
            }
            return result;
        };
    }
}

@Resolver()
class DataBoxResolver {
    @Directive(`@deprecated(reason: "deprecate test")`)
    @Query(() => String)
    hello(): string {
        return "world!";
    }

    @Directive(`@my`)
    @Query(() => String)
    concat(
        @Arg("a", () => String) a: string,
        @Arg("b", () => String) b: string
    ): string {
        return a + b;
    }
}

const schema = buildSchemaSync({
    resolvers: [DataBoxResolver],
    validate: false,
});

SchemaDirectiveVisitor.visitSchemaDirectives(schema, {
    deprecated: deprecatedDirective,
    my: myDirective,
});

export const server = new ApolloServer({ schema });
