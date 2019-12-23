// 商家管理页面
// 修改店铺信息等等...
// 添加、删除、修改商品
import React, { Component } from "react";
import {
  Layout,
  Input,
  message,
  Button,
  PageHeader,
  Icon,
  Modal,
  InputNumber,
  List,
  Spin
} from "antd";
import UploadImage from "../UploadImage";
import { privateFetch } from "./Global";
import { FoodItem } from "./ShopPage";

const { Content } = Layout;

class ModifyShopInfo extends Component {
  state = {
    data: {},
    modifying: false
  };
  input = this.props.data || {
    name: "",
    desc: "",
    logo: ""
  };

  handleInputChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.input[name] = value;
  };

  _isMounted = false;

  componentDidMount() {
    this._isMounted = true;
    this.setState({ data: this.props.data });
  }

  componentWillUnmount() {
    this._isMounted = false;
  }
  onModify = () => {
    this.setState({
      modifying: true
    });
    const { name, desc, logo } = this.input;
    let success = true;
    if (name.length > 8 || name.length < 1) {
      success = false;
      message.error("店铺名长度非法");
    }
    if (desc.length === 0 || desc.length > 100) {
      success = false;
      message.error("请输入正确的描述");
    }
    if (logo.length === 0) {
      success = false;
      message.error("请上传店铺Logo，建议尺寸为4:3");
    }
    if (success) {
      privateFetch("/modify-shop", {
        method: "post",
        body: JSON.stringify(this.input)
      }).then(json => {
        if (!this._isMounted) return;
        this.setState({
          modifying: false
        });
        if (json.code === 0) {
          message.success(json.msg);
          this.props.onChange();
        } else {
          message.error(json.msg);
        }
      });
    } else {
      this.setState({
        modifying: false
      });
    }
  };

  render() {
    const { name, desc, logo } = this.state.data;
    return (
      <React.Fragment>
        <br />
        <Input
          name="name"
          placeholder="商店名"
          defaultValue={name || ""}
          onChange={this.handleInputChange}
        />
        <br />
        <br />
        <Input
          name="desc"
          placeholder="商店描述"
          defaultValue={desc}
          onChange={this.handleInputChange}
        />
        <br />
        <br />
        <UploadImage
          className="logo-uploader"
          uploadText="上传店铺Logo"
          name="logo"
          imageUrl={logo}
          onUpload={json => {
            this.input["logo"] = json.obj;
            this.setState({ data: { ...this.state.data, logo: json.obj } });
          }}
          style={{ width: "292px", height: "218px" }}
        />
        <Button
          type="primary"
          block
          loading={this.state.modifying}
          onClick={this.onModify}
        >
          保存店铺信息
        </Button>
      </React.Fragment>
    );
  }
}

class GoodsInfoModal extends Component {
  static defaultProps = {
    goods: {}
  };

  handleInputChange = event => {
    this.props.onChange(event);
  };

  render() {
    const { name, desc, price, img } = this.props.goods;
    return (
      <Modal {...this.props}>
        <Input
          name="name"
          placeholder="商品名"
          onChange={this.handleInputChange}
          value={name}
        />
        <br />
        <br />
        <Input
          name="desc"
          placeholder="商品描述"
          value={desc}
          onChange={this.handleInputChange}
        />
        <br />
        <br />
        价格：<InputNumber
          name="price"
          onChange={value =>
            this.handleInputChange({
              target: {
                name: "price",
                value: value,
                type: "number"
              }
            })
          }
          value={price}
        /> 元
        <br />
        <br />
        <UploadImage
          className="logo-uploader"
          uploadText="上传商品图片"
          name="img"
          imageUrl={img || ""}
          onUpload={json => {
            this.handleInputChange({
              target: {
                type: "file",
                name: this.props.imgName || "img",
                value: json.obj
              }
            });
          }}
          style={{ width: "292px", height: "218px" }}
        />
      </Modal>
    );
  }
}

class OrderFind extends Component {
  _isMounted = false;
  state = {
    orders: [],
    goodsList: [],
    orderVisible: false,
    loadingGoods: false,
    loadingOrders: true
  };

