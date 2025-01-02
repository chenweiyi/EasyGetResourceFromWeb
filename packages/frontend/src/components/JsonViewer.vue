<script setup lang="ts">
const props = defineProps<{
  result: string;
}>();

const data = computed(() => {
  try {
    const res = JSON.stringify(JSON.parse(props.result), null, 2);
    console.log(res);
    return res;
  } catch (error) {
    return '{}';
  }
});

onMounted(() => {
  console.log('JsonViewer mounted...');
});
</script>

<template>
  <div class="w-576px overflow-auto max-h-500px px-20px py-10px">
    <pre class="inline-block w-full">{{ data }}</pre>
  </div>
</template>

<style scoped lang="less"></style>
