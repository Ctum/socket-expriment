<template>
  <div class="server">
    <Button to="/" shape="circle">
      <Icon type="ios-arrow-round-back" size="24"></Icon>
    </Button>
    <div class="client-form" v-show="!logined">
      <div class="socket-form">
        <span>端口:</span><Input v-model="port" placeholder="默认ip:127.0.0.1, 端口port:8888"/>
      </div>
      <Form ref="formInline" :model="formInline" :rules="ruleInline">
        <FormItem prop="user">
          <Input type="text" v-model="formInline.user" placeholder="Username">
          <Icon type="ios-person-outline" slot="prepend"></Icon>
          </Input>
        </FormItem>
        <FormItem prop="password">
          <Input type="password" v-model="formInline.password" placeholder="Password">
          <Icon type="ios-lock-outline" slot="prepend"></Icon>
          </Input>
        </FormItem>
        <FormItem>
          <Button type="primary" @click="handleSubmit('formInline')">登陆</Button>
        </FormItem>
      </Form>
    </div>
    <div v-show="logined">
      <br/>
      <Card dis-hover>
        <p slot="title">收到的消息</p>
        <p v-for="(message, index) in messages" :key="index">
          {{message}}
        </p>
      </Card>
      <br/>
      <Input v-model="mes" type="textarea" :rows="5" placeholder="输入一些消息"/>
      <br/>
      <br/>
      <Row>
        <Col span="6">
          <Select v-model="commuType">
            <Option v-for="item in mesType" :value="item" :key="item">{{item}}</Option>
          </Select>
        </Col>
        <Col span="6" offset="2">
          <Select v-model="person" :disabled="second" multiple>
            <Option v-for="item in persons" :value="item" :key="item">{{item}}</Option>
          </Select>
        </Col>
        <Col span="1" offset="7">
          <Button @click="sendMes">发送</Button>
        </Col>
      </Row>
    </div>
  </div>
</template>

<script>
const net = require('net');
export default {
  name: 'client',
  data: () => ({
    mesType: ['广播', '私聊'],
    commuType: '广播',
    person: [],
    persons: [],
    port: '',
    mes: '',
    messages: [],
    client: '',
    logined: false,
    formInline: {
      user: '',
      password: ''
    },
    ruleInline: {
      user: [
        {required: true, message: 'Please fill in the user name', trigger: 'blur'}
      ],
      password: [
        {required: true, message: 'Please fill in the password.', trigger: 'blur'},
        {type: 'string', min: 6, message: 'The password length cannot be less than 6 bits', trigger: 'blur'}
      ]
    }
  }),
  computed: {
    second() {
      if (this.commuType === '广播') {
        return true;
      } else {
        return false;
      }
    }
  },
  methods: {
    handleSubmit(name) {
      const that = this;
      this.$refs[name].validate((valid) => {
        if (valid) {
          let port = 8888;
          if (this.port !== '') {
            port = this.port;
          }
          const host = '127.0.0.1';
          const client = net.createConnection(port, host);
          client.on('connect', function () {
            const sendMes = {
              username: that.formInline.user,
              password: that.formInline.password,
              type: 'login'
            };
            const jsonStr = JSON.stringify(sendMes);
            client.write(jsonStr);
            that.client = client;
          });

          client.on('data', function (data) {
            let dataArr = data.toString().split('{');
            dataArr = dataArr.map(item => {
              if (item) {
                return '{' + item;
              }
            });
            dataArr = dataArr.slice(1, 4);
            for (let arr of dataArr) {
              const dataStr = JSON.parse(arr.toString());
              const type = dataStr.type;
              switch (type) {
                case 'auth':
                  // 消息认证
                  if (dataStr.info === true) {
                    that.$Message.success('认证成功');
                    that.logined = true;
                  } else {
                    that.$Message.error('认证失败');
                  }
                  break;
                case 'persons':
                  // 当前在线人数
                  if (dataStr.info.length !== 1) {
                    that.persons = dataStr.info.map(item => {
                      if (item !== that.username) {
                        return item;
                      }
                    })
                  }
                  break;
                case 'broadcast':
                  // 接收广播消息
                  that.messages.push(dataStr.info);
                  break;
                case 'p2p':
                  const mes = `from:${dataStr.from},message:${dataStr.info}`;
                  that.messages.push(mes);
                  break;
              }
            }
          });

          client.on('close', function (data) {
            that.$Message.error('服务器关闭');
          });
        } else {
          that.$Message.error('Fail!');
        }
      })
    },
    sendMes() {
      // 发送广播orP2P消息
      const map = new Map([
        ['广播', 'broadcast'],
        ['私聊', 'p2p']
      ]);
      let notice = {};
      if (this.person && map.get(this.commuType) === 'p2p') {
        notice = {
          type: 'p2p',
          info: this.mes,
          from: this.formInline.user,
          to: this.person
        };
      } else {
        notice = {
          type: 'broadcast',
          info: this.mes
        };
      }
      notice = JSON.stringify(notice);
      this.client.write(notice);
    }
  }
}
</script>

<style scoped>
  .server {
    width: 70%;
    margin: 24px auto;
  }

  .client-form {
    width: 70%;
    text-align: center;
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
</style>