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

import GaltData from "../../../services/galtData";
import EthData from "@galtproject/frontend-core/libs/EthData";

export default {
    name: 'admin-galt-dex',
    template: require('./AdminGaltDex.html'),
    props: [],
    mounted() {
        const interval = setInterval(() => {
            this.getGaltDexData();
        }, 10000);

        this.intervals.push(interval);

        this.getGaltDexData();
    },
    beforeDestroy() {
        this.intervals.forEach(intervalId => clearInterval(intervalId));
    },
    watch: {
        
    },
    methods: {
        async getGaltDexData() {
            this.galtToEthSum = GaltData.weiToEtherRound(await this.getGaltDexProp('galtToEthSum'));
            this.ethToGaltSum = GaltData.weiToEtherRound(await this.getGaltDexProp('ethToGaltSum'));
            this.galtFee = GaltData.weiToSzaboRound(await this.getGaltDexProp('galtFee'));
            this.ethFee = GaltData.weiToSzaboRound(await this.getGaltDexProp('ethFee'));
            this.ethFeePayout = GaltData.weiToEtherRound(await this.getGaltDexProp('ethFeePayout'));
            this.galtFeePayout = GaltData.weiToEtherRound(await this.getGaltDexProp('galtFeePayout'));
            this.galtFeeTotalPayout = GaltData.weiToEtherRound(await this.getGaltDexProp('galtFeeTotalPayout'));
            this.ethFeeTotalPayout = GaltData.weiToEtherRound(await this.getGaltDexProp('ethFeeTotalPayout'));

            this.galtBalance = await GaltData.galtBalance(this.$galtDexContract.address);
            this.ethBalance = await EthData.ethBalance(this.$galtDexContract.address);
        },
        async getGaltDexProp(property) {
            const result = await this.$galtDexContract.callMethod(property);
            console.log('getGaltDexProp', property, result);
            return result;
        },
        async withdrawEthFee() {
            await this.$galtUser.withdrawGaltDexEthFee();

            this.$notify({
                type: 'success',
                title: this.getLocale("success.eth_fee_payout.title"),
                text: this.getLocale("success.eth_fee_payout.description", {value: this.ethFeePayout})
            });
        },
        async withdrawGaltFee() {
            await this.$galtUser.withdrawGaltDexGaltFee();

            this.$notify({
                type: 'success',
                title: this.getLocale("success.galt_fee_payout.title"),
                text: this.getLocale("success.galt_fee_payout.description", {value: this.galtFeePayout})
            });
        },
        async editFee(currency) {
            GaltData.specifyAmountModal({
                title: this.getLocale("edit_fee.title",{currency: currency.toUpperCase()}),
                placeholder: this.getLocale("edit_fee.placeholder"),
                defaultValue: currency == 'eth' ? this.ethFee : this.galtFee
            }).then(async (amount: any) => {
                this.$galtUser.setGaltDexFee(currency, amount);
            });
        },
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    data() {
        return {
            localeKey: 'admin.galtdex',
            intervals: [],
            galtBalance: null,
            ethBalance: null,
            ethFeePayout: null,
            galtFeePayout: null,
            galtToEthSum: null,
            ethToGaltSum: null,
            galtFee: null,
            ethFee: null,
            galtFeeTotalPayout: null,
            ethFeeTotalPayout: null,
        }
    }
}
