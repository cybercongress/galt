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

import GaltData from "../../../../services/galtData";
import SpecifyAddressModal from "../../../../modals/SpecifyAddressModal/SpecifyAddressModal";
import SpecifyAddressAndAmountModal from "../../../../modals/SpecifyAddressAndAmountModal/SpecifyAddressAndAmountModal";
import EthData from "@galtproject/frontend-core/libs/EthData";

export default {
    name: 'general-info',
    template: require('./GeneralInfo.html'),
    props: ['userWallet'],
    async mounted() {
         this.getData();
    },
    watch: {
        userWallet() {
            this.getData();
        }
    },
    methods: {
        getData() {
            EthData.ethBalance(this.userWallet).then(ethBalance => {
                this.ethBalance = ethBalance;
            });
            GaltData.galtBalance(this.userWallet).then(galtBalance => {
                this.galtBalance = galtBalance;
            });
            GaltData.spaceTokensCount(this.userWallet).then(spaceBalance => {
                this.spaceBalance = spaceBalance;
            });
        },
        sendGalt() {
            this.$root.$asyncModal.open({
                id: 'specify-address-and-amount-modal',
                component: SpecifyAddressAndAmountModal,
                props: {
                    locale: 'transfer_galt'
                },
                onClose: (data) => {
                    if(!data) {
                        return;
                    }

                    this.$galtUser.transferGalt(data.address, data.amount).then(() => {
                        this.$notify({
                            type: 'success',
                            title: this.$locale.get(this.localeKey + '.success.token_sent.title'),
                            text: this.$locale.get(this.localeKey + '.success.token_sent.description', data)
                        });
                    }).catch(() => {
                        this.$notify({
                            type: 'error',
                            title: this.$locale.get(this.localeKey + '.error.token_sent.title'),
                            text: this.$locale.get(this.localeKey + '.error.token_sent.description', data)
                        });
                    });
                }
            });
        }
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet;
        }
    },
    data() {
        return {
            localeKey: 'user_account.general_info',
            ethBalance: null,
            galtBalance: null,
            spaceBalance: null
        }
    }
}
