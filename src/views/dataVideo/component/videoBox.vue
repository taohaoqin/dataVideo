<template>
  <div class="left">
    <div :class="videoClass" :style="{backgroundColor: colorObj.bg, color: colorObj.text}">
      <div class="title">
        <div class="left-title" :class="titleBefore">
          <div class="title1" >{{text.title1}}</div>
          <div class="title2" >{{text.title2}}</div>
        </div>
        <div class="source">{{text.source}}</div>
      </div>
      <div class="half">{{text.half}}</div>
      <div id="chart"></div>
    </div>
    <div class="control">
      <el-slider
        class="progress"
        v-model="percentage"
        :show-tooltip="false"
        @change="changeSlider"
        :step="100 / step"
        :max="100"
        :min="0">
      </el-slider>
      <div class="control-btn">
        <div class="time"><span class="now">{{handleTofiexd(time)}}</span> / {{theLength}}</div>
        <div class="player" :class="{play:!playState, suspend:playState}" @click="play"></div>
        <div class="size">
          <div class="proportion" @click="changeProportion">{{proportion}}</div>
          <!-- <div class="full-screen" @click="full"></div> -->
        </div>
      </div>
    </div>
    <div class="control-foot">
      <div class="duration">
        <span>视频时长：</span>
        <div class="second" v-for="i in secondList" :key="i" :class="{select: second === parseInt(i)}" @click="selectDuration(i)">{{i}}</div>
        <span style="margin-left: 24px;">自定义时长：</span>
        <el-input-number controls-position="right" v-model="second" @change="changeSecond"></el-input-number>
        <span style="margin-left: 8px;">S</span>
      </div>
    </div>
  </div>
