/**
 * 제 품: IBSheet8 - Dialog Plugin
 * 버 전: v1.0.11 (20231221-17)
 * 회 사: (주)아이비리더스
 * 주 소: https://www.ibsheet.com
 * 전 화: 1644-5615
 */
(function(window, document) {
/*
 * ibsheet 내에 다이얼로그 (피봇,찾기,상세보기 등)
 * 해당 파일은 반드시 ibsheet.js 파일보다 뒤에 include 되어야 합니다.
 */
var _IBSheet = window['IBSheet'];
if (_IBSheet == null) {
  throw new Error('[ibsheet-dialog] undefined global object: IBSheet');
}

// IBSheet Plugins Object
var Fn = _IBSheet['Plugins'];

if (!Fn.PluginVers) Fn.PluginVers = {};
Fn.PluginVers.ibdialog = {
  name: 'ibdialog',
  version: '1.0.11-20231221-17'
};

/* 드래그 관리 객체 */
function DragObject() {
  this.dx = null;
  this.dy = null;
  this.dialogLeft = null;
  this.dialogTop = null;
  this.tag = null;
  this.orgTag = null;
}

var DOP = DragObject.prototype;

var drag = new DragObject();

/* 드래그 태그를 지움 */
DOP.ClearDragObj = function (org) {
  if (this.tag) {
    this.dx = null;
    this.dy = null;
    if (this.tag.parentNode) {
      this.tag.parentNode.removeChild(this.tag);
      this.tag = null;
    }

    if (org && this.orgTag && this.orgTag.parentNode && this.orgTag.parentNode) {
      var parent = this.orgTag.parentNode;
      parent.removeChild(this.orgTag);
      if (parent.childNodes.length == 0) {
        parent.innerHTML = "<i class='CellsInfo' style='color:gray;font-size:12px;'>이곳으로 대상 컬럼을 끌어놓으십시오.</i>";
      }
      this.orgTag = null;
    }
  }
};

/* 드래그 태그를 생성 */
DOP.MakeDragObj = function (object, ev) {
  this.ClearDragObj();

  this.dx = object.offsetWidth / 2;
  this.dy = parseInt(getComputedStyle(object.firstChild).marginBottom) / 2;

  var div = document.createElement('div');

  div.id = "myDragObj";
  div.appendChild(object.cloneNode(true));
  div.style.position = "absolute";
  div.style.left = (ev.clientX - this.dialogLeft - this.dx) + "px";
  div.style.top = (ev.clientY - this.dialogTop + this.dy) + "px";

  this.tag = div;
  this.orgTag = object;
  document.getElementById('DragTags').appendChild(div);
};

/* 드래그시 태그를 같이 움직임 */
DOP.MoveDragObj = function (ev) {
  if (this.tag) {
    this.tag.style.left = (ev.clientX - this.dialogLeft - this.dx) + "px";
    this.tag.style.top = (ev.clientY - this.dialogTop + this.dy) + "px";
  }
};

/* 컬럼 정보 설정 시트에 보여질 데이터 */
Fn.makeConfigSheetData = function (headerIndex) {
  var DATA = [],
    headerRows = [],
    cols = this.getCols(),
    title = [];

  if (headerIndex != null && typeof headerIndex === 'number' && headerIndex >= 0) {
    headerRows.push(this.getHeaderRows()[headerIndex]);
  } else {
    headerRows = this.getHeaderRows();
  }

  for (var c = 0; c < cols.length; c++) {
    if (this.getAttribute({ col: cols[c], attr: "Visible" }) || this.Cols[cols[c]].UserHidden) {
      title.length = 0;
      for (var r = 0; r < headerRows.length; r++) {
        title.push(this.getValue(headerRows[r], cols[c]));
      }
      DATA.push({
        "HTitle": title.join("/"),
        "Show": !(this.Cols[cols[c]].UserHidden),
        ColName: cols[c]
      });
    }
  }
  return DATA;
};

/* 컬럼 정보 설정 다이얼로그 */
Fn.showConfigDialog = function (width, height, headerIndex, name) {
  /* step 1 start
   * 현재 시트가 사용 불가능이거나 편집종료되지 못하는 경우 띄우지 않는다.
   */
  if (this.endEdit(true) == -1) return;
  /* step 1 end */

  // 스타일이 중복 되었을때 스타일을 제거한다.
  if (this._stylesConfigDialog && this._stylesConfigDialog.parentNode) {
    this._stylesConfigDialog.parentNode.removeChild(this._stylesConfigDialog);
    delete this._stylesConfigDialog;
  }

  var classDlg = "ConfigPopup";
  var themePrefix = this.Style;

  if (typeof width == "object") {
    var configTemp = width;
    if (configTemp.width != null) width = configTemp.width;
    if (configTemp.height != null) height = configTemp.height;
    if (configTemp.headerIndex != null) headerIndex = configTemp.headerIndex;
    if (configTemp.name != null) name = configTemp.name;
  }

  width = width && typeof width === "number" ? width : 500;
  height = height && typeof height === "number" ? height : 500;
  name = name && typeof name === "string" ? name : ("configSheet_" + this.id);

  var styles = document.createElement("style");
  styles.innerHTML = '.' + themePrefix + classDlg + 'Outer {' +
    '  padding: 10px 50px ;' +
    '  border: 3px solid #37acff;' +
    '} ' +
    '.' + themePrefix + classDlg + 'Close {' +
    '  background-color: #000;' +
    '  width: 17px;' +
    '  height: 17px;' +
    '} ' +
    '.' + themePrefix + classDlg + 'Head, .' + themePrefix + classDlg + 'Foot {' +
    '  background-color:white;' +
    '  border-top:0px' +
    '} ' +
    '.' + themePrefix + classDlg + 'Head .' + themePrefix + classDlg + 'HeadText >div:last-child {' +
    '  text-align: center;' +
    '  color: #000;' +
    '  font-size: 25px;' +
    '  margin-bottom: 5px;' +
    '  font-weight: 600;' +
    '  height:35px;' +
    '  line-height: normal;' +
    '} ' +
    '.' + themePrefix + classDlg + 'Btns {' +
    '  text-align:center;' +
    '} ' +
    '.' + themePrefix + classDlg + 'Btns > button {' +
    '  color: #fff;' +
    '  font-family: "NotoSans_Medium";' +
    '  font-size: 18px;' +
    '  display: inline-block;' +
    '  text-align: center;' +
    '  vertical-align: middle;' +
    '  border-radius: 3px;' +
    '  background-color: #37acff;' +
    '  border: 1px solid #37acff;' +
    '  padding: 5px 10px;' +
    '  margin-left: 5px;' +
    '  cursor: pointer;' +
    '}';

  document.body.appendChild(styles);

  this._stylesConfigDialog = styles;

  /* step 2 start
   * 임시로 컬럼 보임 여부가 보여질 시트div 생성(생성된 다이얼로그로 아래에서 옮김).
   */
  var tmpSheetTag = document.createElement("div");
  tmpSheetTag.className = "SheetTmpTag";
  tmpSheetTag.style.width = "300px";
  tmpSheetTag.style.height = "300px";
  document.body.appendChild(tmpSheetTag);
  /* step 2 end */

  /* step 3 start
   * 띄워져있는 다이얼로그나 팁을 제거.
   */
  this.closeDialog();
  this.hideTip();
  /* step 3 end */

  /* step 4 start
   * 컬럼정보설정 시트에 대한 옵션 설정(컬럼정보설정 시트를 띄운 시트의 옵션을 따라간다.) 및 컬럼정보설정 시트 생성
   */
  var data = this.makeConfigSheetData(headerIndex);
  var ConfigSheet = _IBSheet.create(name, tmpSheetTag, {
    Cfg: { InfoRowConfig: { Visible: 0 }, CanSort: 0, HeaderCheck: 1, CanDrag: 1 },
    Def: { Row: { CanDrag: 1 } },
    Cols: [
      { Header: "헤더타이틀", Type: "Text", Name: "HTitle", RelWidth: 3, Hint: 1, CanEdit: 0, CanSelect: 0, CanFocus: 0, NoColor: 1 },
      { Header: "보임", Type: "Bool", Name: "Show", RelWidth: 1, MinWidth: 90, NoColor: 1 },
      { Header: "컬럼명", Type: "Text", Name: "ColName", Visible: 0 },
    ]
  }, data);
  /* step 4 end */

  /* step 5 start
   * 컬럼정보 시트가 띄워질 다이얼로그 창에 대한 설정 및 다이얼로그 생성
   */
  var dialogOpt = {},
    pos = {};
  this.initPopupDialog(dialogOpt, pos, ConfigSheet, {
    cssClass: classDlg
  });

  dialogOpt.Head = "<div>컬럼 정보 저장</div>";
  dialogOpt.Foot = "<div class='" + themePrefix + classDlg + "Btns'>" +
    "  <button id='" + name + "_OkConfigDialog'>확인</button>" +
    "  <button id='" + name + "_CancelConfigDialog'>취소</button>" +
    "</div>";
  dialogOpt.Body = "<div id='" + name + "_ConfigDialogBody' style='width:" + width + "px;height:" + height + "px;overflow:hidden;'></div>"
  dialogOpt = _IBSheet.showDialog(dialogOpt, pos, this);
  /* step 5 end */

  /* step 6 start
   * 다이얼로그 창의 Body에 컬럼정보설정 시트를 옮김 */
  var ConfigDlgBody = document.getElementById(name + "_ConfigDialogBody");
  ConfigDlgBody.innerHTML = "";
  for (var elem = tmpSheetTag.firstChild; elem; elem = tmpSheetTag.firstChild) ConfigDlgBody.appendChild(elem);
  ConfigSheet.MainTag = ConfigDlgBody;
  tmpSheetTag.parentNode.removeChild(tmpSheetTag);
  /* step 6 end */

  /* step 7 start
   * 버튼 클릭시 및 다이얼로그의 시트가 아닌 부분을 클릭했을 때
   */
  var btnOk = document.getElementById(name + "_OkConfigDialog");
  var btnCancel = document.getElementById(name + "_CancelConfigDialog");
  var myArea = ConfigSheet.getElementsByClassName(dialogOpt.Tag, themePrefix + classDlg + "HeadText")[0];
  var self = this;
  myArea.onclick = function () {
    if (self.ARow == null) {
      ConfigSheet.blur();
    }
  }

  var myArea2 = ConfigSheet.getElementsByClassName(dialogOpt.Tag, themePrefix + classDlg + "Foot")[0]
  myArea2.onclick = function () {
    if (self.ARow == null) {
      ConfigSheet.blur();
    }
  }
  btnOk.onclick = function () {
    var rows = ConfigSheet.getDataRows();
    for (var r = 0; r < rows.length; r++) {
      self.setAttribute({ col: rows[r]["ColName"], attr: "Visible", val: rows[r]["Show"], render: 0 });
      self.setAttribute({ col: rows[r]["ColName"], attr: "Hidden", val: !(rows[r]["Show"]), render: 0 });
      if (rows[r]["Show"]) {
        delete self.Cols[rows[r]["ColName"]]["UserHidden"];
      } else {
        self.Cols[rows[r]["ColName"]]["UserHidden"] = true;
      }
    }
    self.saveCurrentInfo(); //현재상태 저장
    self.rerender(); //화면 렌더링

    ConfigSheet.dispose();
    self.closeDialog();
    // 버튼을 닫을때 스타일을 제거한다.
    if (styles && styles.parentNode) {
      styles.parentNode.removeChild(styles);
      delete self._stylesConfigDialog;
    }
  }
  btnCancel.onclick = function () {
    ConfigSheet.dispose();
    self.closeDialog();
    // 버튼을 닫을때 스타일을 제거한다.
    if (styles && styles.parentNode) {
      styles.parentNode.removeChild(styles);
      delete self._stylesConfigDialog;
    }
  }
  /* step 7 end */
};

/* 행 정보를 EditDialog 데이터 형태로 만드는 function */
Fn.getRowEditData = function (row, headerIndex, excludeHideCol, nav) {
  if (!row) return false;

  // base sheet의 cols 정보
  var cols = [];
  if (Array.prototype.filter) {
    cols = this.getCols().filter(function (col) {
      return col != "SEQ";
    });
  } else {
    cols = [];
    var arr = this.getCols();
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] !== "SEQ") cols.push(arr[i]);
    }
  }

  // 헤더 cell 정보
  var header = [];
  if (headerIndex != null && typeof headerIndex === 'number' && headerIndex >= 0) {
    header = this.getHeaderRows();
    if (header.length < headerIndex) headerIndex = header.length - 1;
  } else {
    var headerRows = this.getHeaderRows();
    for (var j = 0; j < cols.length; j++) {
      var headerString = "";
      for (var i = 0; i < headerRows.length; i++) {
        if (headerRows[i][cols[j]] != null && headerRows[i][cols[j]] !== "" && headerRows[i][cols[j] + "RowSpan"] !== 0) {
          headerString += headerRows[i][cols[j]] + "/";
        }
      }
      if (headerString.substr(headerString.length - 1, headerString.length) === "/") {
        headerString = headerString.substr(0, headerString.length - 1);
      }
      header.push(headerString);
    }
  }

  var rowData = [],
    fileValues = [],
    fileValue = null;

  // 행 nav 정보
  if (nav) {
    // 출력 결과 [ n / total ]
    var obj = {};
    var visibleRows = this.getRowsByStatus('Visible');

    obj["Spanned"] = 2;
    obj["ExplainSpan"] = 2;
    obj["Explain"] = "[ " + (visibleRows.indexOf(row) + 1) + " / " + visibleRows.length + " ]";
    obj["ExplainAlign"] = "Center";
    obj["ExplainCanEdit"] = 0;
    obj["ExplainCanFocus"] = 0;
    rowData.push(obj);
  }

  // 편집 다이얼로그의 셀에 설정될 옵션들(기존 컬럼에서 가지고옴)
  var checkPoint = [
    "CanEdit",
    "Enum",
    "EnumKeys",
    "Type",
    "EditFormat",
    "DateFormat",
    "DataFormat",
    "Format",
    "CustomFormat",
    "Align",
    "Alias",
    "Link",
    "Path"
  ];

  // 행 데이터 정보
  // "Explain" Col: 헤더 값
  // "Target" Col: 행 데이터 값
  for (var i = 0; i < cols.length; i++) {
    var obj = {};
    fileValue = null;
    obj["Explain"] = headerIndex != null ? header[headerIndex][cols[i]] : header[i];

    for (var key = 0; key < checkPoint.length; key++) {
      var getAttr = this.getAttribute(row, cols[i], checkPoint[key]);
      if (getAttr != null) {
        obj["Target" + checkPoint[key]] = getAttr;
      }
    }

    if (excludeHideCol) obj["Visible"] = this.getAttribute(null, cols[i], "Visible");

    // Formula가 설정된 컬럼은 제외
    if (this.getAttribute(row, cols[i], "Formula")) {
      // continue;
      obj["TargetCanEdit"] = 0;
    }

    if (this.getType(row, cols[i]) == "Lines") {
      obj["Target" + "AcceptEnters"] = 2;
      if (this.getRowHeight(row) == this.RowHeight) obj["Height"] = this.RowHeight * 2;
    }
    // 관계형 Enum 대응
    if (this.getType(row, cols[i]) == "Enum") {
      if (this.getAttribute(row, cols[i], "Related")) {
        var v = row[cols[i]];
        var keyArr = Object.keys(this.Cols[cols[i]]);
        for (var x = 0; x < keyArr.length; x++) {
          if (keyArr[x] != "EnumKeys" && keyArr[x].indexOf("EnumKeys") > -1) {
            var emkey = this.Cols[cols[i]][keyArr[x]];
            var emkeyArr = emkey.split(emkey.substring(0, 1));
            if (emkeyArr.indexOf(v) > -1) {
              obj["TargetEnum"] = this.Cols[cols[i]]["Enum" + keyArr[x].substring(8)];
              obj["TargetEnumKeys"] = emkey;
              obj["TargetCanEdit"] = 0;
            }
          }
        }
      }
    }
    // file 타입 컬럼
    if (this.getType(row, cols[i]) == "File") {
      if (row[cols[i]] && typeof row[cols[i]] != 'string') {
        var f = row[cols[i]].files;
        for (var j = 0; j < f.length; j++) {
          fileValues.push(f[j].name);
        }
      }
      fileValue = fileValues.join(',');
      obj["TargetCanEdit"] = 0;
    }

    obj["ColName"] = cols[i];
    obj["Target"] = fileValue || row[cols[i]];
    rowData.push(obj);
  }

  return rowData;
};

/* 편집 다이얼로그 내에서 띄워질 html 생성 */
Fn.makeEditHtml = function (row, headerIndex, excludeHideCol) {
  var self = this;
    html = [],
    s = "";

  if (this["Accessibility"] == 2) excludeHideCol = true;
  // base sheet의 cols 정보
  var cols = [];
  if (Array.prototype.filter) {
    cols = this.getCols().filter(function (col) {
      return col != "SEQ";
    });
  } else {
    cols = [];
    var arr = this.getCols();
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] !== "SEQ") cols.push(arr[i]);
    }
  }

  // 헤더 cell 정보
  var header = [];
  if (headerIndex != null && typeof headerIndex === 'number' && headerIndex >= 0) {
    header = this.getHeaderRows();
    if (header.length < headerIndex) headerIndex = header.length - 1;
  } else {
    var headerRows = this.getHeaderRows();
    for (var j = 0; j < cols.length; j++) {
      var headerString = "";
      for (var i = 0; i < headerRows.length; i++) {
        if (headerRows[i][cols[j]] != null && headerRows[i][cols[j]] !== "" && headerRows[i][cols[j] + "RowSpan"] !== 0) {
          headerString += headerRows[i][cols[j]] + "/";
        }
      }
      if (headerString.substr(headerString.length - 1, headerString.length) === "/") {
        headerString = headerString.substr(0, headerString.length - 1);
      }
      header.push(headerString);
    }
  }

  html[html.length] = "<div style='width:80%;border-top:2px solid #000000;word-wrap:break-word;'><ul>"

  for (var i = 0; i < cols.length; i++) {
    if (excludeHideCol && !this.getAttribute(null, cols[i], "Visible")) continue;
    // 컬럼명
    s = "<li style='margin:10px 0'><label style='display:inline-block;width:200px' for='htmlEdit_" + cols[i] + "'>"+ (headerIndex != null ? header[headerIndex][cols[i]] : header[i]) + "</label>";
    var val = row[cols[i]] ? row[cols[i]] : "";
    // value 값
    type = this.getCanEdit(row, cols[i]) ? this.getType(row, cols[i]) : "None";
    s += "<div style='display:inline-block;width:calc(100% - 220px);vertical-align:top'>";
    switch(this.getType(row, cols[i])) {
      case "Lines":
        s += "<textarea style='width:100%;height:80px' id='htmlEdit_" + cols[i] + "' title='"+this.Cols[cols[i]].Header+"' />" + val + "</textarea>";
        break;
      case "Pass":
      case "Text":
      case "Int":
      case "Float":
        s += "<input style='width:100%;height:30px' type='text' value='" + val + "' id='htmlEdit_" + cols[i] + "' title='"+this.Cols[cols[i]].Header+"' />";
        break;
      case "Date":
        s += "<input style='width:100%;height:30px' type='text' value='" + this.getString(row, cols[i]) + "' id='htmlEdit_" + cols[i] + "' title='"+this.Cols[cols[i]].Header+"' />";
        break;
      case "Button":
        s += this.getValue(row, cols[i]);
        break;
      case "Enum":
        s += getEnumString(row, cols[i]);
        break;
      case "Bool":
        s += "<input type='radio' " + (val ? "checked" : "") + " id='htmlEdit_" + cols[i] + "' title='"+this.Cols[cols[i]].Header+"' />";
        break;
      case "Radio":
        s += getRadioString(row, cols[i]);
        break;
      case "Img":
        var imgconf = this.getValue(row, cols[i]).split(`|`);
        s += "<img src='"+imgconf[1]+"' width='"+imgconf[2]+"' height='"+imgconf[3]+"' alt='"+imgconf[9]+"'>";
      default:
        s += this.getString(row, cols[i]);
        break;
    }
    s += "</div></li>"
    html[html.length] = s;
  }
  html[html.length] = "</ul></div>"

  return html.join("");

  function getEnumString(row, col) {
    var enumVal = self.getAttribute(row, col, 'Enum'),
      enumKeysVal = self.getAttribute(row, col, 'EnumKeys'),
      cellValue = self.getValue(row, col),
      result = "<select id='htmlEdit_" + col + "'/>";

    enumVal = enumVal.slice(1).split(enumVal.charAt(0));
    enumKeysVal = enumKeysVal.slice(1).split(enumKeysVal.charAt(0));

    for (var idx = 0; idx < enumVal.length; idx++) {
      tmp = enumKeysVal[idx] != null ? enumKeysVal[idx] : enumVal[idx];
      result += "<option value='" + tmp + "' " + (cellValue == tmp ? "selected" : "") + ">" + enumVal[idx] + "</option>"
    }

    return result + "</select>";
  }

  function getRadioString(row, col) {
    var enumVal = self.getAttribute(row, col, 'Enum'),
      enumKeysVal = self.getAttribute(row, col, 'EnumKeys'),
      tmp, isChecked,
      result = "";

    enumVal = enumVal.slice(1).split(enumVal.charAt(0));
    enumKeysVal = enumKeysVal.slice(1).split(enumKeysVal.charAt(0));

    if (enumVal.length) {
      for (var idx = 0; idx < enumVal.length; idx++) {
        tmp = enumKeysVal[idx] != null ? enumKeysVal[idx] : enumVal[idx];
        isChecked = self.getValue(row, col) == tmp;
        result += "<input type='radio' name='htmlEdit_" + col + "' value='" + tmp +"'" + (isChecked ? "checked" : "") + "><label for='" + tmp + "'>" + enumVal[idx] + "</label>"
      }
    } else {
      return "<input type='radio' " + (row[col] ? "checked" : "") + "/>";
    }

    return result;
  }
};

