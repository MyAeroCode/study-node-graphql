import { gql, Config, ApolloServer } from "apollo-server";

//
// Chapter 00.
//      Hello, Apollo!
//
export const config: Config = {
    typeDefs: gql`
        type Query {
            "여기에 주석을 달 수 있습니다."
            hello: String
        }
    `,

    resolvers: {
        Query: {
            //
            // "hello" 필드는 "world"를 반환합니다.
            hello: () => "Apollo!",
        },
    },
};

export const server = new ApolloServer(config);
