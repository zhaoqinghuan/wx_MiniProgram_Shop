//  引入模型文件
import { Product } from 'product-model.js';
import { Cart } from '../cart/cart-model.js';
//  实例化模型文件
var product = new Product();
var cart = new Cart();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 设置商品详情页面的数量选择下拉菜单
    countsArray: [1,2,3,4,5,6,7,8,9,10],
    //  为商品设置默认选择数量
    productCount: 1,
    //  设置默认数据当前TAB点击事件对应的下标
    currentTabsIndex: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var id = options.id;//  获取当前页面的ID属性
    this.data.id = id;  //  将当前页面的ID参数存入data下做为成员属性
    this._loadData();//  调用私有的加载数据并进行数据绑定的方法
  },

  _loadData: function (){
    product.getDetailInfo(this.data.id,(data)=>{
        //  在回调函数中进行数据绑定
        this.setData({
          product: data, //绑定当前商品的详情信息
          cartTotalCounts: cart.getCartTotalCounts(),//绑定当前购物车中的商品总数信息
        });
    });
  },
  //  页面前往购物车按钮事件定义
  onCartTap: function(event){
      //  因为这里的页面跳转需要跳转到TAP栏的页面因此需要使用专用方法
      wx.switchTab({
        url: '/pages/cart/cart',
      })
  },

  //  wxml页面对数量选择picker定义的获取其选择结果的事件
  bindPickerChange: function (event) {
    //  这里无法直接获取到选择结果，只能通过获取用户选择的数组的下标来确认用户选择的数量
    var index = event.detail.value; //  先获取当前用户选择的结果的数组下标
    var selectedCount = this.data.countsArray[index]//  根据下标获取到用户选择的具体数量
    //  将用户选择的结果重新绑定给一个变量将变量重新定义回wxml静态页面
    this.setData({
      productCount: selectedCount
    });
  },
  //  对tab栏的点击事件进行定义，
  onTabsItemTap: function (event){
    //  获取事件触发时对应的绑定参数,通过调用自定义基类下的getDetaSet方法获取参数
    var index = product.getDataSet(event,'index');
    //  进行数据绑定
    this.setData({
      currentTabsIndex: index
    })
  },
  
  //  自定义加入购物车事件
  onAddingToCartTap: function(event){
    //  调用加入购物车详细操作方法
    this.addToCart();
    //  计算事件发生后的购物车商品总数
    //  用当前购物车内商品总数加上当前点击事件新加入购物车的商品总数
    var counts = this.data.cartTotalCounts + this.data.productCount;
    //  将事件发生后的购物车商品总数绑定给cartTotalCounts
    this.setData({
      cartTotalCounts: cart.getCartTotalCounts(),
    });
  },
  
  //  加入购物车详细操作
  addToCart: function(){
    //  声明一个用于保存商品数据的对象
    var tempObj = {};
    //  定义一个数组用于确定需要保存到对象中的商品信息键
    var keys = ['id', 'name', 'main_img_url', 'price'];
    //  循环遍历页面初始化时拿到的当前商品的详细信息找到符合keys数组要求的属性
    for (var key in this.data.product) {
      //  如果数组中有符合keys要求的数据拿出来直接保存到tempObj对象中
      if (keys.indexOf(key) >= 0) {
        tempObj[key] = this.data.product[key];
      }
    }
    //  调用cart类下的添加到购物车方法实现数据添加到购物车
    cart.add(tempObj, this.data.productCount);
  }
})