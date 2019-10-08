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

import * as _ from 'lodash';

export default {
  name: 'edit-field',
  props: [ 'value', 'state', 'readonly' ],
  watch: {
    value: function () {
      this.changed();
    }
  },
  methods: {
    changed(value){
      if(_.isUndefined(value))
        return;

      this.$emit('input', value);
    }
  },
  template: `<span>
      <input v-if="!readonly" type="text" :class="{'form-control': true, 'invalid':!state.valid}" v-bind:value="value" v-on:input="changed($event.target.value)">
      <span v-if="readonly">{{value}}</span>
      <loader v-if="state.loading"></loader>
      <span class="error">{{state.error_message}}</span>
    </span>
  `
}
