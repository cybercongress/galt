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
    name: 'member-identification-input',
    template: require('./MemberIdentificationInput.html'),
    props: ['value', 'sraAddress'],
    async created() {
        this.sra = await this.$fundsRegistryContract.getSRAByAddress(this.sraAddress);
        
        if(this.$route.name === 'reputation-sra-account') {
            this.memberAddress = this.$route.params.accountAddress;
        } else if(this.$route.name === 'reputation-sra-current-account') {
            this.memberAddress = this.user_wallet;
        }
    },
    watch: {
        async memberAddress() {
            this.generateResultValue();
        },
        async fullName() {
            this.generateResultValue();
        }
    },
    methods: {
        async generateResultValue() {
            if(!this.fullName || !this.memberAddress) {
                this.$emit('input', null);
                this.$emit('change', null);
                return;
            }
            const methodFunc = this.sra.storage.contractInstance.methods.setMemberIdentification;
            const inputFields = EthData.getAbiMethodInputs(this.sra.storage.abi, 'setMemberIdentification');

            const resultValue = EthData.applyMethodByInputsArr(methodFunc, inputFields, {
                'member': this.memberAddress,
                'identificationHash': EthData.generateShaHash(this.fullName)
            }).encodeABI();

            this.$emit('input', resultValue);
            this.$emit('change', resultValue);
        }
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet
        }
    },
    data() {
        return {
            localeKey: 'reputation.sra_section.proposal_fields.input.member_identification',
            memberAddress: null,
            fullName: null
        }
    }
}
