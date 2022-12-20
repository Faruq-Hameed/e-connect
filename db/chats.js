const allChats = [
    {
        id: 1,
        chats: [
            { friendId: 3, chats: ['hello user3'], lastChatted: new Date },
            { friendId: 4, chats: ['hello user4'], lastChatted: new Date },
            { friendId: 5, chats: ['hello user5'], lastChatted: new Date },

        ]
    },
    {
        id: 2,
        chats: [
            { friendId: 6, chats: ['hello user6'], lastChatted: new Date },
            { friendId: 3, chats: ['hello user3'], lastChatted: new Date },
            { friendId: 5, chats: ['hello user5'], lastChatted: new Date },

        ]
    },
    {
        id: 3,
        chats: [
            { friendId: 1, chats: ['hello user1'], lastChatted: new Date },
            { friendId: 2, chats: ['hello user2'], lastChatted: new Date },
        ]
    },
    {
        id: 4,
        chats: [
            { friendId: 1, chats: ['hello user1'], lastChatted: new Date },
            { friendId: 6, chats: ['hello user6'], lastChatted: new Date },
        ]
    },
    {
        id: 5,
        chats: [
            { friendId: 1, chats: ['hello user1'], lastChatted: new Date },
            { friendId: 2, chats: ['hello user2'], lastChatted: new Date },
        ]
    },
    {
        id: 6,
        chats: [
            { friendId: 2, chats: ['hello user2'], lastChatted: new Date },
            { friendId: 4, chats: ['hello user4'], lastChatted: new Date },
        ]
    },
]

module.exports = allChats;