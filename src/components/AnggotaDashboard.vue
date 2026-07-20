<template>
  <div class="dashboard-anggota">
    <MainContentWrapperSubsection />
    <AsideSidenavbarSubsection />
  </div>
</template>

<script>
import { defineProps } from "vue";
import { AsideSidenavbarSubsection } from "./AsideSidenavbarSubsection";
import { MainContentWrapperSubsection } from "./MainContentWrapperSubsection";

export default {
  name: "DashboardAnggota",
  components: {
    AsideSidenavbarSubsection,
    MainContentWrapperSubsection,
  },
};
</script>

<style scoped>
.dashboard-anggota {
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
  padding: 0px 0px 0px 288px;
  position: relative;
}
</style>