  componentDidMount() {
    this._isMounted = true;
    privateFetch("/query-all-order", {
      method: "POST"
    }).then(json => {
      if (json.code === 0) {
        if (this._isMounted)
          this.setState({
            loadingOrders: false,
            orders: json.obj.map(v => v.id)
          });
      } else {
        message.error("查询订单错误");
      }
    });
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  handleCancel = () => {
    this.setState({ orderVisible: false });
  };
  handleOk = () => {};

  render() {
    return (
      <Spin loading="Loading..." spinning={this.state.loadingOrders}>
        <br />
        <List
          size="small"
          header={<div>订单号</div>}
          bordered
          dataSource={this.state.orders}
          renderItem={item => {
            return (
              <List.Item
                onClick={() => {
                  this.curItem = item;
                  this.setState({
                    orderVisible: true,
                    goodsList: [],
                    loadingGoods: true
                  });
                  privateFetch("/query-order-goods", {
                    method: "POST",
                    body: JSON.stringify({
                      orderId: item
                    })
                  }).then(json => {
                    this.setState({ loadingGoods: false });
                    if (this.curItem === item)
                      this.setState({
                        goodsList: json.obj.map((v, i) => {
                          v.key = i + "-" + v.key;
                          return v;
                        })
                      });
                  });
                }}
              >
                {item}
              </List.Item>
            );
          }}
        />
        <Modal
          title="订单列表"
          visible={this.state.orderVisible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          width={600}
          footer={[
            <Button key="confirm" type="primary" onClick={this.handleCancel}>
              确认
            </Button>
          ]}
        >
          <Spin loading={"Loading..."} spinning={this.state.loadingGoods}>
            <FoodItem
              dataSource={this.state.goodsList}
              buttonText="价格"
              descLength={15}
              onClick={item => {}}
            ></FoodItem>
          </Spin>
        </Modal>
      </Spin>
    );
  }
}

class ModifyGoodsData extends Component {
  state = {
    visible: false,
    dataList: [],
    curGoods: {},
    isModify: false,
    loading: false
  };

  componentDidMount() {
    this.setState({
      dataList: this.props.data
    });
  }
  handleCancel = () => {
    this.setState({ visible: false });
  };
  handleOk = () => {};
  checkInput = () => {
    const { name, desc, price, img } = this.goodsInput;
    let success = true;
    if (name.length === 0 || name.length > 100) {
      success = false;
      message.error("请输入正确的商品名");
    }
    if (desc.length === 0 || desc.length > 100) {
      success = false;
      message.error("请输入正确的商品描述");
    }
    if (isNaN(price) || price < 0) {
      success = false;
      message.error("价格设置错误");
    }
    if (img.length === 0) {
      success = false;
      message.error("商品图片错误");
    }
    return success;
  };
  addGoods = () => {
    if (!this.checkInput()) {
      return;
    }
    const { dataList } = this.state;
    dataList.push({
      key: Date.now(), // 标识商品唯一key
      ...this.goodsInput
    });
    this.setState({ dataList });
    this.handleCancel();
  };

  modifyGoods = () => {
    if (!this.checkInput()) {
      return;
    }
    let { dataList } = this.state;
    dataList = dataList.map(v => {
      if (v.key === this.goodsInput.key) {
        return this.goodsInput;
      } else {
        return v;
      }
    });
    this.setState({ dataList });
    this.handleCancel();
  };

  removeGoods = () => {
    let { dataList } = this.state;
    dataList = dataList.filter(v => v.key !== this.goodsInput.key);
    this.setState({ dataList });
    this.handleCancel();
  };
  handleInputChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.goodsInput[name] = value;
    this.setState({
      curGoods: this.goodsInput
    });
  };

  submitGoods = () => {
    this.setState({ loading: true });
    privateFetch("/modify-goods", {
      method: "post",
      body: JSON.stringify(this.state.dataList)
    }).then(json => {
      this.setState({
        loading: false
      });
      if (json.code === 0) {
        message.success("提交修改成功");
        this.props.onChange();
      } else {
        message.error("修改失败");
      }
    });
  };
  render() {
    return (
      <React.Fragment>
        <br />
        <Button.Group>
          <Button
            onClick={() => {
              this.goodsInput = {
                name: "",
                desc: "",
                img: "",
                price: 10
              };
              this.setState({
                visible: true,
                curGoods: this.goodsInput,
                isModify: false
              });
            }}
          >
            添加商品
          </Button>
          <Button loading={this.state.loading} onClick={this.submitGoods}>
            提交修改
          </Button>
        </Button.Group>
        <br />
        <FoodItem
          dataSource={this.state.dataList}
          buttonText="修改商品"
          descLength={15}
          onClick={item => {
            this.goodsInput = Object.assign({}, item);
            this.setState({
              visible: true,
              curGoods: this.goodsInput,
              isModify: true
            });
          }}
        />
        <GoodsInfoModal
          title="商品信息"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          goods={this.state.curGoods}
          onChange={this.handleInputChange}
          footer={
            this.state.isModify
              ? [
                  <Button key="cancel" onClick={this.handleCancel}>
                    取消
                  </Button>,
                  <Button key="delete" type="danger" onClick={this.removeGoods}>
                    删除
                  </Button>,
                  <Button
                    key="modify"
                    type="primary"
                    onClick={this.modifyGoods}
                  >
                    修改
                  </Button>
                ]
              : [
                  <Button key="cancel" onClick={this.handleCancel}>
                    取消
                  </Button>,
                  <Button key="add" type="primary" onClick={this.addGoods}>
                    添加
                  </Button>
                ]
          }
        />
      </React.Fragment>
    );
  }
}
export default class ManagePage extends Component {
  state = {
    shopData: null,
    modifyStatus: "main",
    loaded: false
  };
  _isMounted = false;
  componentDidMount() {
    this._isMounted = true;
    this.reload();
  }

