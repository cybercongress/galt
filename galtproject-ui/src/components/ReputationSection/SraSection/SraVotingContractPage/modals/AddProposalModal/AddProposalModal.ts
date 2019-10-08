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

import {ModalItem} from '../../../../../../directives/AsyncModal/index';
import ProposalFieldInput from "../../../../directives/ProposalFieldInput/ProposalFieldInput";

import * as _ from 'lodash';

export default {
    template: require('./AddProposalModal.html'),
    props: ['sraAddress', 'managerAddress'],
    components: {
        ModalItem,
        ProposalFieldInput
    },
    async created() {
        this.loading = true;
        this.sra = null;

        const sra = await this.$fundsRegistryContract.getSRAByAddress(this.sraAddress);
        await sra.fetchGeneralInfo();
        this.sra = sra;
        this.proposalContract = await sra.storage.getProposalManagerContract(this.managerAddress);
        if(this.$locale.has(this.localeKey + '.' + this.proposalContract.contractType)) {
            this.description = this.$locale.get(this.localeKey + '.' + this.proposalContract.contractType)
        }
        
        this.inputFields = this.proposalContract.getProposalInputFields();

        this.loading = false;
    },
    methods: {
        createProposal() {
            this.sending = true;
            
            console.log('this.proposal', this.proposal);

            this.$galtUser.sraNewAbstractProposal(this.sraAddress, this.managerAddress, this.proposal)
                .then(() => {
                    this.sending = false;
                    this.$notify({
                        type: 'success',
                        title: this.getLocale("success.create.title"),
                        text: this.getLocale("success.create.description")
                    });
                    this.$root.$asyncModal.close('add-proposal-modal');
                })
                .catch((e) => {
                    console.error(e);

                    this.$notify({
                        type: 'error',
                        title: this.getLocale("error.create.title"),
                        text: this.getLocale("error.create.description")
                    });
                    this.sending = false;
                })
        },
        cancel() {
            this.$root.$asyncModal.close('add-proposal-modal');
        },
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    beforeDestroy() {
        this.$locale.unbindOnLoad(this.onLoadId);
    },
    computed: {
        isProposalInvalid() {
            return _.some(this.proposal, (value, name) => {
                return _.isUndefined(this.proposal[name]);
            })
        }
    },
    data: function () {
        return {
            localeKey: 'reputation.sra_section.voting_contract_page.add_proposal_modal',
            loading: true,
            sending: false,
            description: "",
            sra: null,
            proposalContract: null,
            inputFields: [],
            proposal: {},
        }
    }
}