</template>
<script>
const d3 = window.d3
export default {
  props: {
    dataOri: {
      type: Array,
      default: ()=>[]
    },
    text:{
      type: Object,
      default: ()=>{
        return {
          title1: '主标题',
          title2: '副标题',
          source: '数据来源：某某网',
          half: '单位：分',
          num: 0
        }
      }
    },
    colorObj: {
      type: Object,
      default: ()=>{
        return {
          bg: '#FFFFFF',
          text: '#222222',
          series1: '#FF4900',
          series2: '#FFD159',
          series3: '#86C552',
          series4: '#2F97FF'
        }
      }
    },
    flagList: {
      type: Array,
      default: ()=> []
    }
  },
  watch: {
    flagList(){
      this.dataList = []
      this.formatData()
      this.resRender()
    }
  },
  data(){
    return {
      time: '00:00', //已播放时长
      theLength: '00:00', //总时长
      playState: false, //播放状态
      percentage: 0, //进度条
      proportion: "16:9",
      margin: {top: 0, bottom:0 , left: 50, right:  200 },  //边距
      dataList: [], //格式化后的数据
      count: 10, //显示几行
      barPadding: 33,
      dateIndex: 0,
      dataSlice: [], //排序后的数据
      chart: null, //图表
      scale: null, //比例尺
      axis: null,  //坐标
      svg: null, 
      dateTitle: null,
      ticker: null, //计时器
      second: 16, //时长秒数
      secondList: ['10s', '15s', '20s', '25s', '30s'],
      bars: null,
      continueState: false,
      time1: 0,
      time2: 0,
      durationTime: 0,
    }
  },
  computed: {
    titleBefore(){
      if (this.colorObj.text === '#FFFFFF'){
        return 'whiteBefore'
      } else {
        return 'blackBefore'
      }
    },
    videoClass(){
      if (this.proportion === "16:9") {
        return 'video'
      } else {
        return 'video-small'
      }
    },
    width(){ //图表的长宽
      if (this.proportion === "16:9") {
        return 1150
      } else {
        return 350
      }
    },
    height(){
      if (this.proportion === "16:9") {
        return 500
      } else {
        return 530
      }
    },
    fontSize(){ //右下角字体大小
      if (this.proportion === "16:9") {
        return 104
      } else {
        return 55
      }
    },
    fontSize1(){ //右侧字体大小
      if (this.proportion === "16:9") {
        return 24
      } else {
        return 14
      }
    },
    chartWidth(){
      return this.width - (this.margin.left + this.margin.right)
    },
    chartHeight(){
      return this.height - (this.margin.top + this.margin.bottom)
    },
    barHeight(){
      return (this.chartHeight - (this.barPadding * this.count)) / this.count
    },
    date(){ //获取国家名称
      if(this.cloneDataOri[0]){
        return this.cloneDataOri[0][this.dateIndex]
      } else {
        return ''
      }
    },
    step(){ //动画总播放次数 
      if(this.cloneDataOri.length > 0){
        return this.cloneDataOri[0].length - 2
      } else {
        return 0
      }
    },
    duration(){ //动画过渡时间
     if(this.cloneDataOri.length > 0){
       return (this.second / (this.cloneDataOri[0].length - 2)) * 1000
     } else {
       return 0
     } 
    },
    cloneDataOri(){
      if(this.dataOri.length > 0){
        let ary = [] //受excel表格的影响 会产生很多null 过滤掉所有的null
        this.dataOri.forEach(i => {
          let list = i.filter(k => {
            if(k){
              return k
            }
          })
          if(list.length > 0){
            ary.push(list)
          }
        })
        // console.log(ary)
        return ary
      } else {
        return []
      }
    }
  },
  methods: {
    handleTofiexd(val){
      let list = val.split(':')
      if(list[1].indexOf('.') > 0){
        let a = parseInt(list[1])
        return `${list[0]}:${a < 10 ? ('0' + a): a }`
      } else {
        return val
      }
    },
    selectDuration(i){ //改变视频时长秒数
      this.second = parseInt(i)
      this.theLength = this.formatTime(parseInt(i) * 1000)
      this.resetData() //图表数据初始化
      this.init()
      this.percentage = 0
      this.time = '00:00'
      this.durationTime = this.duration
    },
    changeSecond(val){ //input改变视频时长秒数
      this.selectDuration(val)
    },
    timeChange(time){
      let s = 0
      let minutes = time.split(':')[0]
      let seconds = time.split(':')[1]
      s = Number(minutes * 60) + Number(seconds)
      return s*1000
    },
    formatTime(time){
      let minutes = parseInt((time % (1000 * 60 * 60)) / (1000 * 60))
      let seconds = (time % (1000 * 60)) / 1000
      minutes = minutes < 10 ? ('0' + minutes) : minutes
      seconds = seconds < 10 ? ('0' + seconds) : seconds
      return minutes + ":" + seconds
    },
    changeProportion(){ //切换比例
      if(this.proportion === '16:9'){
        this.proportion = '9:16'
        this.margin.bottom = 40
        this.margin.right = 150
      } else {
        this.proportion = '16:9'
        this.margin.bottom = 0
        this.margin.right = 200
      }
      this.resRender()
    },
    clearSvg(){ //移除svg
      this.dataSlice = []
      this.dataList = []
      d3.select('svg').remove() //删除整个SVG
      d3.select('#chart')
        .selectAll('*')
        .remove()
    },
    resRender(){ //整个重新渲染
      if(this.dataOri.length === 0){
        return false
      }
      this.durationTime = 0
      this.clearSvg()
      this.createSvg() // 创建一个svg
      this.formatData() // 格式化数据
      this.sliceData() // 截取当天数据
      this.renderAxis() // 渲染坐标轴
      this.renderDateTitle() // 渲染日期
      this.createChart() //创建图表
      this.dateTitle.text(this.date)
      this.updateAxis()
      this.renderChart()  //渲染图表
      this.durationTime = this.duration
    },
    full(){
      console.log('全屏')
    },
    changeSlider(val){ //滚动条发生改变时
      let step = val * this.step / 100
      if(step === 0 ){
        this.dateIndex = 1
      } else {
        this.dateIndex = step + 1
      }
      this.time = this.formatTime(step * (this.second/this.step)* 1000) //更新时间
      this.dateTitle.text(this.date) //更新图表
      this.sliceData()
      this.updateAxis()
      this.renderChart() 
    },
    createSvg () { // 创建一个svg
      this.svg = d3.select('#chart')
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
    },
    formatData() { // 格式化数据
      if( this.cloneDataOri.length === 0){
        return false
      }
      this.cloneDataOri[0].forEach((i, k) => {
        if (k > 0) {
          this.cloneDataOri.forEach((item, key) => {
            if (key > 0) {
              this.dataList.push({
                name: item[0],
                value: Number(item[k]),
                lastValue: k > 1 ? Number(item[k - 1]) : 0,
                date: i,
                color: this.colorObj.series4,
                img: this.flagList[key - 1] ? this.flagList[key - 1] : ''
              })
            }
          })
        }
      })
      // console.log(this.dataList)
    },
    changeColor(i, k){ //根据排名选颜色
      if(i < 3) {
        return this.colorObj['series' + (k + 1)]
      } else {
        return i.color
      }
    },
    sliceData(){ // 截取当天数据
      this.dataSlice = this.dataList.filter(d => d.date === this.date).sort((a, b) => b.value - a.value).slice(0, this.count)
      this.dataSlice.forEach((i, k) => {
        if( k < 3){
          i.color = this.colorObj['series' + (k + 1)]
        } else {
          i.color = this.colorObj.series4
        }
      })
      // console.log(this.dataSlice)
    },
    createScale(){ //比例尺
      this.scale = d3.scaleLinear().domain([0, d3.max(this.dataSlice, d => d.value)]).range([0, this.chartWidth])
    },
    renderAxis(){ //渲染坐标轴
      this.createScale()
      this.axis = d3.axisTop().scale(this.scale).ticks(5).tickPadding(10).tickSize(0)
      this.svg.append('g')
        .classed('axis', true)
        .style('transform', `translate3d(90px, ${this.margin.top}px, 0)`) //坐标轴左右100px
        .call(this.axis)
    },
    renderAxisLine(){ // 渲染指示线
      d3.selectAll('g.axis g.tick').select('line.grid-line').remove()
      d3.selectAll('g.axis g.tick').append('line')
        .classed('grid-line', true)
        .attr('stroke', 'black')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 0)
        .attr('y2', this.chartHeight)
    },
    renderDateTitle(){ //设置右下角标题 渲染日期
      this.dateTitle = this.svg.append('text')
        .classed('date-title', true)
        .text(this.date)
        .attr('x', this.width)
        .attr('y', this.height-5)
        .attr('fill', this.colorObj.text)
        .attr('font-size', this.fontSize)
        .attr('opacity', 0.3)
        .attr('text-anchor', 'end')
    },
    createChart(){ // 创建图表
      this.chart = this.svg.append('g')
      .classed('chart', true)
      .style('transform', `translate3d(${this.margin.left}px, ${this.margin.top}px, 0)`)
    },
    calTranslateY (i, end) { //计算Y轴位置
      if (this.dateIndex === 1 || end) {
        return (this.barHeight + this.barPadding) * i + (this.barPadding / 2)
      } else {
        return (this.barHeight + this.barPadding) * (this.count + 1)
      }
    },
    renderChart(){ //渲染图表
      const self = this
      self.bars = self.chart.selectAll('g.bar').data(self.dataSlice, (d) => d.name)
      let barsEnter
      barsEnter = self.bars.enter()
        .append('g')
        .classed('bar', true)
        .style('transform', (d, i) => `translate3d(0, ${self.calTranslateY(i)}px, 0)`)

      self.dateIndex > 1 && barsEnter
        .transition().duration((self.durationTime)*0.7)
        .style('transform', (d, i) => `translate3d(0, ${self.calTranslateY(i, 'end')}px, 0)`)

      barsEnter.append("svg:image") //添加图片
        .attr("xlink:href", d => d.img)
        .attr("x", -50)
        .attr("y", -7)
        .attr("width", 49)
        .attr("height", 32)

      barsEnter.append('rect') //柱状图
        .style('width', d => this.proportion === "16:9" ? self.scale(d.value):  parseInt(self.scale(d.value)) + 20 + 'px')
        .style('height', self.barHeight + 'px')
        .style('transform', `translate3d(${this.proportion === "16:9" ? '70px' : '65px'}, 0, 0)`) //柱状图左移50px
        .style('fill', (d) =>  d.color )

      barsEnter.append('text') //左侧文字
        .classed('label', true)
        .text(d => d.name)
        .attr('x', 3)
        .attr('y', 14)
        .attr('font-size', 14)
        .style('text-anchor', 'start')
        .style('fill', self.colorObj.text)

      barsEnter.append('text') //右侧文字
        .classed('value', true)
        .text(d => { return  String(d.value).indexOf('.') > 0 ? d.value.toFixed(self.text.num): d.value })
        .attr('x', d => self.proportion === "16:9" ? self.scale(d.value) + 80:  parseInt(self.scale(d.value)) + 90) //坐标末端的文字位置
        .attr('y', 14)
        .attr('font-size', self.fontSize1)
        .attr('font-weight', 'bold')
        .style('fill', (d, i) => self.changeColor(d, i))

      self.bars.transition().duration((self.durationTime)*0.7).ease(d3.easeLinear) //整体位置 颜色等变化
        .style('transform', function (d, i) {
          return 'translate3d(0, ' + self.calTranslateY(i, 'end') + 'px, 0)'
        })
        .select('rect')
        .style('width', function (d) {
          if(self.proportion === "16:9"){
            return self.scale(d.value) + 'px'
          } else {
            return parseInt(self.scale(d.value)) + 20 + 'px'
          }
        })
        .style('fill', (d, i) => self.changeColor(d, i))
        

      self.bars.select('text.value')//右侧文字变化
        .transition().duration((self.durationTime)*0.7).ease(d3.easeLinear)
        .attr('x', d => self.proportion === "16:9" ? self.scale(d.value) + 80:  parseInt(self.scale(d.value)) + 90) 
        .style('fill', (d, i) => self.changeColor(d, i))
        .tween('text', function (d) {
          const textDom = this
          const i = self.interpolateRound(d.lastValue, d.value)
          return (t) => {
              textDom.textContent = i(t)
            }
        })
        .each(function(){//过渡动画结束时触发 
          if(self.continueState === true){ //中途暂停的时候 恢复计时器
            console.log('恢复计时器')
            self.continueState = false
            self.durationTime = self.duration
            setTimeout(() => {
              self.initTicker()
            }, self.duration * 0.3) 
          }
        })

      self.bars.exit()
        .transition().duration((self.durationTime)*0.7).ease(d3.easeLinear)
        .style('transform', function (d, i) {
          return 'translate3d(0, ' + self.calTranslateY(i) + 'px, 0)'
        })
        .style('width', function (d) {
          return self.scale(d.value) + 'px'
        })
        .remove()
    },
    interpolateRound(a, b) { //复制了d3.interpolateRound 修改了一些格式
      return a = +a, b = +b, (t) => {
        return String(a * (1 - t) + b * t).indexOf('.') > 0 ? (a * (1 - t) + b * t).toFixed(this.text.num): (a * (1 - t) + b * t);
      }
    },
    play() { //d3计时器
      if(this.dataOri.length === 0){
        return false
      } 
      this.playState = !this.playState //播放状态
      if(this.playState){
        console.log('播放')
        if(this.percentage === 100){ //判断是否重新开始
          console.log('重新播放')
          this.resetData() //图表数据初始化
          this.init()
          this.percentage = 0
          this.time = '00:00'
        }
        if(this.percentage !== 0){
          this.continueState = true //暂停后继续播放
          const x = this.duration * 0.7 - (this.time2  - this.time1)
          this.durationTime =  x >= 0 ? x : x + this.duration
          this.renderChart() 
          return false
        }
        this.initTicker()
      } else { 
         this.time2 = Date.now()
         console.log('暂停')
         this.interrupt()
         this.ticker.stop() 
      }
    },
    initTicker(){ //设置定时器
      this.ticker = d3.interval(() => {  
        this.time1 = Date.now()
        if (this.dateIndex <= this.step) {
          setTimeout(()=>{
            let time = this.timeChange(this.time) + this.durationTime //播放时间
            let allTime = this.timeChange(this.theLength) //总时长
            let timeLength = (time / allTime * 100).toFixed(2) //当时时长占比
            this.percentage = Number(timeLength) //进度条进度
            this.time = this.formatTime(time) //时间点
          }, 500)
          this.startTransition()
        } else {
          console.log('停止')
          this.playState = false
          this.ticker.stop()
        }
      }, this.durationTime)
    },
    interrupt(){ //svg动画停止
      this.bars.interrupt()
      this.bars.select('rect').interrupt()
      this.bars.select('text.value').interrupt()
      this.bars.exit().interrupt()
    },
    updateAxis(){ //更新比例尺
      this.createScale()
      this.axis.scale().domain([0, d3.max(this.dataSlice, d => d.value)])
      this.svg.select('g.axis')
        .transition().duration(this.durationTime).ease(d3.easeLinear)
        // .call(this.axis) //是否显示坐标
      d3.selectAll('g.axis g.tick text').attr('font-size', 14)
    },
    startTransition(){ //开始动画
      this.dateIndex++
      this.dateTitle.text(this.date)
      this.sliceData()
      this.updateAxis()
      this.renderChart() // 渲染图表
    },
    resetData(){ //重置
      this.dateIndex = 0
      this.dataSlice = []
      this.dataList = []
      d3.select('svg').remove() //删除整个SVG
      d3.select('#chart')
        .selectAll('*')
        .remove()
    },
    init(){ //初始化
      this.createSvg() // 创建一个svg
      this.formatData() // 格式化数据
      this.sliceData() // 截取当天数据
      this.renderAxis() // 渲染坐标轴
      // this.renderAxisLine() // 渲染指示线
      this.renderDateTitle() // 渲染日期
      this.createChart() // 创建图表
      this.startTransition()
      // console.log('初始化')
    }
  },
  created(){
    // console.log(this.duration)
    this.durationTime = this.duration
  },
  mounted(){
    if(this.cloneDataOri.length > 0){
      this.init()
    }
    this.theLength = this.formatTime((this.second) * 1000)
  }
}
</script>
<style lang="scss" scoped>
/deep/ .domain{ //隐藏图表的x坐标
  display: none;
}
.left{
  width: 1200px;
  height: 100%;
  background: #2B2E36;
  .video{
    height: 677px;
    box-sizing: border-box;
    padding: 24px 15px;
    color: #222222;
    .title{
      display: flex;
      justify-content: space-between;
      line-height: 28px;
      .left-title{
        position: relative;
        margin-left: 18px;
        .title1{
          height: 31px;
          font-size: 24px;
          font-weight: bold;
        }
        .title2{
          height: 21px;
          margin-top: 10px;
          font-size: 16px;
        }
      }
      .blackBefore{
        &::before{
          content: '';
          width: 6px;
          height: 64px;
          position: absolute;
          left: -18px;
          background: #222222;
          opacity: 0.3;
          border-radius: 3px;
        }
      }
      .whiteBefore{
        &::before{
          content: '';
          width: 6px;
          height: 64px;
          position: absolute;
          left: -18px;
          background: #ffffff;
          opacity: 0.3;
          border-radius: 3px;
        }
      }
      .source{
        font-size: 16px;
      }
    }
    .half{
      height: 21px;
      margin-top: 24px;
      font-size: 16px;
      margin-bottom: 10px;
    }
    #chart{
      height: calc(100% - 107px);
    }
  }
  .video-small{
    width: 382px;
    height: 677px;
    margin: 0 auto;
    box-sizing: border-box;
    padding: 24px 15px;
    color: #222222;
    .title{
      display: flex;
      justify-content: space-between;
      line-height: 28px;
      .left-title{
        position: relative;
        margin-left: 13px;
        .title1{
          height: 21px;
          font-size: 16px;
          font-weight: bold;
        }
        .title2{
          height: 14px;
          margin-top: 6px;
          font-size: 14px;
        }
      }
      .blackBefore{
        &::before{
          content: '';
          width: 4px;
          height: 46px;
          position: absolute;
          left: -18px;
          background: #222222;
          opacity: 0.3;
          border-radius: 3px;
        }
      }
      .whiteBefore{
        &::before{
          content: '';
          width: 4px;
          height: 46px;
          position: absolute;
          left: -18px;
          background: #ffffff;
          opacity: 0.3;
          border-radius: 3px;
        }
      }
      .source{
        font-size: 14px;
      }
    }
    .half{
      height: 14px;
      margin-top: 17px;
      font-size: 14px;
      margin-bottom: 10px;
    }
    #chart{
      height: calc(100% - 107px);
    }
  }
  .control{
    height: 50px;
    border-top: 4px;
    box-sizing: border-box;
    background: #272B34;
    box-shadow: 0px -4px 0px #434A59;
    .progress{
      height: 4px;
      // background: #FC4F08;
      position: relative;
      top: -20px;
      /deep/ .el-slider__runway{
        background: none;
        border-radius: 0;
      }
      /deep/ .el-slider__button-wrapper {
        top: -16px;
        z-index: 0;
        .el-slider__button {
          width: 10px;
          height: 10px;
          background-color: #FC4F08;
          border-color: #F8E9E3;
        }
      }
      
      /deep/.el-slider__bar{
        height: 4px;
        background-color: #FC4F08;
      }
      /deep/ .el-progress-bar__outer{
        overflow: inherit;
        background-color: #434A59;
      }
      /deep/ .el-progress-bar__inner{
        &::after{
          content: '';
          width: 10px;
          height: 10px;
          border: 2px solid #F8E9E3;
          box-sizing: border-box;
          border-radius: 50%;
          position: absolute;
          right: 0;
          top: -4px;
          background: #FC4F08;
        }
      }
    }
    .control-btn{
      height: 88%;
      padding: 0 25px 0 13px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .time{
        height: 29px;
        font-size: 22px;
        line-height: 30px;
        color: #EEF2FA;
        .now{
          color: #FF5813;
        }
      }
      .player{
        position: absolute;
        left: 50%;
      }
      .play{
        cursor: pointer;
        width: 26px;
        height: 26px;
        background-image: url(~@/assets/icons/play.png);
        &:hover{
          background-image: url(~@/assets/icons/play1.png);
        }
      }
      .suspend{
        cursor: pointer;
        width: 26px;
        height: 26px;
        background-image: url(~@/assets/icons/suspend.png);
        &:hover{
          background-image: url(~@/assets/icons/suspend1.png);
        }
      }
      .size{
        display: flex;
        align-items: center;
        .proportion{
          cursor: pointer;
          width: 36px;
          height: 23px;
          
          font-size: 12px;
          text-align: center;
          line-height: 20px;
          box-sizing: border-box;
          color: #8C97B1;
          border: 2px solid #8C97B1;
          &:hover{
            color: #FF5813;
            border: 2px solid #FF5813;
          }
        }
        .full-screen{
          cursor: pointer;
          width: 20px;
          height: 20px;
          margin-left: 21px;
          background-image: url(~@/assets/icons/full.png);
          &:hover{
            background-image: url(~@/assets/icons/full1.png);
          }
        }
      }
    }
  }
  .control-foot{
    height: calc(100% - 727px);
    background: #313642;
    box-sizing: border-box;
    padding: 16px 15px;
    .duration{
      display: flex;
      align-items: center;
      font-size: 16px;
      color: #9BA3B6;
      .second{
        cursor: pointer;
        width: 104px;
        height: 40px;
        margin-left: 7px;
        line-height: 40px;
        text-align: center;
        color: #8590AD;
        background: #3E4553;
        border-radius: 3px;
      }
      .select{
        position: relative;
        &::before{
          position: absolute;
          content: '';
          width: 100%;
          height: 100%;
          background: rgba(255, 86, 16, 0.2);
          border: 2px solid #FF5610;
          border-radius: 3px;
          box-sizing: border-box;
          left: 0;
        }
      }
      /deep/ .el-input-number{
        width: 104px;
        padding: 0;
        text-align: center;
        .el-input{
          background: #242730;
          .el-input__inner{
            font-size: 16px;
            color: #9095A5;
            border: 1px solid #373C49;
            background: #242730;
            padding-right: 40px;
          }
        }
        .el-input-number__decrease,.el-input-number__increase{
          font-size: 20px;
          color: #9095A5;
          background: #242730;
          border-bottom:none;
          border-left:none;
          &:hover{
            color: #9095A5;
          }
        }
      }
    }
  }
}
</style>