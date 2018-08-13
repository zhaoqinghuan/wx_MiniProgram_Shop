// pages/pay-result/pay-result.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      payResult: options.flag,  //  支付结果
      id: options.id,           //  订单主键
      from: options.from        //  跳转来源        
    });

  },
  
  /**
   *  自定义查看详情按钮点击后跳转到订单详情页面方法
   *  @params
   *    event   { Object }  点击事件对象 
   */
  viewOrder: function(event){
      wx.navigateBack({ //  调用小程序原生组件中的返回上级页面函数 delta参数值是几就跳转回去几级页面
        delta: 1
      })
  },
})