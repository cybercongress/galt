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
    name: 'proposal-control',
    template: require('./ProposalControl.html'),
    props: ['proposalId', 'managerAddress', 'sraAddress', 'loading'],
    async mounted() {
        this.getProposal();
    },
    watch: {
        async user_wallet() {
            this.getProposal();
        },
        async sraAddress() {
            this.getProposal();
        },
    },
    methods: {
        async getProposal() {
            this.$emit('update:loading', true);
            this.sra = null;

            const sra = await this.$fundsRegistryContract.getSRAByAddress(this.sraAddress);

            await sra.fetchGeneralInfo();
            this.sra = sra;
            this.isSraMember = this.user_wallet && (await this.sra.getIsMember(this.user_wallet));
            this.proposalContract = await sra.storage.getProposalManagerContract(this.managerAddress);
            this.proposal = await this.proposalContract.getProposalObjById(this.proposalId);
            this.userChoice = await this.proposalContract.getProposalsChoice(this.proposalId, this.user_wallet);
            this.proposalShares = await this.proposalContract.getProposalShares(this.proposalId);
            this.$emit('update:loading', false);
        },
        accept() {
            this.$emit('update:loading', true);

            this.$galtUser.sraAcceptProposal(this.sraAddress, this.managerAddress, this.proposalId)
                .then(() => this.handleSuccess('accept'))
                .catch(() => this.handleError('accept'));
        },
        decline() {
            this.$emit('update:loading', true);

            this.$galtUser.sraDeclineProposal(this.sraAddress, this.managerAddress, this.proposalId)
                .then(() => this.handleSuccess('decline'))
                .catch(() => this.handleError('decline'));
        },
        triggerApprove() {
            this.$emit('update:loading', true);

            this.$galtUser.sraTriggerApproveProposal(this.sraAddress, this.managerAddress, this.proposalId)
                .then(() => this.handleSuccess('trigger_approve'))
                .catch(() => this.handleError('trigger_approve'));
        },
        triggerReject() {
            this.$emit('update:loading', true);

            this.$galtUser.sraTriggerRejectProposal(this.sraAddress, this.managerAddress, this.proposalId)
                .then(() => this.handleSuccess('trigger_reject'))
                .catch(() => this.handleError('trigger_reject'));
        },

        async handleError(name) {
            this.notifyResult(name, true);
            this.$emit('update:loading', false);
        },
        async handleSuccess(name) {
            return this.resultUpdate(name);
        },
        async resultUpdate(name, isError = false) {
            this.notifyResult(name, isError);
            this.$emit('update');
            await this.getProposal();
            this.$emit('update:loading', false);
        },
        notifyResult(name, isError = false) {
            const type = isError ? 'error' : 'success';
            this.$notify({
                type: type,
                title: this.getLocale(`${type}.${name}.title`),
                text: this.getLocale(`${type}.${name}.description`)
            });
        },
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet
        }
    },
    data() {
        return {
            localeKey: 'reputation.proposal_control',
            sra: null,
            proposal: null,
            proposalShares: null,
            userChoice: null,
            isSraMember: false
        }
    }
}
