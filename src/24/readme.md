### Health check

`Health check`는 로드 밸런서와 같은 도구들이 서버의 상태를 확인하는 경우에 사용될 수 있습니다. 기본 엔드포인트는 `/.well-known/apollo/server-health`이며, 상태검사 함수를 무사히 지나가면 `200(OK)`가 반환됩니다.

<br/>

##### settings :

```ts
export const server = new ApolloServer({
    onHealthCheck: async () => {
        //
        // 200 OK
    },

    onHealthCheck: async () => {
        //
        // 503 Service Unavailable
        throw new Error("will never pass");
    },
});
```

<br/>

##### request :

```http
GET /.well-known/apollo/server-health HTTP/1.1
Host: localhost:4000
```

<br/>

##### response :

```json
// 200 OK
{
    "status": "pass"
}
```

```json
// 503 Service Unavailable
{
    "status": "fail"
}
```
