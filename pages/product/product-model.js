//  引入自定义基类
import { Base } from '../../utils/base.js';
//  自定义model类继承自基类
class Product extends Base{
  //  构造方法调用基类
  constructor() {
    super();
  }
  //  自定义根据当前商品ID获取对应的商品信息方法
  getDetailInfo(id, callback) {
    var param = {
      url: 'products/' + id,
      sCallback: function (data) {
        callback && callback(data);
      }
    };
    //  调用基类中自定义的发起请求的方法并将参数传递
    this.request(param);
  }
}
//  输出当前模型文件
export { Product }