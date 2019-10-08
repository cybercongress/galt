<!--
  - Copyright ©️ 2018 Galt•Space Society Construction and Terraforming Company 
  - (Founded by [Nikolai Popeka](https://github.com/npopeka),
  - [Dima Starodubcev](https://github.com/xhipster), 
  - [Valery Litvin](https://github.com/litvintech) by 
  - [Basic Agreement](http://cyb.ai/QmSAWEG5u5aSsUyMNYuX2A2Eaz4kEuoYWUkVBRdmu9qmct:ipfs)).
  - ​
  - Copyright ©️ 2018 Galt•Core Blockchain Company 
  - (Founded by [Nikolai Popeka](https://github.com/npopeka) and 
  - Galt•Space Society Construction and Terraforming Company by 
  - [Basic Agreement](http://cyb.ai/QmaCiXUmSrP16Gz8Jdzq6AJESY1EAANmmwha15uR3c1bsS:ipfs)).
  -->

<template>
  <div class="tabs-container">
    <ul class="tabs-bar">
      <li
        v-for="(tab, index) in tabList"
        v-bind="tab.dataAttrs"
        :key="index"
        :class="[{'active': isActive(index), 'disabled': tab.disabled, 'has-notification': tab.hasNotification}, tab.classes]"
        @click="select(index)">
        {{ tab.title }}
      </li>
    </ul>
    <div :class="[{'tabs-content': true}, activeTab.contentClasses]">
      <slot></slot>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        tabList: [],
        activeTabIndex: 0
      }
    },

    mounted() {
      this.activeTabIndex = this.getInitialActiveTab() || 0;
      this.select(this.activeTabIndex);

      this.$root.$on('select-tab', index => this.select(index));
    },

    computed: {
        activeTab: function () {
            return this.tabList[this.activeTabIndex] || {};
        }
    },

    methods: {
      isActive(index) {
        return this.activeTabIndex === index;
      },

      select(index) {
        const tab = this.tabList[index];
        if (!tab.isDisabled) {
          this.activeTabIndex = index;
        }
        if(tab.state){
        	if(tab.state === this.$router.currentRoute.name){
        		return;
          }
          this.$router.push({ name: tab.state });
        }
        this.$emit('select', tab.id);
      },

      getInitialActiveTab() {
        var index = this.tabList.findIndex(tab => tab.state === this.$router.currentRoute.name);
        console.log(index, this.$router.currentRoute.name, this.tabList);
        if(index !== -1)
        	return index;

        index = this.tabList.findIndex(tab => tab.active);
        return index === -1 ? 0 : index;
      }

    }
  }
</script>
