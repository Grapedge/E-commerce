import React, { Component } from "react";
import {
  Row,
  Col,
  Typography,
  List,
  Affix,
  Button,
  Divider,
  Layout,
  Icon,
  Modal,
  Badge,
  message,
  Spin
} from "antd";
import { withRouter } from "react-router-dom";
import { fetchRoot } from "./Config";
import { privateFetch, history } from "./Global";
const { Content } = Layout;

const { Title, Text } = Typography;

export class FoodItem extends Component {
  render() {
    return (
      <List
        itemLayout="vertical"
        size="middle"
        dataSource={this.props.dataSource}
        renderItem={item => (
          <List.Item
            key={item.id}
            extra={
              <div className="add-btn">
                <Button type="primary" onClick={() => this.props.onClick(item)}>
                  {this.props.buttonText}：{item.price}元
                </Button>
              </div>
            }
          >
            <Row type="flex" gutter={16}>
              <Col>
                <img width={118} height={66} alt="商品图片" src={item.img} />
              </Col>
              <Col>
                <List.Item.Meta
                  title={<Text>{item.name}</Text>}
                  description={
                    item.desc.substr(0, this.props.descLength || 70) + "..."
                  }
                />
              </Col>
            </Row>
          </List.Item>
        )}
      ></List>
    );
  }
}

// 购物车
export default withRouter(
  class ShopPage extends Component {
    state = {
      showCartModal: false, // 显示购物车对话框
      cartList: [], // 购物车列表
      submitLoading: false, // 提交按钮加载状态
      spinning: true, // 是否正在加载数据
      shopData: {
        name: "...",
        desc: "......",
        logo: "https://ycimg.woofeng.cn/20180128/20180128231509_26298.jpg"
      },
      qrcode: "",
      paying: false // 正在支付
    };
    toggleCartModal = () => {
      this.setState({
        showCartModal: !this.state.showCartModal
      });
    };
    componentDidMount() {
      const carts = JSON.parse(localStorage.getItem("carts"));
      if (carts && carts[this.props.match.params.id]) {
        this.setState({
          cartList: carts[this.props.match.params.id]
        })
      }
      fetch(`${fetchRoot}/public/get-shop-data`, {
        method: "post",
        body: JSON.stringify({
          phone: this.props.match.params.id
        }),
        headers: {
          "Content-Type": "application/json"
        }
      })
        .then(res => res.json())
        .then(json => {
          this.setState({
            spinning: false
          });
          if (json.code === 0) {
            this.setState({ shopData: json.obj });
          } else {
            message.error("获取数据出错");
          }
        });
    }

    componentWillUnmount() {
      const carts = JSON.parse(localStorage.getItem("carts"));
      const newCarts = {};
      newCarts[this.props.match.params.id] = this.state.cartList;
      localStorage.setItem("carts", JSON.stringify(Object.assign(carts || {}, newCarts)));
    }

    render() {
      const { shopData } = this.state;
      return (
        <Layout
          style={{ padding: "24px 0", background: "#fff", marginTop: "46px" }}
        >
          <Content style={{ padding: "0 24px", minHeight: 280 }}>
            <Spin tip="Loading..." spinning={this.state.spinning}>
              <Row>
                <Col span={10}>
                  <div className="shop-logo-container">
                    <img src={shopData.logo} alt="logo" className="shop-logo" />
                  </div>
                </Col>
                <Col span={14} style={{ padding: "0 16px" }}>
                  <Title level={2}>{shopData.name}</Title>
                  <Text>{shopData.desc}</Text>
                </Col>
              </Row>
              <Divider />
              <Row>
                <Col>
                  <FoodItem
                    dataSource={shopData.goods}
                    buttonText="加入购物车"
                    onClick={item => {
                      const newItem = Object.assign({}, item);
                      newItem.oriKey = newItem.key;
                      this.state.cartList.push(
                        Object.assign(newItem, {
                          key: `${Date.now()}-${newItem.key}`
                        })
                      );
                      this.setState({
                        cartList: this.state.cartList
                      });
                    }}
                  ></FoodItem>
                </Col>
              </Row>
              <br />
            </Spin>
          </Content>
          <Affix offsetBottom={20}>
            <Row type="flex" justify="end">
              <Col>
                <Badge count={this.state.cartList.length} offset={[-6, 4]}>
                  <Icon
                    type="shopping-cart"
                    className="shopping-cart"
                    onClick={this.toggleCartModal}
                  />
                </Badge>
              </Col>
              <Col span={1}></Col>
            </Row>
          </Affix>
          <Modal
            title="购物车"
            visible={this.state.showCartModal}
            onOk={this.handleOk}
            onCancel={this.toggleCartModal}
            width={600}
            footer={[
              <Button key="back" onClick={this.toggleCartModal}>
                返回
              </Button>,
              <Button
                key="submit"
                type="primary"
                loading={this.state.submitLoading || this.state.paying}
                onClick={() => {
                  const { cartList } = this.state;
                  if (cartList.length < 1) {
                    message.error("请先选择购买的商品");
                  } else {
                    this.setState({
                      submitLoading: true
                    });
                    const orders = cartList.map(v => {
                      const newV = Object.assign({}, v);
                      newV.key = v.oriKey;
                      return newV;
                    });
                    // 等待请求返回二维码
                    privateFetch("/submit-order", {
                      method: "post",
                      body: JSON.stringify({
                        phone: this.props.match.params.id,
                        goods: orders
                      })
                    }).then(json => {
                      if (json.code === 0) {
                        message.info("请用手机扫码支付");
                        this.setState({
                          submitLoading: false,
                          qrcode: json.obj.qrcode,
                          paying: true
                        });
                        let fetching = false;
                        const queryInterval = setInterval(() => {
                          if (!fetching) {
                            fetching = true;
                            privateFetch("/public/query-order", {
                              method: "post",
                              body: JSON.stringify({
                                orderId: json.obj.orderId
                              })
                            }).then(json => {
                              if (json.code === 0) {
                                // 订单已支付
                                clearInterval(queryInterval);
                                message.success("支付成功");
                                this.setState({cartList: {}})
                                history.push("/success");
                              } else {
                                fetching = false;
                              }
                            });
                          }
                        }, 1000);
                      } else {
                        message.error("下单失败！");
                        this.setState({ submitLoading: false });
                      }
                    });
                  }
                }}
              >
                {this.state.paying ? "支付中..." : "提交订单"}
              </Button>
            ]}
          >
            <div
              style={{
                maxHeight: "300px",
                overflow: "auto",
                padding: "0 10px"
              }}
            >
              <Spin tip="订单生成中..." spinning={this.state.submitLoading}>
                {this.state.paying ? (
                  <img
                    src={this.state.qrcode}
                    alt="二维码图片"
                    style={{
                      display: "block",
                      margin: "0 auto"
                    }}
                  />
                ) : (
                  <FoodItem
                    dataSource={this.state.cartList}
                    buttonText="移出购物车"
                    descLength={15}
                    onClick={item => {
                      const { cartList } = this.state;
                      cartList.splice(cartList.indexOf(item), 1);
                      this.setState({ cartList });
                      message.success("移出成功");
                    }}
                  ></FoodItem>
                )}
              </Spin>
            </div>
          </Modal>
        </Layout>
      );
    }
  }
);
