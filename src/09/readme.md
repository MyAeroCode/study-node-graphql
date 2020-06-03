### Field Resolver and @Root

`TypeGraphQL`에서 `@Root`가 어떤 역할을 하는지 공부합니다.

---

### @Root의 역할

`@Root` 데코레이터는 어떤 데이터를 특정 메소드의 인자로 데이터를 `Injection`할 때 사용됩니다. 바로 전 챕터에서도 `Publisher`가 전송한 데이터를 `Subscription` 메소드로 주입하기 위해서 `@Root`가 쓰였죠. 이와 같은 상황은 몇 가지 없습니다.

##### 주입이 가능한 경우

-   `Publisher` -> `Subscriber`
-   `ObjectType` -> `FieldResolver`

구독 모델에서 `@Root`를 사용하는 방법은 이미 다뤘기 때문에, 이번 챕터에서는 `ObjectType`의 경우만 다루겠습니다.

---

### FieldResolver

`ObjectType`의 어떤 필드는 `비즈니스 로직`이 포함되어 있을 수 있습니다. DB에서 데이터를 가져와야 한다던가, `복잡한 연산`이 포함되어 있다던가 하는 경우지요. 이런 경우를 위해 `@FieldResolver`는 `필드 값의 결정을 미루고`, `기존의 값이 무시되도록` 돕습니다.

```ts
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
```

위의 코드에서 `getRandomIntBox()`가 먼저 결정한 값은 `0`이지만, `@FieldResolver()`가 `value`의 기존 값을 무시하고 다시 결정하기 때문에, 매번 랜덤한 값이 출력됩니다.

---

### @Root

어떤 경우에는 `다른 필드`를 읽어야 하는 경우가 있을 수 있습니다. 여러개의 키를 합쳐서 `복합키`를 만드는 경우가 대표적이죠. 하지만 `FieldResolver`를 사용하는 경우에는 클래스 자체가 달라지기 때문에 `this`키워드를 사용할 수 없어 `@Root`를 사용하여 값을 주입해야 합니다.

```ts
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
```

물론 `FieldResolver`를 사용하지 않겠다면, 다음과 같은 설계도 가능합니다.

```ts
@ObjectType()
class Member {
    @Field(() => ID)
    id(): string {
        return `${this.name}-${this.age}`;
    }

    @Field(() => String)
    name!: string;

    @Field(() => Int)
    age!: number;
}
```
