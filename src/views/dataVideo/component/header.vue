<template>
  <div class="header">
    <div class="left">
      <img class="logo" src="@/assets/icons/logo.png" alt="">
      <span class="title">
        数据模板名称
      </span>
    </div>
    <div class="right">
      <div class="bgm">
        <div class="icon"></div>
        <span>背景音乐</span>
      </div>
      <div class="fly"></div>
      <div class="more"></div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.header{
  width: 100%;
  height: 60px;
  display: flex;
  justify-content: space-between;
  padding: 0 11px;
  box-sizing: border-box;
  background: #313642;
  .left{
    display: flex;
    align-items: center;
    .title{
      font-size: 22px;
      font-family: MicrosoftYaHei;
      line-height: 20px;
      color: #BFC5D3;
    }
    .logo{
      width: 128px;
      height: 46px;
      margin-right: 39px;
    }
  }
  .right{
    display: flex;
    align-items: center;
    .bgm{
      cursor: pointer;
      font-size: 12px;
      font-family: SimSun;
      line-height: 20px;
      color: #B0C5F7;
      width: 95px;
      height: 28px;
      border: 1px solid #50586B;
      border-radius: 14px;
      display: flex;
      justify-content: center;
      align-items: center;
      .icon{
        width: 18px;
        height: 18px;
        background-image: url(~@/assets/icons/bgm.png);
        vertical-align: middle;
        margin-right: 3px;
      }
      &:hover{
        border: 1px solid #FC4F08;
        color: #FC4F08;
        .icon{
          background-image: url(~@/assets/icons/bgm1.png);
        }
      }
    }
    .fly{
      cursor: pointer;
      margin-left: 56px;
      width: 32px;
      height: 32px;
      background-image: url(~@/assets/icons/fly.png);
      &:hover{
        background-image: url(~@/assets/icons/fly1.png);
      }
    }
    .more{
      cursor: pointer;
      margin-left: 32px;
      width: 32px;
      height: 32px;
      background-image: url(~@/assets/icons/more.png);
      &:hover{
        background-image: url(~@/assets/icons/more1.png);
      }
    }
  }
}
</style>