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
//********************************** 录音 */
Page({
  data: {
    //首页点击的是第几条事项
    tapindex: 0,
    //operation :0:添加事项； 1：查看事项； 2：编辑事项
    operation: 0,
    operationInfo: [
      { operation: 0, btText: '确认添加', dataEditable: true },
      { operation: 1, btText: '返回首页', dataEditable: false },
      { operation: 2, btText: '确认修改', dataEditable: true },
    ],
    /*********************事项详细信息 */
    time: util.formatTime(new Date()).substring(11, 16),
    date: util.formatTime(new Date()).substring(0, 10),
    thing: '',
    //数值越大，优先级越高
    thing_priority: 0,
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
      //   todo_location_locationInfo:''
      // }
    ],
    prioritys: [
      // { priority: 0, color: 'grey', checked: 'true' },
      // { priority: 1, color: 'green' },
      // { priority: 2, color: 'gold' },
      // { priority: 3, color: 'crimson' },
      { priority: 0, color: 'grey', checked: 'true' },
      { priority: 1, color: '#09bb07' },
      { priority: 2, color: '#E4E544' },
      { priority: 3, color: '#e64340' },
    ],
    /***************************录音数据 */
    recorder_progress: 0,
    tempRecorderFile: '',
    //0:未开始录音 1：录音中 2：录音结束
    isRecording: 0,
    recorderInfo: [
      { isRecording: 0, audioImage: '../../image/audio_play_grey.png', btText: '开始录音' },
      { isRecording: 1, audioImage: '../../image/audio_play_grey.png', btText: '停止录音' },
      { isRecording: 2, audioImage: '../../image/audio_play_green.png', btText: '重新录音' }
    ],
    //*****************************照片数据 */
    imagePath: '',
    //*****************************位置数据 */
    location: { latitude: 0, longitude: 0, name: '' },
    //media选择的tab
    swiperIndex: 0
  },
  addThing: function () {
    
    let that = this
    let recorderFilePath = ''
    let imageFilePath = ''
    /**
     * 封装保存此条信息函数,（index=-1则添加一条；index!=-1则修改index条）
     */
    let saveThing = function (index, recorderFilePath, imageFilePath) {
      let _thing = {
        todo_time: that.data.time,
        todo_date: that.data.date,
        todo_thing: that.data.thing,
        todo_thing_priority: that.data.thing_priority,
        todo_audio_path: recorderFilePath,
        todo_recorder_progress: that.data.recorder_progress,
        todo_photo_imagePath: imageFilePath,
        todo_location_locationInfo: that.data.location
      }
      if (index === -1) {
        that.data.things.push(_thing)
      } else {
        that.data.things.splice(index, 1, _thing)
      }
      console.log('things.length:' + that.data.things.length)
      wx.setStorage({
        key: 'save_things',
        data: that.data.things,
        success: function (res) {
          wx.hideLoading()
          wx.navigateBack({
            delta: 1
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

    //图片
    let saveImage = function () {
     
      if (that.data.imagePath !== '') {
        imageFilePath = that.data.imagePath
        wx.saveFile({
          tempFilePath: imageFilePath,
          success: function (res) {
            imageFilePath = res.savedFilePath
            console.log('save success imageFilePath:', imageFilePath)
            //保存此事
            saveThing(-1, recorderFilePath, imageFilePath)
          },
          fail: function () {
            imageFilePath = ''
            saveThing(-1, recorderFilePath, imageFilePath)
            wx.showToast({
              title: '保存照片文件失败！',
              icon: 'none'
            })
          }
        })
      } else {
        // saveThing(-1)
        saveThing(-1, recorderFilePath, imageFilePath)
      }
    }

    let _operation = this.data.operation
    if (_operation === 0) {
      //添加事项
      wx.showLoading({
        title: '保存中...',
      })
      //将临时文件保存本地
      //录音
      
      if (that.data.tempRecorderFile !== '') {
        recorderFilePath = that.data.tempRecorderFile
        wx.saveFile({
          tempFilePath: recorderFilePath,
          success: function (res) {
            recorderFilePath = res.savedFilePath
            console.log('save success recorderFilePath:', recorderFilePath)
            saveImage()
            // //保存此事
            // saveThing(-1, recorderFilePath)
          },
          fail: function () {
            recorderFilePath = ''
            saveImage()
            wx.showToast({
              title: '保存录音文件失败！',
              icon: 'none'
            })
          }
        })
      } else {
        saveImage()
        // saveThing(-1, '')
      }
    } else if (_operation === 1) {
      //查看事项
      wx.navigateBack({
        delta: 1
      })
    } else if (_operation === 2) {
      //编辑事项
      saveThing(that.data.tapindex, that.data.tempRecorderFile, that.data.imagePath)
    }
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
    let interval
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
    let innerAudioContext = wx.createInnerAudioContext()
    let _tempRecorderFile = this.data.tempRecorderFile
    let that = this
    let recorder_progress_original = that.data.recorder_progress
    console.log('音频地址：', _tempRecorderFile)
    if (this.data.isRecording === 2 && _tempRecorderFile !== '') {
      innerAudioContext.autoplay = false
      innerAudioContext.loop = false
      innerAudioContext.src = _tempRecorderFile
      innerAudioContext.onCanplay(() => {
        innerAudioContext.play()
      })
      innerAudioContext.onPlay(() => {
        console.log('开始播放：', _tempRecorderFile)
        that.setData({
          recorder_progress: 0
        })
        let recorderProgress = that.data.recorder_progress
        let interval = setInterval(function () {
          if (recorderProgress < recorder_progress_original) {
            console.log('原始进度：' + recorder_progress_original)
            that.setData({
              recorder_progress: ++recorderProgress
            })
          } else {
            clearInterval(interval)
            // that.setData({
            //   recorder_progress: recorder_progress_original
            // })
          }
        }, 100);
      })
      innerAudioContext.onError((res) => {
        console.log(res.errMsg, ' errCode:' + res.errCode)
        wx.showToast({
          title: '出现内部错误，请重新录制！',
          icon: 'none',
        })
      })
    } else {
      wx.showToast({
        title: '请重新录制！',
        icon: 'none',
      })
    }
  },
  chooseImage: function () {
    let that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        console.log(res.tempFilePaths)
        that.setData({
          imagePath: res.tempFilePaths[0]
        })
      },
    })
  },
  previewPhoto: function () {
    let _imagePath = this.data.imagePath
    let that = this
    wx.previewImage({
      urls: [_imagePath],
      fail: function () {
        console.log('预览失败' + this.data.imagePath)
      },
      success:function(){
        that.setData({
          imagePath:_imagePath
        })
        console.log('预览成功' + that.data.imagePath)
      }
    })
    console.log('预览'+this.data.imagePath)
  },
  chooseLocation: function () {
    let that = this
    wx.chooseLocation({
      success: function (res) {
        console.log('name:' + res.name + 'adress:' + res.address)
        that.setData({
          location: { latitude: res.latitude, longitude: res.longitude, name: res.name }
        })
      },
    })
  },
  openLocation: function () {
    if (this.data.location.name.length > 0) {
      wx.openLocation({
        latitude: this.data.location.latitude,
        longitude: this.data.location.longitude,
      })
    }
  },
  swiperLabelClick: function (event) {
    let clickId = event.currentTarget.id
    let _swiperIndex = 0
    if (clickId == 'edit_media_label_0') {
      _swiperIndex = 0;
    } else if (clickId == 'edit_media_label_1') {
      _swiperIndex = 1
    } else if (clickId == 'edit_media_label_2') {
      _swiperIndex = 2
    }
    this.setData({
      swiperIndex: _swiperIndex
    })
  },
  swiperChange: function (event) {
    let that = this
    if (event.detail.source == 'touch') {
      //console.log(event.detail.current)
      that.setData({
        swiperIndex: event.detail.current
      })
    }
  },
  onLoad: function (options) {
    // 生命周期函数--监听页面加载
    console.log('tapindex:' + options.tapindex, 'operation:' + options.operation)
    let that = this
    that.setData({
      tapindex: options.tapindex,
      operation: parseInt(options.operation)
    })
    wx.getStorage({
      key: 'save_things',
      success: function (res) {
        that.setData({
          things: res.data,
        })
        if (options.tapindex != -1) {
          console.log(res.data[options.tapindex].todo_thing)
          that.setData({
            time: res.data[options.tapindex].todo_time,
            date: res.data[options.tapindex].todo_date,
            thing_priority: res.data[options.tapindex].todo_thing_priority,
            thing: res.data[options.tapindex].todo_thing,
            tempRecorderFile: res.data[options.tapindex].todo_audio_path,
            recorder_progress: res.data[options.tapindex].todo_recorder_progress,
            imagePath: res.data[options.tapindex].todo_photo_imagePath,
            location: res.data[options.tapindex].todo_location_locationInfo
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
      title: '记录的每件事组成了我们生活的Flow', // 分享标题
      desc: '事项详细信息', // 分享描述
      path: 'pages/edit/edit' // 分享路径
    }
  }
})