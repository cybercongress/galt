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
        "key": {"type": "snake_case"},
        "description": {"type": "text"}
    },
    "fine_member": {
        "spaceTokenId": {"type": "link", "urlTemplate": '/land/space-token/<%= value %>'},
    },
    "expel_member": {
        "spaceTokenId": {"type": "link", "urlTemplate": '/land/space-token/<%= value %>'},
    },
    "change_ms_withdrawal_limits": {
        "amount": {"type": "decimals", "tokenAddressField": "erc20Contract"},
        "erc20Contract": {"type": "ms_contract_address"},
        "active": {"type": "hidden"}
    },
    "deactivate_rule": {
        "frpId": {"type": "link", "urlTemplate": '/reputation/community/<%= sraAddress %>/laws/<%= value %>'},
    },
    "white_list": {
        "action": {"type": "enum", "values": {0: "Add contract", 1: "Remove contract"}},
    },
    "add_rule": {
        "action": {"type": "enum", "values": {0: "Add rule", 1: "Disable rule"}},
    },
    "member_identification": {
        "data": {"type": "member_identification"}
    }
};
