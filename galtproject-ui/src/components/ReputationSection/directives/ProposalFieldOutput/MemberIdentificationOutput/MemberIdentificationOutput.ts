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
import MemberIdentification from "../../MemberIdentification/MemberIdentification";

export default {
    name: 'member-identification-output',
    template: require('./MemberIdentificationOutput.html'),
    props: ['value', 'sraAddress'],
    components: {MemberIdentification},
    async created() {
        this.sra = await this.$fundsRegistryContract.getSRAByAddress(this.sraAddress);
        this.parseValue();
    },
    watch: {
        async value() {
            this.parseValue();
        }
    },
    methods: {
        parseValue() {
            const parsed: any = EthData.parseData(this.value, this.sra.storage.abi, 0);
            this.fullNameHash = parsed.inputs.identificationHash;
            this.memberAddress = parsed.inputs.member;
        }
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet
        }
    },
    data() {
        return {
            localeKey: 'reputation.sra_section.proposal_fields.output.member_identification',
            fullNameHash: null,
            memberAddress: null
        }
    }
}
