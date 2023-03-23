const users = [
    {
        id: 1, name: 'admin', username: 'admin1', email: 'admin@mail.com', status: 'active',
        friendsId: [3, 4,5], incomingFriendsId: [], pendingFriendsId: []
    },
    {
        id: 2, name: 'name2', username: 'user2', email: 'user2@mail.com',status: 'active',
        friendsId: [6, 3, 5], incomingFriendsId: [], pendingFriendsId: []
    },
    {
        id: 3, name: 'name3', username: 'user3', email: 'user3@mail.com', status: 'active',
        friendsId: [1, 2], incomingFriendsId: [], pendingFriendsId: []
    },
    {
        id: 4, name: 'name4', username: 'user4', email: 'user4@mail.com', status: 'active',
        friendsId: [1, 6], incomingFriendsId: [], pendingFriendsId: []
    },
    {
        id: 5, name: 'name5', username: 'user5', email: 'user5@mail.com', status: 'active',
        friendsId: [1, 2], incomingFriendsId: [], pendingFriendsId: []
    },
    {
        id: 6, name: 'name6', username: 'user6', email: 'user6@mail.com', status: 'blocked',
        friendsId: [2, 4], incomingFriendsId: [], pendingFriendsId: []
    },
];

module.exports = users;