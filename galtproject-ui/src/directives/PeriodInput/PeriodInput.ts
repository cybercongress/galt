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
    name: 'period-input',
    template: require('./PeriodInput.html'),
    props: ['value', 'localeLabel'],
    async created() {
        await this.$locale.waitForLoad();

        this.periodUnits = [
            {value: 'hours', name: this.getLocale('unit_hours')},
            {value: 'days', name: this.getLocale('unit_days')}
        ];
        if(this.value) {
            this.convertValueToData();
        }
    },

    methods: {
        convertValueToData() {
            if(this.value >= this.dayUnit) {
                this.periodUnit = 'days';
                this.periodValue = this.value / this.dayUnit;
            } else {
                this.periodUnit = 'hours';
                this.periodValue = this.value / this.hourUnit;
            }
        },
        convertDataToValue() {
            if(this.periodUnit == 'days') {
                this.$emit('input', this.dayUnit * this.periodValue);
                this.$emit('change', this.dayUnit * this.periodValue);
            } else {
                this.$emit('input', this.hourUnit * this.periodValue);
                this.$emit('change', this.hourUnit * this.periodValue);
            }
        },
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },

    computed: {

    },
    
    watch: {
        periodUnit() {
            this.convertDataToValue();
        },
        periodValue() {
            this.convertDataToValue();
        }
    },

    data() {
        return {
            localeKey: 'period_input',
            dayUnit: 60 * 60 * 24,
            hourUnit: 60 * 60,
            periodUnit: null,
            periodValue: null,
            periodUnits: []
        }
    }
}
