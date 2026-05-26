/**
 * @jest-environment jsdom
 */

test('DOM exists and can be modified', () => {
  document.body.innerHTML = `
    <div id="app"></div>
  `;

  const el = document.getElementById('app');
  el.textContent = 'Hello';

  expect(el.textContent).toBe('Hello');
});

function buttonClick() {
  document.getElementById('status').textContent = 'clicked';
}

test('user clicks button updates DOM', () => {
  document.body.innerHTML = `
    <button id="btn"></button>
    <div id="status"></div>
  `;

  document.getElementById('btn').addEventListener('click', buttonClick);

  document.getElementById('btn').click();

  expect(document.getElementById('status').textContent).toBe('clicked');
});