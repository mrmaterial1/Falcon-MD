const { getDB, setDB } = require('../../lib/db');

const tttBoards = {};

function renderBoard(board) {
  return board.map((r, i) => r.map((c, j) => c || `${i * 3 + j + 1}`).join('|')).join('\n─────\n');
}

function checkWin(b, p) {
  const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const flat = b.flat();
  return wins.some(w => w.every(i => flat[i] === p));
}

module.exports = {
  ttt: async ({ sock, from, args, sender }) => {
    tttBoards[from] = { board: Array(3).fill(null).map(() => Array(3).fill(null)), turn: sender, players: [sender] };
    await sock.sendMessage(from, { text: `🎮 *Tic Tac Toe started!*\nSend .ready to join.\n\n${renderBoard(tttBoards[from].board)}` });
  },

  ready: async ({ sock, from, sender }) => {
    const game = tttBoards[from];
    if (!game) return sock.sendMessage(from, { text: '❌ No game started. Use .ttt' });
    if (!game.players.includes(sender)) game.players.push(sender);
    if (game.players.length < 2) return sock.sendMessage(from, { text: '⏳ Waiting for opponent...' });
    game.symbols = { [game.players[0]]: '❌', [game.players[1]]: '⭕' };
    await sock.sendMessage(from, { text: `🎮 Game on!\n❌: @${game.players[0].split('@')[0]}\n⭕: @${game.players[1].split('@')[0]}\n\n${renderBoard(game.board)}\n\nTurn: @${game.turn.split('@')[0]}`, mentions: game.players });
  },

  cancel: async ({ sock, from }) => {
    delete tttBoards[from];
    await sock.sendMessage(from, { text: '🛑 Game cancelled.' });
  },

  wordgame: async ({ sock, from }) => {
    const words = ['apple', 'mango', 'banana', 'grape', 'lemon'];
    const word = words[Math.floor(Math.random() * words.length)];
    const hint = word[0] + '_'.repeat(word.length - 1);
    const db = getDB('wordgame');
    db[from] = word;
    setDB('wordgame', db);
    await sock.sendMessage(from, { text: `🔤 *Word Game!*\nGuess the word: *${hint}*\n(${word.length} letters)` });
  },
};
