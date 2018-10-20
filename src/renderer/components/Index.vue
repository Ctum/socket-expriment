<template>
  <div class="index">
    <h2>Node + Socket</h2>
    <Button type="primary" size="large" to="create-server" class="socket-btn">
      <span>创建服务器</span>
    </Button>
    <Button type="primary" size="large" to="create-client" class="socket-btn">创建客户端</Button>
  </div>
</template>

<script>
export default {
  name: 'index'
}
</script>

<style scoped>
  h2 {
    font-weight: 400;
    font-size: 64px;
    text-align: center;
    margin-top: 48px;
    margin-bottom: 24px;
  }

  .index {
    text-align: center;
    display: flex;
    flex-direction: column;
  }

  .socket-btn {
    width: 300px;
    margin: 12px auto;
  }
</style>