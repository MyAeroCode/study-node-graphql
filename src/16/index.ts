import {
    ObjectType,
    Field,
    Int,
    Resolver,
    Arg,
    buildSchemaSync,
    Query,
} from "type-graphql";
import {
    getComplexity,
    fieldExtensionsEstimator,
    simpleEstimator,
} from "graphql-query-complexity";
import { ApolloServer } from "apollo-server";

@ObjectType()
class Calc {
    @Field(() => Int, { complexity: 3 })
    value: number = 0;

    @Field(() => Calc, {
        complexity: ({ childComplexity }) => childComplexity + 1,
    })
    add(@Arg("n", () => Int) n: number): Calc {
        return Object.assign(new Calc(), { value: this.value + n });
    }

    @Field(() => Calc, {
        complexity: ({ childComplexity }) => childComplexity * 3,
    })
    multiply(@Arg("n", () => Int) n: number): Calc {
        return Object.assign(new Calc(), { value: this.value * n });
    }
}

@Resolver()
class CalcResolver {
    @Query(() => Calc)
    getCalc() {
        return new Calc();
    }
}

const schema = buildSchemaSync({ resolvers: [CalcResolver] });

export const server = new ApolloServer({
    schema,
    plugins: [
        {
            serverWillStart: () => {
                console.log("Server will start.");
            },

            requestDidStart: () => {
                console.log("Request did start.");

                return {
                    didResolveOperation({ request, document }) {
                        const complexity = getComplexity({
                            schema,
                            operationName: request.operationName,
                            query: document,
                            variables: request.variables,
                            estimators: [
                                fieldExtensionsEstimator(),
                                simpleEstimator({ defaultComplexity: 1 }),
                            ],
                        });

                        const maxComplexity = 30;
                        if (maxComplexity < complexity) {
                            throw new Error(
                                `Complexity Over : ${complexity} / ${maxComplexity}`
                            );
                        }
                        console.log(
                            `Used Complexity : ${complexity} / ${maxComplexity}`
                        );
                    },
                };
            },
        },
    ],
});
