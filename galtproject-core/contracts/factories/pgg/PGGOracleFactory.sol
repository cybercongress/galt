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

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

// This contract will be included into the current one
import "../../pgg/interfaces/IPGGConfig.sol";
import "../../pgg/PGGOracles.sol";


contract PGGOracleFactory is Ownable {
  function build(
    IPGGConfig pggConfig
  )
    external
    returns (PGGOracles)
  {
    PGGOracles voting = new PGGOracles(
      pggConfig
    );

    return voting;
  }
}
