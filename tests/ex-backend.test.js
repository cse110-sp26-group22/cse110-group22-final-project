test('basic math works in node environment', () => {
  expect(2 + 2).toBe(4);
});

function createUser(name) {
  return { name, loggedIn: false };
}

function login(user) {
  return { ...user, loggedIn: true };
}

test('user flow: create → login', () => {
  const user = createUser('alice');
  const loggedInUser = login(user);

  expect(loggedInUser.loggedIn).toBe(true);
});