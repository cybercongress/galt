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

import {ModalItem} from '../../directives/AsyncModal'

export default {
    template: require('./SpecifyAmountModal.html'),
    props: ['title', 'placeholder', 'defaultValue'],
    components: {
        ModalItem
    },
    created() {
        this.amount = this.defaultValue;
    },
    methods: {
        ok() {
            this.$root.$asyncModal.close('specify-amount-modal', this.amount);
        },
        cancel() {
            this.$root.$asyncModal.close('specify-amount-modal');
        }
    },
    watch: {},
    data: function () {
        return {
            amount: null
        }
    }
}
