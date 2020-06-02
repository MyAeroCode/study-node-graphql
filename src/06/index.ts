import {
    InterfaceType,
    Field,
    ID,
    ObjectType,
    buildSchemaSync,
    Resolver,
    Query,
    Arg,
} from "type-graphql";
import { ApolloServer } from "apollo-server";

@InterfaceType({
    resolveType: (value: any) => {
        if ("subject" in value) {
            // or return "TextBook"
            return TextBook;
        }
        if ("genre" in value) {
            // or return  "ComicBook"
            return ComicBook;
        }
    },
})
abstract class IBook {
    @Field(() => ID)
    isbn!: string;

    @Field(() => String)
    title!: string;

    @Field(() => String)
    author!: string;
}

@ObjectType({ implements: [IBook] })
class TextBook implements IBook {
    //
    // Implemented.
    isbn!: string;
    title!: string;
    author!: string;

    //
    // Own.
    @Field(() => String)
    subject!: string;
}

@ObjectType({ implements: IBook })
class ComicBook implements IBook {
    //
    // Implemented.
    isbn!: string;
    title!: string;
    author!: string;

    //
    // Own.
    @Field(() => String)
    genre!: string;
}

@Resolver()
class BookResolver {
    @Query(() => IBook)
    getRandomBook() {
        const textBook: TextBook = {
            isbn: "xxx-x-xx-xxxxxx-x",
            title: "지구과학Ⅱ",
            author: "xxx",
            subject: "geoscience",
        };

        const comicBook: ComicBook = {
            isbn: "yyy-y-yy-yyyyyy-y",
            title: "신의 탑",
            author: "yyy",
            genre: "fantasy",
        };

        //
        // Nothing is needed.
        return Math.random() < 0.5
            ? Object.assign(new TextBook(), textBook)
            : Object.assign(new ComicBook(), comicBook);

        //
        // Require 'resolveType'.
        return Math.random() < 0.5 ? textBook : comicBook;
    }
}

const schema = buildSchemaSync({
    resolvers: [BookResolver],
});

export const server = new ApolloServer({ schema });
