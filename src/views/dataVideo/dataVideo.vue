<template>
  <div class="data-video">
    <Header />
    <div class="content">
      <VideoBox ref="VideoBox" :dataOri="dataOri" :text="form" :colorObj="colorObj" :flagList="flagList"/>
      <div class="right" v-show="stepNum===1" >
        <Excel ref="Excel" :dataOri="dataOri" />
        <div class="btns">
          <div class="up-or-down">
            <div class="btn up" @click="downData">
              <div class="icon icons"></div>
              <span >实例数据</span>
            </div>
            <div class="btn down" @click="uploadData">
              <div class="icon icons"></div>
              <span>上传数据</span>
            </div>
          </div>
          <!-- <button @click="resetData">重置</button> -->
          <input v-if="stepNum===1" type="file" @change="afterRead" ref="updata"  style="display: none"/>
          <div class="next-or-preservation">
            <div class="btn next" @click="next">
              <span >下一步</span>
            </div>
            <div class="btn preservation" @click="save">
              <div class="icon icons1"></div>
              <span>保存</span>
            </div>
          </div>
        </div>
      </div>
      <div class="right" v-show="stepNum===2">
        <div class="edit-box">
          <div class="heard-tabs">
            <div class="tab" :class="{select:tab===1}" @click="handleTab(1)">文本</div>
            <div class="tab" :class="{select:tab===2}" @click="handleTab(2)">配色</div>
          </div>
          <div class="text-edit" v-if="tab===1">
            <el-form ref="form" :model="form" label-width="95px">
              <el-form-item label="主标题：">
                <el-input v-model="form.title1"></el-input>
              </el-form-item>
              <el-form-item label="副标题：">
                <el-input v-model="form.title2"></el-input>
              </el-form-item>
              <el-form-item label="文本1：">
                <el-input v-model="form.source"></el-input>
              </el-form-item>
              <el-form-item label="文本2：">
                <el-input  v-model="form.half"></el-input>
              </el-form-item>
              <el-form-item label="小数位数：">
                <el-input-number controls-position="right" :min="0" v-model="form.num" @change="changeNum"></el-input-number>
              </el-form-item>
            </el-form>
          </div>
          <div class="colourways" v-if="tab===2"> 
            <div class="theme">
              <span>主题颜色：</span>
              <div class="colorblock" :class="{Select:themeColor === k}" @click="selectColor(k)" v-for="(i, k) in colorList" :key="i">
                <div class="block" :style="{backgroundColor: i}"></div>
              </div>
            </div>
            <div class="bg-text-color">
              <div class="bgColor">
                <span>背景颜色：</span>
                <el-color-picker v-model="colorObj.bg" ></el-color-picker>
              </div>
              <div class="bgColor">
                <span>文本颜色：</span>
                <el-color-picker v-model="colorObj.text" @change="textColor" :predefine="predefineColors" popper-class="colorSelect"></el-color-picker>
              </div>
            </div>
            <div class="series"> 
              <span>系列颜色：</span>
              <el-color-picker v-for="i in 4" :key="i +'colorPicker'" v-model="colorObj['series' + i]" @change="textColor"></el-color-picker>
            </div>
            <div class="examplesImg">
              <span>样例图片：</span>
              <div class="img-box">
                <ul>
                  <li v-for="(i, key) in imgsList" :key="key">
                    <span>{{i.country}}</span>
                    <div v-if="i.src" class="img" @click="del(key)" :style="{backgroundImage:'url('+ i.src+')'}"></div>
                    <div v-else class="addImg" @click="uploadImage(key)">
                      <img src="@/assets/icons/add.png"  alt="">
                    </div>
                  </li>
                </ul>
                <input type="file" v-if="stepNum===2" @change="afterRead" ref="updata" accept="image/*"  style="display: none"/>
              </div>
            </div>
          </div>
        </div>
        <div class="btns btns2">
          <div class="reset" :class="{resetBtn:tab===1}" @click="resetData">
            <div class="btn">全部重置</div>
          </div>
          <div class="next-or-preservation">
            <div class="btn back" @click="back">
              <span >上一步</span>
            </div>
            <div class="btn preservation1" @click="onSubmit">
              <div class="icon icons1"></div>
              <span>保存</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import XLSX from 'xlsx'
