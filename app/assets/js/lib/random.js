import md5 from 'md5';

const possibleChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOP1234567890";
const possibleSymbols = '!-$_@;#%*';

function randomPassword(options={}) {
  options = Object.assign({}, options);
  options.length = options.length || 20;

  let password = Array(options.length).fill().map(() => {
    const i = Math.floor(Math.random() * possibleChars.length);
    return possibleChars.charAt(i);
  });

  // md5 it, and pick a random part
  // just in case the random password had consecutive chars
  const hashed = md5(password),
        startPick = Math.floor(Math.random() * (hashed.length-20));

  password = hashed.substr(startPick, 20).split('');

  // replace with some symbols
  const symReplaceTimes = Math.floor(Math.random() * 3) + 2;
  for (let i = 0; i < symReplaceTimes; i++) {
    const symIndx = Math.floor(Math.random() * possibleSymbols.length),
          replaceIndx = Math.floor(Math.random() * password.length),
          symbol = possibleSymbols.charAt(symIndx);

    password[replaceIndx] = symbol;
  }

  return password.join('');
}

export default {
  randomPassword
};
