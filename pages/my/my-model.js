import { Base } from '../../utils/base.js'

class My extends Base{
  //  构造方法
  constructor(){
    super();
  }

  /**
   *  获取当前用户信息方法
   */
  getUserInfo(cb){
    var that = this;
    wx.login({    //  调用微信内置登录方法
      success: function(){
        wx.getUserInfo({  //  在成功的回调方法中调用微信内置获取用户信息方法
          success: function(res){   //  用户同意获取数据展示获取到的用户信息
            typeof cb == "function" && cb(res.userInfo);
          },
          fail: function(res){   //   用户不同意获取数据展示一组自定义默认数据
            typeof cb == "function" && cb({
              avatarUrl : '../../imgs/icon/user@default.png',
              nickName: 'XXXX'
            });
          }
        })
      }
    })
  }

}
export { My };