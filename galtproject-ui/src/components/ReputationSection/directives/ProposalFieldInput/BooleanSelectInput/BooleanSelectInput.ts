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
    name: 'boolean-select-input',
    template: require('./BooleanSelectInput.html'),
    props: ['value', 'contractType'],
    async created() {
        this.setValue();
        
        await this.$locale.waitForLoad();
        
        if(this.$locale.has(this.localeKey + '.' + this.contractType + '.true')) {
            this.trueStr = this.$locale.get(this.localeKey + '.' + this.contractType + '.true');
            this.falseStr = this.$locale.get(this.localeKey + '.' + this.contractType + '.false');
        } else {
            this.trueStr = this.$locale.get(this.localeKey + '.true');
            this.falseStr = this.$locale.get(this.localeKey + '.false');
        }
    },
    watch: {
        localValue() {
            this.setValue();
        }
    },
    methods: {
        async setValue() {
            this.$emit('input', !!this.localValue);
            this.$emit('change', !!this.localValue);
        }
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet
        }
    },
    data() {
        return {
            localeKey: 'reputation.sra_section.proposal_fields.input.boolean_select',
            localValue: 1,
            trueStr: null,
            falseStr: null
        }
    }
}
