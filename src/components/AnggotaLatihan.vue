<template>
  <div class="latihan-user">
    <MainContentCanvasSubsection />
    <AsideSidenavbarSubsection />
  </div>
</template>

<script>
import { defineProps } from "vue";
import { AsideSidenavbarSubsection } from "./AsideSidenavbarSubsection";
import { MainContentCanvasSubsection } from "./MainContentCanvasSubsection";

export default {
  name: "LatihanUser",
  components: {
    AsideSidenavbarSubsection,
    MainContentCanvasSubsection,
  },
};
</script>

<style scoped>
.latihan-user {
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
  padding: 0px 0px 0px 256px;
  position: relative;
}
</style>