  reload = () => {
    privateFetch("/shop-data", {
      method: "post"
    }).then(json => {
      if (this._isMounted) {
        this.setState({
          shopData: json.obj,
          loaded: true
        });
      }
    });
  };
  componentWillUnmount() {
    this._isMounted = false;
  }
  render() {
    const { modifyStatus, shopData, loaded } = this.state;
    return (
      <Layout
        style={{ padding: "0 0 24px 0", background: "#fff", marginTop: "46px" }}
      >
        <PageHeader
          style={{
            border: "1px solid rgb(235, 237, 240)"
          }}
          onBack={() => this.setState({ modifyStatus: "main" })}
          backIcon={
            modifyStatus === "main" ? (
              <Icon type="home" theme="twoTone" />
            ) : (
              <Icon type="arrow-left" />
            )
          }
          title={
            modifyStatus === "main"
              ? "管理面板"
              : modifyStatus === "good"
              ? "商品管理"
              : modifyStatus === "shop"
              ? "店铺信息"
              : modifyStatus === "order"
              ? "订单查询"
              : "未知页面"
          }
        />
        <Content style={{ padding: "0 24px", minHeight: 280 }}>
          {modifyStatus === "main" ? (
            <React.Fragment>
              <br />
              <Button.Group>
                {loaded ? (
                  <Button
                    onClick={() => {
                      this.setState({
                        modifyStatus: "shop"
                      });
                    }}
                  >
                    修改店铺信息
                  </Button>
                ) : null}
                {shopData ? (
                  <React.Fragment>
                    <Button
                      onClick={() => {
                        this.setState({
                          modifyStatus: "good"
                        });
                      }}
                    >
                      修改商品信息
                    </Button>
                    <Button
                      onClick={() => {
                        this.setState({
                          modifyStatus: "order"
                        });
                      }}
                    >
                      买家已支付订单查询
                    </Button>
                  </React.Fragment>
                ) : null}
              </Button.Group>
            </React.Fragment>
          ) : modifyStatus === "shop" ? (
            <ModifyShopInfo
              data={
                shopData || {
                  name: "",
                  desc: "",
                  logo: ""
                }
              }
              onChange={() => {
                this.reload();
                this.setState({ modifyStatus: "main" });
              }}
            />
          ) : modifyStatus === "good" ? (
            <ModifyGoodsData data={shopData.goods} onChange={this.reload} />
          ) : modifyStatus === "order" ? (
            <OrderFind></OrderFind>
          ) : null}
        </Content>
      </Layout>
    );
  }
}
