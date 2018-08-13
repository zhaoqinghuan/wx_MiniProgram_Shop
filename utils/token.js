//  引入基类配置文件
import { Config } from 'config.js';
//  自定义类
class Token {
  constructor() {//  构造函数
    this.verifyUrl = Config.restUrl + 'token/verify'; //  自定义验证Token是否合法路由
    this.tokenUrl = Config.restUrl + 'token/user';   //  自定义获取Token路由
  }
  /**
   *  自定义检验令牌合法性的方法
   */  
  verify(){
    //  首先如果当前不存在令牌则需要到服务器去请求令牌
    var token = wx.getStorageSync('token');
    if (!token){//  如果令牌不存在，直接调用请求令牌方法生成令牌
      this.getTokenFromService();
    }else{  //  如果令牌存在，调用服务器的检测令牌是否合法接口进行检测
      this._verifyFromService(token);
    }
  }

  /**
   *  自定义根据令牌校验当前Token是否合法
   *  @params
   *    token   { String }    当前用户的Token
   */
  _verifyFromService(token){
    var that = this;      //  将全局方法this赋值给that变量。以免不能在内置方法中使用
    wx.request({          //  发起请求，这里使用原生请求发送因为此类和Base类一样同属于顶级工具类
      url: that.verifyUrl,//  请求地址为服务器的验证token是否合法接口地址
      method: 'POST',
      data: {
        token: token      //  携带参数为Token本身
      },
      success: function(res){   //  回调方法检验Token是否合法不合法调用获取令牌方法重新获取Token
        var valid = res.data.isValid;
        if(!valid){
          that.getTokenFromService();
        }
      }
    })
  }

  /**
   *  自定义通过服务器获取令牌方法
   *  @prams
   *    callBack  { function }  方法调用成功后的回调方法
   */
  getTokenFromService(callback){
    var that = this;  //  将全局方法this赋值给that变量。以免不能在内置方法中使用
    //  调用微信小程序内置的登录方法，如果用户确定登录会返回一个当前用户的code码，
    //  该码是当前用户对当前小程序的唯一凭证。将其作为参数传给服务器服务器处理完成后生成Token
    wx.login({        
      success: function(res){   //  登录成功的返回结果方法体
        wx.request({            //  发起请求，这里使用原生请求发送因为此类和Base类一样同属于顶级工具类
          url: that.tokenUrl,   //  请求地址为服务器的获取token接口地址
          method: 'POST',       //  请求类型POST
          data: {
            code: res.code      //  携带的参数为当前用户的code码
          },
          success: function(res){
            wx.setStorageSync('token', res.data.token);
            callback && callback(res.data.token);
          }
        })
      }
    })
  }
}

export { Token };