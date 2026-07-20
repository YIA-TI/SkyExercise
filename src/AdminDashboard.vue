<template>
<div class="dashboard-admin">
<MainContentAreaSubsection />
<AsideSideSubsection />
</div>
</template>
<script>
import { defineProps } from "vue";
import { AsideSideSubsection } from "./AsideSideSubsection";
import { MainContentAreaSubsection } from "./MainContentAreaSubsection";

export default {
  name: "DashboardAdmin",
  components: {
    AsideSideSubsection,
    MainContentAreaSubsection,
  },
  props: {},
};
</script>
<style>
.dashboard-admin {
  align-items: flex-start;
  background:
    linear-gradient(
      0deg,
      rgba(248, 249, 255, 1) 0%,
      rgba(248, 249, 255, 1) 100%
    ),
    linear-gradient(
      0deg,
      rgba(255, 255, 255, 1) 0%,
      rgba(255, 255, 255, 1) 100%
    );
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  padding: 0px 0px 0px 288px;
  position: relative;
}

.dashboard-admin::-webkit-scrollbar {
  display: none;
  width: 0;
}
</style>