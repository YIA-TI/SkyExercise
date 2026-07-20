<template>
<div class="admin-data-anggota">
<MainContentAreaSubsection />
<HeaderTopSubsection />
<AsideSidebarSubsection />
</div>
</template>
<script>
import { defineProps } from "vue";
import { AsideSidebarSubsection } from "./AsideSidebarSubsection";
import { HeaderTopSubsection } from "./HeaderTopSubsection";
import { MainContentAreaSubsection } from "./MainContentAreaSubsection";

export default {
  name: "AdminDataAnggota",
  components: {
    AsideSidebarSubsection,
    HeaderTopSubsection,
    MainContentAreaSubsection,
  },
  props: {},
};
</script>
<style>
.admin-data-anggota {
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