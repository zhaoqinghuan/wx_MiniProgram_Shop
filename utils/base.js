//  引入Config配置文件类
import { Config } from 'config.js';
import { Token } from 'token.js';
//  基类
class Base{
  //  创建基类对应的构造方法
  constructor(){
    //  定义固定的url部分
    this.baseRequestUrl = Config.restUrl;
  }
  //  自定义request方法
  //  params包含request请求所需要的所有参数,noRefetch参数用于是否发送未授权的重试方法，
  request(params,noRefetch) {
      var that = this;  //  首先将this顶级变量赋值给that以便在回调方法中使用
      //  对url参数进行拼凑
      var url = this.baseRequestUrl + params.url;
      //  对params.type属性进行判断如果为空默认为GET请求
      if (!params.type){
        params.type = 'GET';
      }
      //  重写一个完整版的request方法
      wx.request({
        url: url,//  请求url
        data: params.data,// 请求数据
        method: params.type,// 请求类型
        header:{
          //  设置请求形式为json格式
          'content-type' : 'application/json',
          //  配置请求头中的token令牌属性
          'token':wx.getStorageSync('token')
        },//  http请求头
        success:function(res){
          //  自定义成功回调方法
          //  在这里对接口返回结果进行重构
          var code = res.statusCode.toString(); //  获取当前请求返回的状态码
          var startChar = code.charAt(0);       //  获取状态码的第一位
          if (startChar == '2'){
            //  状态码首位为2，服务器返回结果正常

            //  对params.sCallBack进行判断确定不为空才执行
            //  第一个为true（不为空）直接取后面的，第一个为空直接返回false
            params.sCallback && params.sCallback(res.data);
          }else{
            if(code == '401'){
              if(!noRefetch){ //  当noRefetch为false的时候当前请求允许被发送
                //  再判断如果装要码等于401说明Token失效或过期
                that._refetch(params);
              }
            }
            if (noRefetch) {   //  当noRefetch为True即不再发送未授权的重试方法时
              //  状态码首位为其他值，服务器返回结果异常
              //  处理异常 直接调用异常处理方法
              params.eCallback && params.eCallback(res.data);
            }
          }
        },
        fail:function(err){
          //  自定义失败回调方法
          console.log(err);
        }
      })
  }
  //  自定义方法，调用Token类下的getTokenFromService方法并重新调用requst请求方法
  _refetch(params){
      var token = new Token();  //  实例化Token类
      token.getTokenFromService((token) => {  
        //  调用Token类下的getTokenFromService方法
        this.request(params,true);//  并在其回调方法中重新调用request请求
      });
  }

  //  自定义一个获得绑定元素的值的方法
  getDataSet(event, key){
    //  根据传入的event参数和需要获取的值的KEY完成参数输出
    return event.currentTarget.dataset[key];
  };
}
//  将当前类输出
export {Base};