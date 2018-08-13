// 导入基类
import { Base } from 'base.js';
import { Config } from 'config.js';
//自定义address类
class Address extends Base{
  //  构造方法调用基类
  constructor(){
    super();
  }

  /**
   *  自定义方法获取保存在服务器数据库中我的地址信息
   *  @params
   *    callback  { Function }  回调方法
   */
  getAddress(callback) {
    var that = this;  //  将this保存到一个新的自定义变量中
    var param = {    //  自定义发起请求参数
      url: 'address',
      sCallback: function (res) {
        if(res){
          res.totalDetail = that.setAddressInfo(res); //  对获取到的地址信息字段进行处理
          callback && callback(res);                 //  将地址结果返回给调用页面
        }
      }
    }
    this.request(param);  //  发起请求
  }

  /**
   *  自定义方法来处理微信返回的res地址信息
   *  @params
   *    res   { Object }  通过获取到的地址信息对象
   *  因为当前方法是一个通用的方法不仅要处理来自微信的地址信息，也需要将数据库
   *  中获取到的存储的当前用户的地址信息进行处理
   */
  setAddressInfo(res){
      var province = res.provinceName || res.province,
          city     = res.cityName || res.city,
          country = res.countyName || res.country,
          detail = res.detailInfo || res.detail;
      var totalDetail = city + country + detail;
      //  调用直辖市判断
      if(!this.isCenterCity(province)){
        //  如果是直辖市地址只显示XX市XX区，否则需要显示XX省XX市XX区
        totalDetail = province + totalDetail;
      }
      return totalDetail;   //  将详细地址信息返回
  }
  /**
   *  对地址是否是直辖市进行判断
   *  @params 
   *    name  { String }  当前城市名称
   */
  isCenterCity(name){
    var centerCitys = ['北京市','天津市','上海市','重庆市'],
        flag  = centerCitys.indexOf(name) >=0;  //  判断centerCitys是否存在name属性
    return flag;
  }
  /**
   *  自定义方法用于保存当前用户的收货地址
   *  @params
   *    data      { Object }    地址信息对象
   *    callback  { function }  回调方法
   */
  submitAddress(data, callback) {
      //  调用自定义私有方法将地址信息转换为通用格式
      data = this._setUpAddress(data);
      //  发起服务器请求，保存用户收货地址信息
      var param = {
        url: 'address',
        type: 'post',
        data: data,
        sCallback: function (res) {
          callback && callback(true, res);
        }, eCallback(res) {
          callback && callback(false, res);
        }
      };
      //  调用基类中自定义的发起请求的方法
      this.request(param);
  }
  /**
   *  将地址信息转换为通用格式
   *  @params
   *    res 地址信息对象
   */
  _setUpAddress(res) {
    var formData = {
      name: res.userName,
      province: res.provinceName,
      city: res.cityName,
      country: res.countyName,
      mobile: res.telNumber,
      detail: res.detailInfo
    };
    return formData;
  }
}
//  将自定义类输出
export { Address }