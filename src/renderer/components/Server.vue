<template>
  <div class="server">
    <Button to="/" shape="circle">
      <Icon type="ios-arrow-round-back" size="24"></Icon>
    </Button>
    <div class="socket-form">
      <span>端口:</span><Input v-model="port" placeholder="默认ip:127.0.0.1, 端口port:8888"/>
    </div>
    <div class="socket-form">
      <Button type="primary" class="socket-btn" @click="createServer">创建本地服务器</Button>
    </div>
    <Card dis-hover>
      <p slot="title">消息通信</p>
      <p v-for="(message, index) in messages" :key="index">
        {{message}}
      </p>
    </Card>
    <!--<client></client>-->
  </div>
</template>

<script>
// import client from './Client';

const net = require('net');
const leagalCilent = [
  {
    username: 'test123',
    password: 'test123'
  },
  {
    username: 'test234',
    password: 'test234'
  },
  {
    username: 'test345',
    password: 'test345'
  }
];
let socketObj = {};

function broadcast(data) {
  // data 为对象, 对自己也广播了消息
  for (let username in socketObj) {
    if (socketObj.hasOwnProperty(username)) {
      let client = socketObj[username];
      client.write(JSON.stringify(data));
    }
  }
}

function p2p(data) {
  // data为对象
  const to = data.to;
  to.forEach(item => {
    socketObj[item].write(JSON.stringify(data));
  });
}

export default {
  name: 'server',
  data: () => ({
    port: '',
    messages: []
  }),
  // components: {
  //   client
  // },
  methods: {
    createServer() {
      let port = 8888;
      const that = this;
      if (this.port === '') {
        this.$Notice.open({
          title: '将创建端口为8888的本地服务器'
        });
      } else {
        port = this.port;
      }
      try {
        const server = net.createServer(function (socket) {
          // 回调是连接事件的监听器，当连接到来时才会执行，参数为一个socket套接
          // 最大连接数 maxConnections
          socket.on('data', function (data) {
            // data 为 buffer类型
            const dataObj = JSON.parse(data.toString());
            // that.messages.push(dataStr);
            // 给客户端返回数据
            const type = dataObj.type;
            console.log(type, 44);
            switch (type) {
              case 'login':
                let notice = '';
                let serMes = `[${dataObj.username}]正在尝试连接......`;
                const status = leagalCilent.some(item => {
                  if (item.username === dataObj.username && item.password === dataObj.password) {
                    socketObj[item.username] = socket;
                    const num = Object.keys(socketObj).length;
                    notice = `欢迎 ${socket.remoteAddress}:${socket.remotePort}，[${item.username}]加入聊天室，当前在线：${num}人`;
                    that.messages.push(notice);
                    return true;
                  } else {
                    return false;
                  }
                });
                socket.write(JSON.stringify({
                  type: 'auth',
                  info: status
                }));
                if (status) {
                  // Bug 只会出现在个别用户
                  // socket.write(JSON.stringify({
                  //   type: 'persons',
                  //   info: Object.keys(socketObj)
                  // }));
                  for (let username in socketObj) {
                    if (socketObj.hasOwnProperty(username)) {
                      let client = socketObj[username];
                      client.write(JSON.stringify({
                        type: 'persons',
                        info: Object.keys(socketObj)
                      }));
                    }
                  }
                  // 每个端口登录上都会广播
                  broadcast({
                    type: 'broadcast',
                    info: notice
                  });
                } else {
                  serMes += '连接失败';
                  that.messages.push(serMes);
                }
                break;
              case 'broadcast':
                const mes = `[广播]:${dataObj.info}`;
                that.messages.push(mes);
                broadcast({
                  type: 'broadcast',
                  info: mes
                });
                break;
              case 'p2p':
                const mesP2P = `${dataObj.from} ---> ${dataObj.to}:${dataObj.info}`;
                that.messages.push(mesP2P);
                p2p(dataObj);
                break;
            }
          });
          socket.on('close', function () {
            // console.log('服务端：客户端连接断开');
            that.$Message.error('客户端连接断开');
          });
        });
        server.listen(port, '127.0.0.1', function () {
          that.$Message.success('HTTP服务器创建成功');
        });
        server.on('error', function (err) {
          // EADDRINUSE 当前端口号被调用
          if (err.code === 'EADDRINUSE') {
            that.$Message.error('端口被占用');
          }
        });
      } catch (e) {
        that.$Message.error('HTTP服务器创建失败');
      }
    }
  }
}
</script>

<style scoped>
  .server {
    width: 70%;
    margin: 24px auto;
  }

  .socket-form {
    display: flex;
    margin: 12px auto;
    align-items: center;
  }

  .socket-form span {
    width: 50px;
    text-align: right;
    font-size: 16px;
    font-weight: 600;
    margin-right: 24px;
  }

  .socket-btn {
    width: 300px;
    margin: 48px auto;
  }
</style>