import React, { Component } from "react";
import {
  Typography,
  Icon,
  Input,
  Button,
  Divider,
  Layout,
  Switch,
  message
} from "antd";
import md5 from "md5";
import { fetchRoot } from "./Config";
import { history } from "./Global";
const { Content } = Layout;

const { Title, Text } = Typography;
export default class LoginPage extends Component {
  input = {
    nickname: "",
    password: "",
    phone: "",
    seller: false
  };
  state = {
    loading: false
  };
  handleInputChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.input[name] = value;
  };

  componentDidMount() {
    const token = localStorage.getItem("token");
    if (token) {
      // 已经登录
      history.push("/");
    }
  }
  login = () => {
    if (this.input.nickname.length > 8) {
      message.error("昵称长度不合法");
    } else if (this.input.password.length < 3) {
      message.error("密码至少为3位");
    } else if (!/^1[3456789]\d{9}$/.test(this.input.phone)) {
      message.error("手机号格式错误");
    } else {
      this.setState({
        loading: true
      });
      //this.input.password = md5(this.input.password);
      fetch(`${fetchRoot}/login`, {
        method: "post",
        body: JSON.stringify({
          ...this.input,
          nickname: this.input.nickname.length === 0 ? "未命名" : this.input.nickname,
          password: md5(this.input.password)
        }),
        headers: { "Content-Type": "application/json" }
      })
        .then(res => res.json())
        .then(json => {
          if (json.code === 0) {
            message.success(json.msg);
            localStorage.setItem("token", json.token);

            //this.context.setState(json.obj);
            setTimeout(() => {
              history.push("/");
            }, 2000);
          } else {
            message.error(json.msg);
            this.setState({
              loading: false
            });
          }
        });
    }
  };
  render() {
    return (
      <Layout
        style={{ padding: "24px 0", background: "#fff", marginTop: "46px" }}
      >
        <Content style={{ padding: "0 24px", minHeight: 280 }}>
          <Title level={3}>登录/注册</Title>
          <Divider />
          <Input
            name="nickname"
            placeholder="用户名（登录无需输入）"
            prefix={<Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />}
            onChange={this.handleInputChange}
          />
          <br />
          <br />
          <Input.Password
            placeholder="密码"
            name="password"
            prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />}
            onChange={this.handleInputChange}
          />
          <br />
          <br />
          <Input
            name="phone"
            placeholder="手机号"
            prefix={<Icon type="phone" style={{ color: "rgba(0,0,0,.25)" }} />}
            onChange={this.handleInputChange}
          />
          <br />
          <br />
          <Text>注册为：</Text>
          <Switch
            checkedChildren="商家用户"
            unCheckedChildren="普通用户"
            onChange={checked => (this.input["seller"] = checked)}
          />
          <br />
          <br />
          <Button
            loading={this.state.loading}
            type="primary"
            block
            onClick={this.login}
          >
            下一步
          </Button>
          <br />
          <br />
          <Text
            type=""
            style={{ fontSize: "0.5em", display: "block", textAlign: "center" }}
          >
            未注册用户将自动注册，已注册用户将直接登录
          </Text>
        </Content>
      </Layout>
    );
  }
}
