const users = [];

// Join user to chat
function userJoin(id, username, room) {
  const user = { id, username, room };
  users.push(user);

  return user;
}

// Change users room
function userChangeRoom(userId, room) {
  let user;
  for (let i = 0; i < users.length; i++) {
    if (users[i].id === userId) {
      users[i].room = room;
      user = users[i];
    }
  }
  return user;
}

// Get current user
function getCurrentUser(id) {
  return users.find((user) => user.id === id);
}

// User leaves cat
function userLeave(id) {
  const index = users.findIndex((user) => user.id === id);
  //console.log("user left:", users[index]);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

// Get room users
function getRoomUsers(room) {
  return users;
  // return users.filter((user) => user.room === room);
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  userChangeRoom,
};
