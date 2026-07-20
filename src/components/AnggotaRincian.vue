<template>
  <div class="dashboard-anggota">
    <MainContentCanvasSubsection />
    <img
      class="header-topappbar"
      alt="Header topappbar"
      :src="headerTopappbar"
    />
    <AsideSidenavbarSubsection />
  </div>
</template>

<script>
import { defineProps } from "vue";
import AsideSidenavbarSubsection from "./AsideSidenavbarSubsection";
import headerTopappbar from "./header-topappbar.svg";
import MainContentCanvasSubsection from "./MainContentCanvasSubsection";

export default {
  name: "DashboardAnggota",
  components: {
    AsideSidenavbarSubsection,
    MainContentCanvasSubsection,
  },
  setup() {
    return {
      headerTopappbar,
    };
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
  overflow-y: scroll;
  padding: 0px 0px 32px 256px;
  position: relative;
}

.dashboard-anggota .header-topappbar {
  height: 64px;
  left: 256px;
  position: absolute;
  top: 0;
  width: 1024px;
}

.dashboard-anggota::-webkit-scrollbar {
  display: none;
  width: 0;
}
</style>