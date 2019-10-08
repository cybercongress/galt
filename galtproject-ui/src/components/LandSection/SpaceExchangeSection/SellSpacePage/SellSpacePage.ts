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

export default {
    name: 'sell-space-page',
    template: require('./SellSpacePage.html'),
    components: {},
    created() {

    },
    mounted() {
        const interval = setInterval(() => {
            this.getSpacesCount();
        }, 10000);

        this.intervals.push(interval);

        this.getSpacesCount();
    },
    beforeDestroy() {
        this.intervals.forEach(intervalId => clearInterval(intervalId));
    },
    methods: {
        async getSpacesCount(){
            this.plotEscrowCount = await this.$galtUser.plotEscrowSellerOrdersCount();
        },
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    data() {
        return {
            localeKey: 'sell_space',
            intervals: [],
            plotEscrowCount: null
        };
    },
    watch: {
        
    },
    computed: {

    },
}
