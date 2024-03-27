// 数组 导出excel文档
// 参考文档 https://www.cnblogs.com/liuxianan/p/js-excel.html#%E5%AF%BC%E5%87%BAexcel

// import XLSX from 'xlsx'
import { write, utils } from 'xlsx'
function sheet2blob (sheet, sheetName) {
  sheetName = sheetName || 'sheet1'
  let workbook = {
    SheetNames: [sheetName],
    Sheets: {}
  };
  workbook.Sheets[sheetName] = sheet
  // 生成excel的配置项
  let wopts = {
    bookType: 'xlsx', // 要生成的文件类型
    bookSST: false, // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
    type: 'binary'
  };
  let wbout = write(workbook, wopts);
  let blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
  // 字符串转ArrayBuffer
  function s2ab (s) {
    let buf = new ArrayBuffer(s.length)
    let view = new Uint8Array(buf)
    for (let i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF
    return buf
  }
  return blob
}

export default function exporExcel (list, fileName, sheetName) {
  const sheet = utils.aoa_to_sheet(list)
  let url = sheet2blob(sheet, sheetName)
  if (typeof url == 'object' && url instanceof Blob) {
    url = URL.createObjectURL(url); // 创建blob地址
  }
  let aLink = document.createElement('a');
  aLink.href = url;
  aLink.download = fileName || ''; // HTML5新增的属性，指定保存文件名，可以不要后缀，注意，file:///模式下不会生效
  let event
  if (window.MouseEvent) event = new MouseEvent('click');
  else {
    event = document.createEvent('MouseEvents');
    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
  }
  aLink.dispatchEvent(event)
}
