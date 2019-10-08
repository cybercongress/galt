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

import {ModalItem} from '../../../../../directives/AsyncModal/index'
import EthData from "@galtproject/frontend-core/libs/EthData";

export default {
    template: require('./CheckIdentifierModal.html'),
    props: [ 'identifierHash' ],
    components: {
        ModalItem
    },
    created() {

    },
    mounted(){

    },
    methods: {
        ok() {
            this.$root.$asyncModal.close('check-identifier-modal', true);
        },
        cancel() {
            this.$root.$asyncModal.close('check-identifier-modal');
        }
    },
    computed: {
        validateResult() {
            if(!this.userData.fullName) {
                return 'waiting';
            }
            const currentIdentifierHash = EthData.generateShaHash(this.userData.fullName);

            if(currentIdentifierHash == this.identifierHash) {
                return 'valid';
            } else {
                return 'invalid';
            }
        }
    },
    watch: {},
    data: function () {
        return {
            localeKey: 'reputation.sra_section.check_identifier_modal',
            userData: {
                fullName: ""
            }
        }
    }
}
