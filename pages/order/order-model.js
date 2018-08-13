import { Base } from '../../utils/base.js';
class Order extends Base{
  //  构造方法
  constructor(){
    super();
    this._storageKeyName = 'newOrder'
  }
  
  /**
   *  自定义方法获取当前用户的所有订单信息
   *  @params
   *    pageIndex   { Int }       当前页数
   *    callBack    { Function }  回调方法方法体
   */
  getOrders(pageIndex, callBack){
      //  定义获取订单数据发起请求的相关参数
      var allParams = {
        url: 'order/by_user',
        data: {page: pageIndex},
        type: 'get',
        sCallback: function(data){
          callBack && callBack(data);
        }
      };
      //  调用发起请求发发请求数据
      this.request(allParams);
  }

  /**
   *  自定义根据订单编号获取订单详细数据方法
   *  @params
   *    id        { int }       订单主键ID
   *    callback  { Function }  回调方法方法体
   */ 
  getOrderInfoById(id, callback){
      var that = this;
      var allParams = {
        url: 'order/'+id,
        sCallback: function(data){
          callback && callback(data);
        },
        eCallback: function (){

        }
      };
      this.request(allParams);
  }

  /**
   *  生成订单方法
   *  @params
   *    param     {Object}    订单数据
   *    callback  {function}  回调方法
   */
  doOrder(param, callback){
    var that = this;
    var allParams = {//  自定义请求发起相关参数
      url: 'order',
      type: 'post',
      data: {products: param},
      sCallback: function(data){
        that.execSetStorageSync(true);
        callback && callback(data);
      },eCallback: function(){}
    };
    that.request(allParams);//  调用请求发起封装方法
  }

  /**
   *  发起支付方法
   *  @params
   *    orderNumber   { Int }       订单ID
   *    callback      { function }  回调方法
   *  @return
   *    callback(XX)  { Int }       调用回调方法传递参数0-发起支付失败，1-支付失败，2-支付成功
   */
  execPay(orderNumber, callback){
    var allParams = {
      url: 'pay/pre_order',
      type: 'post',
      data: {id: orderNumber},
      sCallback: function(data){
        var timeStamp = data.timeStamp; //  获取服务器返回的订单创建的时间戳判断订单是否生成成功
        if(timeStamp){
          wx.requestPayment({//  微信小程序段发起支付方法
            timeStamp: timeStamp.toString(),
            nonceStr: data.nonceStr,
            package: data.package,
            signType: data.signType,
            paySign: data.paySign,
            success: function(){
              callback && callback(2);  //  支付成功回调方法传递参数为 2
            },fail(){ 
              callback && callback(1);  //  支付失败回调方法传递参数为 1
            }
          });
        }else{
          callback && callback(0);      //  当前订单未创建回调方法传递参数为 0
        }
      }
    };
    this.request(allParams);
  } 

  //  更新标志位属性
  execSetStorageSync(data){
    wx.setStorageSync(this._storageKeyName, data)
  }

  /**
   *  判断当前订单数据是否需要重新请求服务器接口来重加载 
   */
  hasNewOrder(){
    var flag = wx.getStorageSync(this._storageKeyName);
    return flag == true;
  }
}
//  输出类
export { Order };