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
import EthData from "@galtproject/frontend-core/libs/EthData";

export default {
    name: 'galt-dex-page',
    template: require('./GaltDexPage.html'),
    components: {},
    created() {

    },
    mounted() {
        const interval = setInterval(() => {
            this.getExchangeRate();
        }, 10000);

        this.intervals.push(interval);

        this.getExchangeRate();
    },
    beforeDestroy() {
        this.intervals.forEach(intervalId => clearInterval(intervalId));
    },
    methods: {
        getExchangeRate(){
            this.$galtDexContract.callMethod('exchangeRate', '0').then((exchangeRate) => {
                this.ethToGaltRate = exchangeRate / Math.pow(10, 12);
                if(this.ethToGalt) {
                    this.inputEth();
                } else {
                    this.inputGalt();
                }
            });
        },
        changeDirection(){
            this.ethToGalt = !this.ethToGalt;
        },
        inputEth() {
            this.galtAmount = GaltData.roundToDecimal(this.convertEthToGalt(this.ethAmount));
        },
        convertEthToGalt(ethAmount) {
            return ethAmount * this.ethToGaltRate;
        },
        inputGalt() {
            this.ethAmount = GaltData.roundToDecimal(this.convertGaltToEth(this.galtAmount));
        },
        convertGaltToEth(galtAmount) {
            return galtAmount / this.ethToGaltRate;
        },
        async exchange() {
            if(this.ethToGalt) {
                const ethBalance = await this.$galtUser.ethBalance();
                if(parseFloat(this.ethAmount) > ethBalance) {
                    this.$notify({
                        type: 'error',
                        title: this.$locale.get('galtdex.error.not_enough_balance.title'),
                        text: this.$locale.get('galtdex.error.not_enough_balance.description', {value: ethBalance, currency: "ETH"})
                    });
                    return;
                }
                const contractGaltBalance = await GaltData.galtBalance(this.$galtDexContract.address);
                if(parseFloat(this.galtAmount) > contractGaltBalance) {
                    this.$notify({
                        type: 'error',
                        title: this.$locale.get('galtdex.error.not_enough_balance_on_contract.title'),
                        text: this.$locale.get('galtdex.error.not_enough_balance_on_contract.description', {value: contractGaltBalance, currency: "GALT"})
                    });
                    return;
                }
                this.$galtUser.exchangeEthToGalt(this.ethAmount).then(() => {
                    const options = {eth_value: this.ethAmount, galt_value: this.convertEthToGalt(this.ethAmount)};
                    this.$notify({
                        type: 'success',
                        title: this.$locale.get('galtdex.success.exchange_galt_to_eth.title', options),
                        text: this.$locale.get('galtdex.success.exchange_galt_to_eth.description', options)
                    });
                });
            } else {
                const galtBalance = await this.$galtUser.galtBalance();
                if(parseFloat(this.galtAmount) > galtBalance) {
                    this.$notify({
                        type: 'error',
                        title: this.$locale.get('galtdex.error.not_enough_balance.title'),
                        text: this.$locale.get('galtdex.error.not_enough_balance.description', {value: galtBalance, currency: "GALT"})
                    });
                    return;
                }
                const contractEthBalance = await EthData.ethBalance(this.$galtDexContract.address);
                if(parseFloat(this.ethAmount) > contractEthBalance) {
                    this.$notify({
                        type: 'error',
                        title: this.$locale.get('galtdex.error.not_enough_balance_on_contract.title'),
                        text: this.$locale.get('galtdex.error.not_enough_balance_on_contract.description', {value: contractEthBalance, currency: "ETH"})
                    });
                    return;
                }

                this.$waitScreen.show();
                this.$waitScreen.changeCenterSubText(this.$locale.get('galtdex.wait_screen.title', {value: this.galtAmount}));

                this.$galtUser.approveGalt(this.$galtDexContract.address, this.galtAmount).then(() => {
                    this.$notify({
                        type: 'success',
                        title: this.$locale.get('galtdex.success.approve_galt.title'),
                        text: this.$locale.get('galtdex.success.approve_galt.description')
                    });

                    this.$galtUser.waitForApproveGalt(this.$galtDexContract.address, this.galtAmount).then(() => {
                        this.$galtUser.exchangeGaltToEth(this.galtAmount).then(() => {
                            this.$waitScreen.hide();
                            const options = {galt_value: this.galtAmount, eth_value: this.convertGaltToEth(this.galtAmount)};
                            this.$notify({
                                type: 'success',
                                title: this.$locale.get('galtdex.success.exchange_eth_to_galt.title', options),
                                text: this.$locale.get('galtdex.success.exchange_eth_to_galt.description', options)
                            });
                        });
                    });
                });
            }
        }
    }
    ,
    data() {
        return {
            intervals: [],
            ethToGalt: true,
            galtAmount: null,
            ethAmount: null,
            ethToGaltRate: null
        };
    },
    watch: {
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet;
        },
        oneEthToGalt() {
            return this.ethToGaltRate ? GaltData.roundToDecimal(this.convertEthToGalt(1)) : '...';
        },
        oneGaltToEth() {
            return this.ethToGaltRate ? GaltData.roundToDecimal(this.convertGaltToEth(1)) : '...';
        },

    },
}
