//获取应用实例
var app = getApp()

var sorter = require('../../utils/compositor.js')
Page({
  data: {
    userInfo: {},
    thingColor: 'red',
    things: [
      // {
      //   todo_time: '12:01',
      //   todo_date: '2017-11-07',
      //   todo_thing_priority: 1,
      //   todo_thing: ''
      //   todo_thing: 'thing',
      //   todo_audio_path: '',
      //   todo_recorder_progress: 0,
      //   todo_photo_imagePath:'',
      //   todo_location_locationName:''
      // }
    ],
    prioritys: [
      { priority: 0, color: 'grey', checked: 'true' },
      { priority: 1, color: 'green' },
      { priority: 2, color: 'gold' },
      { priority: 3, color: 'crimson' },
    ],
    //sortBy:1:时间 2：优先级
    sortBy: 1,
    tempRecorderFile: '',
    //operation :0:添加事项； 1：查看事项； 2：编辑事项
  },

  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  thing_click_show_dialog: function (event) {
    console.log(event.currentTarget.dataset.index)
    let index = event.currentTarget.dataset.index
    let that = this
    wx.showActionSheet({
      itemList: ['编辑', '删除'],
      success: function (res) {
        console.log(res.tapIndex)
        if (res.tapIndex === 0) {
          wx.navigateTo({
            url: '../edit/edit?tapindex=' + index + '&operation=2',
          })
        } else if (res.tapIndex === 1) {
          //删除条目
          //1.先删除本地保存的文件
          wx.removeSavedFile({
            filePath: that.data.things[index].todo_audio_path,
            success: function () {
              console.log('录音文件删除成功')
            },
            fail: function () {
              console.log('录音文件删除失败')
            }
          })

          that.data.things.splice(index, 1)
          wx.setStorage({
            key: 'save_things',
            data: that.data.things,
            success: function (res) {
              that.setData({
                things: that.data.things
              })
            },
            fail: function () {
              // fail
            },
            complete: function () {
              // complete
            }
          })
        }
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    })
  },
  thing_click_view_detals: function (event) {
    let index = event.currentTarget.dataset.index
    wx.navigateTo({
      url: '../edit/edit?tapindex=' + index + '&operation=1',
    })
  },
  bindAddTap: function () {
    wx.navigateTo({
      url: '../edit/edit?tapindex=-1&operation=0',
      success: function (res) {
        // success
      },
      fail: function () {
        // fail
      },
      complete: function () {
        // complete
      }
    })
  },
  sortByPriority: function () {
    let _things = this.data.things;
    this.setData({
      things: sorter.sortByPriority(_things),
      sortBy: 2
    })

  },
  onLoad: function () {
    console.log('onLoad')
    var that = this

    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    })
  },
  onShow: function () {
    // 生命周期函数--监听页面显示
    var that = this
    that.setData({
      sortBy: 1
    })
    wx.getStorage({
      key: 'save_things',
      success: function (res) {
        that.setData({
          things: res.data,
          // sortBy: 1
        })
      },
      fail: function () {
        // fail
      },
      complete: function () {
        // complete
      }
    })
  },
  onShareAppMessage: function () {
    // 用户点击右上角分享
    return {
      title: 'MyFlow', // 分享标题
      desc: '每件事组成我们生活的Flow', // 分享描述
      path: 'pages/index/index' // 分享路径
    }
  }

})