/* makeEditSheetOpt로 편집 다이얼로그 내에서 띄워질 시트에 대한 기본 옵션을 설정 */
Fn.makeEditSheetOpt = function (row, headerIndex, excludeHideCol, nav) {
  // 편집 다이얼로그 옵션
  var option = new Object();

  option.Cfg = {
    "CustomScroll": this.CustomScroll,
    "TouchScroll": 4,
    "UsePivot": false,
    "DialogSheet": true,
    "InfoRowConfig": {
      "Visible": false
    },
    "Export": {
      "FilePath": this.Export.FilePath
    }
  };

  option.Cols = [{
    "Type": "Text",
    "Name": "Explain",
    "Color": "#EEEEEE",
    "Align": "Center",
    "CanFocus": 0,
    "RelWidth": 1,
    "CanSort": 0,
    "TextStyle": 1
  }, {
    "Type": "Text",
    "Name": "Target",
    "EditFormat": "",
    "RelWidth": 1,
    "CanSort": 0
  }];

  option.Header = {
    "Visible": false
  };

  option.Body = [];
  option.Body.push(this.getRowEditData(row, headerIndex, excludeHideCol, nav) || []);

  return option;
};

/**
 * 편집(상세보기) 다이얼로그
 * showEditDialog 호출 시 편집 다이얼로그를 생성 후 화면에 띄운다.
*/
Fn.showEditDialog = function (row, width, height, headerIndex, name, excludeHideCol, nav) {
  if (!row) return false;

  /* step 1 start
   * 현재 시트가 사용 불가능이거나 편집종료되지 못하는 경우 띄우지 않는다.
   */
  if (this.endEdit(true) == -1) return;
  /* step 1 end */

  // 스타일이 중복 되었을때 스타일을 제거한다.
  if (this._stylesEditDialog && this._stylesEditDialog.parentNode) {
    this._stylesEditDialog.parentNode.removeChild(this._stylesEditDialog);
    delete this._stylesEditDialog;
  }

  var classDlg = "EditPopup";
  var themePrefix = this.Style;

  if (typeof row == "object") {
    var editTemp = row;
    if (editTemp.row != null) row = editTemp.row;
    if (editTemp.width != null) width = editTemp.width;
    if (editTemp.height != null) height = editTemp.height;
    if (editTemp.headerIndex != null) headerIndex = editTemp.headerIndex;
    if (editTemp.name != null) name = editTemp.name;
    if (editTemp.excludeHideCol != null) excludeHideCol = editTemp.excludeHideCol;
    if (editTemp.nav != null) nav = editTemp.nav;
  }

  if (!row) return false; // row가 없는 경우 return
  if (row && row.Kind != 'Data') return false; // row가 데이터 행이 아닌 경우 return

  width = typeof width == "number" ? width : 500;
  height = typeof height == "number" ? height : 500;
  name = typeof name == "string" ? name : ("editSheet_" + this.id);

  var styles = document.createElement("style");
  styles.innerHTML = '.' + themePrefix + classDlg + 'Outer {' +
    '  padding: 10px '+ (nav ? '20' : '50') + 'px ;' +
    '  border: 3px solid #37acff;' +
    '} ' +
    '.' + themePrefix + classDlg + 'Close {' +
    '  background-color: #000;' +
    '  width: 17px;' +
    '  height: 17px;' +
    '} ' +
    '.' + themePrefix + classDlg + 'Head, .' + themePrefix + classDlg + 'Foot {' +
    '  background-color:white;' +
    '  border-top:0px' +
    '} ' +
    '.' + themePrefix + classDlg + 'Head .' + themePrefix + classDlg + 'HeadText >div:last-child {' +
    '  text-align: center;' +
    '  color: #000;' +
    '  font-size: 25px;' +
    '  margin-bottom: 5px;' +
    '  font-weight: 600;' +
    '  height:35px;' +
    '  line-height: normal;' +
    '} ' +
    '.' + themePrefix + classDlg + 'Btns {' +
    '  text-align:center;' +
    '} ' +
    '.' + themePrefix + classDlg + 'Btns > button {' +
    '  color: #fff;' +
    '  font-family: "NotoSans_Medium";' +
    '  font-size: 18px;' +
    '  display: inline-block;' +
    '  text-align: center;' +
    '  vertical-align: middle;' +
    '  border-radius: 3px;' +
    '  background-color: #37acff;' +
    '  border: 1px solid #37acff;' +
    '  padding: 5px 10px;' +
    '  margin-left: 5px;' +
    '  cursor: pointer;' +
    '}' +
    '.' + themePrefix + classDlg + 'NavBtns {' +
    '  display: flex;' +
    '  flex-basis: 60px;' +
    '  height: 100%;' +
    '  align-items: center;' +
    '  justify-content: center;' +
    '  position: relative;' +
    '  margin: 5px;' +
    '}' +
    '.' + themePrefix + classDlg + 'NavBtns > span {' +
    '  user-select: none;' +
    '  font-size: 2.5em;' +
    '  color: cornflowerblue;' +
    '  cursor: pointer;' +
    '}' +
    '.' + themePrefix + classDlg + 'NavBtnsDisable > span {' +
    '  opacity: 0.3;' +
    '  cursor: default;' +
    '}' +
    '.' + themePrefix + classDlg + 'NavBtns > span:active {' +
    '  opacity: 0.3;' +
    '}' +
    '.' + themePrefix + classDlg + 'NavBody {' +
    '  opacity: 0.7;' +
    '  background-size: contain;' +
    '  overflow: hidden;' +
    '  position: absolute;' +
    '}' +
    '.' + themePrefix + classDlg + 'NavMovedBody {' +
    '  opacity: 0.3;' +
    '  display: flex;' +
    '  flex-basis: 60px;' +
    '  height: 100%;' +
    '  align-items: center;' +
    '  justify-content: center;' +
    '  position: absolute;' +
    '}' +
    '.' + themePrefix + classDlg + 'NavMovedBody > span {' +
    '  user-select: none;' +
    '  font-size: 2.5em;' +
    '  color: black;' +
    '}'
    ;

  document.body.appendChild(styles);
  this._stylesEditDialog = styles;

  /* step 2 start
   * 임시로 상세보기 시트가 들어갈 div 생성(생성된 다이얼로그로 아래에서 옮김).
   */
  var tmpSheetTag = document.createElement("div");
  tmpSheetTag.className = "SheetTmpTag";
  tmpSheetTag.style.width = "300px";
  tmpSheetTag.style.height = "100px";
  document.body.appendChild(tmpSheetTag);

  // edit-dialog nav sheet
  if (nav) {
    var tmpNavSheetTag = document.createElement("div");
    tmpNavSheetTag.className = "SheetTmpTag";
    tmpNavSheetTag.style.width = "300px";
    tmpNavSheetTag.style.height = "100px";
    document.body.appendChild(tmpNavSheetTag);
  }
  /* step 2 end */

  /* step 3 start
   * 띄워져있는 다이얼로그나 팁을 제거.
   */
  this.closeDialog();
  this.hideTip();
  /* step 3 end */

  /* step 4 start
   * 상세보기 시트에 대한 옵션 설정(상세보기 시트를 띄운 시트의 옵션을 따라간다.) 및 상세보기 시트 생성
   */
  var opts = this.makeEditSheetOpt(row, headerIndex, excludeHideCol, nav);
  var EditSheet = _IBSheet.create(name, tmpSheetTag, opts);

  // edit-dialog nav sheet
  if (nav) {
    Object.assign(opts.Cfg, { IgnoreFocused: true, CanFocus: false });
    var EditNavSheet = _IBSheet.create(name + 'Nav', tmpNavSheetTag, opts); // 숨겨 놓을 시트 초기 설정 만들기;
  }
  var currentRow = row; // 현재 row 정보 저장
  /* step 4 end */

  /* step 5 start
   * 상세보기 시트가 띄워질 다이얼로그 창에 대한 설정 및 다이얼로그 생성
   */
  var dialogOpt = {},
    pos = {};

  this.initPopupDialog(dialogOpt, pos, EditSheet, { cssClass: classDlg }, [EditNavSheet]);
  dialogOpt.Head = "<div>편집 다이얼로그</div>";
  dialogOpt.Foot = "<div class='" + themePrefix + classDlg + "Btns'>" +
    "  <button id='" + name + "_OkEditDialog'>확인</button>" +
    "  <button id='" + name + "_CancelEditDialog'>취소</button>" +
    "</div>";
  // edit-dialog nav sheet
  dialogOpt.Body = "<div style='display:flex;'>"
    + (nav ? " <div><div id='" + name + "_NavPrevBtn' class='" + themePrefix + classDlg + "NavBtns " + (row && !this.getPrevVisibleRow(row) ? themePrefix + classDlg + "NavBtnsDisable" : "") + "'><span>◀</span></div></div>" : "") // 왼쪽으로 이동 버튼
    + " <div id='" + name + "_EditSheetDiv' style='display:flex;'>"
    + "   <div id='" + name + "_EditDialogBody' style='width:" + width + "px;height:" + height + "px;overflow:hidden;'></div>"
    + (nav ? "   <div id='" + name + "_EditNavDialogBody' style='width:" + width + "px;height:" + height + "px;display:none;' class='" + themePrefix + classDlg + "NavBody'></div>" : "") // 숨겨진 시트
    + (nav ? "   <div id='" + name + "_MovedPrevBody' style='width:" + width + "px;height:" + height + "px;display: none;' class='" + themePrefix + classDlg + "NavMovedBody'><span>▶</span></div>" : "")
    + (nav ? "   <div id='" + name + "_MovedNextBody' style='width:" + width + "px;height:" + height + "px;display: none;' class='" + themePrefix + classDlg + "NavMovedBody'><span>◀</span></div>" : "")
    + " </div>"
    + (nav ? " <div><div id='" + name + "_NavNextBtn' class='" + themePrefix + classDlg + "NavBtns " + (row && !this.getNextVisibleRow(row) ? themePrefix + classDlg + "NavBtnsDisable" : "") + "'><span>▶</span></div></div>" : "") // 오른쪽으로 이동 버튼
    + "</div>";
  dialogOpt = _IBSheet.showDialog(dialogOpt, pos, this);
  /* step 5 end */

  /* step 6 start
   * 다이얼로그 창의 Body에 상세보기 시트를 옮김 */
  var EditDlgBody = document.getElementById(name + "_EditDialogBody");
  EditDlgBody.innerHTML = "";
  for (var elem = tmpSheetTag.firstChild; elem; elem = tmpSheetTag.firstChild) EditDlgBody.appendChild(elem);
  EditSheet.MainTag = EditDlgBody;
  tmpSheetTag.parentNode.removeChild(tmpSheetTag);

  // edit-dialog nav sheet
  if (nav) {
    var EditNavDlgBody = document.getElementById(name + "_EditNavDialogBody");
    var MovedPrevBody = document.getElementById(name + "_MovedPrevBody");
    var MovedNextBody = document.getElementById(name + "_MovedNextBody");
    EditNavDlgBody.innerHTML = "";
    for (var elem = tmpNavSheetTag.firstChild; elem; elem = tmpNavSheetTag.firstChild) EditNavDlgBody.appendChild(elem);
    EditNavSheet.MainTag = EditNavDlgBody;
    tmpNavSheetTag.parentNode.removeChild(tmpNavSheetTag);
  }
  /* step 6 end */

  /* step 7 start
   * 버튼 클릭시 및 다이얼로그의 시트가 아닌 부분을 클릭했을 때
   */
  var btnOk = document.getElementById(name + "_OkEditDialog");
  var btnCancel = document.getElementById(name + "_CancelEditDialog");
  var myArea = EditSheet.getElementsByClassName(dialogOpt.Tag, themePrefix + classDlg + "HeadText")[0];
  var myArea2 = EditSheet.getElementsByClassName(dialogOpt.Tag, themePrefix + classDlg + "Foot")[0];
  var self = this;

  myArea.onclick = function () {
    if (self.ARow == null) {
      EditSheet.blur();
    }
  };

  myArea2.onclick = function () {
    if (self.ARow == null) {
      EditSheet.blur();
    }
  };

  // 확인 Button
  btnOk.onclick = function () {
    EditSheet.endEdit(1);
    if (EditSheet.getRowsByStatus('Changed').length) {
      var prow = EditSheet.getFirstRow();
      while (prow) {
        self.setValue(currentRow, prow["ColName"], prow["Target"], 1);
        prow = EditSheet.getNextRow(prow);
      }
    }

    EditSheet.dispose();
    if (EditNavSheet) EditNavSheet.dispose();
    self.closeDialog();
    // 버튼을 닫을때 스타일을 제거한다.
    if (styles && styles.parentNode) {
      styles.parentNode.removeChild(styles);
      delete self._stylesEditDialog;
    }
  };

  // 취소 Button
  btnCancel.onclick = function () {
    EditSheet.dispose();
    if (EditNavSheet) EditNavSheet.dispose();
    self.closeDialog();
    // 버튼을 닫을때 스타일을 제거한다.
    if (styles && styles.parentNode) {
      styles.parentNode.removeChild(styles);
      delete self._stylesEditDialog;
    }
  };

  // Nav Button 좌우 시트 이동
  var btnNavPrev = document.getElementById(name + "_NavPrevBtn");
  var btnNavNext = document.getElementById(name + "_NavNextBtn");
  if (nav && btnNavPrev && btnNavNext) {
    btnNavPrev.onclick = function () {
      if (EditSheet.getRowsByStatus('Changed').length && confirm("편집 내용을 저장하시겠습니까?")) {
        // 변경된 내용 저장
        EditSheet.endEdit(1);
        var prow = EditSheet.getFirstRow();
        while (prow) {
          self.setValue(currentRow, prow["ColName"], prow["Target"], 1);
          prow = EditSheet.getNextRow(prow);
        }
      }

      // 이전 행으로 데이터 변경
      var prevRow = self.getPrevVisibleRow(currentRow);
      if (!prevRow) return;
      currentRow = self.updateCurrentRow(EditSheet, name, classDlg, prevRow, headerIndex, excludeHideCol, nav);
    };

    btnNavNext.onclick = function () {
      if (EditSheet.getRowsByStatus('Changed').length && confirm("편집 내용을 저장하시겠습니까?")) {
        // 변경된 내용 저장
        EditSheet.endEdit(1);
        var prow = EditSheet.getFirstRow();
        while (prow) {
          self.setValue(currentRow, prow["ColName"], prow["Target"], 1);
          prow = EditSheet.getNextRow(prow);
        }
      }

      // 이후 행으로 데이터 변경
      var nextRow = self.getNextVisibleRow(currentRow);
      if (!nextRow) return;
      currentRow = self.updateCurrentRow(EditSheet, name, classDlg, nextRow, headerIndex, excludeHideCol, nav);
    };
  }
  /* step 7 end */

  /**
   * step 8 start
   * mobile touch event
   */
  if (nav) {
    var bMoveEvent = false;
    var bStartEvent = false; // touchstart 이벤트 발생 여부 플래그
    var nMoveType = -1; // 현재 판단된 사용자 움직임의 방향
    var htTouchInfo = { // touchstart 시점의 좌표와 시간을 저장하기
      nStartX: -1,
      nStartY: -1,
      nStartTime: 0
    };
    // 수평 방향을 판단하는 기준 기울기
    var nHSlope = ((window.innerHeight / 2) / window.innerWidth).toFixed(2) * 1;
    var direction = null; // 이동 좌우 방향 ['prev', 'next']
    var tmpRow = null; // 이동 row, currentRow 업데이트를 위해 임시 저장
    var isMoved = null; // 이동이 이루어 졌는지 확인: 시트 너비의 절반 이상 이동하지 않으면 이동이 아닌 것으로 간주

    function initTouchInfo() { // 터치 정보들의 값을 초기화하는 함수
      htTouchInfo.nStartX = -1;
      htTouchInfo.nStartY = -1;
      htTouchInfo.nStartTime = 0;
      bStartEvent = false;
      bMoveEvent = false;
    }

    // touchstart 좌표값과 비교하여 현재 사용자의 움직임을 판단하는 함수
    function getMoveType(x, y) {
      // 0은 수평방향, 1은 수직방향
      nMoveType = -1;

      var nX = Math.abs(htTouchInfo.nStartX - x);
      var nY = Math.abs(htTouchInfo.nStartY - y);
      var nDis = nX + nY;
      // 현재 움직인 거리가 기준 거리보다 작을 땐 방향을 판단하지 않는다
      if (nDis < 25) {
        return nMoveType
      }

      var nSlope = parseFloat((nY / nX).toFixed(2), 10);

      if (nSlope < nHSlope) {
        return x - htTouchInfo.nStartX;
      }

      return nMoveType;
    }

    function onStart(e) {
      initTouchInfo(); // 터치 정보를 초기화한다.
      nMoveType = -1; // 이전 터치에 대해 분석한 움직임의 방향도 초기화한다.
      //touchstart 이벤트 시점에 정보를 갱신한다.
      htTouchInfo.nStartX = e.changedTouches[0].pageX;
      htTouchInfo.nStartY = e.changedTouches[0].pageY;
      htTouchInfo.nStartTime = e.timeStamp;
      bStartEvent = true;
    }

    function onMove(e) {
      if (!bStartEvent) {
        return
      }
      bMoveEvent = true; //touchMove 이벤트 발생 여부

      var nX = e.changedTouches[0].pageX;
      var nY = e.changedTouches[0].pageY;

      //현재 touchmMove에서 사용자 터치에 대한 움직임을 판단한다.
      return nMoveType = getMoveType(nX, nY);
    }

    function onEnd(e) {
      if (!bStartEvent) {
        return
      }

      if (bStartEvent && !bMoveEvent) { // 클릭 이벤트
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      //touchmove에서 움직임을 판단하지 못했다면 touchend 이벤트에서 다시 판단한다.
      if (nMoveType < 0) {
        var nX = e.changedTouches[0].pageX;
        var nY = e.changedTouches[0].pageY;
        nMoveType = getMoveType(nX, nY);
      }
      bStartEvent = false;
      nMoveType = -1; //분석한 움직임의 방향도 초기화한다.
      initTouchInfo(); //터치 정보를 초기화한다.

      return true;
    }

    var EditSheetDiv = document.getElementById(name + "_EditSheetDiv");
    var navSheetWidth = parseInt(EditNavDlgBody.style.width);
    // left 계산
    var defaultLeft = 0;
    var outer = getComputedStyle(document.getElementsByClassName(themePrefix + classDlg + 'Outer')[0]);
    defaultLeft += parseInt(outer.paddingLeft) + parseInt(outer.borderLeftWidth);
    defaultLeft += parseInt(getComputedStyle(btnNavPrev.parentElement).width);

    EditSheetDiv.ontouchstart = function (ev) {
      onStart(ev)
    }

    EditSheetDiv.ontouchmove = function (ev) {
      var result = onMove(ev),
        left;

      if (result != -1) {
        if (result > 0) { // get prev
          if (direction != 'prev') {
            var prevRow = self.getPrevVisibleRow(currentRow);
            if (!prevRow) return;

            tmpRow = self.updateCurrentRow(EditNavSheet, name, classDlg, prevRow, headerIndex, excludeHideCol, nav);
            EditNavDlgBody.style.display = '';
            direction = 'prev';
          }
          isMoved = Math.abs(result) > navSheetWidth / 2 ? true : false;
          if (!isMoved) {
            left = result - navSheetWidth + defaultLeft;
            MovedPrevBody.style.display = 'none';
            MovedNextBody.style.display = 'none';
          }
          else MovedPrevBody.style.display = '';
        } else { // get next
          if (direction != 'next') {
            var nextRow = self.getNextVisibleRow(currentRow);
            if (!nextRow) return;

            tmpRow = self.updateCurrentRow(EditNavSheet, name, classDlg, nextRow, headerIndex, excludeHideCol, nav);
            EditNavDlgBody.style.display = '';
            direction = 'next';
          }
          isMoved = Math.abs(result) > navSheetWidth / 2 ? true : false;
          if (!isMoved) {
            left = navSheetWidth + result + defaultLeft;
            MovedPrevBody.style.display = 'none';
            MovedNextBody.style.display = 'none';
          }
          else MovedNextBody.style.display = '';
        }
        EditNavDlgBody.style.left = left + 'px';
      }
    }

    EditSheetDiv.ontouchend = function (ev) {
      onEnd(ev);

      if (isMoved) {
        currentRow = tmpRow;
        self.updateCurrentRow(EditSheet, name, classDlg, currentRow, headerIndex, excludeHideCol, nav);
      }
      EditNavDlgBody.style.display = 'none';
      MovedPrevBody.style.display = 'none';
      MovedNextBody.style.display = 'none';
      direction = null;
      isMoved = null;
    }
  }
  /* step 8 end */

  _IBSheet.Focused = EditSheet;
};

/**
 * Html 편집(상세보기) 다이얼로그
 * showHtmlEditDialog 호출 시 순수 Html 편집 다이얼로그를 생성 후 화면에 띄운다.
*/
Fn.showHtmlEditDialog = function (row, width, height, headerIndex, name, excludeHideCol) {
  if (!row) return false;

  /* step 1 start
   * 현재 시트가 사용 불가능이거나 편집종료되지 못하는 경우 띄우지 않는다.
   */
  if (this.endEdit(true) == -1) return;
  /* step 1 end */

  // 스타일이 중복 되었을때 스타일을 제거한다.
  if (this._stylesHtmlEditDialog && this._stylesHtmlEditDialog.parentNode) {
    this._stylesHtmlEditDialog.parentNode.removeChild(this._stylesHtmlEditDialog);
    delete this._stylesHtmlEditDialog;
  }

  var classDlg = "HtmlEditPopup";
  var themePrefix = this.Style;

  if (typeof row == "object") {
    var htmlEditTemp = row;
    if (htmlEditTemp.row != null) row = htmlEditTemp.row;
    if (htmlEditTemp.width != null) width = htmlEditTemp.width;
    if (htmlEditTemp.height != null) height = htmlEditTemp.height;
    if (htmlEditTemp.headerIndex != null) headerIndex = htmlEditTemp.headerIndex;
    if (htmlEditTemp.name != null) name = htmlEditTemp.name;
    if (htmlEditTemp.excludeHideCol != null) excludeHideCol = htmlEditTemp.excludeHideCol;
  }

  if (!row) return false; // row가 없는 경우 return
  if (row && row.Kind != 'Data') return false; // row가 데이터 행이 아닌 경우 return

  width = typeof width == "number" ? width : 500;
  height = typeof height == "number" ? height : 500;
  name = typeof name == "string" ? name : ("htmlEditSheet_" + this.id);

  var styles = document.createElement("style");
  styles.innerHTML = '.' + themePrefix + classDlg + 'Outer {' +
    '  padding: 10px 50px;' +
    '  border: 3px solid #37acff;' +
    '} ' +
    '.' + themePrefix + classDlg + 'Close {' +
    '  background-color: #000;' +
    '  width: 17px;' +
    '  height: 17px;' +
    '} ' +
    '.' + themePrefix + classDlg + 'Head, .' + themePrefix + classDlg + 'Foot {' +
    '  background-color:white;' +
    '  border-top:0px' +
    '} ' +
    '.' + themePrefix + classDlg + 'Head .' + themePrefix + classDlg + 'HeadText >div:last-child {' +
    '  text-align: center;' +
    '  color: #000;' +
    '  font-size: 25px;' +
    '  margin-bottom: 5px;' +
    '  font-weight: 600;' +
    '  height:35px;' +
    '  line-height: normal;' +
    '} ' +
    '.' + themePrefix + classDlg + 'Btns {' +
    '  text-align:center;' +
    '} ' +
    '.' + themePrefix + classDlg + 'Btns > button {' +
    '  color: #fff;' +
    '  font-family: "NotoSans_Medium";' +
    '  font-size: 18px;' +
    '  display: inline-block;' +
    '  text-align: center;' +
    '  vertical-align: middle;' +
    '  border-radius: 3px;' +
    '  background-color: #37acff;' +
    '  border: 1px solid #37acff;' +
    '  padding: 5px 10px;' +
    '  margin-left: 5px;' +
    '  cursor: pointer;' +
    '}' +
    ' #' + name + '_EditDialogBody > table tr td {' +
    '  padding-left: 5px;' +
    '  padding-bottom: 10px;' +
    '  padding-top: 5px;' +
    '  padding-right: 10px;' +
    '}'
    ;

  document.body.appendChild(styles);
  this._stylesHtmlEditDialog = styles;

  /* step 2 start
   * 임시로 상세보기 시트가 들어갈 div 생성(생성된 다이얼로그로 아래에서 옮김).
   */
  var tmpHtmlTag = document.createElement("div");
  tmpHtmlTag.className = "HtmlTmpTag";
  tmpHtmlTag.style.width = "300px";
  tmpHtmlTag.style.height = "100px";
  document.body.appendChild(tmpHtmlTag);
  /* step 2 end */

  /* step 3 start
   * 띄워져있는 다이얼로그나 팁을 제거.
   */
  this.closeDialog();
  this.hideTip();
  /* step 3 end */

  /* step 4 start
   * 상세보기 html 생성
   */
  var editHtml = this.makeEditHtml(row, headerIndex, excludeHideCol);
  // var EditSheet = _IBSheet.create(name, tmpSheetTag, opts);
  /* step 4 end */

  /* step 5 start
   * 상세보기 시트가 띄워질 다이얼로그 창에 대한 설정 및 다이얼로그 생성
   */
  var dialogOpt = {},
    pos = {};

  this.initPopupDialog(dialogOpt, pos, null, { cssClass: classDlg });
  dialogOpt.Head = "<div>편집 다이얼로그</div>";
  dialogOpt.Foot = "<div class='" + themePrefix + classDlg + "Btns'>" +
    "  <button id='" + name + "_OkEditDialog'>확인</button>" +
    "  <button id='" + name + "_CancelEditDialog'>취소</button>" +
    "</div>";
  dialogOpt.Body = "<div style='display:flex;'>"
    + " <div id='" + name + "_EditHtmlDiv' style='display:flex;'>"
    + "   <div id='" + name + "_EditDialogBody' style='width:" + width + "px;height:" + height + "px;overflow:auto;'></div>"
    + " </div>"
    + "</div>";
  dialogOpt = _IBSheet.showDialog(dialogOpt, pos, this);
  /* step 5 end */

  /* step 6 start
   * 다이얼로그 창의 Body에 상세보기 html을 옮김 */
  var EditDlgBody = document.getElementById(name + "_EditDialogBody");
  EditDlgBody.innerHTML = editHtml;
  /* step 6 end */

  /* step 7 start
   * 버튼 클릭시 및 다이얼로그의 시트가 아닌 부분을 클릭했을 때
   */
  var btnOk = document.getElementById(name + "_OkEditDialog");
  var btnCancel = document.getElementById(name + "_CancelEditDialog");
  var self = this;

  // 확인 Button
  btnOk.onclick = function () {
    var cols = [], elem;
    if (Array.prototype.filter) {
      cols = self.getCols().filter(function (col) {
        return col != "SEQ";
      });
    } else {
      cols = [];
      var arr = self.getCols();
      for (var i = 0; i < arr.length; i++) {
        if (arr[i] !== "SEQ") cols.push(arr[i]);
      }
    }

    for (var c = 0; c < cols.length; c++) {
      switch(self.getType(row, cols[c])) {
        case "Radio":
          elem = document.querySelector("input[name='htmlEdit_" + cols[c] + "']:checked");
          if (elem && self.getValue(row, cols[c]) != elem.value) self.setValue(row, cols[c], elem.value);
        case "Bool":
          elem = document.getElementById("htmlEdit_" + cols[c]);
          if (elem && self.getValue(row, cols[c]) != elem.checked) self.setValue(row, cols[c], elem.checked);
          break;
        case "Date":
          elem = document.getElementById("htmlEdit_" + cols[c]);
          if (elem && self.getString(row, cols[c]) != elem.value) self.setString(row, cols[c], elem.value);
          break;
        default:
          elem = document.getElementById("htmlEdit_" + cols[c]);
          if (elem && self.getValue(row, cols[c]) != elem.value) self.setValue(row, cols[c], elem.value);
          break;
      }
    }

    self.closeDialog();
    // 버튼을 닫을때 스타일을 제거한다.
    if (styles && styles.parentNode) {
      styles.parentNode.removeChild(styles);
      delete self._stylesHtmlEditDialog;
    }
  };

  // 취소 Button
  btnCancel.onclick = function () {
    self.closeDialog();
    // 버튼을 닫을때 스타일을 제거한다.
    if (styles && styles.parentNode) {
      styles.parentNode.removeChild(styles);
      delete self._stylesHtmlEditDialog;
    }
  };
  /* step 7 end */
};

/* Edit 시트의 데이터를 바꾸고 네비게이션을 조정하는 function */
Fn.updateCurrentRow = function (EditSheet, name, classDlg, row, headerIndex, excludeHideCol, nav) {
  var self = this;
  var themePrefix = this.Style;

  var data = self.getRowEditData(row, headerIndex, excludeHideCol, nav);
  EditSheet.loadSearchData({ data: data, sync: 1 });

  if (nav) { // nav buttons disable 적용
    var btnNavPrev = document.getElementById(name + "_NavPrevBtn");
    var btnNavNext = document.getElementById(name + "_NavNextBtn");

    if (row && !self.getPrevVisibleRow(row)) {
      btnNavPrev.classList.add(themePrefix + classDlg + 'NavBtnsDisable');
    } else {
      btnNavPrev.classList.remove(themePrefix + classDlg + 'NavBtnsDisable');
    }

    if (row && !self.getNextVisibleRow(row)) {
      btnNavNext.classList.add(themePrefix + classDlg + 'NavBtnsDisable');
    } else {
      btnNavNext.classList.remove(themePrefix + classDlg + 'NavBtnsDisable');
    }
  }

  return row;
};

/* 멀티레코드 코드 정리해주는 코드 */
Fn.collectColsByMultiRecord = function (cols) {
	var tempCols = [];
	for (var i = 0; i < cols.length; i++) {
		for (var j = 0; j < cols[i].length; j++) {
			if (cols[i][j]) {
				if (typeof cols[i][j].Name == "undefined") continue;
				tempCols[tempCols.length] = cols[i][j];
			}
		}
	}
	return tempCols;
};

/* getDataRows로 가져온 Row들에 대한 DeepCopy */
Fn.deepCopyRows = function () {
	var dataRows = IBSheet.__.clone(this.getDataRows());
	var copyRows = [];

	for (var i = 0; i < dataRows.length; i++) {
		copyRows.push(IBSheet.__.clone(dataRows[i]));
	}

	return copyRows;
};

/* 다이얼로그에 올라갈 시트 생성(업로드시 데이터가 임시로 올라갈 곳) */
Fn.initImportSheet = function (uploadType, width, height, name, colCount, fullLoadData) {
  if(IBSheet[name]) IBSheet[name].dispose();

  var tmpSheetDiv = document.createElement("div");
  tmpSheetDiv.id = "tmpSheetid";
  tmpSheetDiv.style.width = "100%";
  tmpSheetDiv.style.height = "100%";
  tmpSheetDiv.style.position = "absolute";
  tmpSheetDiv.style.top = "-10000px";
  tmpSheetDiv.style.zIndex = "-9999";
  document.body.appendChild(tmpSheetDiv);

  if(fullLoadData) var sheetData = fullLoadData["sheetData"];
  var sheetOpts = this.getUserOptions(1);
  var sheetHeaderRows = this.getHeaderRows();
  var headerValue = "";
  var headerEnumString = "";
  var colsEnum = {};
  var seqHeader = [];
  var leftChk = [];
  var colsEnumKeys = "";
  var columnMapping = [];
  sheetOpts.Def = {};
  sheetOpts.Def.Row = {};
  var calcName = "";
  var seqIndex = -1;
  var sheetColslength = 0;

  // 시트의 이벤트를 그대로 가져오므로, 이벤트를 삭제 합니다.
  delete sheetOpts.Events;

  if (sheetOpts.Cfg["HeaderCheck"] > 0) {
    delete sheetOpts.Cfg.HeaderCheck;
  }

  if (sheetOpts.LeftCols && sheetOpts.LeftCols instanceof Array) {
    sheetOpts.Cols = sheetOpts.LeftCols.concat(sheetOpts.Cols);
    delete sheetOpts.LeftCols;
  }

  if (sheetOpts.RightCols && sheetOpts.RightCols instanceof Array) {
    sheetOpts.Cols = sheetOpts.Cols.concat(sheetOpts.RightCols);
    delete sheetOpts.RigthCols;
  }

  if (this.MultiRecord) {
    delete sheetOpts.Cfg.MultiRecord;
    sheetOpts.Cols = this.collectColsByMultiRecord(sheetOpts.Cols);
  }

  sheetColslength = sheetOpts.Cols.length + colCount;

  for (var i = 0; i < sheetColslength; i++) {

    if (sheetOpts.Cols[i]) {
      sheetOpts.Cols[i].Visible = !sheetOpts.Cols[i].Visible ? (sheetOpts.Cols[i].Visible == null ? 1 : 0) : 1;

      sheetOpts.Cols[i] = IBSheet.__.extend(sheetOpts.Cols[i], {
        Header: {Value : sheetOpts.Cols[i].Name},
        Name: "EXTRACOL" + i,
        Visible: sheetOpts.Cols[i].Visible
      });

      if (sheetOpts.Cols[i].RecordRowSpan) {
        delete sheetOpts.Cols[i].RecordRowSpan;
      }

      if (sheetOpts.Cols[i].RecordColSpan) {
        delete sheetOpts.Cols[i].RecordColSpan;
      }

      if (sheetOpts.Cols[i].RecordHColSpan) {
        delete sheetOpts.Cols[i].RecordHColSpan;
      }

      if (sheetOpts.Cols[i].RecordHColTitle) {
        delete sheetOpts.Cols[i].RecordHColTitle;
      }
    }

    if (!sheetOpts.Cols[i]) {
      sheetOpts.Cols[i] = {
        Type: "Text",
        Name: "EXTRACOL" + i
      }
    }

    if (sheetOpts.Cols[i].Visible) {
      for (var j = 0; j < sheetHeaderRows.length; j++) {
        headerEnumString = headerEnumString.concat((j > 0 ? "/" : "") + (sheetOpts.Cols[i].Required == 1 ? (sheetHeaderRows[j][sheetOpts.Cols[i].Header.Value] + "(필수)") : sheetHeaderRows[j][sheetOpts.Cols[i].Header.Value]));
      }
      headerValue = headerValue.concat("|" + headerEnumString);
      headerEnumString = "";
      colsEnumKeys = colsEnumKeys.concat("|",sheetOpts.Cols[i].Header.Value);
      sheetOpts.Cols[i].Align = "Center";
      sheetOpts.Cols[i].Width = 150;
      delete sheetOpts.Cols[i].DefaultValue;
      delete sheetOpts.Cols[i].RelWidth;
      delete sheetOpts.Cols[i].MinWidth;
      delete sheetOpts.Cols[i].MaxWidth;
      delete sheetOpts.Cols[i].EditEnum;
      delete sheetOpts.Cols[i].Range;
      delete sheetOpts.Cols[i].Button;
      delete sheetOpts.Cols[i].Icon;
      sheetOpts.Cols[i].CanEdit = true;
      sheetOpts.Cols[i].CanFocus = true;
    }
    calcName = calcName.concat(",",sheetOpts.Cols[i].Name + "Color");

    columnMapping.push(i+1);
  }

  sheetOpts.Def.Row = {CanFormula:1, CalcOrder: calcName};

  for (var i = 0; i < sheetOpts.Cols.length; i++) {
    if (sheetOpts.Cols[i] && (typeof sheetOpts.Cols[i].Name == "undefined" || sheetOpts.Cols[i].Name == "" || sheetOpts.Cols[i].Name == null)) {
      if (sheetOpts.Cols[i].Header instanceof Array && sheetOpts.Cols[i].Header.length > 1) {
        for (var j = 1; j < sheetOpts.Cols[i].Header.length; j++) {
          sheetOpts.Cols[i].Header.splice(1, j);
        }
      }
      seqIndex = i;
      continue;
    }

    if (sheetOpts.Cols[i].Required) {
      sheetOpts.Cols[i].RequiredField = 1;
      delete sheetOpts.Cols[i].Required;
    }

    sheetOpts.Cols[i].ColorFormula = function(fr) {
      var colorError = "#FFFF00";
      if (fr.Sheet.Sheet.Cols[fr.HeadRow[fr.Col]]) {
        var isRequired = fr.Sheet.Sheet.Cols[fr.HeadRow[fr.Col]].Required;
        var type = fr.Sheet.Sheet.Cols[fr.HeadRow[fr.Col]].Type;
        var valueTrue = fr.Sheet.Sheet.Cols[fr.HeadRow[fr.Col]].TrueValue || 1;
        var valueFalse = fr.Sheet.Sheet.Cols[fr.HeadRow[fr.Col]].FalseValue || 0;
      }
      var enumValue = new Array();

      if (type === "Int") {
        if (isRequired) {
          if (fr.Value == null || (_IBSheet.__.isString(fr.Value) && fr.Value == "")) {
            return colorError;
          } else {
            return _IBSheet.__.isNumeric(fr.Value) ?  "" : colorError;
          }
        } else {
          return _IBSheet.__.isNumeric(fr.Value) ?  "" : colorError;
        }
      }

      if (type === "Bool") {
        if (isRequired) {
          if (fr.Value == null || (_IBSheet.__.isString(fr.Value) && fr.Value == "")) {
            return colorError;
          }
        } else {
          return (fr.Value == valueTrue || fr.Value == valueFalse) ? "" : colorError;
        }
      }

      if (type === "Text") {
        if (isRequired) {
          if (fr.Value == null || (_IBSheet.__.isString(fr.Value) && fr.Value == "")) {
            return colorError;
          }
        }
      }

      if (type === "Enum") {
        enumValue = fr.Sheet.Sheet.Cols[fr.HeadRow[fr.Col]].Enum.split("|");
        if (isRequired) {
          if (fr.Value == null || (_IBSheet.__.isString(fr.Value) && fr.Value == "")) {
            for (var i = 1; i < enumValue.length; i++) {
              if (fr.Value === enumValue[i]) {
                return;
              }
            }
            return colorError;
          }
        } else {
          for (var i = 1; i < enumValue.length; i++) {
            if (fr.Value === enumValue[i]) {
              return;
            }
          }
          return colorError;
        }
      }

      if (type === "Date") {
        var maskedDate = _IBSheet.stringToDate("" + fr.Value, fr.Sheet.Sheet.Cols[fr.HeadRow[fr.Col]].DataFormat);
        if (isRequired) {
          if (fr.Value == null || (_IBSheet.__.isString(fr.Value) && fr.Value == "")) {
            return colorError;
          }
        }
        else{
          return _IBSheet.__.isDate(maskedDate) ? "" : colorError;
        }
      }
    }

    colsEnum[sheetOpts.Cols[i].Name] = {
      "Type": "Enum",
      "Enum": "|"+headerValue,
      "CanEdit": 1,
      "Value": (!sheetOpts.Cols[i].Header ? "": sheetOpts.Cols[i].Header.Value),
      "EnumKeys": "|"+colsEnumKeys
    };
    sheetOpts.Cols[i].Header = (function (arr, idx) {
      arr.push({
        Value: "컬럼" + idx
      });
      return arr;
    })([], i);

    if (i == seqIndex + 1  && (uploadType === "txt" || uploadType === "csv")) {
      sheetOpts.Cols[i].RelWidth = 1;
    }

    if (i > seqIndex + 1 && (uploadType === "txt" || uploadType === "csv")) {
      sheetOpts.Cols[i].Visible = false;
    }
  }

  colsEnum.id = "HeadRow";
  colsEnum.Kind = "Head";

  sheetOpts.Head = [colsEnum];
  var cellHeader = this.getCell(this.Header, sheetOpts.Head[0][sheetOpts.Cols[1].Name].Value);

  if (cellHeader) {
    var style = getComputedStyle(cellHeader);
    sheetOpts.Head[0].Color = style.backgroundColor;
    sheetOpts.Head[0].TextColor = style.color;
  }

  sheetOpts.Head[0].SEQ = {
    Type: "Text",
    CanEdit: false,
    CanFocus: false,
    Color: sheetOpts.Head[0].Color,
    TextColor: sheetOpts.Head[0].TextColor,
    Visible: false
  }

  sheetOpts.Head[0].chkBool = {
    Type: "Text",
    CanEdit: false,
    CanFocus: false
  }

  seqHeader[0] = {
    Value: "No"
  }
  leftChk[0] = {
    Value: "체크",
    HeaderCheck: 1
  }

  // 다이얼로그 전용 컬럼.
  sheetOpts.LeftCols = [
  {
    Header: seqHeader,
    Name: "SEQ",
    Visible: 1
  },
  {
    Header: leftChk,
    Type: "Bool",
    Name: "chkBool",
    Visible: 1,
    CanEmpty: 3,
    CanEdit: 1,
    ColMerge: 0,
    Align: "Center",
    VAlign: "Middle"
  }];

  sheetOpts.Cfg.FitWidth = 0;

  var defaultEvents = {
    onRenderFirstFinish: function (evtParams) {
      var sheetCols = evtParams.sheet.getCols();
      var colsMap = "";
      for (var i = columnMapping.length; i < sheetCols.length; i++) {
        colsMap += "|";
      }
      colsMap += columnMapping.join("|");

      if (uploadType === "excel") {
        evtParams.sheet.loadExcel({mode: "NoHeader", columnMapping: colsMap});
      }
      else if (uploadType === "txt" || uploadType === "csv") {
        evtParams.sheet.loadText({mode: "NoHeader", colSeparator: " !  @  ", fileExt: uploadType === "csv" ? "csv" : ""});
      }
    },
    onImportFinish: function (evtParams) {
      var sheetCols = evtParams.sheet.getCols();
      var dataLength = Object.keys(evtParams.data[0]).length;
      if (uploadType === "excel") {
        for (var i = dataLength; i < sheetOpts.Cols.length; i++) {
          if (!evtParams.data[0][sheetOpts.Cols[i].Name]) {
            evtParams.sheet.hideCol("EXTRACOL"+i);
          }
        }
      }

      evtParams.sheet.Sheet.makeUploadDialog(width, height, name, evtParams.sheet, calcName, uploadType, sheetHeaderRows);

      for (var i = 0; i < sheetCols.length; i++) {
        if (sheetCols[i] == "chkBool") continue;
        evtParams.sheet.Cols[sheetCols[i]].MasterType = evtParams.sheet.Cols[sheetCols[i]].Type || "Text";
        evtParams.sheet.Cols[sheetCols[i]].Type = "Text";
        evtParams.sheet.Cols[sheetCols[i]].Format = "";
        evtParams.sheet.Cols[sheetCols[i]].DataFormat = "";
        evtParams.sheet.Cols[sheetCols[i]].EditFormat = "";
      }

      if (uploadType === "txt" || uploadType === "csv") {
        var headerRows = evtParams.sheet.getHeaderRows();
        var selectOptsValue = document.getElementById(name + "_UploadTextSep").value;
        var startCol = sheetCols.indexOf("SEQ") == 0 ? 1 : 0;
        if (evtParams.data.length && evtParams.data[0][sheetCols[startCol]].indexOf(selectOptsValue) > -1) {
          var tmpRow = {};
          if (!evtParams.sheet.OrgLoadTextDataValue) evtParams.sheet.OrgLoadTextDataValue = [];
          for (var i = 0; i < evtParams.data.length; i++) {
            tmpRow = {};
            var sepContents = evtParams.sheet.OrgLoadTextDataValue[i] ? evtParams.sheet.OrgLoadTextDataValue[i].split(selectOptsValue) : (evtParams.data[i][sheetCols[startCol]] && evtParams.data[i][sheetCols[startCol]].split(selectOptsValue));
            if (!evtParams.sheet.OrgLoadTextDataValue[i]) evtParams.sheet.OrgLoadTextDataValue[i] = evtParams.data[i][sheetCols[startCol]];
            for (var j = startCol; j < sheetCols.length; j++) {
              if (j != startCol) evtParams.sheet.showCol(sheetCols[j]);
              else {
                evtParams.sheet.Cols[sheetCols[j]].Width = 150;
                evtParams.sheet.Cols[sheetCols[j]].RelWidth = 0;
              }
              tmpRow[sheetCols[j]] = sepContents[j-1];
            }
            evtParams.data[i] = tmpRow;
          }
        }
        headerRows[0].SEQ = "No";
        headerRows[0].SEQAlign = "Center";
        evtParams.sheet.showCol("SEQ");
        evtParams.sheet.moveCol("chkBool", "SEQ", 1, 1);
        for (var i = 0; i < sheetOpts.Cols.length; i++) {
          if (evtParams.data[0][sheetOpts.Cols[i].Name] == null) {
            evtParams.sheet.hideCol("EXTRACOL"+i);
          }
        }
      }

      if (evtParams.data && evtParams.data.length) {
        for (var i = 0; i < evtParams.data.length; i++) {
          evtParams.data[i]["chkBool"] = (i < sheetHeaderRows.length) ? 0 : 1;
        }
      }
    },
    onBeforeDataLoad: function (evtParams) {
      if (evtParams.sheet.textSepApply && (uploadType === "txt" || uploadType === "csv")) {
        for (var i = 0; i < sheetOpts.Cols.length; i++) {
          if (evtParams.data[0][sheetOpts.Cols[i].Name] == null) {
            evtParams.sheet.hideCol("EXTRACOL"+i);
          }
        }
        delete evtParams.sheet.textSepApply;
      }
    }
  };

  var fullLoadEvents = {
    onRenderFirstFinish: function (evtParams) {
      var sheetCols = evtParams.sheet.getCols();
      evtParams.sheet.Sheet.makeUploadDialog(width, height, name, evtParams.sheet, calcName, uploadType, sheetHeaderRows, sheetData);

      for (var i = 0; i < sheetCols.length; i++) {
        if (sheetCols[i] == "chkBool") continue;
        evtParams.sheet.Cols[sheetCols[i]].MasterType = evtParams.sheet.Cols[sheetCols[i]].Type || "Text";
        evtParams.sheet.Cols[sheetCols[i]].Type = "Text";
        evtParams.sheet.Cols[sheetCols[i]].Format = "";
        evtParams.sheet.Cols[sheetCols[i]].DataFormat = "";
        evtParams.sheet.Cols[sheetCols[i]].EditFormat = "";
      }

      evtParams.sheet.loadSearchData(fullLoadData["sheetData"][0]);
    },
    onBeforeDataLoad: function (evtParams) {
      var sheetCols = evtParams.sheet.getCols();
      var dataLength = Object.keys(evtParams.data[0]).length;

      if (uploadType === "excel") {
        for (var i = 1; i < sheetOpts.Cols.length; i++) {
          if (dataLength <= i < sheetOpts.Cols.length && !evtParams.data[0][sheetOpts.Cols[i].Name]) evtParams.sheet.hideCol("EXTRACOL"+i);
          else evtParams.sheet.showCol("EXTRACOL"+i);
        }
      }

      if (evtParams.data && evtParams.data.length) {
        for (var i = 0; i < evtParams.data.length; i++) {
          evtParams.data[i]["chkBool"] = (i < sheetHeaderRows.length) ? 0 : 1;
        }
      }
    }
  };

  var uploadDialogEvents = sheetData ? fullLoadEvents : defaultEvents;

  uploadDialogEvents.onBeforeChange = function (evtParams) {
    if (evtParams.row && evtParams.row.id === "HeadRow") {
      if (evtParams.val == evtParams.oldval) return evtParams.val;
      var sheetCols = evtParams.sheet.getCols();
      var parentSheetCols = evtParams.sheet.Sheet.Cols;

      var listConvert = [
        {Name: "Size", OrgName: "Size"},
        {Name: "EditMask", OrgName: "EditMask"},
        {Name: "ResultMask", OrgName: "ResultMask"},
        {Name: "ResultText", OrgName: "ResultText"},
        {Name: "ResultMessage", OrgName: "ResultMessage"},
        {Name: "EmptyValue", OrgName: "EmptyValue"},
        {Name: "RequiredField", OrgName: "Required"}
      ];

      for (var i = 2; i < sheetCols.length; i++) {
        if (evtParams.val && evtParams.row[sheetCols[i]] == evtParams.val && sheetCols[i] != evtParams.col) {
          evtParams.row[sheetCols[i]] = evtParams.oldval;
        }
        if (evtParams.row[sheetCols[i]] == evtParams.oldval) {
          for (var j = 0; j < listConvert.length; j++) {
            evtParams.sheet.Cols[evtParams.col][listConvert[j]["Name"]] = !evtParams.val ? "" : evtParams.sheet.Sheet.Cols[evtParams.val][listConvert[j]["OrgName"]];
            if (evtParams.col !== sheetCols[i]) evtParams.sheet.Cols[sheetCols[i]][listConvert[j]["Name"]] = !evtParams.oldval ? "" : evtParams.sheet.Sheet.Cols[evtParams.oldval][listConvert[j]["OrgName"]];
          }
        }
      }

      if(parentSheetCols[evtParams.val].Type == 'Date') evtParams.sheet.Cols[evtParams.col].MasterType = "Date";

      evtParams.sheet.refreshRow(evtParams.row);
    }
  };

  uploadDialogEvents.onAfterChange = function (evtParams) {
    if (evtParams.row.id == "HeadRow") {
      evtParams.sheet.calculate(true);
    }
  };

  var opts = {
    Def: sheetOpts.Def,
    Cfg: sheetOpts.Cfg,
    Cols: sheetOpts.Cols,
    LeftCols: uploadType === "excel" ? sheetOpts.LeftCols : [],
    RightCols: (uploadType === "txt" || uploadType === "csv") ? [sheetOpts.LeftCols[1]] : [],
    Head: sheetOpts.Head,
    Events: uploadDialogEvents,
  };

  var UploadSheet = _IBSheet.create({
    id: name,
    el: "tmpSheetid",
    options: opts
  });
  UploadSheet.Sheet = this;
};

/* 업로드 다이얼로그 만들기 */
Fn.makeUploadDialog = function (width, height, name, uploadSheet, calcName, uploadType, sheetHeaderRows, sheetData) {
  var classDlg = "ExcelUpLoadPopup";
  var themePrefix = this.Style;

  var styles = document.createElement("style");
  styles.innerHTML = '.' + themePrefix + classDlg + 'Outer {' +
    '  padding: 5px ;' +
    '  border: 3px solid #37acff;' +
    '  padding-left: 50px; padding-right: 50px' +
    '} ' +
    '.' + themePrefix + classDlg + 'Body .' + themePrefix + classDlg + 'Title {' +
    '  width:100%;height:30px;margin-bottom:2px;border-top:1px solid #C3C3C3;padding-top:10px;' +
    '} ' +
    '.' + themePrefix + classDlg + 'Body .' + themePrefix + classDlg + 'Title > div:last-child > div:first-child > label {' +
    '  text-align:left !important;font-size:16px;color:#444444;font-family:"NotoSans_Bold"; font-weight:600;' +
    '} ' +
    '.' + themePrefix + classDlg + 'Body .' + themePrefix + classDlg + 'Foot {' +
    '  width:100%;' +
    '  margin-top:10px;' +
    '} ' +
    '.' + themePrefix + classDlg + 'Foot ul li {' +
    '  list-style-type : none;' +
    '  height : 32px;' +
    '} ' +
    '.' + themePrefix + classDlg + 'Foot label {' +
    '  color : #666666;' +
    '} ' +
    '.' + themePrefix + classDlg + 'Close {' +
    '  background-color: black;' +
    '  width: 17px;' +
    '  height: 17px;' +
    '} ' +
    '.' + themePrefix + classDlg + 'Head, .' + themePrefix + classDlg + 'Foot {' +
    '  background-color:white;' +
    '} ' +
    '.' + themePrefix + classDlg + 'Head .' + themePrefix + classDlg + 'HeadText >div:last-child {' +
    '  text-align: center;' +
    '  color: black;' +
    '  font-size: 25px;' +
    '  margin-bottom: 5px;' +
    '  font-weight: 600;' +
    '  height:35px;' +
    '  line-height: normal;' +
    '} ' +
    '.' + themePrefix + classDlg + 'Btns {' +
    '  text-align:center;' +
    '} ' +
    '.' + themePrefix + classDlg + 'Btns > button {' +
    '  color: #fff;' +
    '  font-family: "NotoSans_Medium";' +
    '  font-size: 18px;' +
    '  display: inline-block;' +
    '  text-align: center;' +
    '  vertical-align: middle;' +
    '  border-radius: 3px;' +
    '  background-color: #37acff;' +
    '  border: 1px solid #37acff;' +
    '  padding: 5px;' +
    '  margin-left: 2px;' +
    '  cursor: pointer;' +
    '}' +
    '.' + name + '_Btn {' +
    '   background-color: white;' +
    '   border: 1px solid gray;' +
    '   cursor: pointer;' +
    '   text-align: center;' +
    '   margin-right: 5px;'
  '}';

  document.body.appendChild(styles);

  var dialogOpt = {},
    pos = {};
  this.initPopupDialog(dialogOpt, pos, uploadSheet, {
    cssClass: classDlg
  });

  if(sheetData){
    var fullLoadSheetOptArr = [];
    for (var i = 0; i < sheetData.length; i++){
        var fullLoadSheetOpt = "<option value='" + i + "'>" + sheetData[i]["sheetName"] + "</option>";
        fullLoadSheetOptArr.push(fullLoadSheetOpt);
    }
    fullLoadSheetOptArr = fullLoadSheetOptArr.join("");
  }

  dialogOpt.Head = "<div>파일 업로드</div>";
  dialogOpt.Foot = "<div class='" + themePrefix + classDlg + "Btns'>" +
    "  <button id='" + name + "_ExcuteExcelUpLoad'>확인</button>" +
    "  <button id='" + name + "_CancelExcelUpLoad'>취소</button>" +
    "</div>";

  if (uploadType === "excel") {
    dialogOpt.Body = "<div class='" + themePrefix + classDlg + "Title' ><div></div>" +
      "  <div>" +
      "    <div style='float:left;'><label >데이터 미리보기</label></div>" +
      "    <div style='float:right;'><button type='button' id='add_Btn' class='" + name + "_Btn'>행추가</button><button type='button' id='delete_Btn' class='" + name + "_Btn'>행삭제</button><button type='button' id='rule_Btn' class='" + name + "_Btn'>설명보기</button></div>" +
      "  </div>" +
      "</div>" +
      "<div style='width:" + width + "px;display: none;' id='" + name + "dialogRule'>" +
      "   <p>오류건에는 노란색 배경이 입혀집니다. 오류건이 있으면 데이터 로드가 되지 않으므로 삭제하거나 수정 후 사용하시기 바랍니다.</p>" +
      "   <p>업로드 다이얼로그는 mode가 NoHeader로 지정되어있고 헤더행이 없다고 가정하고 첫행부터 순서대로 각 열에 대입합니다.</p>" +
      "   <p>Type이 Int인 경우 숫자 입력이 가능합니다.</p>" +
      "   <p>Type이 Enum인 경우 Enum에 입력한 데이터만 입력이 가능합니다.</p>" +
      "   <p>Type이 Bool인 경우 기본적으로 0과 1만을 사용하고 TrueValue, FalseValue를 사용하여 해당 값들을 변경할 수 있습니다.</p>" +
      "</div>" +
      "<div id='" + name + "_ExcelUpLoadPopupBody' style='width:" + width + "px;height:" + height + "px;overflow:hidden;'></div>";

    if(sheetData && fullLoadSheetOptArr) {
      dialogOpt.Body += "<div class='" + themePrefix + classDlg + "Foot'>" +
        "  <div>" +
        "    <ul class=''>" +
        "      <li>" +
        "        <span style='height:65px;display:inline'>" +
        "          <label for='" + name + "_UploadFileName' style='display:inherit;font-size:15px;'>시트 명</label>" +
        "          <select type='text' id='excelUploadSheet_sheet_UploadSheetName' name='_UploadSheetName' style='display:inherit;margin-left: 3px;font-size:15px;width:75%;text-align:left;height:25px;'>" +
                    fullLoadSheetOptArr +
        "          </select>" +
        "        </span>" +
        "      </li>" +
        "    </ul>" +
        "  </div>" +
        "</div>";
    }
  }

  if (uploadType === "txt" || uploadType === "csv") {
    dialogOpt.Body = "<div class='" + themePrefix + classDlg + "Title' ><div></div>" +
      "  <div>" +
      "    <div style='float:left;'><label >데이터 미리보기</label></div>" +
      "    <div style='float:right;'><button type='button' id='add_Btn' class='" + name + "_Btn'>행추가</button><button type='button' id='delete_Btn' class='" + name + "_Btn'>행삭제</button><button type='button' id='rule_Btn' class='" + name + "_Btn'>설명보기</button></div>" +
      "  </div>" +
      "</div>" +
      "<div style='width:" + width + "px;display: none;' id='" + name + "dialogRule'>" +
      "   <p>오류건에는 노란색 배경이 입혀집니다. 오류건이 있으면 데이터 로드가 되지 않으므로 삭제하거나 수정 후 사용하시기 바랍니다.</p>" +
      "   <p>업로드 다이얼로그는 mode가 NoHeader로 지정되어있고 헤더행이 없다고 가정하고 첫행부터 순서대로 각 열에 대입합니다.</p>" +
      "   <p>Type이 Int인 경우 숫자 입력이 가능합니다.</p>" +
      "   <p>Type이 Enum인 경우 Enum에 입력한 데이터만 입력이 가능합니다.</p>" +
      "   <p>Type이 Bool인 경우 기본적으로 0과 1만을 사용하고 TrueValue, FalseValue를 사용하여 해당 값들을 변경할 수 있습니다.</p>" +
      "   <p>구분자 설정 적용시 다른 구분자로 적용할 경우 시트의 데이터가 올바르게 나오지 않습니다. 입력된 구분자로 적용 하시면 데이터가 올바르게 적용되는 것을 확인 할 수 있습니다.</p>" +
      "</div>" +
      "<div id='" + name + "_ExcelUpLoadPopupBody' style='width:" + width + "px;height:" + height + "px;overflow:hidden;'></div>" +
      "<div class='" + themePrefix + classDlg + "Foot'>" +
      "  <div>" +
      "    <ul class=''>" +
      "      <li>" +
      "          <label for='" + name + "_UploadTextSep' style='font-size:15px;font-weight:bold;'>구분자 설정</label>" +
      "          <select id='" + name + "_UploadTextSep' style='margin-left: 3px;font-size:15px;height:25px;'>" +
      "            <option value=','>,</option>" +
      "            <option value='\\t' selected>Tab</option>" +
      "            <option value='|'>|</option>" +
      "            <option value='.'>.</option>" +
      "            <option value=' '>Space</option>" +
      "          </select>" +
      "          <span style ='float:right;padding-right:109px;'><button id='textSepApply'>적용</button></span>" +
      "      </li>" +
      "    </ul>" +
      "  </div>" +
      "</div>";
  }
  dialogOpt = _IBSheet.showDialog(dialogOpt, pos, this);

  var self = this;
  var excelUpLoadBody = document.getElementById(name + "_ExcelUpLoadPopupBody");
  uploadSheet.MainTag = excelUpLoadBody;

  if (document.getElementById("textSepApply")) {
    var textSepApply = document.getElementById("textSepApply");
    textSepApply.onclick = function () {
      var selectOptsValue = document.getElementById(name + "_UploadTextSep").value;
      var dataRows = uploadSheet.getDataRows();
      var cols = self.getCols();
      var sheetCols = uploadSheet.getCols();
      var data = [];
      var tmpRow = {};
      var startCol = cols.indexOf("SEQ") === 0 ? 1 : 0;

      if (!uploadSheet.OrgLoadTextDataValue) uploadSheet.OrgLoadTextDataValue = [];
      for (var i = 0; i < dataRows.length; i++) {
        tmpRow = {};
        var sepContents = uploadSheet.OrgLoadTextDataValue[i] ? uploadSheet.OrgLoadTextDataValue[i].split(selectOptsValue) : (dataRows[i][sheetCols[startCol + 1]] && dataRows[i][sheetCols[startCol + 1]].split(selectOptsValue));
        if (!uploadSheet.OrgLoadTextDataValue[i]) uploadSheet.OrgLoadTextDataValue[i] = dataRows[i][sheetCols[startCol + 1]];
        for (var j = startCol + 1; j < sheetCols.length; j++) {
          if (j != startCol + 1) uploadSheet.showCol(sheetCols[j]);
          else {
            uploadSheet.Cols[sheetCols[j]].Width = 150;
            uploadSheet.Cols[sheetCols[j]].RelWidth = 0;
          }
          tmpRow[sheetCols[j]] = sepContents[j - 1];
        }
        data.push(tmpRow);
      }
      if (data && data.length) {
        for (var i = 0; i < data.length; i++) {
          data[i]["chkBool"] = (i < sheetHeaderRows.length) ? 0 : 1
        }
      }
      uploadSheet.textSepApply = true;
      uploadSheet.loadSearchData({ data: data });
    }
  }

  var btnUpload = document.getElementById(name + "_ExcuteExcelUpLoad");
  btnUpload.onclick = function () {
    var chkRows = uploadSheet.getRowsByChecked("chkBool");
    if (chkRows && chkRows.length === 0) {
      uploadSheet.showMessageTime("로드할 행을 선택해주세요.");
      return uploadSheet.selectCol("chkBool", 1);
    }

    var data = { data: [] };
    var hr = uploadSheet.Rows.HeadRow;
    var cols = uploadSheet.getCols("Visible");
    for (var i = 0; i < chkRows.length; i++) {
      for (var j = 0; j < cols.length; j++) {
        if (!data.data[i]) data.data[i] = { Added: 1 };
        if (cols[j] != "SEQ" && cols[j] != "chkBool" && chkRows[i][cols[j]] != null) {
          if (!hr[cols[j]]) data.data[i][hr[cols[j]]] = "";
          else {
            if(uploadSheet.Cols[cols[j]].MasterType == "Date" && typeof chkRows[i][cols[j]] == 'number') {
              var stringToDateFormat = "yyyyMMddHHmmss"; 
              var chkRowsVal = chkRows[i][cols[j]] + ""; 
              var stringToDateFormatMap = { 12: "yyyyMMddHHmm", 10: "yyyyMMddHH", 8: "yyyyMMdd" };
              stringToDateFormat = stringToDateFormatMap[chkRowsVal.length] || stringToDateFormat;
              var chkRowsValJSDate = _IBSheet.stringToDate(chkRowsVal, stringToDateFormat);
              var uploadDataFormat = uploadSheet.ParentSheet.Cols[hr[cols[j]]].DataFormat || uploadSheet.ParentSheet.Cols[hr[cols[j]]].Format || "yyyy/mm/dd";
              chkRows[i][cols[j]] = _IBSheet.dateToString(chkRowsValJSDate, uploadDataFormat);
            }

            data.data[i][hr[cols[j]]] = "" + chkRows[i][cols[j]];
          }
        } else {
          data.data[i][hr[cols[j]]] = "";
        }
        if (chkRows[i][cols[j] + "Color"] === "#FFFF00") {
          uploadSheet.showMessageTime("현재 오류건(노란색)이 있습니다. 노란색으로 표시된 부분을 확인 후 삭제 및 수정하시거나 파일을 다시 수정 후 등록하시기 바랍니다.");
          return uploadSheet.startEdit(chkRows[i], cols[j]);
        }
      }
    }

    self.loadSearchData(data);
    uploadSheet.dispose();
    self.closeDialog();
  }

  var btnCancel = document.getElementById(name + "_CancelExcelUpLoad");
  btnCancel.onclick = function () {
    uploadSheet.dispose();
    self.closeDialog();
  }

  var btnAdd = document.getElementById("add_Btn");
  btnAdd.onclick = function () {
    uploadSheet.addRow({ "init": { "chkBool": 0 } });
  }

  var btnDelete = document.getElementById("delete_Btn");
  btnDelete.onclick = function () {
    var chkRows = uploadSheet.getRowsByChecked("chkBool");
    if (chkRows.length == 0) {
      uploadSheet.showMessageTime("삭제할 행을 선택해주세요");
    } else {
      for (var i = 0; i < chkRows.length; i++) {
        uploadSheet.removeRow({ row: chkRows[i] });
      }
    }
  }

  var btnRule = document.getElementById("rule_Btn");
  btnRule.onclick = function () {
    var dialogRule = document.getElementById(name + "dialogRule");
    if (dialogRule.style.display === "none") {
      dialogRule.style.display = "block";
    } else {
      dialogRule.style.display = "none";
    }
  }

  if(sheetData){
    var uploadSheetName = document.getElementById("excelUploadSheet_sheet_UploadSheetName");
    var dialogSheet = uploadSheet; 
    uploadSheetName.onchange = function(){
          dialogSheet.loadSearchData(sheetData[this.value]);
    }
  }
};

Fn.parseFullLoadData = function(data, opt) {
    var replaceEntities = function(v) {
        if (v.indexOf('&#') >= 0) {
            var A = v.match(/\&\#x\w*\;/gi);
            if (A) for (var i = 0; i < A.length; i++) v = v.replace(A[i], String.fromCharCode(parseInt(A[i].slice(3), 16)));
            var A = v.match(/\&\#\w*\;/gi);
            if (A) for (var i = 0; i < A.length; i++) v = v.replace(A[i], String.fromCharCode(parseInt(A[i].slice(2), 10)));
        }
        return v.replace(/\&lt\;/g, "<").replace(/\&gt\;/g, ">").replace(/\&quot\;/g, "\"").replace(/\&apos\;/g, "'").replace(/\&amp\;/g, "&");
    };

    if (data) {
        try {
            data = replaceEntities(data);
            data = JSON.parse(data.replace(/\n/g, "\\\\n").replace(/\r/g, "\\\\r").replace(/\t/g, "\\\\t").replace(/\u0000/g,""));

            var name = typeof name == "string" ? name : ("excelUploadSheet_" + this.id);
            
            if (data) {
                var colCount = 20;
                for(var j = 0; j < data["sheetData"].length; j++){
                    if(j == 0) colCount = data["sheetData"][0].maxCol;
                    else if(data["sheetData"][j].maxCol > data["sheetData"][j-1].maxCol) colCount = data["sheetData"][j].maxCol;
                }
                if(colCount > this.getCols()) colCount = colCount - this.getCols().length;

                this.initImportSheet(data["fileType"], Math.abs(700), Math.abs(500), name, Math.abs(colCount), data);
            } else this.ShowAlert(this.GetAlert("LoadExcelError"), "U");
        } catch (e) {
            this.ShowAlert(this.GetAlert("LoadExcelError"), "U");              
        }
    } else {
        this.ShowAlert(this.GetAlert("LoadExcelError"), "U");
    }
};
/*
  엑셀 다운로드 다이얼로그
  showExcelDownloadDialog 호출 시 엑셀 다운로드 다이얼로그를 생성 후 화면에 띄운다.
  다운로드 다이얼로그 인자 추가 - downParams
*/
Fn.showExcelDownloadDialog = function (width, height, name, rowchk, title, downParams) {
  /* step 1 start
   * 현재 시트가 사용 불가능이거나 편집종료되지 못하는 경우 띄우지 않는다.
   */
  if (this.endEdit(true) == -1) return;
  /* step 1 end */

  // 스타일이 중복 되었을때 스타일을 제거한다.
  if (this._stylesExcelDownloadDialog && this._stylesExcelDownloadDialog.parentNode) {
    this._stylesExcelDownloadDialog.parentNode.removeChild(this._stylesExcelDownloadDialog);
    delete this._stylesExcelDownloadDialog;
  }

  var classDlg = "ExcelDownLoadPopup";
  var themePrefix = this.Style;

  if (typeof width == "object") {
    var downTemp = width;
    if (downTemp.width != null) width = downTemp.width;
    if (downTemp.height != null) height = downTemp.height;
    if (downTemp.name != null) name = downTemp.name;
    if (downTemp.rowchk != null) rowchk = downTemp.rowchk;
    if (downTemp.title != null) title = downTemp.title;
    if (downTemp.titleText != null) titleText = downTemp.titleText;
    if (downTemp.userMerge != null) userMerge = downTemp.userMerge;
    if (downTemp.downParams != null) downParams = downTemp.downParams;
  }

  width = typeof width == "number" ? width : 700;
  height = typeof height == "number" ? height : 400;
  name = typeof name == "string" ? name : ("excelDownloadSheet_" + this.id);
  rowchk = typeof rowchk == "number" ? rowchk : 1;
  title = typeof title == "string" ? title : "파일 다운로드";
  // downParma.fileName 인자가 있을 때 다이얼로그에 보여지는 fileName 처리
  if (downParams && downParams.fileName) {
    var fileName = downParams.fileName;
  } else {
    var fileName = _IBSheet.dateToString(new Date(), "yyyy-MM-dd HH:mm") + "_" + (this.Name ? this.Name : this.id);
  }

  var styles = document.createElement("style");
  styles.innerHTML = '.' + themePrefix + classDlg + 'Outer {' +
    '  padding: 5px ;' +
    '  border: 3px solid #37acff;' +
    '  padding-left: 50px; padding-right: 50px' +
    '} ' +
    '.' + themePrefix + classDlg + 'Body .' + themePrefix + classDlg + 'Title {' +
    '  width:100%;height:30px;margin-bottom:2px;border-top:1px solid #C3C3C3;padding-top:10px;' +
    '} ' +
    '.' + themePrefix + classDlg + 'Body .' + themePrefix + classDlg + 'Title > div:last-child > div {' +
    '  float:left!important;width:50%;' +
    '} ' +
    '.' + themePrefix + classDlg + 'Body .' + themePrefix + classDlg + 'Title > div:last-child > div:first-child > label {' +
    '  text-align:left !important;font-size:16px;color:#444444;font-family:"NotoSans_Bold"; font-weight:600;' +
    '} ' +
    '.' + themePrefix + classDlg + 'Body .' + themePrefix + classDlg + 'Foot {' +
    '  width:100%;' +
    '  margin-top:10px;' +
    '} ' +
    '.' + themePrefix + classDlg + 'Foot ul li {' +
    '  list-style-type : none;' +
    '  height : 32px;' +
    '} ' +
    '.' + themePrefix + classDlg + 'Foot label {' +
    '  color : #666666;' +
    '} ' +
    '.' + themePrefix + classDlg + 'Close {' +
    '  background-color: black;' +
    '  width: 17px;' +
    '  height: 17px;' +
    '} ' +
    '.' + themePrefix + classDlg + 'Head, .' + themePrefix + classDlg + 'Foot {' +
    '  background-color:white;' +
    '} ' +
    '.' + themePrefix + classDlg + 'Head .' + themePrefix + classDlg + 'HeadText >div:last-child {' +
    '  text-align: center;' +
    '  color: black;' +
    '  font-size: 25px;' +
    '  margin-bottom: 5px;' +
    '  font-weight: 600;' +
    '  height:35px;' +
    '  line-height: normal;' +
    '} ' +
    '.' + themePrefix + classDlg + 'Btns {' +
    '  text-align:center;' +
    '} ' +
    '.' + themePrefix + classDlg + 'Btns > button {' +
    '  color: #fff;' +
    '  font-family: "NotoSans_Medium";' +
    '  font-size: 18px;' +
    '  display: inline-block;' +
    '  text-align: center;' +
    '  vertical-align: middle;' +
    '  border-radius: 3px;' +
    '  background-color: #37acff;' +
    '  border: 1px solid #37acff;' +
    '  padding: 5px;' +
    '  margin-left: 2px;' +
    '  cursor: pointer;' +
    '}';

  document.body.appendChild(styles);

  this._stylesExcelDownloadDialog = styles;

  /* step 2 start
   * 임시로 다운로드 시트가 들어갈 div 생성(생성된 다이얼로그로 아래에서 옮김).
   */
  var tmpSheetTag = document.createElement("div");
  tmpSheetTag.className = "SheetTmpTag";
  tmpSheetTag.style.width = "300px";
  tmpSheetTag.style.height = "100px";
  document.body.appendChild(tmpSheetTag);
  /* step 2 end */

  /* step 3 start
   * 띄워져있는 다이얼로그나 팁을 제거. */
  this.closeDialog();
  this.hideTip();
  /* step 3 end */

  /* step 4 start
   * 다운로드 시트에 대한 옵션 설정(다운로드 시트를 띄운 시트의 옵션을 따라간다.) 및 다운로드 시트 생성
   */
  var opts = this.getUserOptions(1);
  // 시트의 이벤트를 그대로 가져오므로, 이벤트를 삭제 합니다.
  delete opts.Events;

  if (opts.Cfg && opts.Cfg.UsePivot) opts.Cfg.UsePivot = false;
  if (this.InfoRow && this.InfoRow.Visible) {
    if (opts.Cfg) {
      opts.Cfg.InfoRowConfig.Visible = false;
    }
  }

  //부모의 CanEdit가 0이나 3일때
  if (opts.Cfg.CanEdit === 0 || opts.Cfg.CanEdit === 3) {
    opts.Cfg.CanEdit = 1;
    opts.Def = opts.Def || {};
    opts.Def.Col = opts.Def.Col || {};
    opts.Def.Col.CanEdit = 0;
  }

  // 시트에 Foot과 Solid가 존재하면 제거합니다.
  if (opts.Foot) delete opts.Foot;
  if (opts.Solid) delete opts.Solid;

  if (!opts.Head) opts.Head = [];
  opts.Head.push({
    "id": "downCheckHeader",
    "Kind": "Header",
    "CanEdit": true,
    "RowMerge": false
  });

  // MultiRecord 사용하는 시트에서 엑셀 다운로드 다이얼로그를 사용 할 수 있도록 기능개선
  if (opts.Cfg.MultiRecord == 1) {
    delete opts.Cfg.MultiRecord;
    var tmpCols = opts.Cols;
    opts.Cols = new Array();
    for (var i = 0; i < tmpCols.length; i++) {
      var colsLen = tmpCols[i].length * i;
      for (var j = 0; j < tmpCols[i].length; j++) {
        opts.Cols[j + colsLen] = new Array();
        opts.Cols[j + colsLen] = tmpCols[i][j];
      }
    }
  }

  var self = this;
  var chkHeader = [];
  // rowchk 이 있을 경우 동작되는 작업들.
  if (rowchk) {
    var headerRows = self.getHeaderRows();
    opts.LeftCols = (opts.LeftCols != null) ? opts.LeftCols : [];
    for (var i = 0, j = headerRows; i < j.length; i++) {
      chkHeader[i] = {
        Value: "체크",
        HeaderCheck: 1
      }
    }
    // 다이얼로그 전용 컬럼. LeftCols 가장 앞에 넣는다.
    opts.LeftCols.unshift({
      Header: chkHeader,
      Type: "Bool",
      Name: "chkBool",
      Visible: 1,
      CanEmpty: 3,
      CanEdit: 1,
      ColMerge: 0,
      Align: "Center",
      VAlign: "Middle"
    });

    opts.Head[opts.Head.length - 1].chkBool = "";

    // downParams.downRows 인자를 사용할 때 chkBool 처리
    if (downParams && downParams.downRows) {
      var chkrows = "|" + downParams.downRows + "|";
    } else {
      var chkrows = "|";
      for (var i = 0, j = self.getDataRows(); i < j.length; i++) {
        chkrows = chkrows + i + "|";
      }
    }

    opts.Events = {
      onDataLoad: function (evtParams) {
        for (var i = 0, j = self.getDataRows(), k = evtParams.sheet.getDataRows(); i < j.length; i++) {
          if (chkrows.indexOf("|" + i + "|") != -1) {
            k[i].chkBool = k[i].Visible = j[i].Visible;
          } else {
            k[i].chkBool = 0;
          }
        }
        evtParams.sheet.syncHeaderCheck();
      }
    }
  }

  // downParams.downCols 인자와 다이얼로그 헤더체크 처리
  // LeftCols, RightCols 에 대한 대응.
  var sec = ["LeftCols", "Cols", "RightCols"];
  if (!downParams || (downParams && downParams.downCols == "Visible")) {
    var chkcols = "|";
    for (var s = 0; s < sec.length; s++) {
      if (opts[sec[s]]) {
        for (var i = 0; i < opts[sec[s]].length; i++) {
          if (sec[s] == "LeftCols" && opts[sec[s]][i] && opts[sec[s]][i].Name == "chkBool") continue;
          chkcols = chkcols + opts[sec[s]][i].Name + "|";
        }
      }
    }
  } else if (downParams && downParams.downCols) {
    var chkcols = "|" + downParams.downCols + "|";
  }

  var C = this.Cols;

  for (var s = 0; s < sec.length; s++) {
    if (opts[sec[s]]) {
      opts[sec[s]].forEach(function (col) {
        if (sec[s] == "LeftCols" && col && col.Name == "chkBool") return;
        delete col.Required;
        delete col.FormulaRow;
        delete col.RelWidth;
        col.Visible = 1;

        if (downParams && downParams.downCols == "Visible" && C[col.Name] && !C[col.Name].Visible) col.Visible = 0;
        opts.Head[opts.Head.length - 1][col.Name] = {
          Type: "Bool",
          Value: (chkcols.indexOf("|" + col.Name + "|") != -1 && C[col.Name] && C[col.Name].CanExport) ? 1 : 0,
          CanEdit: C[col.Name] && C[col.Name].CanExport ? true : false
        };
      });
    }
  }

  opts.Head[opts.Head.length - 1].SEQ = "선택";

  var DownSheet = _IBSheet.create(name, tmpSheetTag, opts, self.deepCopyRows());
  /* step 4 end */

  /* step 5 start
   * 다운로드 시트가 띄워질 다이얼로그 창에 대한 설정 및 다이얼로그 생성
   */
  var dialogOpt = {},
    pos = {};
  this.initPopupDialog(dialogOpt, pos, DownSheet, {
    cssClass: classDlg
  });

  dialogOpt.Head = "<div>" + title + "</div>";
  dialogOpt.Foot = "<div class='" + themePrefix + classDlg + "Btns'>" +
    "  <button id='" + name + "_ExcuteExcelDownLoad'>다운로드</button>" +
    "  <button id='" + name + "_CancelExcelDownLoad'>취소</button>" +
    "</div>";
  dialogOpt.Body = "<div class='" + themePrefix + classDlg + "Title' ><div></div>" +
    "  <div>" +
    "    <div><label >데이터 미리보기</label></div>" +
    "    <div style='text-align:right;'>" +
    "      <!--<label for='" + name + "_DownloadSelectSave' style='display:inline-block'>다운로드 항목 저장</label>" +
    "      <input type='checkbox' id='" + name + "_DownloadSelectSave' name='DownloadSelectSave' style='display:inline-block'> -->" +
    "    </div>" +
    "  </div>" +
    "</div>" +
    "<div id='" + name + "_ExcelDownPopupBody' style='width:" + width + "px;height:" + height + "px;overflow:hidden;'></div>" +
    "<div class='" + themePrefix + classDlg + "Foot'>" +
    "  <div>" +
    "    <ul class=''>" +
    "      <li>" +
    "        <span>" +
    "          <input type='radio' id='" + name + "_DownloadExcel' name='DownloadType' value='1' checked='checked' style='margin-left:0px;'>" +
    "          <label for='" + name + "_DownloadExcel'>엑셀파일 다운로드</label>" +
    "        </span>" +
    "        <span>" +
    "          <input type='radio' id='" + name + "_DownloadText' name='DownloadType' value='2'>" +
    "          <label for='" + name + "_DownloadText'>텍스트파일 다운로드</label>" +
    "        </span>" +
    "        <span style='margin-left: 15px;display:none'>" +
    "          <label for='" + name + "_DownloadTextSep'>구분자 설정</label>" +
    "          <select id='" + name + "_DownloadTextSep'>" +
    "            <option value=','>,</option>" +
    "            <option value='\t' selected>Tab</option>" +
    "            <option value='|'>|</option>" +
    "            <option value='.'>.</option>" +
    "            <option value=' '>Space</option>" +
    "          </select>" +
    "        </span>" +
    "      </li>" +
    "      <li>" +
    "        <span style='height:65px;display:inline'>" +
    "          <label for='" + name + "_DownloadFileName' style='display:inherit;font-size:15px;font-family:'NotoSans_Bold''>파일 명</label>" +
    "          <input type='text' id='" + name + "_DownloadFileName' name='DownloadFileName' style='display:inherit;margin-left: 3px;font-size:15px;width:75%;text-align:left;height:25px' value='" + fileName + "'>" +
    "        </span>" +
    "      </li>" +
    "    </ul>" +
    "  </div>" +
    "</div>";

  dialogOpt = _IBSheet.showDialog(dialogOpt, pos, this);
  /* step 5 end */

  /* step 6 start
   * 다이얼로그 창의 Body에 다운로드 시트를 옮김
   */
  var ExcelDownDlgBody = document.getElementById(name + "_ExcelDownPopupBody");
  ExcelDownDlgBody.innerHTML = "";
  for (var elem = tmpSheetTag.firstChild; elem; elem = tmpSheetTag.firstChild) ExcelDownDlgBody.appendChild(elem);
  DownSheet.MainTag = ExcelDownDlgBody;
  tmpSheetTag.parentNode.removeChild(tmpSheetTag);
  /* step 6 end */

  /* step 7 start
   * 버튼 클릭시 및 다이얼로그의 시트가 아닌 부분을 클릭했을 때
   */
  var btnDownload = document.getElementById(name + "_ExcuteExcelDownLoad");
  var btnCancel = document.getElementById(name + "_CancelExcelDownLoad");
  var myArea = DownSheet.getElementsByClassName(dialogOpt.Tag, themePrefix + classDlg + "HeadText")[0];

  myArea.onclick = function () {
    if (self.ARow == null) {
      DownSheet.blur();
    }
  }

  var myArea2 = DownSheet.getElementsByClassName(dialogOpt.Tag, themePrefix + classDlg + "Foot")[0]
  myArea2.onclick = function () {
    if (self.ARow == null) {
      DownSheet.blur();
    }
  }

  var txtSep = document.getElementById(name + "_DownloadTextSep");

  btnDownload.onclick = function () {
    var fileName = document.getElementById(name + "_DownloadFileName").value ? document.getElementById(name + "_DownloadFileName").value : "sheet";
    var checkHeader = DownSheet.getRowById("downCheckHeader");
    var cols = DownSheet.getCols();
    var str = cols.filter(function (col) {
      return col === 'SEQ' ? DownSheet.Cols[col].Visible : !(checkHeader[col + "Visible"] == 0 || checkHeader[col + "Type"] != "Bool") && checkHeader[col] === 1 && DownSheet.getAttribute(null, col, "Visible")
    });
    var rows = [];
    var rowStr = "";

    if (rowchk) {
      for (var i = 0, j = cols; i < j.length; i++) {
        if (j[i] == "chkBool") {
          rows = DownSheet.getRowsByChecked("chkBool");
          rowStr = (rows.length == 0) ? "|" : "";
          break;
        }
      }

      for (var i = 0, j = rows; i < j.length; i++) {
        rowStr = rowStr.concat(DownSheet.getRowIndex(j[i]), "|");
      }
    }

    if (document.getElementById(name + "_DownloadExcel").checked) {
      try {
        if (fileName.lastIndexOf(".") > -1) {
          var ext = fileName.substring(fileName.lastIndexOf("."));
          if (ext == ".xls") {
            fileName += "x";
          } else if (ext != ".xlsx") {
            fileName += ".xlsx";
          }
        } else {
          fileName += ".xlsx";
        }

        // downParams 인자로 다이얼로그에서 down2Excel의 옵션 사용할 수 있도록 수정
        var paramObj = {
          sheetDesign: 1
        };
        paramObj = IBSheet.__.extend(downParams ? downParams : paramObj, {
          fileName: fileName,
          downRows: rowStr,
          downCols: str.join("|"),
        });

        self.down2Excel(paramObj);
      } catch (e) {
        if (e.message.indexOf("down2Excel is not a function") > -1) {
          console.log("%c 경고", "color:#FF0000", " : ibsheet-excel.js 파일이 필요합니다.");
        }
      }
    } else {
      try {
        self.down2Text({
          fileName: fileName,
          downRows: rowStr,
          downCols: str.join("\|"),
          colDelim: txtSep.value
        });
      } catch (e) {
        if (e.message.indexOf("down2Text is not a function") > -1) {
          console.log("%c 경고", "color:#FF0000", " : ibsheet-excel.js 파일이 필요합니다.");
        }
      }
    }

    DownSheet.dispose();
    self.closeDialog();

    // 버튼을 닫을때 스타일을 제거한다.
    if (styles && styles.parentNode) {
      styles.parentNode.removeChild(styles);
      delete self._stylesExcelDownloadDialog;
    }
  }
  btnCancel.onclick = function () {
    DownSheet.dispose();
    self.closeDialog();
    // 버튼을 닫을때 스타일을 제거한다.
    if (styles && styles.parentNode) {
      styles.parentNode.removeChild(styles);
      delete self._stylesExcelDownloadDialog;
    }
  }
  /* step 7 end */

  //var txtBtn = document.getElementById(name + "_DownloadText");
  var txtBtn = document.getElementsByName("DownloadType");

  for (var i = 0; i < txtBtn.length; i++) {
    txtBtn[i].onclick = function (ev) {
      if (ev.srcElement.value == "2") {
        txtSep.parentNode.style.display = "inline-block";
      } else {
        txtSep.parentNode.style.display = "none";
      }
    }
  }

  _IBSheet.Focused = DownSheet;
};

// showDownloadDialog로도 호출 가능하게끔 수정.
Fn.showDownloadDialog = Fn.showExcelDownloadDialog;

/*
  엑셀 업로드 다이얼로그
  showUploadDialog 호출 시 엑셀 업로드 다이얼로그를 생성 후 화면에 띄움.
*/
Fn.showUploadDialog = function (uploadType, width, height, name, colCount) {
  var minWidth = 700;
  var minHeight = 400;
  var count = 20;

  if (!uploadType) return false;

  if (this.endEdit(true) == -1) {
    return;
  }

  if (typeof uploadType == "object") {
    var uploadTemp = uploadType;
    if (uploadTemp.uploadType != null) uploadType = uploadTemp.uploadType;
    if (uploadTemp.width != null) width = uploadTemp.width;
    if (uploadTemp.height != null) height = uploadTemp.height;
    if (uploadTemp.name != null) name = uploadTemp.name;
    if (uploadTemp.colCount != null) colCount = uploadTemp.colCount;
  }

  width = parseInt(width);
  if (!width) width = minWidth;
  else if (width < minWidth) width = minWidth;
  height = parseInt(height);
  if (!height) height = minHeight;
  else if (height < minHeight) height = minHeight;
  name = typeof name == "string" ? name : ("excelUploadSheet_" + this.id);
  colCount = parseInt(colCount);
  if (!colCount) colCount = count;

  this.initImportSheet(uploadType, Math.abs(width), Math.abs(height), name, Math.abs(colCount));
};

/*
 * 시트내 찾기 Ctrl+Shift+F
 * 다이얼로그 기능
 */
Fn.findDlgFunc = function (work, evt) {
  var match = document.getElementById(this.id + "_ContentMatchChk").checked;
  var rvalue = document.getElementById(this.id + "_ReplaceTxt").value;
  var frow = this.getFocusedRow();
  var fcol = this.getFocusedCol();
  var fvalue = this.getString(frow, fcol);
  var param = {
    action: (work === "FindKeyUp" || work === "Replace" || work === "ReplaceKeyUp") ? "Find" : work,
    match: match,
    callback: function () {
      afterFindingToDo(this);
    }
  };

  function afterFindingToDo (ibsheet) {
    //검색 된 행/건수 표시
    window[ibsheet.id + "_FindDlg"].Tag.getElementsByTagName("span")[0].innerText = ibsheet.SearchCount ? ibsheet.SearchCount + "건을 찾았습니다." : "";
    //클릭 객체에게 다시 포커스 부여
    evt.srcElement.focus();
    _IBSheet.Focused = null;
    delete ibsheet.SearchMethod;
  }

  // findRows 에 연산을 사용하지 않음. 연산사용하고 싶을시 주석.
  this.SearchMethod = 3;
  this["SearchValueMatch"] = document.getElementById(this.id + "_ContentMatchChk").checked || false;
  this.SearchExpression = document.getElementById(this.id + "_FindTxt").value;
  this.SearchCols = document.getElementById(this.id + "_SelectColChk").value;

  //ESC 클릭시 닫기
  if (work == "outKeyUp") {
    if (evt.keyCode == 27) {
      window[this.id + "_FindDlg"].Close();
    }
    return;
  }

  switch (work) {
    case "Find": //검색
    case "FindPrev": //이전 검색
      if (!this.SearchExpression) {
        alert("검색어를 입력해주세요.");
        document.getElementById(this.id + "_FindTxt").focus();
        return;
      }
    case "Mark": //강조
    case "Select": //선택
      if (!this.SearchExpression) {
        alert("검색어를 입력해주세요.");
        document.getElementById(this.id + "_FindTxt").focus();
        return;
      }
    case "Clear": //취소
      this.findRows(param);
      break;
    case "FindKeyUp": //검색 창 입력
      if (evt.keyCode == 13) {
        if (!this.SearchExpression) {
          alert("검색어를 입력해주세요.");
          document.getElementById(this.id + "_FindTxt").focus();
          return;
        }
        this.findRows(param);
      }
      break;
    case "ChgCaseSense": //대소문자 구분
      //시트 생성시 cfg에 설정한 대소문자 구분 설정을 기억해 둔다.
      this.SearchCaseSensitiveOld = this.SearchCaseSensitive;
      if (evt.srcElement.checked) {
        this.SearchCaseSensitive = 1;
      } else {
        this.SearchCaseSensitive = 0;
      }
      break;
    case "ReplaceKeyUp": //검색 창 입력
      if (evt.keyCode !== 13) {
        delete this.SearchMethod;
        return;
      }
    case "Replace":
      var flag = true;
      var tmp = "";

      if (this.SearchExpression === "") {
        alert("검색어를 입력해주세요.");
        document.getElementById(this.id + "_FindTxt").focus();
        delete this.SearchMethod;
        return;
      }

      if (match) {
        if (fvalue === this.SearchExpression) {
          flag = false;
          tmp = fvalue.sheet_dialog_replaceAll(this.SearchExpression, rvalue);
          if (!this.setString(frow, fcol, tmp, true, true)) {
            alert("바꿀 내용을 정확하게 입력해주세요.");
            return;
          }
        }
      } else {
        if (fvalue.indexOf(this.SearchExpression) > -1) {
          flag = false;
          tmp = fvalue.sheet_dialog_replaceAll(this.SearchExpression, rvalue);
          if (!this.setString(frow, fcol, tmp, true, true)) {
            alert("바꿀 내용을 정확하게 입력해주세요.");
            return;
          }
        }
      }

      if (flag) {
        this.findRows(param);
        frow = this.getFocusedRow();
        fcol = this.getFocusedCol();
        fvalue = this.getString(frow, fcol) || temp;
        if (match) {
          if (fvalue === this.SearchExpression) {
            flag = false;
            tmp = fvalue.sheet_dialog_replaceAll(this.SearchExpression, rvalue);
            if (!this.setString(frow, fcol, tmp, true, true)) {
              alert("바꿀 내용을 정확하게 입력해주세요.");
              return;
            }
          }
        } else {
          if (fvalue.indexOf(this.SearchExpression) > -1) {
            flag = false;
            tmp = fvalue.sheet_dialog_replaceAll(this.SearchExpression, rvalue);
            if (!this.setString(frow, fcol, tmp, true, true)) {
              alert("바꿀 내용을 정확하게 입력해주세요.");
              return;
            }
          }
        }
      }

      if (!flag) {
        var T = this;
        setTimeout(function() {
          T.findRows(param);
        }, 10);
      }

      break;
    case "ReplaceAll":
      var r = this.getFirstVisibleRow();
      var cols = this.SearchCols ? [this.SearchCols] : this.getCols("Visible");
      var nomatch = true;
      var c, rc, tmp, count = 0;

      if (this.SearchExpression === "") {
        alert("검색어를 입력해주세요.");
        document.getElementById(this.id + "_FindTxt").focus();
        delete this.SearchMethod;
        return;
      }

      while (r) {
        for (var i = 0; i < cols.length; i++) {
          c = cols[i];
          rc = this.getString(r, c);

          if (match) {
            if (rc === this.SearchExpression) {
              if (nomatch) nomatch = false;
              tmp = rc.sheet_dialog_replaceAll(this.SearchExpression, rvalue);
              if (this.setString(r, c, tmp, 0, true)) count++;
            }
          } else {
            if (rc.indexOf(this.SearchExpression) > -1) {
              if (nomatch) nomatch = false;
              tmp = rc.sheet_dialog_replaceAll(this.SearchExpression, rvalue);
              if (this.setString(r, c, tmp, 0, true)) count++;
            }
          }
        }
        r = this.getNextVisibleRow(r);
      }
      if (nomatch) {
        alert("일치하는 것이 없습니다.");
        delete this.SearchMethod;
        return;
      } else {
        alert(count + "건이 변경되었습니다.")
        this.renderBody();
      }
      break;
  }
};

Fn.findReplaceOpen = function (evt) {
  if (document.getElementById("sheet_edit_input_div").style.display !== "none") {
    evt.target.textContent = "＋";
    document.getElementById("sheet_edit_input_div").style.display = "none";
    document.getElementById("replace_sheet_dialog_btn").style.visibility = "hidden";
    document.getElementById("replace_all_sheet_dialog_btn").style.visibility = "hidden";
  } else {
    evt.target.textContent = "－";
    document.getElementById("sheet_edit_input_div").style.display = "";
    document.getElementById("replace_sheet_dialog_btn").style.visibility = "visible";
    document.getElementById("replace_all_sheet_dialog_btn").style.visibility = "visible";
  }
}

String.prototype.sheet_dialog_replaceAll = function(org, dest) {
	return this.split(org).join(dest);
};

Fn.showFindDialog = function () {
  if (this.getTotalRowCount() == 0) {
    this.showMessageTime("검색할 데이터가 없습니다.");
    return;
  }

  var sheetId = this.id;
  var dlgName = sheetId + "_FindDlg";
  var self = this;
  var checked1 = this.SearchCaseSensitive ? "checked" : "";
  var checked2 = this["SearchValueMatch"] ? "checked" : "";
  var vcols = this.getCols("Visible");
  var str = "<option value='' selected>전체 컬럼</option>";
  var hr = this.getHeaderRows();
  for (var i = 0; i < vcols.length; i++) {
    str += ("<option value=" + vcols[i] + ">" + hr[hr.length - 1][vcols[i]] + "</option>");
  }
  // 기존에 열린 창이 있는지 확인.
  if (window[dlgName]) return;

  var themePrefix = this.Style;
  var btnClass = themePrefix + "DialogButton";
  var DLGBODY = "<div class='" + themePrefix + "FindDlgTop' onkeyup='" + sheetId + ".findDlgFunc(\"outKeyUp\", event)'>" +
    "<div style='border-radius:3px;'><input type='text' style='border:0px;outline:none;' id='" + sheetId + "_FindTxt' onkeyup='" + sheetId + ".findDlgFunc(\"FindKeyUp\", event)' title='검색어 입력' placeholder='검색어 입력' autocomplete='off'/><span></span></div>" +
    "<div><button type='button' tabindex='-1' class='" + btnClass + "' onclick='" + sheetId + ".findDlgFunc(\"FindPrev\", event)' title='이전 찾기'>↑</button>" +
    "<button type='button' tabindex='-1' class='" + btnClass + "' onclick='" + sheetId + ".findDlgFunc( \"Find\", event)' title='다음 찾기'>↓</button><button type='button' tabindex='-1' class='" + btnClass + "' onclick='" + sheetId + ".findReplaceOpen(event)' title='바꾸기 기능'>＋</button></div></div>" +
    "<div class='" + themePrefix + "FindDlgTop' onkeyup='" + sheetId + ".findDlgFunc(\"outKeyUp\", event)'>" +
    "<div id='sheet_edit_input_div' style='display:none;margin-top:5px;border-radius:3px;'><input type='text' style='border:0px;outline:none;' id='" + sheetId + "_ReplaceTxt' onkeyup='" + sheetId + ".findDlgFunc(\"ReplaceKeyUp\", event)'  title='바꿀 내용 입력' placeholder='바꿀 내용 입력' autocomplete='off'/></div></div>" +
    "<div style='clear:both;'></div>" +
    "<div class='" + themePrefix + "FindDlgBottom'  onkeyup='" + sheetId + ".findDlgFunc(\"outKeyUp\", event)'><div class='" + themePrefix + "S_FIND_CASE' style='margin-bottom:10px;width:100%;'>" +
    "<input type='checkbox' id='" + sheetId + "_FindChk' " + checked1 + " onchange='" + sheetId + ".findDlgFunc(\"ChgCaseSense\", event)' /><label for='" + sheetId + "_FindChk'>대/소문자 구분</label>" +
    "<input type='checkbox' id='" + sheetId + "_ContentMatchChk' " + checked2 + " onchange='" + sheetId + ".findDlgFunc(\"ContentMatch\", event)' /><label for='" + sheetId + "_ContentMatchChk'>전체 셀 내용 일치</label>" +
    "</div>" +
    "<div class='" + themePrefix + "S_FIND_CASE' style='margin-bottom:10px;width:100%;'>" +
    "<label for='" + sheetId + "_SelectColChk' style='padding-left:3px;'>컬럼 선택</label>" +
    "<select id=" + sheetId + "_SelectColChk style='margin-left:6px;font-size:13px;height:25px;width:67%;outline:none;padding: 0 3px;border:1px solid #888;border-radius:3px;padding-right:24px;cursor:pointer;appearance:auto;background:none;'>" + str + "</select>" +
    "</div>" +
    "<div class='" + themePrefix + "S_FIND_BTN' style='padding-left: 18%;'>" +
    "<button id='replace_sheet_dialog_btn' type='button' style='visibility:hidden;background:cornflowerblue;' class='" + btnClass + "' onclick='" + sheetId + ".findDlgFunc(\"Replace\", event)'>바꾸기</button>" +
    "<button id='replace_all_sheet_dialog_btn' type='button' style='visibility:hidden;background:cornflowerblue;' class='" + btnClass + "' onclick='" + sheetId + ".findDlgFunc(\"ReplaceAll\", event)'>모두 바꾸기</button>" +
    "<button type='button' class='" + btnClass + "' onclick='" + sheetId + ".findDlgFunc(\"Mark\", event)' style='background:darkcyan;'>강조</button>" +
    "<button type='button' class='" + btnClass + "' onclick='" + sheetId + ".findDlgFunc(\"Select\", event)' style='background:darkcyan;'>선택</button>" +
    "<button type='button' class='" + btnClass + "' onclick='" + sheetId + ".findDlgFunc(\"Clear\", event)' style='background:darkcyan;'>해제</button></div><div style='clear:both;'></div></div>";
  var dlg = {
    "Head": "IBSheet 검색 / 바꾸기",
    "Body": DLGBODY,
    "Modal": false,
    "MinWidth": 310,
    "MinHeight": 300,
    "Shadow": false,
    "HeadDrag": true,
    "ZIndex": this.ZIndex ? (this.ZIndex + 20) : 270,
    "OnClose": function () {
      self.SearchExpression = window[dlgName].Tag.getElementsByTagName("input")[0].value;
      delete self.SearchMethod;
      _IBSheet.Focused = self;
      // 기존 창을 제거
      window[dlgName] = null;
    }
  };

  window[dlgName] = _IBSheet.showDialog(
    dlg,
    {
      Align: "center middle",
      Tag: (this.PivotSheet ? this.PivotSheet.MainTag : this.MainTag)
    }
  );
  if (this.SearchExpression) {
    window[dlgName].Tag.getElementsByTagName("input")[0].value = this.SearchExpression;
  }
  var T = this;
  setTimeout(function () {
    window[dlgName].Tag.getElementsByTagName("input")[0].focus();
    window[dlgName].Tag.getElementsByTagName("input")[0].select();
  }, 50);
  _IBSheet.Focused = null;
};

/* 피벗 다이얼로그 생성 정보 삭제 메소드 */
Fn.clearCurrentPivotInfo = function () {
  var key = this.getPivotStorageKey(),
    session = this["StorageSession"] || 0;

  if (window.ClearCache) ClearCache(key, session === 2 ? 1 : 0);
};

/* 피벗 시트에서 원래 시트로 돌릴때 사용하는 메소드(초기화) */
Fn.clearPivotSheet = function () {
  if (this.PivotMaster) {
    this.dispose();
    this.switchPivotSheet(0);
    IBSheet[this.PivotMaster].PivotSheet = null;
    IBSheet[this.PivotMaster].PivotDetail = null;
  }
};

/* 피벗 다이얼로그 삭제 메소드(키보드 사용) */
Fn.closePivotDialog = function (ev) {
  var closingSheet = this;
  if (ev.keyCode == 27) {
    for (var i = 0; i < Dialogs.length; i++) {
      if (Dialogs[i].PivotDialog) {
        this.beforePivotActiveElemen.focus();
        Dialogs[i].Close();
      }
    }
  }
};

/* 피벗 다이얼로그 생성 메소드 */
Fn.showPivotDialog = function (width, height, name, showType, pivotParams, useStorage) {
  
  // 스타일이 중복 되었을때 스타일을 제거한다.
  if (this._stylesPivotDialog && this._stylesPivotDialog.parentNode) {
    this._stylesPivotDialog.parentNode.removeChild(this._stylesPivotDialog);
    delete this._stylesPivotDialog;
  }

  this.endEdit();

  if (width && typeof width == "object") {
    var pivotTemp = width;
    if (pivotTemp.width != null) width = pivotTemp.width;
    if (pivotTemp.height != null) height = pivotTemp.height;
    if (pivotTemp.name != null) name = pivotTemp.name;
    if (pivotTemp.showType != null) showType = pivotTemp.showType;
    if (pivotTemp.pivotParams != null) pivotParams = pivotTemp.pivotParams;
    if (pivotTemp.useStorage != null) useStorage = pivotTemp.useStorage;
  }

  width = typeof width == "number" && width >= 500 ? width : 500;
  height = typeof height == "number" ? height : 500;
  name = typeof name == "string" ? name : ("pivotDialog_" + this.id);
  pivotParams = typeof pivotParams == "object" ? pivotParams : null;

  var pivotFormat,
    pivotType = "Sum",
    pivotCallback;

  if (pivotParams) {
    pivotFormat = pivotParams.format;
    pivotType = pivotParams.type || "Sum";
    pivotCallback = pivotParams.callback;
  }

  var saveInfo;
  if (!useStorage) {
    this.clearCurrentPivotInfo();
  } else {
    saveInfo = !!this.getCurrentPivotInfo();
    pivotType = saveInfo ? this.getCurrentPivotInfo()["pivotType"] : "Sum";
    width = width < 450 ? 450 : width;
  }

  var classDlg = "pivotPopup";
  var themePrefix = this.Style;
  var styles = document.createElement("style");
  styles.innerHTML = "" +
    ".box {  " +
    "  display:inline-block; " +
    "  border: 1px solid #586980; " +
    "  border-radius:2px;" +
    "  padding: 3px 8px 3px 8px; " +
    "  white-space: nowrap; " +
    "  margin-right: 5px; " +
    "  margin-left: 5px; " +
    "  margin-bottom: 5px; " +
    "  font-size: 12px; " +
    "  cursor: pointer; " +
    "  color: #586980; " +
    "  background-color: #FFFFFF; " +
    "} " +
    "." + name + "_table { " +
    "  display: block; " +
    "  float: left; " +
    "  width:calc(50% - 7px); " +
    "  height:100%; " +
    "  border:1px solid #c5c5c5; " +
    "} " +
    "." + name + "_btns { " +
    "  text-align:right; " +
    "  background-color: #e4f5fd; " +
    (showType ? "" : "  padding-top: 15px; ") +
    "} " +
    "." + name + "_btns > input { " +
    "  height: 13px; " +
    "  margin-right: 3px; " +
    "  vertical-align: middle " +
    "} " +
    "." + name + "_btns > label { " +
    "  margin-right: 3px; " +
    "} " +
    "." + name + "_btns > button { " +
    "  color: #fff; " +
    "  font-family: 'NotoSans_Medium'; " +
    "  font-size: 12px; " +
    "  display: inline-block; " +
    "  text-align: center; " +
    "  vertical-align: middle; " +
    "  border-radius: 3px; " +
    "  background-color: #37acff; " +
    "  border: 1px solid #37acff; " +
    "  padding: 5px; " +
    "  margin-left: 5px; " +
    "  cursor: pointer; " +
    "} " +
    "." + name + "_radios { " +
    "  text-align:left; " +
    "  background-color: #e4f5fd; " +
    "  padding-top: 15px; " +
    "  vertical-align: middle;" +
    "} " +
    "." + name + "_radios > input { " +
    "  height: 15px; " +
    "  margin-right: 12px; " +
    "  vertical-align: middle " +
    "} " +
    "." + name + "_radios > label { " +
    "  font-size: 12px; " +
    "  vertical-align: middle " +
    "} " +
    "." + name + "_table > div > div:first-child { " +
    "  text-align:center; " +
    "  background-color:#d9ecea; " +
    "  height: 30px; " +
    "  line-height: 30px; " +
    "  font-size: 15px; " +
    "} " +
    "." + themePrefix + classDlg + " { " +
    "  border:15px solid #e4f5fd; " +
    "  background-color:#e4f5fd; " +
    "} " +
    "." + themePrefix + classDlg + " > div:first-child { " +
    (showType ? "  height: 80% " : "  height: 90% ") +
    "} " +
    "." + themePrefix + classDlg + " > div:nth-child(2) { " +
    "  height: 10% " +
    "} " +
    (showType ?
      "." + themePrefix + classDlg + " > div:nth-child(3) { " +
      "  height: 10% " +
      "} " : "");

  document.body.appendChild(styles)

  this._stylesPivotDialog = styles;

  var dialogOpt = {};
  var Pos = {
    Align: "center middle",
    Tag: (this.PivotSheet ? (this.PivotSheet.MainTag.style.display === "" && this.MainTag.style.display == "none" ? this.PivotSheet.MainTag : this.MainTag) : this.MainTag),
  }

  dialogOpt.Modal = 1;
  dialogOpt.Head = "<div>피벗 테이블 설정</div>";

  var self = this;
  if (this.PivotMaster) {
    self = IBSheet[this.PivotMaster];
  }
  var pivotCols = self.producePivotColumn();
  var pivotTypes = self.producePivotTypes(this.PivotFunc || pivotType);

  var switchSheet = "";
  if(this.PivotSheet){
    if(IBSheet[this.PivotSheet.Index] && IBSheet[this.PivotSheet.Index].MainTag && self.PivotSheet.MainTag.style.display == "none") switchSheet = "<button id= " + name + "_switchToPivot>피벗시트보기</button>";
    else if(self.MainTag.style.display == "none") switchSheet = "<button id= " + name + "_switchToSheet>원본시트보기</button>";
  }
  

  dialogOpt.Body = "<div class='" + themePrefix + classDlg + "' style='width:" + width + "px;height:" + height + "px;' onmousedown='return false' onkeyup='" + this.id + ".closePivotDialog(event)' onmouseup='" + this.id + ".PivotDragMouseUp(event)' onmousemove='" + this.id + ".PivotDragMouseMove(event)'>" +
    "<div>" +
    "<div id='DragTags' style='left: 0px; top: 0px; width: 0px; height: 0px; visibility: visible;'></div>" +
    "<div class='" + name + "_table' >" +
    "<div style='height:50%'>" +
    "<div style='border-bottom: 1px solid #c5c5c5;'>대상 컬럼(일반)</div>" +
    "<div id='" + name + "_NomalCols' class='" + this.Style + "PivotStandards' style='overflow-y:auto; height:calc(100% - 45px);padding:7px;' onselectstart='return false;' onmouseup='" + this.id + ".PivotDragSetItem(this,event)' ontouchstart='return false'> " +
    pivotCols[0] +
    "</div>" +
    "</div>" +
    "<div style='height:50%'>" +
    "<div style='border-bottom: 1px solid #c5c5c5;border-top: 1px solid #c5c5c5;'>대상 컬럼(숫자형)</div>" +
    "<div id='" + name + "_NumberCols' class='" + this.Style + "PivotStandards' style='overflow-y:auto; height:calc(100% - 46px);padding:7px;' onselectstart='return false;' onmouseup='" + this.id + ".PivotDragSetItem(this,event)' ontouchstart='return false'> " +
    pivotCols[1] +
    "</div>" +
    "</div>" +
    "</div>" +
    "<div class='" + name + "_table' style='float:right'>" +
    "<div style='height:33%'>" +
    "<div style='border-bottom: 1px solid #c5c5c5;'>가로행 기준</div>" +
    "<div id='" + name + "_PivotRow' class='" + name + "_PivotStandards " + this.Style + "PivotStandards' style='height:calc(100% - 45px);padding:7px; overflow-y: auto;' onmouseup='" + this.id + ".PivotDragSetItem(this,event,1)'>" +
    (pivotCols[2] ? pivotCols[2] : "<i class='CellsInfo' style='color:gray;font-size:12px;'>이곳으로 대상 컬럼을 끌어놓으십시오.</i>") +
    "</div>" +
    "</div>" +
    "<div style='height:33%'>" +
    "<div style='border-bottom: 1px solid #c5c5c5;border-top: 1px solid #c5c5c5;'>세로행 기준</div>" +
    "<div id='" + name + "_PivotCol' class='" + name + "_PivotStandards " + this.Style + "PivotStandards' style='height:calc(100% - 46px);padding:7px; overflow-y: auto;' onmouseup='" + this.id + ".PivotDragSetItem(this,event,1)'>" +
    (pivotCols[3] ? pivotCols[3] : "<i class='CellsInfo' style='color:gray;font-size:12px;'>이곳으로 대상 컬럼을 끌어놓으십시오.</i>") +
    "</div>" +
    "</div>" +
    "<div style='height:34%'>" +
    "<div style='border-bottom: 1px solid #c5c5c5;border-top: 1px solid #c5c5c5;'>데이터 값</div>" +
    "<div id='" + name + "_PivotData' class='" + name + "_PivotStandards " + this.Style + "PivotStandards' style='height:calc(100% - 46px);padding:7px; overflow-y: auto;' onmouseup='" + this.id + ".PivotDragSetItem(this,event,2)'>" +
    (pivotCols[4] ? pivotCols[4] : "<i class='CellsInfo' style='color:gray;font-size:12px;'>이곳으로 대상 컬럼을 끌어놓으십시오.</i>") +
    "</div>" +
    "</div>" +
    "</div>" +
    "</div>" +
    (showType ? "<div class='" + name + "_radios'><i style='color:black;font-weight:200;font-size:15px;margin-right:15px;'>피벗 타입</i>" + pivotTypes + "</div>" : "") +
    "<div class='" + name + "_btns'>" +
      (useStorage ? "<label for=\'" + name + "_saveStorage\'><input type=\'checkbox\' id=\'" + name + "_saveStorage\'" + (saveInfo ? " checked " : "") + ">피벗 생성 정보 저장</label>" : "") +
      "<button id='" + name + "_clearPivotBtn'>초기화</button>" + switchSheet + "<button id='" + name + "_createPivotBtn'>피벗 테이블 생성</button><button id='" + name + "_cancelBtn'>취소</button></div>" +
    "</div>";

  var result = _IBSheet.showDialog(dialogOpt, Pos);
  result.PivotDialog = 1;
  result.Name = name;
  drag.dialogLeft = result.Tag.offsetLeft;
  drag.dialogTop = result.Tag.offsetTop;

  var btnCancel = document.getElementById(name + "_cancelBtn");
  var btnCreate = document.getElementById(name + "_createPivotBtn");
  var btnClear = document.getElementById(name + "_clearPivotBtn");
  var saveStorage = document.getElementById(name + "_saveStorage");
  var switchToPivot = document.getElementById(name + "_switchToPivot");
  var switchToSheet = document.getElementById(name + "_switchToSheet");
  
  if(switchToPivot){
    switchToPivot.onclick = function(){
      self.PivotSheet.switchPivotSheet(1);
      result.close();
    }
  }
  
  if(switchToSheet){
    switchToSheet.onclick = function(){
      self.PivotSheet.switchPivotSheet(0);
      result.close();
    }
  }

  btnCreate.onclick = function () {
    function findChildren(node) {
      var child = node.firstChild;
      var str = [];
      while (child) {
        if (child.tagName && child.tagName.toLowerCase() == "span") {
          str.push(child.firstChild.getAttribute("colname"));
        }

        child = child.nextSibling;
      }
      return str;
    }

    var targetPRow = findChildren(document.getElementById(name + "_PivotRow"));
    var targetPCol = findChildren(document.getElementById(name + "_PivotCol"));
    var targetPData = findChildren(document.getElementById(name + "_PivotData"));
    var cols = self.findPivotColumn();
    pivotType = showType ? document.querySelector("input[name='PivotTypes']:checked") && document.querySelector("input[name='PivotTypes']:checked").value : pivotType;

    if (useStorage && saveStorage && saveStorage.checked) {
      self.saveCurrentPivotInfo(targetPRow, targetPCol, targetPData, pivotType);
    } else if (useStorage && saveStorage && !saveStorage.checked) self.clearCurrentPivotInfo();

    if (cols.common.length === 0 || cols.number.length === 0) {
      alert("가능한 대상 컬럼이 없습니다.");
      return false;
    }
    if (targetPRow.length === 0 || targetPCol.length === 0 || targetPData.length === 0) {
      alert("피벗 설정이 완료되지 않았습니다.");
      return false;
    }

    setTimeout(function () {
      var criterias = {
        row: cols.common.reduce(function (arr, curVal) {
          arr.push(curVal.Name);
          return arr;
        }, []).join(","),
        col: cols.common.reduce(function (arr, curVal) {
          arr.push(curVal.Name);
          return arr;
        }, []).join(","),
        data: cols.number.reduce(function (arr, curVal) {
          arr.push(curVal.Name);
          return arr;
        }, []).join(",")
      }

      var init = {
        row: targetPRow.join(","),
        col: targetPCol.join(","),
        data: targetPData.join(",")
      }

      // 생성된 피벗 시트가 있는 경우 제거
      if (typeof window["pivotSheet_" + self.id] !== "undefined") {
        window["pivotSheet_" + self.id].dispose();
      }
      self.makePivotTable(criterias, init, pivotFormat, pivotType, pivotCallback);
    }, 10)
    result.Close();
  }

  var tmpSheet = this;
  btnClear.onclick = function () {
    setTimeout(function () {
      if (useStorage && saveStorage) self.clearCurrentPivotInfo();
      delete tmpSheet.PivotRows;
      delete tmpSheet.PivotCols;
      delete tmpSheet.PivotData;
      delete tmpSheet.PivotFunc;
      tmpSheet.PivotSheet && tmpSheet.PivotSheet.clearPivotSheet();
    }, 10)
    result.Close();
    // 버튼을 닫을때 스타일을 제거한다.
    if (styles && styles.parentNode) {
      styles.parentNode.removeChild(styles);
      delete self._stylesPivotDialog;
    }
  }

  btnCancel.onclick = function () {
    result.Close();
    // 버튼을 닫을때 스타일을 제거한다.
    if (styles && styles.parentNode) {
      styles.parentNode.removeChild(styles);
      delete self._stylesPivotDialog;
    }
  }
  this.beforePivotActiveElemen = document.activeElement;
  btnCreate.focus();
};

// showPivotDialog로도 호출 가능하게끔 수정
Fn.createPivotDialog = Fn.showPivotDialog;

/* 시트에서 피벗 다이얼로그에 사용될 컬럼 중 일반과 숫자형을 나눠서 반환 */
Fn.findPivotColumn = function () {
  var res = {};
  res.common = [];
  res.number = [];
  var header = this.getHeaderRows()[0];
  var cols = this.getCols().filter(function (col) {
    return col !== "SEQ";
  });
  // 230712 김상현 - 🛠기능개선: 헤더행이 두줄이상인 경우 상단 헤더타이틀만 버튼에 표시되는 문제 개선 (#55)
  for (var i = 0; i < cols.length; i++) {
    (this.Cols[cols[i]].Type == "Int" || this.Cols[cols[i]].Type == "Float") ? res.number.push({
      Name: cols[i],
      Value: this.getHeaderRows().filter(function(r){ return r.Visible}).map(function(r){ return r[cols[i]] }).join("/")
    }): res.common.push({
      Name: cols[i],
      Value: this.getHeaderRows().filter(function(r){ return r.Visible}).map(function(r){ return r[cols[i]] }).join("/")
    });
  }

  return res;
};

/* 피벗 다이얼로그 저장된 생성 정보 가져오는 메소드 */
Fn.getCurrentPivotInfo = function () {
  var key = this.getPivotStorageKey(),
    session = this["StorageSession"] || 0,
    val = null;

  if (session) {
    val = LoadCache(key, session === 2 ? 1 : 0);
    val = this.getCompressValue && this.getCompressValue(val, 1);
    if (val) val = JSON.parse(val);
  }

  return val;
};

/* 피벗 다이얼로그 생성 정보 저장시 사용할 키를 가져오는 메소드 */
Fn.getPivotStorageKey = function() {
  return (this["StorageKeyPrefix"] || location.href) + "^pivot" + this.id;
};

/* 드래그된 아이템이 일반이냐 숫자형이냐에 따라 가로행 기준, 세로행 기준, 데이터 값에 들어갈 수 있는지 유무를 판별한다. */
Fn.PivotDragExactTarget = function (target, group) {
  return group.filter(function (col) {
    return target.indexOf(col.Name) > -1
  }).length == target.length;
};

/* 드래그 움직임을 캐치하는 이벤트 */
Fn.PivotDragMouseMove = function (ev) {
  drag.MoveDragObj(ev)
};

/* 드래그로 아이템을 옮겼을때 발생하는 이벤트(아이템 삭제) */
Fn.PivotDragMouseUp = function (ev) {
  if (drag.tag) {
    drag.ClearDragObj();
  }
};

/* 드래그로 아이템을 옮겼을때 발생하는 이벤트(아이템 생성) */
Fn.PivotDragSetItem = function (object, ev) {
  if (drag.tag) {
    var pivotDialog, targetPRow, targetPCol, targetPData, nomalColsArea, numberColsArea;
    for (var i = 0; i < Dialogs.length; i++) {
      if (Dialogs[i].PivotDialog) {
        pivotDialog = Dialogs[i];
        break;
      }
    }

    if (object.className.indexOf("_PivotStandards") > -1) {
      var self = this;

      if (this.PivotMaster) {
        self = IBSheet[this.PivotMaster];
      }

      var cols = self.findPivotColumn();
      var group;
      if (object.id.indexOf("_PivotData") > -1) {
        group = cols.number;
      } else {
        group = cols.common;
      }

      if (!document.documentMode && pivotDialog) {
        targetPRow = GetElem(pivotDialog.Name + "_PivotRow");
        targetPCol = GetElem(pivotDialog.Name + "_PivotCol");
        targetPData = GetElem(pivotDialog.Name + "_PivotData");
        nomalColsArea = GetElem(pivotDialog.Name + "_NomalCols");
        numberColsArea = GetElem(pivotDialog.Name + "_NumberCols");
        targetPRow.classList.remove(this.Style + "PivotDragSetItemAllow", this.Style + "PivotDragSetItemDisallow");
        targetPCol.classList.remove(this.Style + "PivotDragSetItemAllow", this.Style + "PivotDragSetItemDisallow");
        targetPData.classList.remove(this.Style + "PivotDragSetItemAllow", this.Style + "PivotDragSetItemDisallow");
        nomalColsArea.classList.remove(this.Style + "PivotDragSetItemAllow", this.Style + "PivotDragSetItemDisallow");
        numberColsArea.classList.remove(this.Style + "PivotDragSetItemAllow", this.Style + "PivotDragSetItemDisallow");
      }

      if (!this.PivotDragExactTarget([drag.tag.firstChild.firstChild.getAttribute("colname")], group)) {
        alert("데이터 값에는 숫자형이, 가로행/세로행 기준에는 그 외의 값이 들어가야합니다.");
        drag.ClearDragObj();
        return false;
      }
    }

    var copy = drag.tag.firstChild.cloneNode(true);
    if (object.firstChild && object.firstChild.className === "CellsInfo") {
      object.removeChild(object.firstChild);
    }
    object.appendChild(copy);
    drag.ClearDragObj(1);

    if (!document.documentMode && pivotDialog) {
      targetPRow = GetElem(pivotDialog.Name + "_PivotRow");
      targetPCol = GetElem(pivotDialog.Name + "_PivotCol");
      targetPData = GetElem(pivotDialog.Name + "_PivotData");
      nomalColsArea = GetElem(pivotDialog.Name + "_NomalCols");
      numberColsArea = GetElem(pivotDialog.Name + "_NumberCols");
      targetPRow.classList.remove(this.Style + "PivotDragSetItemAllow", this.Style + "PivotDragSetItemDisallow");
      targetPCol.classList.remove(this.Style + "PivotDragSetItemAllow", this.Style + "PivotDragSetItemDisallow");
      targetPData.classList.remove(this.Style + "PivotDragSetItemAllow", this.Style + "PivotDragSetItemDisallow");
      nomalColsArea.classList.remove(this.Style + "PivotDragSetItemAllow", this.Style + "PivotDragSetItemDisallow");
      numberColsArea.classList.remove(this.Style + "PivotDragSetItemAllow", this.Style + "PivotDragSetItemDisallow");
    }

    _IBSheet.cancelEvent(ev, 2);
  }
};

/* 클릭시 드래그 태그 생성하는 이벤트 */
Fn.PivotItemClick = function (tag, ev) {
  var pivotDialog;
  for (var i = 0; i < Dialogs.length; i++) {
    if (Dialogs[i].PivotDialog) {
      drag.dialogLeft = Dialogs[i].Tag.offsetLeft;
      drag.dialogTop = Dialogs[i].Tag.offsetTop;
      pivotDialog = Dialogs[i];
    }
  }

  drag.MakeDragObj(tag, ev)
  document.documentElement.style.cursor = "default";

  if (!document.documentMode && pivotDialog) {
    var targetPRow = GetElem(pivotDialog.Name + "_PivotRow"),
      targetPCol = GetElem(pivotDialog.Name + "_PivotCol"),
      targetPData = GetElem(pivotDialog.Name + "_PivotData"),
      nomalColsArea = GetElem(pivotDialog.Name + "_NomalCols"),
      numberColsArea = GetElem(pivotDialog.Name + "_NumberCols");

    if (this.Cols[tag.childNodes[0].getAttribute("colname")].Type == "Int" || this.Cols[tag.childNodes[0].getAttribute("colname")].Type == "Float") {
      targetPRow.classList.add(this.Style + "PivotDragSetItemDisallow");
      targetPCol.classList.add(this.Style + "PivotDragSetItemDisallow");
      targetPData.classList.add(this.Style + "PivotDragSetItemAllow");
      nomalColsArea.classList.add(this.Style + "PivotDragSetItemDisallow");
      numberColsArea.classList.add(this.Style + "PivotDragSetItemAllow");
    } else {
      targetPRow.classList.add(this.Style + "PivotDragSetItemAllow");
      targetPCol.classList.add(this.Style + "PivotDragSetItemAllow");
      targetPData.classList.add(this.Style + "PivotDragSetItemDisallow");
      nomalColsArea.classList.add(this.Style + "PivotDragSetItemAllow");
      numberColsArea.classList.add(this.Style + "PivotDragSetItemDisallow");
    }
  }

  _IBSheet.cancelEvent(ev, 2);
};

/* 대상 컬럼에 들어갈 셀들을 생성하는 메소드 */
Fn.producePivotColumn = function () {
  var cols = this.findPivotColumn();
  var res = [];
  var strCommon = "",
    strNum = "",
    strPivotRows = "",
    strPivotCols = "",
    strPivotData = "";
  var strCols;
  var T = this;
  var arPivotRows = this.PivotRows ? this.PivotRows.split(",") : this.InitPivotRows ? this.InitPivotRows.split(",") : [],
    arPivotCols = this.PivotCols ? this.PivotCols.split(",") : this.InitPivotCols ? this.InitPivotCols.split(",") : [],
    arPivotData = this.PivotData ? this.PivotData.split(",") : this.InitPivotData ? this.InitPivotData.split(",") : [];

  var saveInfo = this.getCurrentPivotInfo();

  if (cols.common && cols.common.length > 0) {
    if (saveInfo) {
      arPivotRows = saveInfo.targetPRow,
      arPivotCols = saveInfo.targetPCol,
      this.PivotRows = saveInfo.targetPRow.join(","),
      this.PivotCols = saveInfo.targetPCol.join(",");
    }

    for (var i = 0; i < arPivotRows.length; i++) {
      _IBSheet.__.find(cols.common, function (v){
        if (v.Name == arPivotRows[i]) {
          strCols = "<span onmousedown='" + T.id + ".PivotItemClick(this,event);' ontouchstart='" + T.id + ".PivotItemClick(this,event);'><b class='box' colName='" + v.Name + "'>" + v.Value + "</b></span>";
          strPivotRows += strCols;
        }
      });
    }

    for (var i = 0; i < arPivotCols.length; i++) {
      _IBSheet.__.find(cols.common, function (v){
        if (v.Name == arPivotCols[i]) {
          strCols = "<span onmousedown='" + T.id + ".PivotItemClick(this,event);' ontouchstart='" + T.id + ".PivotItemClick(this,event);'><b class='box' colName='" + v.Name + "'>" + v.Value + "</b></span>";
          strPivotCols += strCols;
        }
      });
    }

    for (var i = 0; i < cols.common.length; i++) {
      strCols = "<span onmousedown='" + this.id + ".PivotItemClick(this,event);' ontouchstart='" + this.id + ".PivotItemClick(this,event);'><b class='box' colName='" + cols.common[i].Name + "'>" + cols.common[i].Value + "</b></span>";

      if (!((this.PivotRows && this.PivotRows.indexOf(cols.common[i].Name) > -1) || (!this.PivotRows && this.InitPivotRows && this.InitPivotRows.indexOf(cols.common[i].Name) > -1)) && 
        !((this.PivotCols && this.PivotCols.indexOf(cols.common[i].Name) > -1) || (!this.PivotCols && this.InitPivotCols && this.InitPivotCols.indexOf(cols.common[i].Name) > -1))
      ) {
        strCommon += strCols;
      }
    }
  }

  if (cols.number && cols.number.length > 0) {
    if (saveInfo) {
      arPivotData = saveInfo.targetPData;
      this.PivotData = saveInfo.targetPData.join(",");
    }

    for (var i = 0; i < arPivotData.length; i++) {
      _IBSheet.__.find(cols.number, function (v){
        if (v.Name == arPivotData[i]) {
          strCols = "<span onmousedown='" + T.id + ".PivotItemClick(this,event);' ontouchstart='" + T.id + ".PivotItemClick(this,event);'><b class='box' colName='" + v.Name + "'>" + v.Value + "</b></span>";
          strPivotData += strCols;
        }
      });
    }

    for (var i = 0; i < cols.number.length; i++) {
      strCols = "<span onmousedown='" + this.id + ".PivotItemClick(this,event);' ontouchstart='" + this.id + ".PivotItemClick(this,event);'><b class='box' colName='" + cols.number[i].Name + "'>" + cols.number[i].Value + "</b></span>";

      if (!((this.PivotData && this.PivotData.indexOf(cols.number[i].Name) > -1) || (!this.PivotData && this.InitPivotData && this.InitPivotData.indexOf(cols.number[i].Name) > -1))) {
        strNum += strCols;
      }
    }
  }

  res.push(strCommon);
  res.push(strNum);
  res.push(strPivotRows);
  res.push(strPivotCols);
  res.push(strPivotData);
  return res;
};

/* 피벗 타입 버튼들을 생성하는 메소드 */
Fn.producePivotTypes = function (pivotType) {
  var types = ["Sum", "Count", "Max", "Min"];
  var label = "",
    input = "",
    res = "";

  if (types && types.length > 0) {
    for (var i = 0; i < types.length; i++) {
      label = "<label>" + this.getMessage("Pivot"+types[i],"Text") + "</label>";
      input = "<input type=\'radio\' name=\'PivotTypes\' value=\'" + types[i] + "\'" + (types[i] == pivotType ? " checked>" : ">");

      res += (label + input);
    }
  }

  return res;
};

/* 피벗 다이얼로그 생성 정보 저장 메소드 */
Fn.saveCurrentPivotInfo = function (targetPRow, targetPCol, targetPData, pivotType) {
  var key = this.getPivotStorageKey(),
    pivotInfo = {},
    session = this["StorageSession"] || 0,
    val;

  if (session) {
    pivotInfo["targetPRow"] = targetPRow;
    pivotInfo["targetPCol"] = targetPCol;
    pivotInfo["targetPData"] = targetPData;
    pivotInfo["pivotType"] = pivotType;

    val = this.getCompressValue(JSON.stringify(pivotInfo));
    SaveCache(key, val, session === 2 ? 1 : 0);

    return true;
  }

  return false;
};

/* makeSortSheetOpt로 정렬 다이얼로그 내에서 띄워질 시트에 대한 기본 옵션을 설정 */
Fn.makeSortSheetOpt = function (headerIndex, excludeHideCol, useOptions) {
  var cols = [];

  var arr = this.getCols()
  for (var i = 0; i < arr.length; i++) {
    if (excludeHideCol && !this.getAttribute(null, arr[i], "Visible")) continue;
    cols.push(arr[i]);
  }

  var colEnumKeys = '|' + cols.join('|'),
    colEnum,
    header = [],
    headerRows = this.getHeaderRows();

  if (headerIndex != null && typeof headerIndex === 'number' && headerIndex >= 0) {
    if (header.length < headerIndex) headerIndex = headerRows.length - 1;
    for (var j = 0; j < cols.length; j++) {
      var headerString = [];
      if (headerString.indexOf(headerRows[headerIndex][cols[j]]) < 0) headerString.push(headerRows[headerIndex][cols[j]]);
      header.push(headerString.join('/'));
    }
  } else {
    for (var j = 0; j < cols.length; j++) {
      var headerString = [];
      for (var i = 0; i < headerRows.length; i++) {
        if (headerString.indexOf(headerRows[i][cols[j]]) < 0) headerString.push(headerRows[i][cols[j]]);
      }
      header.push(headerString.join('/'));
    }
  }
  colEnum = '|' + header.join('|');

  // 정렬 다이얼로그 옵션
  var option = new Object();
  option.Cfg = {
    "ColorSate": 0,
    "CanColMove": 0,
    "CanSort": 0,
    "CustomScroll": this.CustomScroll,
    "UsePivot": false,
    "DialogSheet": true,
    "InfoRowConfig": {
      "Visible": false
    }
  };

  option.Def = {
    "Row": {
      "CanFormula": 1,
      "CalcOrder": "sExplain"
    },
    "Header": {
      "Menu": { Items: [] },
      "sExplainTip": "가장 상위에 오는 행 부터 정렬 기준이 됩니다.",
      "sTargetTip": "정렬 기준이 될 컬럼(열)을 선택합니다.",
      "sOrderTip": "오름차순/내림차순 정렬 여부를 선택합니다.",
      "sNumberSortTip": "데이터를 숫자형식으로 정렬 할지 여부를 선택합니다.",
      "sRawSortTip": "정렬 데이터에 포맷 적용 여부를 선택합니다.\n콤보 리스트 순서 선택시 콤보 열에 리스트 순서대로 정렬이 됩니다.",
      "sCaseSensitiveTip": "대소문자 구분 여부를 선택합니다.\n체크하는 경우 대소문자를 구분하여 정렬됩니다."
    }
  };

  option.Events = {
    onAfterChange: function (evtParam) {
      var numberType = ["Int", "Float", "Date"],
        val;

      if (evtParam.col == "sTarget") {
        val = evtParam.sheet.ParentSheet.Cols[evtParam.val].NumberSort != null ? evtParam.sheet.ParentSheet.Cols[evtParam.val].NumberSort : (numberType.indexOf(evtParam.sheet.ParentSheet.Cols[evtParam.val].Type) > -1 ? 1 : 0);
        evtParam.sheet.setValue(evtParam.row, 'sNumberSort', val);
        evtParam.sheet.setValue(evtParam.row, 'sRawSort', evtParam.sheet.ParentSheet.Cols[evtParam.val].RawSort != null ? evtParam.sheet.ParentSheet.Cols[evtParam.val].RawSort : 0);
        evtParam.sheet.setValue(evtParam.row, 'sCaseSensitive', evtParam.sheet.ParentSheet.Cols[evtParam.val].CaseSensitive != null ? evtParam.sheet.ParentSheet.Cols[evtParam.val].CaseSensitive : 1);
      }
    }
  }

  option.Cols = [
    {
      "Header": "설명",
      "Type": "Text",
      "Name": "sExplain",
      "Align": "Center",
      "CanEdit": 0,
      "Color": "#EEEEEE",
      "MinWidth": 80,
      "RelWidth": 1,
      "TextStyle": 1,
      "Formula": function (fr) {
        return fr.Row.HasIndex == 1 ? "정렬 기준" : "다음 기준"
      }
    },
    {
      "Header": "기준 컬럼",
      "Type": "Enum",
      "Name": "sTarget",
      "Enum": colEnum,
      "EnumKeys": colEnumKeys,
      "EditFormat": "",
      "RelWidth": 5,
      "MinWidth": 150
    },
    {
      "Header": "정렬",
      "Type": "Enum",
      "Name": "sOrder",
      "Enum": "|오름차순|내림차순",
      "EnumKeys": "|asc|desc",
      "RelWidth": 5,
      "MinWidth": 150
    },
    {
      "Header": "데이터 형식",
      "Type": "Enum",
      "Name": "sNumberSort",
      "Enum": "|문자 형식|숫자 형식",
      "EnumKeys": "|0|1",
      "RelWidth": 5,
      "MinWidth": 150,
      "Visible": useOptions
    },
    {
      "Header": "포맷 적용",
      "Type": "Enum",
      "Name": "sRawSort",
      "Enum": "|포맷 데이터|순수 데이터|콤보 리스트 순서",
      "EnumKeys": "|0|1|2",
      "RelWidth": 5,
      "MinWidth": 150,
      "Visible": useOptions
    },
    {
      "Header": "대/소문자 구분",
      "Type": "Bool",
      "Name": "sCaseSensitive",
      "RelWidth": 5,
      "MinWidth": 150,
      "Visible": useOptions
    }
  ];

  option.Body = [];

  // 기존 소팅 정보 가져오기
  if (!!this.Sort) {
    var Body = [],
      sort = (this.Sort + "").replace(/\s/g, "").split(","),
      obj = {},
      col,
      order,
      numberType = ["Int", "Float", "Date"],
      C = this.Cols;

    for (var i = 0; i < sort.length; i++) {
      obj = {},
      col = sort[i],
      order = 'asc';
      if (col.charAt(0) == '-') {
        col = col.slice(1);
        order = 'desc'
      }

      obj["sTarget"] = col;
      obj["sOrder"] = order
      obj["sNumberSort"] = C[col].NumberSort != null ? C[col].NumberSort : (numberType.indexOf(C[col].Type) > -1 ? 1 : 0);
      obj["sRawSort"] = C[col].RawSort != null ? C[col].RawSort : 0;
      obj["sCaseSensitive"] = C[col].CaseSensitive;
      Body.push(obj);
    }

    option.Body.push(Body);
  }

  return option;
};

/*
  정렬 다이얼로그
  showSortDialog 호출 시 정렬 다이얼로그를 생성 후 화면에 띄운다.
*/
Fn.showSortDialog = function (width, height, headerIndex, name, excludeHideCol, useOptions) {
  /* step 1 start
   * 현재 시트가 정렬 불가능인 경우 띄우지 않는다.
   */
  if (!this.CanSort) return;
  /* step 1 end */

  // 스타일이 중복 되었을때 스타일을 제거한다.
  if (this._stylesSortDialog && this._stylesSortDialog.parentNode) {
    this._stylesSortDialog.parentNode.removeChild(this._stylesSortDialog);
    delete this._stylesSortDialog;
  }

  var classDlg = "SortPopup";
  var themePrefix = this.Style;

  if (width && typeof width == "object") {
    var sortTemp = width;
    if (sortTemp.width != null) width = sortTemp.width;
    if (sortTemp.height != null) height = sortTemp.height;
    if (sortTemp.headerIndex != null) headerIndex = sortTemp.headerIndex;
    if (sortTemp.name != null) name = sortTemp.name;
    if (sortTemp.excludeHideCol != null) excludeHideCol = sortTemp.excludeHideCol;
    if (sortTemp.useOptions != null) useOptions = sortTemp.useOptions;
  }

  width = (typeof width == "number" && width > 600) ? width : 600;
  height = (typeof height == "number" && height > 200) ? height : 200;
  name = typeof name == "string" ? name : ("sortSheet_" + this.id);
  if (useOptions == null) useOptions = 0;

  var styles = document.createElement("style");
  styles.innerHTML = '.' + themePrefix + classDlg + 'Outer {' +
    '  padding: 5px ;' +
    '  border: 3px solid #37acff;' +
    '  padding-left: 50px; padding-right: 50px' +
    '} ' +
    '.' + themePrefix + classDlg + 'Body .' + themePrefix + classDlg + 'Title {' +
    '  width:100%;height:30px;margin-bottom:2px;border-top:1px solid #C3C3C3;padding-top:10px;' +
    '} ' +
    '.' + themePrefix + classDlg + 'Body .' + themePrefix + classDlg + 'Title > div:last-child > div:first-child > label {' +
    '  text-align:left !important;font-size:16px;color:#444444;font-family:"NotoSans_Bold"; font-weight:600;' +
    '} ' +
    '.' + themePrefix + classDlg + 'Body .' + themePrefix + classDlg + 'Foot {' +
    '  width:100%;' +
    '  margin-top:10px;' +
    '} ' +
    '.' + themePrefix + classDlg + 'Foot ul li {' +
    '  list-style-type : none;' +
    '  height : 32px;' +
    '} ' +
    '.' + themePrefix + classDlg + 'Foot label {' +
    '  color : #666666;' +
    '} ' +
    '.' + themePrefix + classDlg + 'Close {' +
    '  background-color: black;' +
    '  width: 17px;' +
    '  height: 17px;' +
    '} ' +
    '.' + themePrefix + classDlg + 'Head, .' + themePrefix + classDlg + 'Foot {' +
    '  background-color:white;' +
    '} ' +
    '.' + themePrefix + classDlg + 'Head .' + themePrefix + classDlg + 'HeadText >div:last-child {' +
    '  text-align: center;' +
    '  color: black;' +
    '  font-size: 25px;' +
    '  margin-bottom: 5px;' +
    '  font-weight: 600;' +
    '  height:35px;' +
    '  line-height: normal;' +
    '} ' +
    '.' + themePrefix + classDlg + 'Btns {' +
    '  text-align:center;' +
    '} ' +
    '.' + themePrefix + classDlg + 'Btns > button {' +
    '  color: #fff;' +
    '  font-family: "NotoSans_Medium";' +
    '  font-size: 18px;' +
    '  display: inline-block;' +
    '  text-align: center;' +
    '  vertical-align: middle;' +
    '  border-radius: 3px;' +
    '  background-color: #37acff;' +
    '  border: 1px solid #37acff;' +
    '  padding: 5px;' +
    '  margin-left: 2px;' +
    '  cursor: pointer;' +
    '}' +
    '.' + name + '_Btn {' +
    '   background-color: white;' +
    '   border: 1px solid gray;' +
    '   cursor: pointer;' +
    '   text-align: center;' +
    '   margin-right: 5px;'
  '}';

  document.body.appendChild(styles);

  this._stylesSortDialog = styles;

  /* step 2 start
   * 임시로 상세보기 시트가 들어갈 div 생성(생성된 다이얼로그로 아래에서 옮김).
   */
  var tmpSheetTag = document.createElement("div");
  tmpSheetTag.className = "SheetTmpTag";
  tmpSheetTag.style.width = "300px";
  tmpSheetTag.style.height = "100px";
  document.body.appendChild(tmpSheetTag);
  /* step 2 end */

  /* step 3 start
   * 띄워져있는 다이얼로그나 팁을 제거.
   */
  this.closeDialog();
  this.hideTip();
  /* step 3 end */

  /* step 4 start
   * 상세보기 시트에 대한 옵션 설정(상세보기 시트를 띄운 시트의 옵션을 따라간다.) 및 상세보기 시트 생성
   */
  var opts = this.makeSortSheetOpt(headerIndex, excludeHideCol, useOptions);
  var SortSheet = _IBSheet.create(name, tmpSheetTag, opts);
  /* step 4 end */

  /* step 5 start
   * 상세보기 시트가 띄워질 다이얼로그 창에 대한 설정 및 다이얼로그 생성
   */
  var dialogOpt = {},
    pos = {};
  this.initPopupDialog(dialogOpt, pos, SortSheet, {
    cssClass: classDlg
  });

  dialogOpt.Head = "<div>정렬 다이얼로그</div>";
  dialogOpt.Body = "<div class='" + themePrefix + classDlg + "Title' >" +
    "  <div>" +
    "    <div style='float:left;'>" +
    "      <button type='button' id='add_Btn' class='" + name + "_Btn'>기준 추가</button>" +
    "      <button type='button' id='remove_Btn' class='" + name + "_Btn'>기준 삭제</button>" +
    "      <button type='button' id='copy_Btn' class='" + name + "_Btn'>기준 복사</button>" +
    "      <button type='button' id='moveup_Btn' class='" + name + "_Btn'>↑</button>" +
    "      <button type='button' id='movedown_Btn' class='" + name + "_Btn'>↓</button>" +
    "    </div>" +
    "  </div>" +
    "  <div>" +
    "    <div style='float:right;'>" +
    "      <button type='button' id='clear_Btn' class='" + name + "_Btn'>기준 전체 삭제</button>" +
    "    </div>" +
    "  </div>" +
    "</div>" +
    "<div id='" + name + "_SortDialogBody' style='width:" + width + "px;height:" + height + "px;overflow:hidden;'></div>";
  dialogOpt.Foot = "<div class='" + themePrefix + classDlg + "Btns'>" +
  "  <button id='" + name + "_InitSortDialog'>초기화</button>" +
  "  <button id='" + name + "_OkSortDialog'>확인</button>" +
  "  <button id='" + name + "_CancelSortDialog'>취소</button>" +
  "</div>";
  dialogOpt = _IBSheet.showDialog(dialogOpt, pos, this);
  /* step 5 end */

  /* step 6 start
   * 다이얼로그 창의 Body에 상세보기 시트를 옮김 */
  var SortDlgBody = document.getElementById(name + "_SortDialogBody");
  SortDlgBody.innerHTML = "";
  for (var elem = tmpSheetTag.firstChild; elem; elem = tmpSheetTag.firstChild) SortDlgBody.appendChild(elem);
  SortSheet.MainTag = SortDlgBody;
  tmpSheetTag.parentNode.removeChild(tmpSheetTag);
  /* step 6 end */

  /* step 7 start
   * 버튼 클릭시 및 다이얼로그의 시트가 아닌 부분을 클릭했을 때
   */
  var myArea = SortSheet.getElementsByClassName(dialogOpt.Tag, themePrefix + classDlg + "HeadText")[0];
  var self = this;
  myArea.onclick = function () {
    if (self.ARow == null) {
      SortSheet.blur();
    }
  }

  var myArea2 = SortSheet.getElementsByClassName(dialogOpt.Tag, themePrefix + classDlg + "Foot")[0]
  myArea2.onclick = function () {
    if (self.ARow == null) {
      SortSheet.blur();
    }
  }

  // 초기화 버튼
  var btnInit = document.getElementById(name + "_InitSortDialog");
  btnInit.onclick = function (ev) {
    var self = SortSheet;
    SortSheet.reloadData({
      func: function () {
        if (self.getFirstVisibleRow()) self.focus(self.getFirstVisibleRow());
      }
    });
    SortSheet.calculate();
    ev.stopPropagation();
    ev.preventDefault();
  }

  // 확인 버튼
  var btnOk = document.getElementById(name + "_OkSortDialog");
  btnOk.onclick = function () {
    SortSheet.endEdit(1);
    var prow = SortSheet.getFirstRow()
      sortInfo = [],
      sortStr = "";
    while (prow) {
      if (!prow["sTarget"]) {
        SortSheet.showMessageTime("모든 정렬 조건에는 지정된 열이 있어야 합니다. 선택한 정렬 조건을 확인하고 다시 시도하십시오.");
        return;
      }

      if (sortInfo.indexOf((prow["sOrder"] == "asc" ? "" : "-") + prow["sTarget"]) > -1) {
        SortSheet.showMessageTime(SortSheet.getString(prow, 'sTarget') + "은(는) 값을 기준으로 두 번 이상 정렬되어 있습니다. 중복된 정렬 조건을 삭제하고 다시 시도하십시오.");
        return;
      }

      sortInfo.push((prow["sOrder"] == "asc" ? "" : "-") + prow["sTarget"]);
      // NumberSort 설정 적용
      self.setAttribute(null, prow['sTarget'], 'NumberSort', parseInt(prow['sNumberSort']));
      self.setAttribute(null, prow['sTarget'], 'RawSort', parseInt(prow['sRawSort']));
      self.setAttribute(null, prow['sTarget'], 'CaseSensitive', parseInt(prow['sCaseSensitive']));

      prow = SortSheet.getNextRow(prow);
    }
    sortStr = sortInfo.join(',');

    !!sortStr ? self.doSort(sortStr) : self.clearSort();
    SortSheet.dispose();
    self.closeDialog();
    // 버튼을 닫을때 스타일을 제거한다.
    if (styles && styles.parentNode) {
      styles.parentNode.removeChild(styles);
      delete self._stylesSortDialog;
    }
  }

  // 취소 버튼
  var btnCancel = document.getElementById(name + "_CancelSortDialog");
  btnCancel.onclick = function () {
    SortSheet.dispose();
    self.closeDialog();
    // 버튼을 닫을때 스타일을 제거한다.
    if (styles && styles.parentNode) {
      styles.parentNode.removeChild(styles);
      delete self._stylesSortDialog;
    }
  }

  // 기준 추가 버튼
  var btnAdd = document.getElementById("add_Btn");
  btnAdd.onclick = function () {
    if (self.MaxSort <= SortSheet.getDataRows().length) {
      SortSheet.showMessageTime("해당 시트의 최대 정렬 개수는 " + self.MaxSort + "개 입니다.");
      return;
    }
    SortSheet.addRow({ "init": { "sOrder": "asc" }});
    SortSheet.calculate();
  }

  // 기준 삭제 버튼
  var btnRemove = document.getElementById("remove_Btn");
  btnRemove.onclick = function () {
    var focusRow = SortSheet.getFocusedRow();
    if (focusRow) {
      SortSheet.removeRow({ row: focusRow });
    } else {
      SortSheet.showMessageTime("삭제할 행을 선택해주세요");
    }
    SortSheet.calculate();
  }

  // 기준 복사 버튼
  var btnCopy = document.getElementById("copy_Btn");
  btnCopy.onclick = function () {
    if (self.MaxSort <= SortSheet.getDataRows().length) {
      SortSheet.showMessageTime("해당 시트의 최대 정렬 개수는 " + self.MaxSort + "개 입니다.");
      return;
    }
    var focusRow = SortSheet.getFocusedRow();
    if (focusRow) {
      SortSheet.copyRow({ row: focusRow });
    } else {
      SortSheet.showMessageTime("복사할 행을 선택해주세요");
    }
    SortSheet.calculate();
  }

  // ↑ 버튼
  var btnMoveup = document.getElementById("moveup_Btn");
  btnMoveup.onclick = function () {
    var focusRow = SortSheet.getFocusedRow(),
      targetRow = focusRow ? SortSheet.getPrevRow(focusRow) : null;
    if (focusRow) {
      if (targetRow) SortSheet.moveRow({ row: focusRow, next: targetRow });
    } else {
      SortSheet.showMessageTime("이동할 행을 선택해주세요");
    }
    SortSheet.calculate();
  }

  // ↓ 버튼
  var btnMovedown = document.getElementById("movedown_Btn");
  btnMovedown.onclick = function () {
    var focusRow = SortSheet.getFocusedRow(),
      targetRow = focusRow ? (SortSheet.getNextRow(focusRow) ? SortSheet.getNextRow(SortSheet.getNextRow(focusRow)) : null) : null;

    if (focusRow) {
      SortSheet.moveRow({ row: focusRow, next: targetRow });
    } else {
      SortSheet.showMessageTime("이동할 행을 선택해주세요");
    }
    SortSheet.calculate();
  }

  // 기준 전체 삭제 버튼
  var btnClear = document.getElementById("clear_Btn");
  btnClear.onclick = function () {
    SortSheet.removeAll();
  }
  /* step 7 end */

  _IBSheet.Focused = SortSheet;
};
}(window, document));
