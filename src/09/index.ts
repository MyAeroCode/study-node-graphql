import {
    ObjectType,
    Field,
    Int,
    Resolver,
    ID,
    FieldResolver,
    Root,
    Query,
    buildSchemaSync,
} from "type-graphql";
import { ApolloServer } from "apollo-server";

@ObjectType()
class RandomIntBox {
    @Field(() => Int)
    value!: number;
}

@Resolver((of) => RandomIntBox)
class RandomIntBoxResolver {
    @Query(() => RandomIntBox)
    getRandomIntBox(): RandomIntBox {
        return {
            value: 0,
        };
    }

    @FieldResolver(() => Int)
    value(): number {
        return Math.floor(Math.random() * 100);
    }
}

@ObjectType()
class Member {
    @Field(() => ID)
    id?: string;

    @Field(() => String)
    name!: string;

    @Field(() => Int)
    age!: number;
}

@Resolver(() => Member)
class MemberResolver {
    @Query(() => Member)
    getMember(): Member {
        return {
            name: "ych",
            age: 26,
        };
    }

    @FieldResolver(() => ID)
    id(@Root() member: Member): string {
        //
        // 현재 오브젝트를 읽은 뒤,
        // name와 age를 묶어서 id를 결정한다.
        return `${member.name}-${member.age}`;
    }
}

const schema = buildSchemaSync({
    resolvers: [RandomIntBoxResolver, MemberResolver],
});

export const server = new ApolloServer({ schema });