import exporExcel from '@/utils/downExcel.js'
export default {
  data(){
    return {
      dataOri: [
        ['国家', '2001', '2002', '2003', '2004', '2005', '2006','2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017'],
        ['美国', '7291', '6931.03', '7247.71', '8148.75', '9010.82', '10259.67', '11481.99', '12874.42', '10560.43', '12784.95', '14825.08', '15457.03', '15795.93', '16205.319', '15025.7223', '14510.10702', '15467.24565'],
        ['德国', '5716.450763', '6158.307583', '7515.601651', '9098.868999', '9709.144953', '11081.06645', '13212.14031', '14461.71447', '11200.40632', '12589.23741', '14739.84989', '14011.12687', '14450.66962', '14946.07935', '13267.64731',	'13343.55553', '14483.02287'],
        ['日本', '4034.96', '4167.26', '4718.17', '5656.75', '5949.40866', '6467.25059', '7143.27036', '7814.12163', '5807.18734', '7697.73832', '8231.83759', '7985.67588', '7150.97244', '6902.02827', '6247.87119', '6448.99697', '6981.30533'],
        ['法国', '3233.790891', '3317.192199', '3920.392811', '4521.058498', '4634.279577', '4958.678397', '5596.120181', '6162.401232', '4847.81161', '5237.670394', '5964.727719', '5687.083688', '5809.628687', '5810.546803', '5063.418493', '5017.647435', '5351.862244'],
        ['英国', '2727.151879', '2801.951476', '3056.270513', '3474.934743', '3908.599876', '4509.070248', '4418.30822', '4721.676879', '3548.930226', '4159.58982', '5065.700121', '4727.918818', '5406.158548', '5052.047699', '4601.534753', '4095.78348', '4449.815999'],
        ['中国', '2660.98', '3255.96', '4382.28', '5933.26', '7619.53', '9689.78', '12204.56', '14306.93', '12016.12', '15777.54', '18983.81', '20487.14', '22090.05', '23422.93', '22734.68', '20976.32', '22633.29'], 
        ['加拿大', '2598.58', '2523.94', '2727.39', '3167.62', '3604.75248', '3881.77873',' 4206.93307', '4564.70923', '3233.791', '3881.779', '4159.591', '4473.009', '4978.901', '4564.709', '4206.933', '3701.253', '4069.094'],
        ['意大利', '2444.895008', '2544.265001', '2993.332142', '3537.817798', '3731.34722', '4168.753784', '4998.815412', '5427.480799', '4069.093522', '4473.009267', '5232.581339', '5013.058336', '5182.681817', '5298.993264', '4574.371974', '4618.748347', '5062.26026'],
        ['荷兰', '2308.548452',' 2440.584517', '2960.122876', '3574.171033', '4063.724488', '4636.294517', '5507.548918', '6379.179154', '4978.909749', '5742.511486', '6671.012708', '6553.737819', '6715.5589', '6726.714944', '5706.259465', '5714.359074', '6519.999157'],
        ['中国香港', '1910.66', '2040.57', '2444.89', '2727.39', '2960.12', '3233.79', '3573.81', '3604.75', '3537.81', '3908.07', '4473.01', '4929.07472', '5355.46', '5241.3', '5105.96', '5167.34', '5502.72'],
        ['比利时', '1766.380687', '2161.274394', '2556.1681', '3068.664479', '3344.001351', '3667.445996', '4309.5192', '4718.402527', '3701.249703', '4076.92343', '4756.717524', '4407.01', '5013.058', '4601.535', '4473.009', '3701.25', '4309.519'],
        ['韩国', '1654.89', '1910.66', '2040.57', '2444.89', '2727.39', '2960.12', '3731.347', '4168.754', '3635.3356', '4663.84', '5552.14', '5478.7', '5596.32', '5726.64', '5267.56', '4954.26', '5736.94']
      ],
      stepNum: 1,
      tab: 1,
      form: {
        title1: '主标题',
        title2: '副标题',
        source: '数据来源：某某网',
        half: '单位：分',
        num: 2
      },
      themeColor: 0,
      colorTheme: [{
        bg: '#FFFFFF',
        text: '#222222',
        series1: '#FF4900',
        series2: '#FFD159',
        series3: '#86C552',
        series4: '#2F97FF'
      }, {
        bg: '#1C5ACC',
        text: '#FFFFFF',
        series1: '#FFFFFF',
        series2: '#30E3C9',
        series3: '#A978FF',
        series4: '#29A8BB'
      }, {
        bg: '#001C37',
        text: '#FFFFFF',
        series1: '#2ECEC4',
        series2: '#2E98F0',
        series3: '#9A90FF',
        series4: '#214588' 
      }, {
        bg: '#562FA3',
        text: '#FFFFFF',
        series1: '#D57D7D',
        series2: '#F0C46C',
        series3: '#9EC5DC',
        series4: '#807DE7' 
      }, {
        bg: '#FF5610',
        text: '#FFFFFF',
        series1: '#FFFFFE',
        series2: '#FEF5A6',
        series3: '#EEB24E',
        series4: '#E99E48' 
      }, {
        bg: '#222222',
        text: '#FFFFFF',
        series1: '#B34AFC',
        series2: '#5793F3',
        series3: '#0E69FE',
        series4: '#5F6C77' 
      }],
      flagList: [],
      uploadKey: 0, //设置样例图片的索引值
      uploadFileType: 0, // 0为图片 1为excel
      predefineColors: [ // 默认选择的色块
        '#FF9E26',
        '#EEC9F9',
        '#FBDF73',
        '#FDC769',
        '#13ACF1',
        '#5465E6',
        '#FF5D65',
        '#86C552',
        '#FFFFFF',
        '#ECF0F1',
        '#CED4D9',
        '#7E8D8D',
        '#222222',
        '#E00011'
      ]
    }
  },
  components: {
    'Excel': ()=> import('@/components/excel'),
    'Header': ()=> import('./component/header'),
    'VideoBox': ()=> import('./component/videoBox')
  },
  computed: {
    colorList(){
      return this.colorTheme.map(i => i.bg)
    },
    colorObj(){
      return this.colorTheme[this.themeColor]
    },
    cloneDataOri(){ //受excel表格的影响 会产生很多null 过滤掉所有的null
      if(this.dataOri.length > 0){
        let ary = [] 
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
        return ary
      } else {
        return []
      }  
    },
    imgsList(){ //返回国家和国旗的数组
      return this.cloneDataOri.filter((i, k) => k > 0).map((i, k) => {
        return {
          country: i[0],
          src: this.flagList[k] ? this.flagList[k] : ''
        }
      })
    }
  },
  methods: {
    del(i){ //设置样例图片的删除效果
      this.$set(this.flagList, i, '')
    },
    afterRead() { //设置样例图片
      const file = this.$refs.updata.files[0]
      if(this.uploadFileType === 0){
        const reader = new FileReader()
        reader.readAsDataURL(file)
        const self = this
        reader.onload = function () {
          self.$set(self.flagList, self.uploadKey,  this.result)
        }
      } else {
        const types = file.name.split('.')[1]
        const fileType = ['xlsx', 'xlc', 'xlm', 'xls', 'xlt', 'xlw', 'csv'].some(item => item === types)
        if (!fileType) {
          alert('格式错误！请重新选择')
          return
        }
        this.readWorkbookFromLocalFile(file)
      }
      this.$refs.updata.value = ''
    },
    readWorkbookFromLocalFile(file) { // 导入excel表格
      let reader = new FileReader()
      const self = this
      reader.onload = function(e) {
        let data = e.target.result
        this.wb = XLSX.read(data, {
          type: 'binary'
        })
        const result = []
        this.wb.SheetNames.forEach((sheetName) => {
          result.push({
            sheet: XLSX.utils.sheet_to_csv(this.wb.Sheets[sheetName])
          })
        })
        const list = result[0].sheet.split(/[\s\n]/).map( i => {
          return i.split(',')
        })
        list.pop() //把数据变成数组格式
        console.log(list)
        self.dataOri = list
        self.$nextTick(()=>{
          self.$refs.Excel.loadData(list)
          self.$refs.VideoBox.resRender()
        })
      }
      reader.readAsBinaryString(file)
    },
    uploadImage(k){ //点击设置样例图片
      this.uploadFileType = 0
      this.uploadKey = k
      this.$refs.updata.click()
    },
    uploadData(){ //点开上传excel表格
      this.uploadFileType = 1
      this.$refs.updata.click()
    },
    selectColor(i){ //修改颜色时重新渲染
      this.themeColor = i
      this.$nextTick(()=>{
        this.$refs.VideoBox.resRender()
      })
    },
    textColor(){
      this.$nextTick(()=>{
        this.$refs.VideoBox.resRender()
      })
    },
    onSubmit() { //保存 输出数据 
      // console.log(this.form)
      // console.log(this.colorObj)
      // console.log(this.dataOri)
      // console.log(this.flagList)
    },
    handleTab(val){ //选中配色文本标签
      this.tab = val
    },
    changeNum(){
      this.$nextTick(()=>{
        this.$refs.VideoBox.resRender()
      })
    },
    save(){
      this.onSubmit()
      // console.log('保存')
    },
    next(){
      this.stepNum++ 
    },
    back(){
      this.stepNum-- 
    },
    downData(){ //导出excel表格
      exporExcel(this.dataOri, '数据视频模板表格.xlsx', 'sheet')
    },
    resetData(){
      // console.log('全部重置')
      this.flagList = []
      this.themeColor = 0
      this.dataOri = this.$options.data().dataOri //this.$options.data()获取初始数据
      this.colorTheme = this.$options.data().colorTheme
      this.$nextTick(() => {
        this.$refs.Excel.loadData(this.dataOri) //加载空数组来清空excel表格
        this.$refs.VideoBox.resRender() //清空svg标签
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.data-video{
  height: 100%;
  .content{
    height: calc(100% - 60px);
    min-height: 876px;
    display: flex;
    .right{
      flex: 1;
      // width: calc(100% - 1200px);
      height: 100%;
      box-sizing: border-box;
      border: 1px solid #17191E;
      background: #313642;
      .edit-box{
        height: 790px;
        width: 100%;
        .heard-tabs{
          height: 40px;
          text-align: center;
          line-height: 40px;
          border-bottom: 1px solid #1C1F25;
          box-sizing: border-box;
          font-size: 16px;
          display: flex;
          background: #2B2F39;
          color: #9BA3B6;
          .tab{
            cursor: pointer;
            width: 180px;
            height: 40px;
            box-sizing: border-box;
          }
          .select{
            border-right: 1px solid #1C1F25;
            border-bottom: 1px solid #313642;
            background: #313642;
            color: #FF5610;
            box-shadow: -1px -1px 0px #1C1F25;
          }
        }
        .text-edit{
          height: calc(100% - 40px);
          padding:24px 25px;
          /deep/ .el-form-item {
            margin-bottom: 24px;
            .el-form-item__label{
              font-size: 16px;
              color: #8C97B1;
            }
            .el-input{
              .el-input__inner{
                font-size: 16px;
                color: #9095A5;
                border: 1px solid #373C49;
                background: #242730;
              }
            }
            .el-input-number{
              width: 20%;
              padding: 0;
              text-align: center;
              .el-input{
                .el-input__inner{
                  padding-right: 40px;
                  text-align: center;
                }
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
        .colourways{
          height: calc(100% - 40px);
          padding:21px 25px 0 23px;
          color: #8C97B1;
          .theme{
            margin-bottom: 25px;
            display: flex;
            align-items: center;
            .colorblock{
              cursor: pointer;
              width: 46px;
              height: 46px;
              margin-right: 3px;
              border: 2px solid #313642;
              padding: 1px;
              box-sizing: border-box;
              opacity: 1;
              border-radius: 3px;
              .block{
                width: 40px;
                height: 40px;
                background: #FFFFFF;
                opacity: 1;
                border-radius: 3px;
              }
            }
            .Select{
              border-color: #FF5610;
            }
          }
          .bg-text-color{
            display: flex;
            justify-content: space-between;
            margin-bottom: 38px;
            padding-right: 64px;
            .bgColor{
              // &:nth-child(2){
              //   margin-left: 92px;
              // }
              display: flex;
              align-items: center;
              /deep/ .el-color-picker{
                background-color: #434A59;
                border-radius: 3px;
                border-color: #434A59;
                .el-color-picker__trigger{
                  width: 173px;
                  padding-right: 40px;
                  border: none;
                  .el-color-picker__color{
                    border: none;
                  }
                  .el-color-picker__color-inner{
                    border-radius: 3px;
                  }
                }
                .el-color-picker__icon{
                  color: #9BA3B6;
                  
                  font-size: 22px;
                  text-align: end;
                  padding-right: 17px;
                }
              }
            }
          }
          .series{
            display: flex;
            align-items: center;
            margin-bottom: 39px;
            /deep/ .el-color-picker{
              margin-right: 8px;
              background-color: #434A59;
              border-radius: 3px;
              border-color: #434A59;
              .el-color-picker__trigger{
                width: 124px;
                padding-right: 40px;
                border: none;
                .el-color-picker__color{
                  border: none;
                }
                .el-color-picker__color-inner{
                  border-radius: 3px;
                }
              }
              .el-color-picker__icon{
                color: #9BA3B6;
                font-size: 22px;
                text-align: end;
                padding-right: 17px;
              }
            }
          }
          .examplesImg{
            display: flex;
            .img-box{
              // width: 582px;
              flex: 1;
              height: 507px;
              background: #272B34;
              box-sizing: border-box;
              padding: 12px 24px;
              overflow: auto;
              &::-webkit-scrollbar{
                width: 16px;
                height: 238px;
                background: #383E4A;
                border-radius: 8px;
              }
              &::-webkit-scrollbar-track{
                width: 16px;
                background-color: #272B34;
              }
              &::-webkit-scrollbar-thumb{
                width: 16px;
                border-radius: 8px;
                background-color: #383E4A;
                box-shadow: inset 0 0 5px #383E4A;
              }
              // &::-webkit-scrollbar-button{
              //   color: #4E5564;
              // }
              &::-webkit-scrollbar-corner {
                display: none;
              }
              ul{
                margin: 0;
                padding: 0;
                list-style: none;
                li{
                  display: flex;
                  align-self: center;
                  margin-bottom: 15px;
                  font-size: 16px;
                  color: #9BA3B6;
                  span{
                    width: 96px;
                    height: 21px;
                    display: inline-block;
                    margin-right: 23px;
                  }
                  .img{
                    width: 49px;
                    height: 32px;
                    background-size: 49px 32px;
                    cursor: pointer;
                    &:hover{
                      &::before{
                        display: inline-block;
                        content: url(~@/assets/icons/delete.png);
                        width: 49px;
                        height: 32px;
                        text-align: center;
                        line-height: 40px;
                        background: rgba(0, 0, 0, 0.8);
                      }
                    }
                  }
                  .addImg{
                    cursor: pointer;
                    width: 49px;
                    height: 32px;
                    box-sizing: border-box;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(155, 163, 182, 0.2);
                    border: 1px dashed #9BA3B6;
                  }
                }
              }
            }
          }
        }
      }
    }
    .btns{
      width: 100%;
      height: calc(100% - 781px);
      padding: 0 16px 0 24px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .icons{
        margin-right: 12px;
        width: 18px;
        height: 18px;
      }
      .icons1{
        margin-right: 8px;
        width: 22px;
        height: 22px;
      }
      .btn{
        cursor: pointer;
        width: 124px;
        height: 40px;
        background: #434A59;
        border-radius: 20px;
        font-size: 16px;
        color: #DBE3F6;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .up-or-down{
        display: flex;
        .up{
          margin-right: 24px;
          .icon{
            background-image: url(~@/assets/icons/download.png);
          }
          &:hover{
            color: #FC4F08;
            .icon{
              background-image: url(~@/assets/icons/download1.png);
            }
          }
        }
        .down{
          .icon{
            background-image: url(~@/assets/icons/upload.png);
          }
          &:hover{
            color: #FC4F08;
            .icon{
              background-image: url(~@/assets/icons/upload1.png);
            }
          }
        }
      }
      .next-or-preservation{
        display: flex;
        .next{
          margin-right: 12px;
          background: #FC4F08;
        }
        .preservation{
          .icon{
            margin-right: 8px;
            background-image: url(~@/assets/icons/preservation.png);
          }
          &:hover{
            color: #FC4F08;
            .icon{
              background-image: url(~@/assets/icons/preservation1.png);
            }
          }
        }
      }
    }
    .btns2{
      height: calc(100% - 790px);
      .reset{
        .btn:hover{
          color: #FC4F08;
        }
      }
      .resetBtn{
        visibility: hidden;
      }
      .back{
        margin-right: 12px;
        &:hover{
          color: #FC4F08;
        }
      }
      .preservation1{
        background: #FC4F08;
        .icon{
          background-image: url(~@/assets/icons/preservation.png);
        }
      }
    }
  }
}
</style>
<style>
/* .colorSelect{
  border-color: #434A59;
  background: #434A59;
} */
</style>