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

import EthData from "@galtproject/frontend-core/libs/EthData";

export default {
    name: 'tariff-paying-control',
    template: require('./TariffPayingControl.html'),
    props: ['sraAddress', 'tariffAddress', 'loading', 'showSumForPay'],
    async mounted() {
        this.getInfo();
    },
    watch: {
        async user_wallet() {
            this.getInfo();
        },
        async tariffAddress() {
            this.getInfo();
        },
    },
    methods: {
        async getInfo() {
            if(!this.user_wallet) {
                return;
            }
            this.$emit('update:loading', true);

            this.sraContract = await this.$fundsRegistryContract.getSRAByAddress(this.sraAddress);
            this.feeContract = await this.$fundsRegistryContract.getFeeContract(this.tariffAddress);
            this.payData = await this.feeContract.getPayData(this.sraContract, this.user_wallet);
            
            this.$emit('update:loading', false);
        },
        async pay() {
            this.$emit('update:loading', true);

            this.$waitScreen.show();
            if(this.feeContract.currency != 'eth') {
                await this.$galtUser.approveErc20(this.feeContract.currencyContract.address, this.feeContract.address, this.payData.sum);
            }

            await this.$galtUser.tariffPayArray(this.feeContract, this.payData.tokensIds, this.payData.paySumsWei, this.feeContract.currency)
                .then(() => this.handleSuccess('pay'))
                .catch((e) => this.handleError('pay', e));
            
            this.$waitScreen.hide();
        },

        async handleError(name, e) {
            this.notifyResult(name, e);
            this.$emit('update:loading', false);
        },
        async handleSuccess(name) {
            return this.resultUpdate(name);
        },
        async resultUpdate(name, error = null) {
            this.notifyResult(name, error);
            this.$emit('update');
            await this.getInfo();
            this.$emit('update:loading', false);
        },
        notifyResult(name, error = null) {
            const type = error ? 'error' : 'success';
            this.$notify({
                type: type,
                title: this.getLocale(`${type}.${name}.title`),
                text: this.getLocale(`${type}.${name}.description`, { error: error ? error.message || error : "" })
            });
        },
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet
        }
    },
    data() {
        return {
            localeKey: 'reputation.sra_section.tariff_paying_control',
            sra: null,
            feeContract: null,
            payData: null
        }
    }
}
