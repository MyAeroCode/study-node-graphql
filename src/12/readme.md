### Context and Authorization

특정 그룹의 유저에게만 API를 제공해야 하는 경우가 있습니다. `express.js`는 이러한 기능을 `passport.js`와 같은 미들웨어를 사용하여 구현하지만, `GraphQL`은 이러한 기능을 염두에 두고 설계되었기 때문에, 매번 리졸버에서 권한을 검사하거나, 매번 다른 함수의 인자로 넘기거나, 별도의 미들웨어를 사용하지 않아도 됩니다.

---

### Context

`Request`에서 정보를 읽어 전역으로 사용되는 `Context`에 넘길 수 있습니다. 단 한번만 설정하면 모든 리졸버가 해당 `Context`를 공유하는데, 이것으로 매번 문맥을 인자로 넘기지 않아도 됩니다. 관례적으로 `Context`에 넘겨줄 정보는 `HTTP(S) Header`에 저장합니다.

```ts
interface MyContextType {
    access_token: string;
}

export const server = new ApolloServer({
    schema,
    context: ({ req, res, connection }): MyContextType => {
        const access_token = req.headers.access_token || "";
        return {
            access_token: String(access_token),
        };
    },
});
```

---

### Authorization

##### Authorized Decorator

`@Authorized` 데코레이터와 `Context`에 넘겨진 정보를 기반으로 접근허용 여부를 결정할 수 있습니다. 유저의 권한을 3개(`GUEST`, `USER`, `ADMIN`)으로 구분하고 각 쿼리에 접근권한을 걸어보겠습니다. 접근을 허용할 `Role`의 이름을 `@Authroized`에 넘기면 됩니다.

<br/>

이 때, 3가지 스타일이 허용됩니다.

```ts
//
// 배열로 묶어서 다중 전달
@Authroized(["guest", "user", "admin"])

//
// 배열을 풀어서 다중 전달
@Authroized("guest", "user")

//
// 단일 전달
@Authroized("guest")
```

이것을 적용하면...

```ts
enum UserRole {
    GUEST = "guest",
    USER = "user",
    ADMIN = "admin",
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
}
```

물론 `ObjectType`의 `Field`에도 적용할 수 있습니다.

```ts
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
```

<br/>

##### Auth Checker

이제 `AuthChecker<T>`를 구현하여 실제 권한을 체크하는 로직을 만들겠습니다. `Context`는 1번째 인자로, `Target-Role-List`는 `["guest", "user", "admin"]`처럼 문자열 배열 형태로 2번째 인자에 전달됩니다.

```ts
import { AuthChecker } from "type-graphql";

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
```

이것을 `buildSchema`의 `{ authChecker: myAuthChecker }` 옵션으로 넘기면 됩니다.

```ts
const schema = buildSchemaSync({
    resolvers: [AuthResolver],
    authChecker: myAuthChecker,
});
```

<br/>

##### Auth Mode

`AuthChecker`에서 접근을 거부하면 에러가 발생되는데, 에러 메세지가 클라이언트에게 그대로 출력됩니다. 만약 에러 메세지를 숨겨야한다면 `{ authMode : "null" }` 옵션도 함께 넘겨줘야 합니다. 기본값은 `"error"` 입니다.

```ts
const schema = buildSchemaSync({
    resolvers: [AuthResolver],
    authChecker: myAuthChecker,
    // authMode: "error",  // if you want return error message. (default)
    // authMode: "null",   // if you want slient auth guard.
});
```
