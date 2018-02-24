var util = require('../../utils/util.js')
//********************************** 录音 */
const recorder = wx.getRecorderManager()
// var tempRecorderFile
const options = {
  duration: 10000,
  sampleRate: 44100,
  numberOfChannels: 1,
  encodeBitRate: 192000,
  format: 'aac',
  frameSize: 50
}

// recorder.onStop((res) => {
//   const { tempFilePath } = res
//   tempRecorderFile = tempFilePath
//   console.log("recorder stop:", tempFilePath)
// })
//********************************** 录音 */

//**********************************音频播放 */
const innerAudioContext = wx.createInnerAudioContext()

//**********************************音频播放 */
Page({
  data: {
    time: '12:01',
    date: '2017-11-07',
    //数值越大，优先级越高
    thing_priority: 0,
    thing: 'thing',
    things: [
      // {
      //   todo_time: '12:01',
      //   todo_date: '2017-11-07',
      //   todo_thing_priority: 1,
      //   todo_thing: ''
      //   todo_thing: 'thing',
      //   todo_audio_path: '',
      //   todo_recorder_progress: 0
      // }
    ],
    prioritys: [
      { priority: 0, color: 'grey', checked: 'true' },
      { priority: 1, color: 'green' },
      { priority: 2, color: 'gold' },
      { priority: 3, color: 'crimson' },
    ],
    recorder_progress: 0,
    tempRecorderFile: '',
    //0:未开始录音 1：录音中 2：录音结束
    isRecording: 0,
    recorderInfo: [
      { isRecording: 0, audioImage: '../../image/audio_play_grey.png', btText: '开始录音' },
      { isRecording: 1, audioImage: '../../image/audio_play_grey.png', btText: '停止录音' },
      { isRecording: 2, audioImage: '../../image/audio_play_green.png', btText: '重新录音' }
    ]
  },
  addThing: function () {
    let _thing = {
      todo_time: this.data.time,
      todo_date: this.data.date,
      todo_thing: this.data.thing,
      todo_thing_priority: this.data.thing_priority,
      todo_audio_path: this.data.tempRecorderFile,
      todo_recorder_progress: this.data.recorder_progress
    }
    this.data.things.push(_thing)

    // this.setData({
    //   things: this.data.things,
    //   thing: 'thing'
    // })
    console.log('onshow' + this.data.things.length)
    wx.setStorage({
      key: 'save_things',
      data: this.data.things,
      success: function (res) {
        wx.navigateBack({
          url: '../index/index',
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
      fail: function () {
        // fail
      },
      complete: function () {
        // complete
      }
    })
  },
  bindTimeChange: function (e) {
    this.setData({
      time: e.detail.value
    })
  },
  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
  },
  bindThingChange: function (e) {
    this.setData({
      thing: e.detail.value
    })
  },
  priorityChange: function (e) {
    console.log(e.detail.value)
    this.setData({
      thing_priority: e.detail.value
    })
  },
  recorder_bt: function () {
    let _isRecording = this.data.isRecording
    let _recorder_progress = this.data.recorder_progress
    let that = this
    var interval
    /**
     * 开始录音函数
     */
    var _startRecord = function () {
      //开始录音
      recorder.start(options)
      //录音结束回调
      recorder.onStop((res) => {
        const { tempFilePath } = res
        that.setData({
          tempRecorderFile: tempFilePath
        })
        console.log("recorder stop:", that.data.tempRecorderFile)
      })

      that.setData({
        isRecording: 1
      })

      interval = setInterval(function () {
        //console.log('recorder_progress:' + _recorder_progress)
        if (that.data.isRecording === 1 && _recorder_progress <= 100) {
          that.setData({
            recorder_progress: _recorder_progress++
          })
        } else {
          clearInterval(interval)
          that.setData({
            isRecording: 2
          })
        }
      }, 100)
    }
    if (_isRecording === 0) {
      _startRecord()
    } else if (_isRecording === 1) {
      recorder.stop()
      clearInterval(interval)
      that.setData({
        isRecording: 2
      })
    } else if (_isRecording === 2) {
      //录音结束,重新录音
      _recorder_progress = 0
      that.setData({
        recorder_progress: 0
      })
      _startRecord()
    }
  },
  audioPlay: function () {
    let _tempRecorderFile = this.data.tempRecorderFile
    if (this.data.isRecording === 2 && _tempRecorderFile !== '') {
      innerAudioContext.src = _tempRecorderFile
      innerAudioContext.play()
      innerAudioContext.onPlay(() => {
        console.log('开始播放')
      })
      innerAudioContext.onError((res) => {
        console.log(res.errMsg)
        wx.showToast({
          title: '出现内部错误，请重新录制！',
          icon: 'none',
        })
      })
    } else {
      wx.showToast({
        title: '出现内部错误，请重新录制！',
        icon: 'none',
      })
    }
  },
  onLoad: function (options) {
    // 生命周期函数--监听页面加载
    console.log(options.tapindex)
    let that = this
    wx.getStorage({
      key: 'save_things',
      success: function (res) {
        that.setData({
          things: res.data
        })
        if (options.tapindex != undefined) {
          console.log(res.data[options.tapindex].todo_thing)
          that.setData({
            time: res.data[options.tapindex].todo_time,
            date: res.data[options.tapindex].todo_date,
            thing_priority: res.data[options.tapindex].todo_thing_priority,
            thing: res.data[options.tapindex].todo_thing,
            tempRecorderFile: res.data[options.tapindex].todo_audio_path,
            recorder_progress: res.data[options.tapindex].todo_recorder_progress,
          })
          if (res.data[options.tapindex].todo_recorder_progress > 0) {
            that.setData({
              isRecording: 2
            })
          }
        } else {
          that.setData({
            time: util.formatTime(new Date()).substring(11, 16),
            date: util.formatTime(new Date()).substring(0, 10),
            thing: '',
          })
        }
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
      title: 'title', // 分享标题
      desc: 'desc', // 分享描述
      path: 'path' // 分享路径
    }
  }
})