### File Upload and File Download

`Scalar`를 직접 정의하여 버퍼를 관리할 수 있습니다.

---

### GraphQLBuffer Scalar

`Buffer` 또는 `Uint8Array`를 입력받아 `Buffer`로 역직렬화하는 스칼라 타입을 정의합니다. 직렬화는 `Uint8Array`로 진행합니다.

```ts
import { GraphQLScalarType } from "graphql";

export const GraphQLBuffer = new GraphQLScalarType({
    name: "Buffer",
    description: "The `Buffer` scalar type represents a Uint8Array.",

    parseValue: (value) => {
        //
        // if buffer object.
        if (value?.type === "Buffer") {
            return Buffer.from(value.data as number[]);
        }

        //
        // if int[].
        if (value?.constructor === Array) {
            return Buffer.from(value as number[]);
        }

        //
        // else.
        throw new Error("`Buffer` must be a Buffer or a Uint8Array.");
    },

    parseLiteral(value) {
        throw new Error("`Buffer` does not support literal.");
    },

    serialize(value) {
        if (value.constructor !== Buffer) {
            throw new Error(
                `"Buffer" must be a Buffer. But found ${value.constructor.name}.`
            );
        }
        return [...value];
    },
});
```

<br/>

이제 이 타입을 사용하여 버퍼를 입력 또는 출력할 수 있습니다.

```ts
@Resolver()
class FileUploadResolver {
    @Query(() => GraphQLBuffer)
    download(@Arg("name", () => String) name: string): Buffer {
        return fs.readFileSync(`./src/22/${name}`);
    }

    @Mutation(() => Boolean)
    upload(
        @Arg("buffer", () => GraphQLBuffer)
        buffer: Buffer,

        @Arg("name", () => String)
        name: string
    ): Boolean {
        try {
            fs.writeFileSync(`./src/22/${name}`, buffer);
            return true;
        } catch (e) {
            return false;
        }
    }
}
```

---

### Client Example

다음은 `Apllo Client`를 사용하여 위의 스키마를 이용하는 예제입니다.

```ts
import ApolloClient from "apollo-client";
import fs from "fs";
import { InMemoryCache } from "apollo-cache-inmemory";
import { createHttpLink } from "apollo-link-http";
import { gql } from "apollo-boost";
import "cross-fetch/polyfill";

async function main() {
    const link = createHttpLink({ uri: "http://localhost:4000" });
    const client = new ApolloClient({
        cache: new InMemoryCache(),
        link: link,
    });

    //
    // define target file.
    const filename = "tsconfig.json";

    //
    // upload
    await client
        .mutate({
            mutation: gql`
                mutation($buffer: Buffer!, $name: String!) {
                    upload(buffer: $buffer, name: $name)
                }
            `,
            variables: {
                buffer : fs.readFileSync(filename),  // style 1
                buffer : [123, 13, 10, 32, 32, ...], // style 2
                name: filename,
            },
        })
        .then((val) => console.log(val.data));
    /*
{
    upload: true
}
    */

    //
    // download
    await client
        .query({
            query: gql`
                query($name: String!) {
                    download(name: $name)
                }
            `,
            variables: {
                name: filename,
            },
        })
        .then((val) => console.log(val.data));
    /*
{
    download: [
        123,  13,  10,  32,  32,  32,  32,  34,  99, 111, 109, 112,
        105, 108, 101, 114,  79, 112, 116, 105, 111, 110, 115,  34,
         58,  32, 123,  13,  10,  32,  32,  32,  32,  32,  32,  32,
         32,  47,  42,  32,  66,  97, 115, 105,  99,  32,  79, 112,
        116, 105, 111, 110, 115,  32,  42,  47,  13,  10,  32,  32,
         32,  32,  32,  32,  32,  32,  47,  47,  32,  34, 105, 110,
         99, 114, 101, 109, 101, 110, 116,  97, 108,  34,  58,  32,
        116, 114, 117, 101,  44,  32,  32,  32,  32,  32,  32,  32,
         32,  32,  32,  32,
                                                ... 5986 more items
    ]
}
     */
}
main();
```
