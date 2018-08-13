import { Base } from '../../utils/base.js';

// 自定义模型类继承自基类
 class Category extends Base{
   // 构造函数调用基类中的方法
   constructor(){
     super();
   }
   // 自定义方法加载服务器中所有的分类名称数据
   getCategoryType(callback){
    var param = {
      url: 'category/all',
      sCallback: function(data){
        callback && callback(data);
      }
    };
    //  调用基类中的发起请求的方法
    this.request(param);
   }
   // 自定义根据当前选中的分类ID获取该分类下的所有商品数据
   getProductsByCategory(id, callback){
     var param = {
       url: 'products/by_category?id=' + id,
       sCallback: function(data){
         callback && callback(data);
       }
     };
     this.request(param);
   }
 }

 // 将当前自定义模型文件输出
 export { Category };