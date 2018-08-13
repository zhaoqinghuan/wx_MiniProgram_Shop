//  引入模型基类并实例化
import { Cart } from 'cart-model.js';
var cart = new Cart();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //  声明绑定数据
    selectedTypeCounts: null,
    selectedCounts: null,
    account: null,
    cartData: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //  调用模型类下的方法获取所有的购物车数据
    var cartData = cart.getCartDataFromLocal();
    //  调用模型类下的方法获取所有购物车中状态被标记为选中状态的商品信息
    var countsInfo = cart.getCartTotalCounts(true);
    //  调用私有方法获取购物车中选中状态商品信息
    var cal = this._calcTotalAccountAndCounts(cartData);
    //  进行数据绑定
    this.setData({
      selectedTypeCounts: cal.selectedTypeCounts,   //  绑定私有方法的返回参数中被选中商品总类目
      selectedCounts: cal.selectedCounts,           //  绑定私有方法的返回参数中被选中商品信息
      account: cal.account,                         //  绑定私有方法的返回参数中被选中商品的总价        
      cartData: cartData,                           //  购物车商品信息
    });
  },

  /**
   *  声明周期函数--监听页面关闭    
   */
  onHide: function (){
      cart.execSetStorageSync(this.data.cartData);
  },

  /**
   *  点击下单按钮页面跳转到订单详情页面
   *  @params
   *    account float 订单总金额
   *    from    cart  指当前跳转是通过购物车页面跳转到订单详情页面的
   */
  submitOrder: function(event){
      //  使用小程序内置的页面跳转方法跳转到订单详情页
      wx.navigateTo({
        url: '../order/order?account=' + this.data.account + '&from=cart',
      })
  },

  /**
   *  购物策划中商品的删除事件
   *  @params
   *    event.id    int   当前商品的ID
   */
  delete: function(event){
    var id = cart.getDataSet(event, 'id'),        //  获取event下的ID参数
        index = this._getProductIndexById(id);    //  并且根据ID求出当前商品在缓存中的键值
    this.data.cartData.splice(index,1);           //  对页面数据执行删除操作
    this._resetCartData();                        //  页面数据进行重新保存
    cart.delete(id);                              //  调用模型中的方法对缓存中的数据执行删除操作
  },

  /**
   *  购物车商品增减按钮事件
   *  @params
   *    event.id      int     当前商品ID
   *    event.type    string  根据类型不同进行增/减 操作  
   */
  changeCounts: function(event){
    var id   = cart.getDataSet(event, 'id'),    //  商品ID
        type = cart.getDataSet(event, 'type'),  //  操作类型
        index = this._getProductIndexById(id),  //  获取事件商品对应的点击下标
        counts = 1;                             //  用于修改当前购物车中的商品总数
    //  根据type的不同对商品进行不同的操作
    if (type == "add"){
      cart.addCounts(id); //  调用模型文件中的方法进行加操作
    } else{
      counts = -1;  //  如果是减操作 直接将counts赋值为-1进行修改购物车中的商品总数
      cart.cutCounts(id); //  调用模型文件中的方法执行减操作
    } 
    //  修改购物车中的商品总数
    this.data.cartData[index].counts += counts;
    //  调用_resetCartData方法对购物车中商品的数量，总价进行重新计算
    this._resetCartData();
  },

  /**
   *  购物车页面底部栏的全选按钮点击事件
   *  @params
   *    event.status  float   当前全选按钮的状态(全选/非全选)
   */
  toggleSelectAll: function (event) {
    //  获取当前点击事件全选框按钮的状态
    var status = cart.getDataSet(event, 'status') == 'true';
    //  获取当前购物车中的商品数据
    var data = this.data.cartData,
        len  = data.length;
    //  循环给购物车中的商品加取反后的状态
    for (let i=0; i<len; i++){
      data[i].selectStatus = !status;
    }
    //  调用_resetCartData方法对购物车中商品的状态，总价进行重新计算
    this._resetCartData();
  },

  /**
   *  购物车单个商品的是否选中事件
   *  @params
   *    event.id      int   当前点击事件对应的商品ID
   *    event.status  int   当前点击事件对应商品的状态   
   */
  toggleSelect: function(event){
    //  声明变量并获取页面绑定的参数
    var id,
        status,
        index;
    id = cart.getDataSet(event, 'id');
    status = cart.getDataSet(event, 'status');
    index = this._getProductIndexById(id); //  调用私有方法获取当前商品所在购物车商品组的下标
    this.data.cartData[index].selectStatus = !status; //  对当前购物车商品的状态取反
    this._resetCartData();  //  调用自定义私有的关联操作方法
  },

  /**
   *  私有方法根据商品ID得到商品所在缓存中的下标
   *  @params
   *    id  int   当前商品的商品ID
   *  @return int 当前商品在购物车商品中的下标
   */
  _getProductIndexById: function (id) {
    var data = this.data.cartData;  //  获取当前购物车在缓存中的数据
    var len = data.length;          //  获取当前数据的数组长度
    for (let i = 0; i < len; i++) {      //  循环购物车中的数据
      if (data[i].id == id) {        //  如果购物车中的商品ID等于传递过来的商品ID
        return i;                   //  返回购物车商品的下标
      }
    }
  },

  /**
   *  私有进行关联操作的方法
   *  客户端进行任何操作以后由当前方法重新计算购物车选中商品总金额，购物车选中商品总数量等
   */
  _resetCartData: function(){
    //  直接调用_calcTotalAccountAndCounts方法进行计算及数据绑定
    //  因为点击事件触发后已经修改了对应商品的状态并将数据保存到cartData数据集中
    //  因此可以直接通过方法调用以及参数传入实现状态更改。
    var newData = this._calcTotalAccountAndCounts(this.data.cartData);
    //  重新进行事件绑定
    this.setData({
        account: newData.account,
        selectedCounts: newData.selectedCounts,
        selectedTypeCounts: newData.selectedTypeCounts,
        cartData: this.data.cartData,
    });
  },

  /**
   *  私有方法计算购物车中被选中商品总金额
   *  @params
   *    data  array 购物车商品信息
   *  @returns
   *    selectedCounts int 选中商品总数
   *    selectedTypeCounts  int 选中商品总类目
   *    account float 选中商品总价
   */
  _calcTotalAccountAndCounts: function(data){
      var len = data.length,      //  购物车商品信息数组长度
          account = 0,            //  购物车商品总价（需排除未选中的商品）
          selectedCounts = 0,     //  购物车被选中商品总数
          selectedTypeCounts = 0; //  购物车被选中商品类型总数(同一商品选择多个只算一种类型)
      var multiple = 100;         //  声明一个变量这个变量本身无意义，计算总价时JS浮点数计算的误差
      //  循环计算
      for (let i=0;i<len;i++){
        //  根据商品是否处于选中状态
        if( data[i].selectStatus){
          //  计算总价JS浮点数计算总价产生问题，给浮点数单价*变量multiple的100
          account += data[i].counts * multiple * Number(data[i].price) * multiple;
          selectedCounts += data[i].counts;
          selectedTypeCounts ++;
        }
      }
      //  将计算结果返回
      return {
        selectedCounts: selectedCounts,           //  选中商品总数
        selectedTypeCounts: selectedTypeCounts,   //  选中商品品类总数
        account: account / (multiple * multiple), //  选种商品总价(计算总价时乘了两个multiple所以要在这里除掉)
      }    
  }

})