### Testing

`apollo-server-testing`을 통해 테스트용 클라이언트를 생성하고 쿼리와 뮤테이션을 실행할 수 있습니다. 해당 쿼리의 결과를 사용하여 `mocha`와 `chai`로 테스팅을 진행할 수 있습니다.

<br/>

##### 테스팅 도구 설치 :

```bash
$ npm install mocha chai apollo-server-testing
$ npm install @types/mocha @types/chai -D
```

<br/>

##### 테스팅 파일 정의 :

```ts
//
// my.test.ts
import "reflect-metadata";
import { describe } from "mocha";
import { createTestClient } from "apollo-server-testing";
import { server } from "./index";
import { assert } from "chai";

const { query, mutate } = createTestClient(server);

describe("chapter25", () => {
    //
    // Test hello.
    it("hello", async () => {
        const { data } = await query({
            query: ` 
            query {
                hello
            }
            `,
        });

        //
        // 해당 쿼리의 결과는 다음과 같아야 한다.
        assert.deepEqual(data, {
            hello: "world!",
        });
    });

    //
    // Test byebye.
    it("byebye", async () => {
        const { data } = await query({
            query: ` 
            query {
                byebye
            }
            `,
        });

        //
        // 해당 쿼리의 결과는 다음과 같아야 한다.
        assert.deepEqual(data, {
            byebye: "See you again!",
        });
    });
});
```

<br/>

##### 테스트 진행 :

```bash
$ npx mocha -r ts-node/register ./src/**/*.test.ts
```

```text
  chapter25
    √ hello
    √ byebye


  2 passing (43ms)
```
