//  引入home-model.js文件
import {Home} from 'home-model.js';
//  实例化home-model.js
var home = new Home();
Page({
  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
      //  调用私有的数据加载方法
      this._loadData();
  },
  // 自定义私有的数据加载方法
  _loadData:function(){
    //  自定义获取最新商品部分数据的方法
    home.getProductsData((res) => {
      this.setData({
        'productsArr': res
      });
    });
    //  getBannerData方法的id参数赋予初始值
    var id = 1;
    //  调用home类下的getBannerData方法,将id参数和callBack方法作为参数传递给home-model.js
    //  var data = home.getBannerData(id,this.callBack);
    //  使用ES2016中定义的直接在调用参数中自定义一个回调函数方法体
    //  这种方法的优势在于简化了写法，但是对于开发人员来说可能读懂这种写法的代码会有一定的难度，
    //  且如果在回调方法中还需要调用其他函数再继续这样写系统直接回GG，因此这种方法并不如第一种
    //  写法简洁易用，在开发中我们将采用方法1，重新定义函数本身的方式。
    var data = home.getBannerData(id, (res)=>{
      //  进行数据绑定
      this.setData({
        'bannerArr':res
      });
    });
    //  自定义获取主题部分数据的方法,
    home.getThemeData((res) => {
      //  回调方法直接进行数据绑定
      this.setData({
        'themeArr': res
      });
    });
    
  },
  //  自定义数据回调函数方法体
  // callBack:function(res){
  //   console.log(res);
  // },

  // 自定义BannerSwipper点击事件触发后的方法体
  onProductsItemTap:function(event){
    //  调用基类自定义的获取指定字段数据的方法获取数据
    var id = home.getDataSet(event,'id');
    //  调用小程序定义的页面跳转方法
     wx.navigateTo({
       url: '../product/product?id='+id,//  指定跳转的页面
     })
  },
  //  自定义onThemeItemTap点击事件触发后的方法体
  onThemeItemTap:function(event){
    //  调用基类定义的获取事件触发后对应的数据获取方法
    var id = home.getDataSet(event,'id');
    var name = home.getDataSet(event, 'name');
    //  调用系统定义的小程序的页面跳转方法
    wx.navigateTo({
      url: '../theme/theme?id=' + id + '&name=' + name,
    })
  },
})