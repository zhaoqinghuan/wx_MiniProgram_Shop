//  引入base基类
import { Base } from '../../utils/base.js';
//  自定义模型类继承自Base基类
class Cart extends Base{
  //  构造函数调用基类中的方法
  constructor(){
    super();
    //  为当前缓存数据指定一个Key
    this._storageKeyName = 'cart';
  }

  /**
   *  自定义本地数据保存方法
   *  @params
   *    data { object }   需要保存的数据
   */
  execSetStorageSync(data){
    //  调用数据保存方法，数据保存命名为构造方法中定义的_storageKeyName，缓存数据为购物车中数据
    wx.setStorageSync(this._storageKeyName, data);
  }

  /**
   *  获取当前购物车下的商品总数方法
   *  @params
   *    flag    { bool }    True，获取当前购物车中所有的选中状态的商品总数
   *                        False，获取当前购物车中所有商品的总数
   */
  getCartTotalCounts(flag){
    //  首先获取缓存中购物车下的商品数据
    var data = this.getCartDataFromLocal();
    //  定义变量用于保存商品总数
    var counts = 0;
    //  遍历data将所有的商品数据中的商品数量累加赋值给counts
    for(let i=0 ;i<data.length; i++){
      //  新增一条状态判断，如果当前商品状态为选中状态才对其进行数量计算
      if(flag){
        //  flag为true当前查找购物车中选中商品的总数量
          if(data[i].selectStatus){
            counts += data[i].counts;
          }
      }else{
        //  flag为false无需条件判断,将所有状态下的商品总数进行查询
        counts += data[i].counts;
      }
    }
    //  将商品总数返回
    return counts;
  }

  /**
   *  缓存中读取购物车数据的方法
   *  @params
   *    flag    { bool }    True，获取当前购物车中所有选中状态的商品信息，
   *                        False，获取当前购物车中的所有的商品信息。
   */
  getCartDataFromLocal(flag) {
    //  调用微信内置的获取缓存数据的方法
    var res = wx.getStorageSync(this._storageKeyName);
    //  如果缓存中的购物车数据为空直接返回一个空数组
    if (!res) {
      res = [];
    }
    //  判断当前flag的属性，如果存在且为true，说明需要过滤掉购物车中未选中商品
    if(flag){
      var newRes = [];    //  声明一个变量用于存储过滤后的数据
      for (let i=0; i<res.length; i++){   //  轮询获取当前购物车中的所有数据
        if(res[i].selectStatus) {   //  对某一个商品的状态进行判断
          newRes.push(res[i]);      //  将选中状态的商品数据保存到变量中
        }
      }
      res = newRes;   //  将变量的值赋回给res
    }
    return res;
  }

  /**
   *  私有的判断当前新加入购物车的商品数据在购物车缓存数据中是否存在
   *  如果存在需要返回该商品的详细信息 ， 不存在返回一个index=-1的属性。
   *  @params：
   *    id    - {Int} 当前新加入购物车的商品主键ID
   *    arr   - {Arr} 购物车数据
   */
  _isHasThatOne(id, arr) {
    //  定义两个变量
    var item,
      result = { index: -1 };// 默认index如果为-1则说明该商品不存在购物车中
    //  循环遍历购物车数据
    for (let i = 0; i < arr.length; i++) {
      item = arr[i];  //  保存当前选择的商品在购物车中的数据
      if (item.id == id) {//  如果找到购物车中数据与新加入购物车数据主键ID一致的情况
        //  该商品在购物车缓存数据的主键以及该商品在购物车中的信息返回
        result = {
          index: i,
          data : item
        };
        break;//  循环终止
      }
    }
    return result;  //  将数据返回    
  }

  /**
   *  商品加入购物车的方法
   *  如果购物车中之前没有此商品，直接新增一条记录。
   *  如果之前有此商品，对之前商品的数量增加counts
   *  @params:
   *    item    - {Obj} 商品对象信息
   *    counts  - {Int} 商品数量信息
   */
  add(item, counts){
    //  调用通过缓存获取购物车数据的方法
    var cartData = this.getCartDataFromLocal();
    //  调用判断商品是否已加入到购物车中的方法
    var isHasInfo = this._isHasThatOne(item.id, cartData);
    //  对结果进行判断并根据结果进行不同的处理
    if(isHasInfo.index==-1){
      //  购物车中不存在该商品
      item.counts = counts;     //  为该商品属性添加一个数量属性
      item.selectStatus = true; //  添加该商品在购物车中被选中属性
      //  调用将商品添加到购物车方法
      cartData.push(item);
    }else{
      //  购物车中已存在该商品
      //  因为_isHasThatOne方法会返回该商品的相关属性，这里直接调用该属性获取到
      //  购物车中某商品的总数量并在该数量上累加一个新加入的数量属性。
      cartData[isHasInfo.index].counts += counts;
    }
    //  然后调用设置缓存的方法将缓存进行更新
    wx.setStorageSync(this._storageKeyName, cartData);
  }


  /**
   *  私有的修改购物车中某个商品数量
   *  @params
   *    id      int   商品主键ID
   *    counts  int   修改数量 
   */
  _changeCounts(id, counts){
    var cartData = this.getCartDataFromLocal(), //  先从本地获取购物车商品数据
        hasInfo  = this._isHasThatOne(id, cartData);  //  从缓存中查找当前商品在购物车中的信息
    if (hasInfo.index != -1){     //  如果当前商品还在购物车中
      if (hasInfo.data.counts > 1){   //  且购物车中的商品数量大于1
        cartData[hasInfo.index].counts += counts;   //  对购物车中的商品数量增加counts数量个
      }
    }
    wx.setStorageSync(this._storageKeyName, cartData);  //  对本地缓存中的购物车数据进行更新
  }
  
  /**
   *  对某一商品在购物车中的数量执行增加操作
   *  @params
   *    id  { int }  商品主键ID
   */
  addCounts(id) {
    //  调用私有方法执行购物车商品数量增加操作
    this._changeCounts(id, 1);
  }

  /**
   *  对某一商品在购物车中的数量执行减少操作
   *  @params
   *    id  { int }  商品主键ID
   */
  cutCounts(id) {
    //  调用私有方法执行购物车商品数量增加操作
    this._changeCounts(id, -1);
  }
  /**
   *  通用删除购物车中的某一样商品
   *  @params
   *    ids { array }     需要删除的商品ID组
   *      ids.id  { int } 需要删除的某一商品ID
   */
  delete(ids){
    //  如果传递的是单个ID将单个ID也转换成数组格式
    if(!(ids instanceof Array)){
      ids = [ids];
    }
    var cartData = this.getCartDataFromLocal(); //  从本地缓存中获取购物车数据
    for (let i = 0; i <ids.length; i++){        //  循环拿出需要需要删除的ID主键
      var hasInfo = this._isHasThatOne(ids[i], cartData);   //  根据ID找到相应的数据
      if(hasInfo.index != -1){                  //  如果本地数据键值不为-1即为存在
        cartData.splice(hasInfo.index, 1);      //  执行数据删除操作
      }
    }
    wx.setStorageSync(this._storageKeyName, cartData);  //  更新缓存中的数据
  }
}
//  将模型文件输出
export { Cart };