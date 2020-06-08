import { Query, buildSchemaSync, Resolver, Mutation } from "type-graphql";
import { ApolloServer } from "apollo-server";

//
// Chapter 01.
//      Hello, TypeGraphQL!
//

/**
 * 쿼리용 리졸버를 정의합니다.
 */
@Resolver()
class QueryResolver {
    //
    // 이제 "hello_q" 필드는 Query의 진입점으로 사용할 수 있습니다.
    @Query(() => String)
    hello_q(): string {
        return "TypeGraphQL! on Query";
    }
}

/**
 * 뮤테이션용 리졸버를 정의합니다.
 */
@Resolver()
class MutationResolver {
    //
    // 이제 "hello_m" 필드는 Mutation의 진입점으로 사용할 수 있습니다.
    @Mutation(() => String)
    hello_m(): string {
        return "TypeGraphQL! on Mutation";
    }
}

const schema = buildSchemaSync({
    resolvers: [QueryResolver, MutationResolver],
});

export const server = new ApolloServer({
    schema,
});
