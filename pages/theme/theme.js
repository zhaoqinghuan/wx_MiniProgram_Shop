// 引入theme-model.js文件
import {Theme} from 'theme-model.js';
var theme = new Theme();//实例化theme-model类
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
    var id = options.id; //  获取当前页面的themeID参数。
    var name = options.name; // 获取当前页面的themeName参数

    //  将ID和Name参数作为data的成员属性进行赋值
    this.data.id = id;
    this.data.name = name;

    this._loadData();// 调用私有的数据加载方法
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
      wx.setNavigationBarTitle({
        title: this.data.name,  //  将存储在data下的成员属性name的值作为当前页面的标题设置给当前页面。
      })
  },
  // 自定义私有的数据加载方法
  _loadData:function(){
    var id = this.data.id;  //  获取保存在data中的ID参数。
    theme.getProductsData(id,(data)=>{
      this.setData({
       // 进行数据绑定
        themeInfo:data
      });
    });// 调用基类中的获取数据方法并把参数传递给后端。
  },

  // 补充专题页面的商品点击跳转到商品详情页面
  onProductsItemTap: function (event) {
    var id = theme.getDataSet(event, 'id');
    wx.navigateTo({
      url: '../product/product?id=' + id
    })
  },

})