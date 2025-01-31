<template>
  <div id="options" class="container xl:w-2/3 mx-auto flex flex-col gap-1">
    <DebugVariables v-if="debug" :state="state.options" title="options" />
    <ChooseImageFormat v-model:format="state.options.imageFormat" />
    <ChooseChromePath v-model:path="state.options.chromePath" />
    <ChooseDownloadDirectory v-model:path="state.options.outputDirectory" />
    <h2 class="text-xl text-center underline opacity-80 font-bold">
      Tout changement des options est appliqué au prochain démarrage de
      l'application
    </h2>
    <BaseButton class="text-2xl" @click="setData">
      Sauvegarder les modifications
    </BaseButton>
    <p class="text-center text-xl opacity-70" v-scroll-to v-if="state.message">
      {{ state.message }}
    </p>
  </div>
</template>

<script lang="ts" setup>
import { ipcRenderer } from "electron";
import { reactive } from "vue";
import { configData } from "@/utils/handleConfig";
import { inject } from "@vue/runtime-core";
import DebugVariables from "@/components/DebugVariables.vue";
import BaseButton from "@/components/BaseButton.vue";
import ChooseImageFormat from "@/components/Options/ChooseImageFormat.vue";
import ChooseChromePath from "@/components/Options/ChooseChromePath.vue";
import ChooseDownloadDirectory from "@/components/Options/ChooseDownloadDirectory.vue";

const debug = inject("debug");

const state = reactive({
  options: {} as configData,
  possibleOptions: {} as { [key: string]: string[] },
  message: "" as string,
  //@ts-expect-error doesn't understand Timeout type
  // eslint-disable-next-line no-undef
  timeout: null as null | Timeout,
});

ipcRenderer.send("getConfigData");
ipcRenderer.once("returnConfigData", (event, data: configData) => {
  state.options = data;
});

function setData() {
  const data = ipcRenderer.sendSync("setDataSync", {
    theme: state.options.theme,
    outputDirectory: state.options.outputDirectory,
    imageFormat: state.options.imageFormat,
    chromePath: state.options.chromePath,
  } as configData);
  if (state.timeout) clearTimeout(state.timeout);
  if (data === "ok") {
    state.message = "Les options ont été enregistrées avec succès";
  } else {
    const objectEntries = Object.entries(data);
    const errorMessage = objectEntries
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
    state.message = `Erreur lors de l'enregistrement des options: ${errorMessage}`;
  }
  state.timeout = setTimeout(() => {
    state.message = "";
    state.timeout = null;
  }, 5000);
}
</script>

<style scoped>
:deep(.header) {
  @apply text-2xl font-bold mb-4;
}
</style>
