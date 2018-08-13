//  引入模型基类并实例化
import { Cart } from '../cart/cart-model.js';
import { Order } from '../order/order-model.js';
import { Address } from '../../utils/address.js';
var cart = new Cart();
var order = new Order();
var address = new Address();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    //  预声明当前页面需要用到的变量
    productsArr: null,
    account: null,
    orderStatus: null,
    id: null,   //  当前订单的订单编号
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var from = options.from;
    if (from == 'cart') {
      this._fromCart(options.account);
    }
    else {
      var id = options.id;
      this._fromOrder(id);
    }
  },

  /**
   *  生命周期函数--监听页面刷新
   */
  onShow: function () {
    if (this.data.id) {// 根据是否存在data.id(订单ID)
      this._fromOrder(this.data.id);  //  调用自定义私有的通过订单页跳转的处理方法
    }
  },

  /**
   *  私有方法用来定义订单页面通过购物车跳转到订单详情页面的相关数据处理逻辑
   *  @param
   *    account   { Float }     订单总价
   */
  _fromCart: function(account){
    var productsArr;  //  声明一个变量用于保存当前页面触发时对应的订单详细信息
    this.data.account = account;//  获取页面传递过来的数据
    //  调用cart模型下的getCartDataFromLocal方法获取选中状态的数据作为订单下的商品数据
    productsArr = cart.getCartDataFromLocal(true);
    this.setData({    //  将数据绑定
      productsArr: productsArr,
      account: account,
      orderStatus: 0
    });
    address.getAddress((res) => {   //  获取服务器返回的地址信息并将其绑在页面上
      this._bindAddressInfo(res);
    });
  },

  /**
   *  私有方法用来定义订单页面通过我的页面跳转到订单详情页面的相关数据处理逻辑
   *  @param
   *      id    { Int }     订单编号
   */
  _fromOrder: function(id){
    if (id) {// 根据是否存在data.id(订单ID)
      var that = this;
      order.getOrderInfoById(id, (data) => {
        that.setData({
          orderStatus: data.status,
          productsArr: data.snap_items,
          account: data.total_price,
          basicInfo: {
            orderTime: data.create_time,
            orderNo: data.order_no
          },
        });
        var addressInfo = data.snap_address;//  收货地址快照
        addressInfo.totalDetail = address.setAddressInfo(addressInfo);
        that._bindAddressInfo(addressInfo);
      });
    }
  },


  /**
   *  自定义用户点击去付款按钮后的后续操作
   */
  pay: function(){
    //  先判断当前用户的地址信息是否已经正常填写
    if(!this.data.addressInfo){
      //  未填写弹出提示框并终止当前方法
      this.showTips('下单提示','请先填写您的收货地址~');
      return;
    }
    if(this.data.orderStatus == 0){
      this._firstTimePay();//  当前订单的orderStatus参数为0说明当前订单未创建，先需要调用创建订单方法
    }else{
      this._oneMoresTimePay();//  否则说明当前订单已经在服务器数据库中被创建，无需再进行订单创建。
    }
  },

  /**
   *  自定义当前订单未创建需要创建订单后再调用支付的方法
   *  完成支付一般需要两个步骤，先由服务器数据库生成订单，然后再由客户端发起支付完成订单
   */
  _firstTimePay: function () {
    var orderInfo = [],//  声明变量分别用于存储生成订单所需要的变量
      productInfo = this.data.productsArr,
      order = new Order();
    for (let i = 0; i < productInfo.length; i++) {//  循环向orderInfo变量中填入当前订单中的所有商品信息
      orderInfo.push({
        product_id: productInfo[i].id,
        count: productInfo[i].counts
      });
    }
    var that = this;
    order.doOrder(orderInfo, (data) => {//  调用模型类中的方法调用服务器接口完成服务器的订单创建
      if (data.pass) {//  判定订单生成成功
        //  更新订单状态
        var id = data.order_id; //  将订单ID保存到全局变量中
        that.data.id = id;
        //that.data.fromCartFail = false;
        that._execPay(id);      //  发起支付
      } else {
        that._orderFail(data);
      }
    });
  },

  /**
   *  继承自模型文件的发起订单支付方法
   *  @params 
   *    id  { Int }   订单ID
   */
  _execPay: function(id){
    var that = this;
    order.execPay(id, (statusCode) => {//  调用模型类中的execPay方法执行支付
      if (statusCode != 0) {      //  statusCode不为0说明订单已创建支付状态未知
        that.deleteProducts();    //  此时应当将购物车中已下单商品删除
        var flag = statusCode == 2; //  如果statusCode=2说明订单状态是已支付flag为true
        wx.navigateTo({//   执行页面跳转
          url: '../pay-result/pay-result?id=' + id + '&flag=' + flag + '&from=order',
        });
      }
    });
  },

  /**
     *  下单失败后自定义回调方法
     *  @params 
     *    data  { Object }  服务器返回下单失败结果 
     */
  _orderFail: function (data) {
    var nameArr = [], //  声明变量分别用于存储下单失败的商品信息
      name = '',
      str = '',
      pArr = data.pStatusArray;
    for (let i = 0; i < pArr.length; i++) { //  循环获取失败结果
      if (!pArr[i].haveStock) {
        name = pArr[i].name;
        if (name.length > 15) {
          name = name.substr(0, 12) + '...';  //  如果商品名称长度超过12字符将超出部分截取替换成...
        }
        nameArr.push(name);
        if (nameArr.length >= 2) {      //  如果商品超过两个跳出循环
          break;
        }
      }
    }
    str += nameArr.join('、');    //  将商品名称用 、连接
    if (nameArr.length > 2) {     //  如果商品数量大于2 给后续增加一个 等字符
      str += ' 等';
    }
    str += '缺货';                //  下单失败原因标记为缺货
    wx.showModal({                //  调用小程序内置的模态框展示错误信息
      title: '下单失败',
      content: str,
      showCancel: false,
      success: function (res) {

      }
    });
  },

  /**
   *  将已经创建订单的数据从购物车中删除
   */
  deleteProducts: function(){
      var ids = [],
          arr = this.data.productsArr;  //  声明变量存储订单中的商品数据
      for(let i=0; i<arr.length; i++){
        ids.push(arr[i].id);  //  循环获取订单中的商品主键ID
      }    
      cart.delete(ids);       //  调用cart模型文件中的购物车中商品删除方法，将已加入订单的数据从购物车中删除
  },

  /**
   *  自定义用户点击地址编辑后的用户收货地址处理
   *    @1.1.1直接调用微信提供的收货地址获取组件来获取用户收货地址
   */
  editAddress: function(event){
      //  重新声明一个变量等于this顶级操作
      var that = this;
      wx.chooseAddress({
        //  使用组件只需要在自定义success方法中对获取到的信息进行处理
        success: function(res){
          var addressInfo = {
            name: res.userName,
            mobile: res.telNumber,
            totalDetail: address.setAddressInfo(res),
          }
          that._bindAddressInfo(addressInfo);   //  调用地址模型方法中私有的地址绑定方法
          address.submitAddress(res, (flag) => {//  调用地址模型方法中的保存用户地址信息的方法，回调函数对操作结果进行判断
            if (!flag) {  //  如果操作失败弹出提示框
              that.showTips('操作提示','地址信息更新失败，请重试~');
            }
          })
        }
      })
  },
  /**
   *  自定义操作完成后的提示信息
   *  @params:
   *    title   { String }  提示信息标题
   *    content { String }  提示信息内容
   *    flag    { Bool }    提示信息完成后是否跳转到其他页面
   */
  showTips: function(title, content, flag){
      wx.showModal({
        title: title,
        content: content,
        showCancel: false,
        success: function(res){ //  回调方法如果存在flag跳转到自定义页面
            if(flag){
              wx.switchTab({
                url: '/pages/my/my',
              })
            }
        }
      })
  },

  /**
   *  自定义私有方法用于绑定地址信息
   *  @params
   *    addressInfo   { Object }    用户收件信息对象
   */
  _bindAddressInfo: function(addressInfo){
      this.setData({
          addressInfo: addressInfo
      });
  },
})