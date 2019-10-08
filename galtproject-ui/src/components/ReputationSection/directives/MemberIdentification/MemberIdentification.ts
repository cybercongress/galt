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
import Helper from "@galtproject/frontend-core/services/helper";
import CheckIdentifierModal from "../../SraSection/modals/CheckIdentifierModal/CheckIdentifierModal";

export default {
    name: 'member-identification-input',
    template: require('./MemberIdentification.html'),
    props: ['hex'],
    created() {
        this.cutHex();
    },
    watch: {
        async hex() {
            this.cutHex();
        }
    },
    methods: {
        cutHex(){
            if(!this.hex) {
                this.showHex = "...";
                this.type = null;
                return;
            }
            if(this.full) {
                this.showHex = this.hex;
            } else {
                this.showHex = EthData.cutHex(this.hex);
            }
        },
        copyToClipboard() {
            Helper.copyToClipboard(this.hex);

            this.$notify({
                type: 'success',
                title: this.$locale.get('pretty_hex.copied_to_clipboard')
            });
        },
        identificationModal() {
            this.$root.$asyncModal.open({
                id: 'check-identifier-modal',
                component: CheckIdentifierModal,
                props: {identifierHash: this.hex}
            });
        }
    },
    computed: {
        
    },
    data() {
        return {
            showHex: null,
            type: null
        }
    }
}
