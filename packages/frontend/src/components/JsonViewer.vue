<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    result: string;
    type?: 'js' | 'json';
  }>(),
  {
    type: 'json',
  },
);

const data = computed(() => {
  try {
    if (props.type === 'js') {
      return props.result;
    }
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
