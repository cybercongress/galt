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

const _ = require('lodash');

export default {
    name: 'member-managers-input',
    template: require('./MultisigManagersInput.html'),
    props: ['value', 'sraAddress'],
    async created() {
        this.sra = await this.$fundsRegistryContract.getSRAByAddress(this.sraAddress);
        
        this.allManagers = await this.sra.storage.getActiveMultisigManagers();
        
        if(this.value) {
            this.selectedManagers = this.value;
        }
        this.baseValue = _.clone(this.value || []);
        this.loading = false;
    },
    watch: {
        async selectedManagers() {
            this.$emit('input', this.selectedManagers);
            this.$emit('change', this.selectedManagers);
        }
    },
    methods: {
        
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet
        },
        changed() {
            return !_.isEqual(_.sortBy(this.baseValue), _.sortBy(this.selectedManagers)) && !this.loading;
        }
    },
    data() {
        return {
            localeKey: 'reputation.sra_section.proposal_fields.input.multisig_managers',
            loading: true,
            baseValue: null,
            allManagers: [],
            selectedManagers: []
        }
    }
}
