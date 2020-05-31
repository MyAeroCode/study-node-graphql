import {
    Query,
    buildSchemaSync,
    Resolver,
    Mutation,
    ObjectType,
    Field,
} from "type-graphql";
import { ApolloServer } from "apollo-server";

//
// Chapter 01.
//      Hello, TypeGraphQL!
//

/**
 * GraphQL에서 사용되는 오브젝트 타입을 정의합니다.
 */
@ObjectType()
class HelloObject {
    /**
     * String!을 반환하는 "hello_q" 필드를 정의합니다.
     */
    @Field((type) => String)
    hello_q!: string;

    /**
     * String!을 반환하는 "hello_m" 필드를 정의합니다.
     */
    @Field((type) => String)
    hello_m!: string;
}

/**
 * "HelloObject"의 필드에 값을 결정하는 리졸버를 정의합니다.
 */
@Resolver((of) => HelloObject)
class HelloObjectQueryResolver {
    //
    // 이제 "hello_q" 필드는 Query의 진입점으로 사용할 수 있습니다.
    @Query(() => String)
    hello_q(): string {
        return "TypeGraphQL! on Query";
    }
}

/**
 * "HelloObject"의 필드에 값을 결정하는 리졸버를 정의합니다.
 */
@Resolver((of) => HelloObject)
class HelloObjectMutationResolver {
    //
    // 이제 "hello_m" 필드는 Mutation의 진입점으로 사용할 수 있습니다.
    @Mutation(() => String)
    hello_m(): string {
        return "TypeGraphQL! on Mutation";
    }
}

const schema = buildSchemaSync({
    resolvers: [HelloObjectQueryResolver, HelloObjectMutationResolver],
});

export const server = new ApolloServer({
    schema,
});
