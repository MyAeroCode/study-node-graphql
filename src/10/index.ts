import {
    ObjectType,
    Field,
    Float,
    Int,
    Resolver,
    Query,
    createUnionType,
    Arg,
    buildSchemaSync,
} from "type-graphql";
import { Min, Max } from "class-validator";
import { ApolloServer } from "apollo-server";

@ObjectType()
class Movie {
    @Field(() => String)
    name!: string;

    @Field(() => Float)
    @Min(0.0)
    @Max(5.0)
    rating!: number;
}

@ObjectType()
class Character {
    @Field(() => String)
    name!: string;

    @Field(() => Int)
    @Min(0)
    age!: number;
}

const SearchResult = createUnionType({
    name: "SearchResult",
    types: () => [Movie, Character],
    resolveType: (value) => {
        if ("rating" in value) return Movie;
        if ("age" in value) return Character;
    },
});

@Resolver()
class UnionResolver {
    @Query(() => SearchResult, { nullable: true })
    search(@Arg("name", () => String) name: String) {
        if (name === "Gone With the Wind") {
            const movie: Movie = {
                name: "Gone With the Wind",
                rating: 5,
            };
            return movie;
            // return Object.assign(new Movie(), movie);
        }
        if (name === "Doraemon") {
            const character: Character = {
                name: "Doraemon",
                age: 11,
            };
            return character;
            // return Object.assign(new Character(), character);
        }
        return null;
    }
}

const schema = buildSchemaSync({ resolvers: [UnionResolver] });

export const server = new ApolloServer({ schema });
