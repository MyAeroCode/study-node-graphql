### Validation

`TypeGraphQL`과 `Class Validator`를 사용하여 데이터 또는 입력값의 유효성을 검증하는 방법을 공부합니다.

---

### InputType Validation

`TypeGraphQL`은 데이터와 입력값의 유효성을 검증하기 위해 `Class Validator`를 사용합니다. 아래의 `InputType`을 먼저 살펴보겠습니다.

```ts
@InputType()
class GetUserByNameInput {
    @Field(() => String)
    name!: string;
}
```

비즈니스 요구조건에 의해 `name`의 길이는 4이상, 10이하로 제한되었다면 어떻게 해야 할까요? `Resolver` 안에서 `if`문으로 체크할 수 있겠지만, `Class Validator`를 사용하면 더 쉽고 직관적으로 제약을 가할 수 있습니다.

```ts
import { MaxLength, MinLength } from "class-validator";

@InputType()
class GetUserByNameInput {
    @Field(() => String)
    @MinLength(4)
    @MaxLength(10)
    name!: string;
}
```

이후로는 클라이언트가 유효성을 만족하지 못하는 쿼리를 날리면 에러가 발생됩니다.

```graphql
query {
    getUserByName(
        input: {
            # 이름은 항상 4글자 이상이어야 합니다.
            name: "cat"
        }
    )
}
```

---

### ObjectType Validation

클래스 객체의 유효성도 검사할 수 있습니다. 이것을 이용하면 `ObjectType`에도 제약을 가하고 유효성을 검사할 수 있습니다.

```ts
import { MaxLength, MinLength } from "class-validator";

@ObjectType()
class User {
    @Field(() => String)
    @MinLength(4)
    @MaxLength(10)
    name!: string;

    @Field(() => Int)
    age!: number;
}
```

이제 `validate()`를 사용하여 유효성을 검사할 수 있습니다. 단, 클래스 정보를 담고있는 객체(`new 키워드로 생성된 객체`)를 넘겨야 합니다.

```ts
import { validate } from "class-validator";

async function test() {
    //
    // new 키워드로 생성한 오브젝트를 validate에 넘겨야 합니다.
    const user: User = new User();
    user.name = "cat";
    user.age = 20;

    //
    // errorList.length === 1
    //      [0] : 이름의 길이는 4보다 같거나 커야 합니다.
    const errorList = await validate(user);
    if (errorList.length) {
        console.log("유효성 검사를 통과하지 못했습니다.");
    }
}
```

<br/>

##### Selective Validation

경우에 따라 제약이 달라져야 하는 경우가 있습니다. 위의 클래스에 다음의 제약을 추가하도록 하겠습니다.

-   유저의 역할이 `admin`이라면, 나이는 30살 이상, 이름은 5글자 이상이어야 한다.
-   유저의 역할이 `user`이라면, 나이는 20살 이상이어야 한다.

데코레이터에 `{ groups : [제약이름, ...] }` 을 함께 넘겨줍니다.

```ts
import { MaxLength, MinLength, Min } from "class-validator";

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
```

`validate()`에도 `{ groups : [제약이름, ...] }`을 함께 넘겨줍니다.

```ts
import { validate } from "class-validator";

async function test() {
    //
    // new 키워드로 생성한 오브젝트를 validate에 넘겨야 합니다.
    const user: User = new User();
    user.name = "very-very-long-name";
    user.age = 29;
    user.role = UserRole.ADMIN;

    //
    // errorList.length === 1
    //      [0] : 관리자의 나이는 30이상이어야 합니다.
    const errorList = await validate(user, {
        groups: [user.role],
    });
    if (errorList.length) {
        console.log("유효성 검사를 통과하지 못했습니다.");
    }
}
```

위의 코드의 결과에서 이상한 점이 있습니다. `name`이 10글자는 거뜬히 넘었는데도 불구하고 `errorList`에는 해당 에러가 포함되지 않았기 때문입니다.

<br/>

제약 이름이 명시적으로 지정되지 않은 것들은 `validate with groups`에서 무시되기 때문인데, 이것을 방지하려면 `{ always:true }` 옵션을 추가하면 됩니다. 이후로 해당 제약은 어떤 경우라도 평가됩니다.

```ts
import { MaxLength, MinLength } from "class-validator";

@ObjectType()
class User {
    @Field(() => String)
    @MinLength(4)
    @MinLength(6, { groups: [UserRole.ADMIN] })
    //                        v
    @MaxLength(10, { always: true })
    name!: string;

    ...
}
```

```ts
async function test() {
    //
    // new 키워드로 생성한 오브젝트를 validate에 넘겨야 합니다.
    const user: User = new User();
    user.name = "very-very-long-name";
    user.age = 29;
    user.role = UserRole.ADMIN;

    //
    // errorList.length === 1
    //      [0] : 관리자의 나이는 30이상이어야 합니다.
    //      [1] : 이름의 길이는 10이하여야 합니다.
    const errorList = await validate(user, {
        groups: [user.role],
    });
}
```
