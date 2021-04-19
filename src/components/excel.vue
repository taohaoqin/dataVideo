<template>
  <div class="excel">
    <hot-table 
      ref="hottable"
      :settings="hotSettings" 
      licenseKey="non-commercial-and-evaluation"
      style="height:auto;overflow:auto;"
      class="table_hot"
    />
  </div>
</template>
<script>
import {HotTable} from '@handsontable/vue';
// import Handsontable from 'handsontable';
export default {
  name: 'excel',
   props: {
    dataOri: {
      type: Array,
      default: ()=>[]
    }
  },
  // watch: {
  //   'hotSettings.data': {
  //     deep:true,
  //     handler(val){
  //       console.log(val)
  //       // this.$refs.hottable.hotInstance.getData()
  //     }
  //   }
  // },
  data() {
    const self = this
    return {
      hotSettings: {
        // data: Handsontable.helper.createSpreadsheetData(0, 0),
        data: this.dataOri.length === 0 ? [[]]: this.dataOri,
        minRows: 18,
        minCols: 13,
        colHeaders: true,
        rowHeaders: true,
        rowHeights:39,
        autoRowSize: true,
        autoColumnSize:true,
        columnSorting:true,
        trimWhitespace: true,  //过滤掉空格
        contextMenu: {
          items: {
            'row_above': {
              name: '在此行上方插入行'
            },
            'row_below': {
              name: '在此行下方插入行'
            },
            "col_left": {
              name: '左方插入列',
            },
            "col_right": {
              name: '右方插入列',
            },
            // 'separator': Handsontable.plugins.ContextMenu.SEPARATOR,
            // 'copy': {
            //   name: '复制'
            // },
            // 'undo': {
            //   name: '撤消'
            // },
            // 'separator1': Handsontable.plugins.ContextMenu.SEPARATOR,
            'remove_row': {
              name: '删除行',
              callback: (row, sources) => {
                if(this.dataOri.length !== 0){
                  this.dataOri.splice(sources[0].start.row, 1) //手动删除行 
                  this.loadData(this.dataOri)
                } else {
                  this.hotSettings.data.splice(sources[0].start.row, 1) //没导入数据的时候 避免删除行报错
                }
              }
            },
            'remove_col': {
              name: '删除列',
            },
            // 'clear_custom': {
            //   name: '删除所有单元格',
            //   callback: function () {
            //     this.clear()
            //   }
            // }
          }
        },
        afterChange: function () {
          // console.log(changes, sources)  // changes为数组数据改变后的坐标（row,col），sources改变的类型
          self.dataOri.splice() //数据发生改变的时候 用splicec()触发响应式监听
          self.$parent.$refs.VideoBox.resRender()
        },
      }
    }
  },
  components: {
    HotTable
  },
  methods: {
    loadData(list){ //导入数据
      this.$refs.hottable.hotInstance.loadData(list)
    }
  },
  // mounted(){
  //   console.log(this.$refs.hottable.hotInstance)
  // }
}
</script>
<style lang="scss" scoped>
::-webkit-scrollbar{
  display: none;
  background: #272B34;
}
.excel{
  height: 100%;
  max-height: 781px;
  box-sizing: border-box;
  overflow:auto;
  ::-webkit-scrollbar{
    background: #272B34;
  }
  ::-webkit-scrollbar-track{
    height: 24px;
    background-color: #272B34;
  }
  ::-webkit-scrollbar-thumb{
    height: 16px!important;
    border-radius: 8px;
    background-color: #383E4A;
    box-shadow: inset 0 0 5px #383E4A;
  }
  ::-webkit-scrollbar-corner {
    display: none;
  }
  .table_hot{
    ::-webkit-scrollbar-track{
      height: 24px;
      background-color: #272B34;
    }
    ::-webkit-scrollbar-thumb{
      height: 16px!important;
      border-radius: 8px;
      background-color: #383E4A;
      box-shadow: inset 0 0 5px #383E4A;
    }
    ::-webkit-scrollbar-corner {
      display: none;
    }
    /deep/ th{
      height: 39px;
      border: 1px solid #2B2E36;
      border-right-width: 0;
      border-bottom-width: 0;
      vertical-align: middle;
      background: #313642;
      color: #8C97B1;
    }
    /deep/ td{
      border: 1px solid #2B2E36;
      border-right-width: 0;
      border-bottom-width: 0;
      vertical-align: middle;
    }
  }
  /deep/ .htRowHeaders thead tr{
    th:nth-child(2){
      border-left: 1px solid #2B2E36;
    }
  }
  /deep/ .handsontableInput{
    background-color: #3A3F4C;
    box-shadow: 0 0 0 2px rgba(255, 86, 16, 0.2) inset;
    color: #8C97B1;
  }
  /deep/ .wtBorder {
    background-color: #FF5610!important;
    &:nth-child(2){
      width: 2px!important;
    }
  }
  /deep/ .corner{
    display: none!important;
  }
  /deep/ .highlight{
    background: #3A3F4C;
    position: relative;
    &::after{
      display: inline-block;
      content: '';
      width: 100%;
      height: 100%;
      background-color: rgba(255, 86, 16, 0.2);
      // opacity: 0.7;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 0;
    }
  }
}
/deep/ .handsontable td{
  background-color: #3A3F4C;
  color: #8C97B1;
}
</style>
