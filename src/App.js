import React, { Component } from "react";
import { Typography, Layout, Menu, Col, Row, Avatar, Popover, message } from "antd";
import { Router, Route, Switch } from "react-router-dom";
import MainPage from "./pages/MainPage";
import NotFoundPage from "./pages/NotFoundPage";
import LoginPage from "./pages/LoginPage";
import ShopPage from "./pages/ShopPage";
import { Link, withRouter } from "react-router-dom";
import { history, privateFetch, relogin } from "./pages/Global";
import "./App.css";
import ManagePage from "./pages/ManagePage";
import SuccessPage from "./pages/SuccessPage";
import UserPage from "./pages/UserPage";

const { Header, Footer, Content } = Layout;
const { Title } = Typography;

class AppContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLogged: false,
      loadingUser: false,
      user: {
        // 用户昵称
        nickname: "未登录",
        // 用户账户
        account: "0",
        // 用户头像
        avatar: "",
        // 用户描述
        desc: "",
        // 是否为商家
        seller: false
      },
      location: "/"
    };
  }

  updateData = props => {
    this.setState(props);
  };
  onRouteChanged = () => {
    this.setState({ location: this.getCurSelectedMenu() });
    if (localStorage.getItem("token")) {
      this.setState({ isLogged: true, loadingUser: true });
      privateFetch("/user", {
        method: "post"
      })
        .then(json => {
          if (json.code === 0)
            this.setState({
              isLogged: true,
              user: json.obj,
              loadingUser: false
            });
          else if (json.code === -128)
            this.setState({ isLogged: false, loadingUser: false });
          else {
            message.warn("登录信息失效");
            relogin();
          }
        })
        .catch(e => console.log(e));
    } else {
      this.setState({ isLogged: false, loadingUser: false });
    }
  };

  componentDidMount() {
    this.onRouteChanged(this.props.location);
  }

  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      this.onRouteChanged(this.props.location);
    }
  }

  pathMenutMap = {
    "/manage": [/\/manage/g],
    "/": [/\/*/]
  };

  getCurSelectedMenu = () => {
    const keys = Object.keys(this.pathMenutMap);
    for (let k of keys) {
      for (let reg of this.pathMenutMap[k]) {
        if (reg.test(this.props.location.pathname)) {
          return k;
        }
      }
    }
  };
  render() {
    const { user } = this.state;
    const avatarTip = this.state.isLogged
      ? `${user.nickname} ${user.seller ? "商家" : "买家"}`
      : `尚未登录`;
    return (
      <Layout id="app-layout">
        <Header className="header" style={{ backgroundColor: "#fff" }}>
          <Row type="flex" align="middle">
            <Col span={20}>
              <Title level={4} className="logo">
                丑团
              </Title>
              <Menu
                theme="light"
                mode="horizontal"
                selectedKeys={[this.state.location]}
                style={{ lineHeight: "64px" }}
              >
                <Menu.Item key="/">
                  <Link to="/">商店</Link>
                </Menu.Item>
                {this.state.user.seller ? (
                  <Menu.Item key="/manage">
                    <Link to="/manage">管理</Link>
                  </Menu.Item>
                ) : null}
              </Menu>
            </Col>
            <Col span={4}>
              <Row type="flex" justify="end" align="middle">
                <Popover
                  content={avatarTip}
                  title="用户信息"
                  placement="bottomLeft"
                >
                  <Link
                    to={
                      this.state.loadingUser
                        ? "/"
                        : this.state.isLogged
                        ? "/user"
                        : "/login"
                    }
                  >
                    <Avatar
                      icon="user"
                      size="large"
                      src={this.state.user.avatar}
                      className="avatar"
                    />
                  </Link>
                </Popover>
              </Row>
            </Col>
          </Row>
        </Header>
        <Content style={{ padding: "0 100px" }}>
          <Switch>
            <Route exact path="/">
              <MainPage />
            </Route>
            <Route path="/login">
              <LoginPage />
            </Route>
            <Route path="/user">
              <UserPage user={this.state.user} />
            </Route>
            <Route path="/shop/:id" component={ShopPage} />
            <Route path="/manage" component={ManagePage} />
            <Route path="/success" component={SuccessPage} />
            <Route component={NotFoundPage} />
          </Switch>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          Web Course Design ©2019 Created by Grapedge
        </Footer>
      </Layout>
    );
  }
}

export default function() {
  const AppRoute = withRouter(AppContainer);
  return (
    <Router className="App" history={history}>
      <AppRoute />
    </Router>
  );
}
