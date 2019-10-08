/*
 * Copyright ©️ 2018 Galt•Space Society Construction and Terraforming Company 
 * (Founded by [Nikolai Popeka](https://github.com/npopeka),
 * [Dima Starodubcev](https://github.com/xhipster), 
 * [Valery Litvin](https://github.com/litvintech) by 
 * [Basic Agreement](http://cyb.ai/QmSAWEG5u5aSsUyMNYuX2A2Eaz4kEuoYWUkVBRdmu9qmct:ipfs)).
 * ​
 * Copyright ©️ 2018 Galt•Core Blockchain Company 
 * (Founded by [Nikolai Popeka](https://github.com/npopeka) and 
 * Galt•Space Society Construction and Terraforming Company by 
 * [Basic Agreement](http://cyb.ai/QmaCiXUmSrP16Gz8Jdzq6AJESY1EAANmmwha15uR3c1bsS:ipfs)).
 */

module.exports = {
    "modify_config": {
        "key": {"type": "autocomplete"},
        "description": {"type": "textarea"}
    },
    "fine_member": {
        "spaceTokenId": {"type": "autocomplete"},
    },
    "expel_member": {
        "spaceTokenId": {"type": "autocomplete"},
    },
    "deactivate_rule": {
        "frpId": {"type": "autocomplete"},
    },
    "change_ms_withdrawal_limits": {
        "amount": {"type": "decimals"},
        "erc20Contract": {"type": "ms_contract_address"},
        "active": {"type": "hidden", "value": true}
    },
    "white_list": {
        "action": {"type": "select", "list": [{"title": "Add contract", "value": 0}, {"title": "Remove contract", "value": 1}]},
    },
    "add_rule": {
        "action": {"type": "select", "list": [{"title": "Add rule", "value": 0}, {"title": "Disable rule", "value": 1}]},
    },
    "member_identification": {
        "data": {"type": "member_identification"}
    },
    "change_ms_owners": {
        "newOwners": {"type": "multisig_managers"}
    }
};
