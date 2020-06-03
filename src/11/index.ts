import {
    InputType,
    Field,
    ObjectType,
    Int,
    buildSchemaSync,
    Resolver,
    Query,
    Arg,
    registerEnumType,
} from "type-graphql";
import { MaxLength, MinLength, validate, Min } from "class-validator";
import { ApolloServer } from "apollo-server";

enum UserRole {
    ADMIN = "admin",
    USER = "user",
}
registerEnumType(UserRole, { name: "UserRole" });

@ObjectType()
class User {
    @Field(() => String)
    @MinLength(4)
    @MinLength(6, { groups: [UserRole.ADMIN] })
    @MaxLength(10, { always: true })
    name!: string;

    //
    // The age of "admin" must be greater than or equal to 30.
    // The age of "user" must be greater than or equal to 20.
    @Field(() => Int)
    @Min(30, { groups: [UserRole.ADMIN] })
    @Min(20, { groups: [UserRole.USER] })
    age!: number;

    @Field(() => UserRole)
    role!: UserRole;
}

@InputType()
class GetUserByNameInput {
    @Field(() => String)
    @MinLength(4)
    @MaxLength(10)
    name!: string;
}

@Resolver()
class UserResolver {
    @Query(() => User, { nullable: true })
    async getUserByName(
        @Arg("input", () => GetUserByNameInput) input: GetUserByNameInput
    ): Promise<User | null> {
        const users: User[] = [
            //
            // This user will not pass validation.
            // age of "user" must not be less than 20
            {
                name: "garfield",
                age: 14,
                role: UserRole.USER,
            },

            //
            // This user will not pass validation.
            // age of "admin" must not be less than 30
            {
                name: "meerkat",
                age: 29,
                role: UserRole.ADMIN,
            },

            //
            // This user will pass validation.
            {
                name: "lion",
                age: 21,
                role: UserRole.USER,
            } as any,
        ];

        for (const user of users) {
            if (user.name === input.name) {
                //
                // It is important to use the object that created with the "new" keyword.
                const target = Object.assign(new User(), user);
                const err = await validate(target, {
                    groups: [user.role],
                });
                if (err.length) {
                    console.log(err);
                    throw new Error(`Validation Error.`);
                }
                return user;
            }
        }
        return null;
    }
}

const schema = buildSchemaSync({ resolvers: [UserResolver] });

export const server = new ApolloServer({ schema });
