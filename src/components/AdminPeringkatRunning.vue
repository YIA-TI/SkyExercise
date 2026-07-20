<template>
<div class="papan-peringkat">
<MainContentSectionSubsection />
<img
      class="header-topappbar"
      alt="Header topappbar"
      :src="headerTopappbar"
    />
<AsideSidebarSubsection />
</div>
</template>
<script>
import { defineProps } from "vue";
import { AsideSidebarSubsection } from "./AsideSidebarSubsection";
import headerTopappbar from "./header-topappbar.svg";
import { MainContentSectionSubsection } from "./MainContentSectionSubsection";

export default {
  name: "PapanPeringkat",
  components: {
    AsideSidebarSubsection,
    MainContentSectionSubsection,
  },
  setup() {
    return {
      headerTopappbar,
    };
  },
};
</script>
<style>
.papan-peringkat {
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
  padding: 0px 0px 0px 256px;
  position: relative;
}

.papan-peringkat .header-topappbar {
  -webkit-backdrop-filter: blur(6px) brightness(100%);
  backdrop-filter: blur(6px) brightness(100%);
  height: 57px;
  left: 256px;
  object-fit: cover;
  position: absolute;
  top: 0;
  width: calc(100% - 256px);
}

.papan-peringkat::-webkit-scrollbar {
  display: none;
  width: 0;
}
</style>