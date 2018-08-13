//  引入模型文件
import { Category } from 'category-model.js';
//  实例化自定义的模型文件
var category = new Category();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    categoryTypeArr: null,  //  用于存储所有分类信息数据
    categoryProducts: null, //  用于记录当前选中分类下的所有商品信息
    currentMenuIndex: 0,    //  用于存储页面初始化默认选中第一个分类下的数据
    loadedData: {},         //  用于存储所有分类下的商品详细数据，字典类型
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //  调用自定义的数据加载方法
    this._loadData();
  },

  /**
     * 生命周期函数--监听页面初次渲染完成
     */
  onReady: function () {

  },

  //  自定义商品分类页面点击商品跳转到商品详情页面的事件
  onProductsItemTap: function(event){
    //  通过调用基类中获取点击事件发生时对应的参数来获取商品ID参数
    var id = category.getDataSet(event,'id');
    //  调用页面跳转事件完成页面跳转
    wx.navigateTo({
      url: '../product/product?id=' + id,
    })
  },

  //  自定义一个判断当前分类下的商品数据是否已经被加载的方法
  //  需要一个参数为当前分类的下标
  isLoadedData: function (index) {
    //  判断当前商品数据字典中是否包含有当前选择分类下标对应的商品
    if (this.data.loadedData[index]){
      return true;
    }
    return false;
  },

  //  自定义数据加载方法
  _loadData: function(){
    //  调用模型文件中的获取分类信息数据
    category.getCategoryType((Categorydata)=>{
      //  回调方法中直接进行数据绑定
      this.setData({
        categoryTypeArr: Categorydata
      });
      
      //  在获取分类信息数据的方法内部直接进行根据分类ID获取对应分类下的商品详细信息方法
      //  这样才能够保证获取某一分类下的商品详细信息方法一定在获取分类信息数据结束后再执行
      //  调用模型文件中的根据分类ID获取对应分类下的商品列表信息
      //  默认取分类信息获取到的数据列表中的第一个分类信息下对应的商品数据
      var id = Categorydata[0].id;

      //  对是否需要再次请求服务器接口进行判断，如果数据没有在字典中进行接口请求并将数据保存至字典
      if (!this.isLoadedData(Categorydata[0])) {
        category.getProductsByCategory(id, (data) => {
          //  考虑到客户端还需要一个分类头图以及分类名称对将要返回给wxml端的数据结构进行重构
          var dataObj = {
            products : data,
            topImgUrl : Categorydata[0].img.url,//  将分类头图作为参数重组到数据结构中
            title: Categorydata[0].name //  将分类名称作为参数充足到数据结构中
          };

          //  对获取到的数据进行数据绑定
          this.setData({
            categoryProducts: dataObj
          });
          //  将获取到下标为0的分类下的商品数据存储到字典中
          this.data.loadedData[0] = dataObj;
        });
      } else {
        //  否则字典中已有已有当前需要请求的分类下的数据，直接提取并进行数据绑定
        this.setData({
          categoryProducts: this.data.loadedData[0]
        })
      }
    });
  },
  //  自定义点击事件的事件体
  changeCategory: function(event){
    //  获取页面绑定的ID和下标属性的值
    var id = category.getDataSet(event, 'id');
    var index = category.getDataSet(event, 'index');
    //  对当前点击事件对应的index进行数据绑定
    this.setData({
      currentMenuIndex: index
    })

    //  对是否需要再次请求服务器接口进行判断，如果数据没有在字典中进行接口请求并将数据保存至字典
    if (!this.isLoadedData(index)){
      //  调用模型文件中的根据分类ID获取对应分类下的详细商品信息方法
      category.getProductsByCategory(id, (data) => {
        //  考虑到客户端还需要一个分类头图以及分类名称对将要返回给wxml端的数据结构进行重构
        var dataObj = {
          products: data,
          topImgUrl: this.data.categoryTypeArr[index].img.url,//  将分类头图作为参数重组到数据结构中
          title: this.data.categoryTypeArr[index].name //  将分类名称作为参数充足到数据结构中
        };

        //  对获取到的数据进行数据绑定
        this.setData({
          categoryProducts: dataObj
        });
        //  将当前点击事件所对应的分类下的商品数据存储到字典中
        this.data.loadedData[index] = dataObj;
      });
    }else{
      //  否则字典中已有已有当前需要请求的分类下的数据，直接提取并进行数据绑定
      this.setData({
        categoryProducts: this.data.loadedData[index]
      })
    }
  },
})