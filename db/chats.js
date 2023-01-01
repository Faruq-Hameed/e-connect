const allChats = [
    {
        id: 1,
        chats: [
            { friendId: 3, chats: [{sent:['hello user3']}, {received: ['hello user1']} ], lastChatted: new Date },
            { friendId: 4, chats: [{sent:['hello user4']}, {received: ['hello user1']}], lastChatted: new Date },
            { friendId: 5, chats: [{sent:['hello user5']}, {received: ['hello user1']}], lastChatted: new Date },

        ]
    },
    {
        id: 2,
        chats: [
            // { friendId: 6, chats: [{sent:['hello user6']}, {received: ['hello user2']}], lastChatted: new Date },
            // { friendId: 3, chats: [{sent:['hello user3']},{received: ['hello user2']}], lastChatted: new Date },
            // { friendId: 5, chats: [{sent:['hello user5']},{received: ['hello user2']}], lastChatted: new Date },

        ]
    },
    {
        id: 3,
        chats: [
            { friendId: 1, chats: [{sent:['hello user1']},{received: ['hello user3']}], lastChatted: new Date },
            { friendId: 2, chats: [{sent:['hello user2']},{received: ['hello user3']}], lastChatted: new Date },
        ]
    },
    {
        id: 4,
        chats: [
            { friendId: 1, chats: [{sent:['hello user1']},{received: ['hello user4']}], lastChatted: new Date },
            { friendId: 6, chats: [{sent:['hello user6']},{received: ['hello user4']}], lastChatted: new Date },
        ]
    },
    {
        id: 5,
        chats: [
            { friendId: 1, chats: [{sent:['hello user1']}, {received: ['hello user5']}], lastChatted: new Date },
            { friendId: 2, chats: [{sent:['hello user2']}, {received: ['hello user5']}], lastChatted: new Date },
        ]
    },
    {
        id: 6,
        chats: [
            { friendId: 2, chats: [{sent:['hello user2']}, {received: ['hello user6']}], lastChatted: new Date },
            { friendId: 4, chats: [{sent:['hello user4']}, {received: ['hello user6']}], lastChatted: new Date },
        ]
    },
]

module.exports = allChats;