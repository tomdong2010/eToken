/* global artifacts */

const Accesslist = artifacts.require('Accesslist');
const TokenManager = artifacts.require('TokenManager');
const TokenX = artifacts.require('TokenX');
const ExternalERC20Storage = artifacts.require('ExternalERC20Storage');

module.exports = function (deployer, _network, accounts) {
  if (deployer.network === 'development' ||
      deployer.network === 'develop') {
    deployer.then(() => setupAccounts(accounts));
  }
};

async function setupAccounts ([owner, whitelistAdmin, whitelisted, ...restAccounts]) {
  /*
    The purpose of this is to automatically setup the test environment accounts.
    DO NOT use in production yet.
  */

  const intialMintValue = 100;

  // Setup whitelists
  const accesslistContract = await Accesslist.deployed();

  await accesslistContract.addWhitelistAdmin(whitelistAdmin, { from: owner });
  await accesslistContract.addWhitelisted(whitelisted, { from: whitelistAdmin });

  // Setup tokens
  const tokenManagerContract = await TokenManager.deployed();

  const tokenDetails = [
    {
      name: 'eToro US Dollar',
      symbol: 'eUSD',
      decimals: 4,
      whitelistEnabled: true
    },
    {
      name: 'eToro Australian Dollar',
      symbol: 'eAUD',
      decimals: 4,
      whitelistEnabled: false
    }
  ];

  const tokens = await Promise.all(
    tokenDetails.map(async (td) => {
      const externalERC20Storage = await ExternalERC20Storage.new();
      const token = await TokenX.new(
        td.name, td.symbol, td.decimals,
        accesslistContract.address, td.whitelistEnabled, externalERC20Storage.address,
        0, true,
        { from: owner });

      await tokenManagerContract.addToken(td.name, token.address);
      return token;
    })
  );

  // Mint tokens
  await Promise.all(
    tokens.map((t) => t.mint(owner, intialMintValue, { from: owner }))
  );
}