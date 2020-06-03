import {
    Resolver,
    Subscription,
    ObjectType,
    Field,
    InputType,
    Root,
    Mutation,
    Arg,
    PubSub,
    PubSubEngine,
    Query,
    Int,
    registerEnumType,
} from "type-graphql";

//
// 메세지 타입 열거형을 정의하고 GraphQL에 등록한다.
enum MessageType {
    CHAT = "chat",
    NOTICE = "notice",
}
registerEnumType(MessageType, { name: "MessageType" });

//
// 메세지 ObjectType을 정의한다.
// "MessageInput"이라는 이름으로 InputType도 생성한다.
@ObjectType()
@InputType("MessageInput")
class Message {
    @Field(() => Int)
    chatRoomNumber!: number;

    @Field(() => String)
    contents!: string;

    @Field(() => MessageType)
    type!: MessageType;
}

@InputType()
class EnterChatRoomInput {
    @Field(() => Int)
    chatRoomNumber!: number;
}

//
// "채팅방번호-메세지타입" 형태로 토픽 문자열을 생성한다.
function createTopicString(chatRoomNumber: number, messageType: MessageType) {
    return [chatRoomNumber, messageType].join("-");
}

@Resolver()
export class MessageResolver {
    @Subscription(() => Message, {
        // topics: MessageType.CHAT, // single topic
        // topics: [MessageType.CHAT, MessageType.NOTICE], // multiple topic.
        topics: ({ args, context, info }) => {
            //
            // 채팅방 번호에 일치하는 토픽을 지정한다.
            const input: EnterChatRoomInput = args.input;
            const topics: string[] = [
                createTopicString(input.chatRoomNumber, MessageType.CHAT),
                createTopicString(input.chatRoomNumber, MessageType.NOTICE),
            ];
            console.log(topics);
            return topics;
        },
        filter: ({ args, context, info, payload }) => {
            //
            // 리턴값이 false라면, 구독자에게 알림이 전송되지 않음.
            // 여기서는 문자열의 길이가 홀수라면 구독자에게 알림이 전송되지 않음.
            const contents: string = payload.contents;
            const enabeld: boolean = contents.length % 2 === 0;
            return enabeld;
        },
    })
    enterChatRoom(
        @Root() message: Message,
        @Arg("input", () => EnterChatRoomInput) input: EnterChatRoomInput
    ): Message {
        return message;
    }

    @Mutation(() => Message)
    async newMessage(
        @Arg("input", () => Message)
        message: Message,
        @PubSub() pubsub: PubSubEngine
    ) {
        const topic = createTopicString(message.chatRoomNumber, message.type);
        await pubsub.publish(topic, message);
        return message;
    }

    @Query(() => String)
    hello(): string {
        return "world!";
    }
}
