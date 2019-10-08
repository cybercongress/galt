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

import GaltData from "../../services/galtData";

export default {
    name: 'user-menu',
    template: require('./UserMenu.html'),
    async created() {

    },

    data() {
        return {
            rpcServer: GaltData.rpcServer(),
            avatarImage: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAADwElEQVR4Xu3dsXEVQRBF0VEYJICJKUsxgIOPQVHEQgiULHxZOCRABDhUkQDKQgRxjKdFV35r5r+++7qn//7dm8fbL08H/j5/ewPR5/z9+UDx3+9fU7wGv/30h/7Fq7v3FP/1wy+KvwkA0u8EQA5ABOUAlQACqBJQD0AA1QOQfKceoFNApwC6hjoGdgwkgJoDNAcggDS4OUBzAGKoOUBzAAKoOUBzAAKoOQDJ1xzgNAdoDkDXUHOAi88B9Bik53hdn+g956z3r+tzD6AJ0A+g6wcA3hGkCQgA6yFUvxwALUATsL6AAiAA7KbQNcG6Pua/JlATsLbQAKgJJAbWAOv69QCU/uYAfE+cEqwlCPNfD6AJCIDmAHQRKoC0eKNg/zo0B8gB6CLMAezHsZ0CCL9OAZ0C8JY0dTAtoTfvfv+g5wOsb+hQAdEA5sdAvas4AJAAvQIV4ADAJ3Rg/nOASoB14TnAuInKAWoCiYF6gPFPu9RCKfvPYBRcE1gTSAx3DCT59pPAHCAHIIRzAJIvB5g/6rUm0H5bmAPkAH0ZJAw0B2gOIPzw1+mdAjoFEIA3t/cf6X4AWr3guQIBME/BdgMBsNV/vnoAzFOw3UAAbPWfrx4A8xRsNxAAW/3nqwfAPAXbDQTAVv/56gEwT8F2AwGw1X++egDMU7DdQABs9Z+vHgDzFGw3EABb/eerB8A8BdsNXP4JIVv5fHW9qVVvSQsAzyH9hwDAXweT+s8gOAACgDCsBJB8++AcIAcgCnMAkm8fnAPkAERhDkDy7YNzgByAKMwBSL59cA6QAxCFOQDJtw/OAXIAojAHIPn2wTlADkAUsgPo+wJo9+fMHzKl+9crWJ/wofvnh0TpBtZPG9f9BwAqGAD2mDeU/+QAqGAOgALmADkAIaRdMC1+/MWZNYHj5wwGAL4xRAWsBFQCiKFKAMnXKcDkqwdQ/ZoE3lUCCKJKAMlXCTD5KgGqXyWgEvBAEFUCSL5KgMn3H5SA9fsC9ArWL2MUgKvvf/6EkKsLePX9BwBaQAC8cAEDIABIgXUPUwmg9O1fHYvbPwGAClYCXriAARAApEA9AP4yaC1gDkD8X7+JCoAAIAXWDtYpgNJ3fQcLgADYvj386jX06vvPAV66AzzefnlCDabh6yZKHWAq3jmH3xew/gABYBkIANPv5AAooIbnAKZgDmD65QCoH4fnACZhDmD65QCoH4fnACZhDmD65QCoH4fnACZhDmD65QCoH4fnACZhDmD65QCoH4fnACZhDmD65QCoH4fnACbhP21BTB26VaD0AAAAAElFTkSuQmCC')",
            geohashesCount: null
        }
    },

    methods: {
        copyInternalWalletToClipboard() {
            GaltData.copyToClipboard(this.internal_wallet);
            this.$notify({
                type: 'success',
                title: this.$locale.get('user_menu.success.internal_wallet_copied')
            });
        },
        copyInternalWalletPrivateToClipboard() {
            GaltData.copyToClipboard(this.$internalWallet.getPrivate());
            this.$notify({
                type: 'success',
                title: this.$locale.get('user_menu.success.internal_wallet_private_copied')
            });
        },
        toggleInternalWallet() {
            const toggleTo = !this.internal_wallet_active;
            this.$internalWallet.setActive(toggleTo);
            this.$galtUser.setInternalWalletActive(toggleTo);
        },
        regenerateInternalWallet() {
            if(!confirm(this.$locale.get('user_menu.regenerate_confirm'))){
                return;
            }
            
            this.$galtUser.generateNewInternalWallet();
        }
    },

    computed: {
        user_wallet() {
            return this.$store.state.user_wallet;
        },
        user_eth_balance() {
            return this.$store.state.user_eth_balance;
        },
        user_space_balance() {
            return this.$store.state.user_space_balance;
        },
        user_galt_balance() {
            return this.$store.state.user_galt_balance;
        },
        pm_user_applications_ids() {
            return this.$store.state.pm_user_applications_ids;
        },
        is_oracle() {
            return this.$store.state.is_oracle;
        },

        internal_wallet() {
            return this.$store.state.internal_wallet;
        },
        internal_wallet_active() {
            return this.$store.state.internal_wallet_active;
        },
        internal_wallet_eth_balance() {
            return this.$store.state.internal_wallet_eth_balance;
        },
        internal_wallet_galt_balance() {
            return this.$store.state.internal_wallet_galt_balance;
        },
        internal_wallet_space_balance() {
            return this.$store.state.internal_wallet_space_balance;
        }
    }
}
