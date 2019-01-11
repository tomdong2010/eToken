/* global artifacts */

'use strict';

const TokenManager = artifacts.require('TokenManager.sol');
const TokenX = artifacts.require('./TokenX.sol');

const argv = require('optimist')
  .usage('Usage: --network [name] --tokenManager [address] --oldToken [address] --newToken [address] --tokenManagerOwner [address] --oldTokenOwner [address]')
  .describe('network', 'truffle network configuration name')
  .demand(['tokenManager', 'oldToken', 'newToken', 'tokenManagerOwner', 'oldTokenOwner'])
  .argv;

const upgradeToken = require('./upgradeToken');

async function upgradeTokenWrapper () {
  const tokenManager = TokenManager.at(argv.tokenManager);
  const oldToken = TokenX.at(argv.oldToken);
  const newToken = TokenX.at(argv.newToken);

  const tokenManagerOwner = argv.tokenManagerOwner;
  const oldTokenOwner = argv.oldTokenOwner;

  if ((await tokenManager.owner()) !== tokenManagerOwner) {
    throw Error('tokenManagerOwner is not correct');
  }

  if ((await oldToken.owner()) !== oldTokenOwner) {
    throw Error('oldTokenOwner is not correct');
  }

  await newToken.owner();

  await upgradeToken(tokenManager, oldToken, newToken, tokenManagerOwner, oldTokenOwner);
}

module.exports = (callback, test) => {
  upgradeTokenWrapper().then(
    () => callback(),
    (err) => callback(err)
  );
};