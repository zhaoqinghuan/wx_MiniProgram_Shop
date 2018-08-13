import { Address } from '../../utils/address.js';
import { Order } from '../order/order-model.js';
import { My } from '../my/my-model.js';
var my = new My();
var order = new Order();
var address = new Address();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    pageIndex: 1,         //  默认当前的页数为第一页
    orderArr: [],       //  存储订单数据的对象
    isLoadedAll: false   //  数据加载完毕当前对象值为true
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._loadData();       //  调用自定义私有获取当前用户头像和昵称信息方法
    this._getAddressInfo(); //  调用自定义私有获取当前用户地址信息方法
    this._getOrders();      //  调用自定义私有获取当前用户订单信息方法
  },

  /**
   *  生命周期函数 -- 监听页面刷新
   */
  onShow: function(){
    //  调用Order模型下的判断订单数据是否更新方法
    var newOrderFlag = order.hasNewOrder();
    if(newOrderFlag){
      this.refresh(); //  只有当订单数据更新了才执行数据更新方法
    }
  },

  /**
   *  自定义方法用于实时同步我的订单的数据
   */
  refresh: function(){
    var that = this;
    this.data.orderArr = [];  //  我的订单数据初始化
    this._getOrders(()=> {
        //  重置相关需要的变量的初始值
        that.data.isLoadedAll = false;
        that.data.pageIndex = 1;
        order.execSetStorageSync(false);  //  更新标志位属性为false
    });
  },

  /**
   *  定义页面的订单点击跳转到订单详情页面的事件
   *    @params
   *      event   { Object }    点击事件对象
   */
  showOrderDetailInfo: function(event){
      var id = order.getDataSet(event, 'id');
      wx.navigateTo({
        url: '../order/order?from=order&id=' + id,
      });
  },
  
  /**
   *  自定义私有获取当前用户地址信息方法
   *    （直接调用Address模型类中的获取当前用户地址信息方法即可）
   */ 
  _getAddressInfo: function(){
      //  该方法只需要传入一个回调方法，在回调方法中调用绑定用户地址信息方法将地址结果绑定到页面上
      address.getAddress((addressInfo)=>{
        this._bindAddressInfo(addressInfo);
      });
  },
  /**
   *  自定义私有方法将当前用户的地址信息绑定到页面上
   *    （此方法直接将地址信息进行参数绑定，页面接收到数据直接回展示到参数绑定的位置）
   */
  _bindAddressInfo: function(addressInfo){
      this.setData({
          addressInfo: addressInfo,
      });
  },
  /**
   *  自定义私有的获取数据方法
   */
  _loadData: function(){
    //  调用模型文件中的获取用户头像和昵称方法
    my.getUserInfo((data)=>{
      this.setData({
        userInfo: data
      });
    });
  },
  /**
   *  自定义私有方法获取当前用户的订单信息
   *    （方法体直接调用定义在Order-Model中的方法获取所有的订单信息）
   *  @params
   *    callback    { Function }      回调方法
   */
  _getOrders: function(callback){
    order.getOrders(this.data.pageIndex,(res)=>{
      var data = res.data;
      if (data.length > 0) {
        //  将两个数组中的数据合并为一个数组调用数组下的.push.apply方法
        this.data.orderArr.push.apply(this.data.orderArr, data);  
        this.setData({
          orderArr: this.data.orderArr //  将对象中的数据重新进行绑定
        });
      }else{
        this.data.isLoadedAll = true;   //  数据是否已经加载完毕 加载完毕赋值为TRUE
      }
      callback && callback();
    })
  },
  /**
   *  调用小程序官方提供的页面下拉触底事件来处理订单数据在请求
   */
  onReachBottom: function(){
      if (!this.data.isLoadedAll){
        this.data.pageIndex++;  //  当前页数累加1 
        this._getOrders();      //  调用自定义私有获取当前用户所有订单信息方法
      }
  },

  /**
   *  定义页面发起支付的方法
   *    
   */
  rePay: function(event){
    var id    = order.getDataSet(event, 'id'),  
        index = order.getDataSet(event, 'index'); //  分别获取订单编号以及订单在订单数组中的下标
    this._execPay(id, index); //  调用发起支付方法 
  },

  /**
   *  自定义私有的我的页面发起支付方法
   *  @params
   *    id    { Int }     订单ID
   *    index { Int }     订单数据所在数组的下标
   */
  _execPay: function(id, index){
    var that = this;
    order.execPay(id, (statusCode) => { //  调用订单下的支付方法发起支付
      if(statusCode > 0){  //  回调方法中对支付结果进行处理
        var flag = statusCode == 2;
        if(flag){ //  订单支付返回状态码大于0且等于2说明支付成功，修改我的订单数据的状态
          that.data.orderArr[index].status = 2;
          that.setData({
            orderArr: that.data.orderArr,
          });
        }
        wx.navigateTo({ //  支付成功且回调方法处理结束跳转到订单详情页面
          url: '../pay-result/pay-result?id=' + id +'&flag=' + flag + '&from=my' ,
        });
      }else{  //  支付失败直接弹出框
        that.showTips('支付失败','商品下架或库存不足。');
      }
    })
  },
  /**
   *  自定义错误提示窗口
   *  @params
   *    title     { String }      标题
   *    content   { String }      内容
   *    flag      { Bool }        是否跳转到我的页面
   */
  showTips: function(title,content){
    wx.showModal({
      title: title,
      content: content,
    })
  },
  
  /**
   *  自定义用户点击地址编辑后的用户收货地址处理
   *    @1.1.1直接调用微信提供的收货地址获取组件来获取用户收货地址
   */
  editAddress: function (event) {
    //  重新声明一个变量等于this顶级操作
    var that = this;
    wx.chooseAddress({
      //  使用组件只需要在自定义success方法中对获取到的信息进行处理
      success: function (res) {
        var addressInfo = {
          name: res.userName,
          mobile: res.telNumber,
          totalDetail: address.setAddressInfo(res),
        }
        that._bindAddressInfo(addressInfo);   //  调用地址模型方法中私有的地址绑定方法
        address.submitAddress(res, (flag) => {//  调用地址模型方法中的保存用户地址信息的方法，回调函数对操作结果进行判断
          if (!flag) {  //  如果操作失败弹出提示框
            that.showTips('操作提示', '地址信息更新失败，请重试~');
          }
        })
      }
    })
  },
})