//  引入基类
import { Base } from '../../utils/base.js';
//  新建theme模型层继承自基类
class Theme extends Base{
  //  定义构造方法
  constructor() {
    //  在当前类的构造方法中调用基类方法，直接使用super();
    super();
  }
  //  新建根据主题ID获取对应的主题信息及其下商品数据的方法
  getProductsData(id,callback){
    var param = {
      url:'theme/' + id,
      sCallback:function(data){
        callback && callback(data);
      }
    };
    //  调用基类中的请求发起的方法
    this.request(param);
  }
}
//  将当前模型文件输出
export { Theme };
