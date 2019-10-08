/*
 * Copyright ©️ 2018 Galt•Space Society Construction and Terraforming Company
 * (Founded by [Nikolai Popeka](https://github.com/npopeka),
 * [Dima Starodubcev](https://github.com/xhipster),
 * [Valery Litvin](https://github.com/litvintech) by
 * [Basic Agreement](http://cyb.ai/QmSAWEG5u5aSsUyMNYuX2A2Eaz4kEuoYWUkVBRdmu9qmct:ipfs)).
 *
 * Copyright ©️ 2018 Galt•Core Blockchain Company
 * (Founded by [Nikolai Popeka](https://github.com/npopeka) and
 * Galt•Space Society Construction and Terraforming Company by
 * [Basic Agreement](http://cyb.ai/QmaCiXUmSrP16Gz8Jdzq6AJESY1EAANmmwha15uR3c1bsS:ipfs)).
 */

pragma solidity 0.5.10;


interface IPGGMultiSig {
  function proposeTransaction(address destination, uint value, bytes calldata data) external returns (uint256 transactionId);
  function setArbitrators(address[] calldata descArbitrators) external;
  function revokeArbitrators() external;
  function isOwner(address _owner) external view returns(bool);
  function transactions(uint256) external view returns(address destination, uint value, bytes memory data, bool executed);
  function checkGaltLimitsExternal(bytes calldata data) external;
  function getArbitrators() external view returns (address[] memory);
}
