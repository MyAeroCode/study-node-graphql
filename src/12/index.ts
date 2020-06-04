import {
    Resolver,
    Query,
    buildSchemaSync,
    AuthChecker,
    Authorized,
    ObjectType,
    Field,
} from "type-graphql";
import { ApolloServer } from "apollo-server";

enum UserRole {
    GUEST = "guest",
    USER = "user",
    ADMIN = "admin",
}

interface MyContextType {
    access_token: string;
}

//
// Make sure that the user the access token points to is a valid user.
function isUser(access_token: string): boolean {
    return access_token === "access_token_of_user";
}

//
// Make sure that the user the access token points to is a valid admin.
function isAdmin(access_token: string): boolean {
    return access_token === "access_token_of_admin";
}

//
// Examine permissions using access token.
const myAuthChecker: AuthChecker<MyContextType> = (
    { root, args, context, info },
    roles
) => {
    // here we can read the user from context
    // and check his permission in the db against the `roles` argument
    // that comes from the `@Authorized` decorator, eg. ["ADMIN", "MODERATOR"]

    if (0 <= roles.indexOf(UserRole.GUEST)) {
        //
        // Anyone can access it.
        return true;
    }

    if (0 <= roles.indexOf(UserRole.USER)) {
        //
        // Only users can access it.
        if (isUser(context.access_token)) return true;
    }

    if (0 <= roles.indexOf(UserRole.ADMIN)) {
        //
        // Only administrators can access it.
        if (isAdmin(context.access_token)) return true;
    }

    //
    // Access is denied.
    return false;
};

@ObjectType()
class Data {
    @Authorized([UserRole.ADMIN, UserRole.USER, UserRole.GUEST])
    @Field(() => String)
    publicData!: string;

    @Authorized(UserRole.ADMIN, UserRole.USER)
    @Field(() => String)
    userData!: string;

    @Authorized(UserRole.ADMIN)
    @Field(() => String)
    adminData!: string;
}

@Resolver()
class AuthResolver {
    @Authorized([UserRole.ADMIN, UserRole.USER, UserRole.GUEST])
    @Query(() => String)
    publicQuery(): string {
        return "public";
    }

    @Authorized(UserRole.ADMIN, UserRole.USER)
    @Query(() => String)
    userQuery(): string {
        return "user";
    }

    @Authorized(UserRole.ADMIN)
    @Query(() => String)
    adminQuery(): string {
        return "admin";
    }

    @Query(() => Data)
    getData(): Data {
        return Object.assign(new Data(), {
            publicData: "public",
            userData: "user",
            adminData: "admin",
        });
    }
}

const schema = buildSchemaSync({
    resolvers: [AuthResolver],
    authChecker: myAuthChecker,
    // authMode: "error",  // if you want return error message. (default)
    // authMode: "null",   // if you want slient auth guard.
});

export const server = new ApolloServer({
    schema,
    context: ({ req, res, connection }): MyContextType => {
        const access_token = req.headers.access_token || "";
        return {
            access_token: String(access_token),
        };
    },
});
