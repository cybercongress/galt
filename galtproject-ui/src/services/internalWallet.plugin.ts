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

const ethers = require('ethers');

export default {
    install (Vue, options: any = {}) {
        let internalWalletAddress;
        let internalWalletPrivate;

        let active = localStorage.getItem('internalWalletActive') == '1';

        if(localStorage.getItem('internalWalletAddress') && localStorage.getItem('internalWalletPrivate')) {
            internalWalletAddress = localStorage.getItem('internalWalletAddress');
            internalWalletPrivate = localStorage.getItem('internalWalletPrivate');
        } else {
            generateNew();
        }

        function generateNew() {
            const newAccount = ethers.Wallet.createRandom();
            internalWalletAddress = newAccount.address;
            internalWalletPrivate = newAccount.privateKey;

            localStorage.setItem('internalWalletAddress', internalWalletAddress);
            localStorage.setItem('internalWalletPrivate', internalWalletPrivate);
        }

        Vue.prototype.$internalWallet = {
            getAddress: function() {
                return internalWalletAddress;
            },
            getPrivate: function() {
                return internalWalletPrivate;
            },
            generateNew: generateNew,
            setActive: function(_active) {
                active = _active;
                localStorage.setItem('internalWalletActive', _active ? "1" : "0");
            },
            getActive: function() {
                return active;
            }
        };
    }
}
