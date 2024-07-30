/**
 * �� ǰ: IBSheet8 - Common Plugin
 * �� ��: v0.0.6 (20220331-09)
 * ȸ ��: (��)���̺񸮴���
 * �� ��: https://www.ibsheet.com
 * �� ȭ: 1644-5615
 * 
 * 
 * �ѹ�� ��Ī�÷��� (LINC)���� ���
 */


(function(window, document) {
/*CommonOptions ����
 * ��� ��Ʈ�� �����ϰ� �����ϰ��� �ϴ� ������ CommonOptions�� ����մϴ�.
 * �ش� ������ �ݵ�� ibsheet.js ���Ϻ��� �ڿ� include �Ǿ�� �մϴ�.
 */
var _IBSheet = window['IBSheet'];
if (_IBSheet == null) {
  throw new Error('[ibsheet-common] undefined global object: IBSheet');
}

// IBSheet Plugins Object
var Fn = _IBSheet['Plugins'];

if (!Fn.PluginVers) Fn.PluginVers = {};
Fn.PluginVers.ibcommon = {
  name: 'ibcommon',
  version: '0.0.6-20220331-09'
};

// Ʋ���� �Լ�, 2022-06-17 �ڹ̿�
function freezePanes(obj, opt) {
  if ((opt ?? "") === "cancel") {
	  
	  if(obj.options.Cfg.SearchMode != 0) obj.setFixedTop(0);
    obj.setFixedCols(0);
    return;
  }

  var rowObj = obj.getFocusedRow();
  var rowIdx = obj.getRowIndex(rowObj) - 1;
  var colObj = obj.getFocusedCol();
  var colIdx = obj.getColIndex(colObj);

  if (obj.options.Cfg.MultiRecord) {
    obj.showMessageTime({
      message: "��Ƽ���ڵ� ��� ��� �� �������� ����� �� �����ϴ�.",
      func: function () {
        // �����
        obj.setFixedTop(rowIdx);
      },
    });
  } else if(obj.options.Cfg.SearchMode == 0){
	  obj.setFixedCols(colIdx);
  } else {
    // �����
	  obj.setFixedTop(rowIdx);
	  
    // ������
    obj.setFixedCols(colIdx);
  }
}

_IBSheet.CommonOptions = {
  Cfg: {
      Alternate: 2, // Ȧ¦ �࿡ ���� ���� ����
      CanEdit: 0, // Edit ��� Disabled
      Export: {
        Url: "/ibsheet8/jsp/",
      }, // �����ٿ� URL
      FitWidth: true,
      InfoRowConfig: { // ��Ʈ �ϴ� �� �� ǥ��
        Visible: 0, // ǥ������ ���� (Default)
        Layout: ["Count"],
        Space: "Bottom",
      }, // �Ǽ� ���� ǥ��
      GroupFormat:
        " <span style='color:red'>{%s}</span> <span style='color:blue'>({%c}��)</span>", // �׷��� �÷����� ������, �Ǽ��� �Ķ������� ǥ��
      HeaderSortMode: 1,
      HeaderMerge: 1, // ������� �ڵ� ����
      PrevColumnMerge: 1, // ���÷� ���� ���� ��� ����

      SearchCells: 1, // ã�� ��� ������/����� ����
      //Size: "Small", // �⺻���� �۰� ����
      Style: "IB",
      ShowHint: 0, //���콺 hover�� hint ǥ�ñ��

      MaxPages: 6, // SearchMode:2�� ��� �ѹ��� ���� �ִ� ������ ��(Ŭ���� �������� �δ��� Ŀ��)
      MaxSort: 3, // �ִ� ���� ���� �÷���(4�� �̻��� ��� ������ �� ����)

      StorageSession: 1, // ����ȭ ���(�÷����� ����) ��� ����
      StorageKeyPrefix: window["rerpIBSheet"]
        ? window["rerpIBSheet"]
        : location.href, // ���� Ű prefix ����
      //Style: "IBCL", // ��Ʈ �׸� Prefix
  },
  Def: {
    Header: { //��� ���� �࿡ ���� ����
      Menu: {
        Items: [{
            "Name": "�÷� ���߱�"
          },
          {
            "Name": "�÷� ���߱� ���"
          },
          {
            "Name": "*-"
          },
          {
            "Name": "�÷� ���� ����"
          },
          {
            "Name": "�÷� ���� ���� ���"
          },
          {
            "Name": "*-"
          },
          {
            "Name": "������ ����"
          },
          {
            "Name": "���� ���߱�"
          }
        ],
        "OnSave": function (item, data) {
          switch (item.Name) {
            case '�÷� ���߱�':
              var col = item.Owner.Col;
              this.Sheet.hideCol(col, 1);
              break;
            case '�÷� ���߱� ���':
              this.Sheet.showCol();
              break;
            case '�÷� ���� ����':
              this.Sheet.saveCurrentInfo();
              break;
            case '�÷� ���� ���� ���':
              this.Sheet.clearCurrentInfo();
              this.Sheet.showMessageTime({
                message: "�÷� ������ �����Ͽ����ϴ�.<br>���ΰ�ħ�Ͻø� �ʱ� ������ ��Ʈ�� Ȯ���Ͻ� �� �ֽ��ϴ�."
              });
              break;
            case '������ ����':
              this.Sheet.showFilterRow();
              break;
            case '���� ���߱�':
              this.Sheet.hideFilterRow();
              break;

          }
        }
      }
    },

    //������ ���� ��� �࿡ ���� ����
    Row: {
      Menu: {
        //���콺 ������Ư Ŭ���� �������� �޴� ���� (�޴��󿡼� Appedix/Menu ����)
        Items: [{ Name: "Ʋ ����" }, { Name: "Ʋ ���� ���" }],
        OnSave: function (item, data) {
          //�޴� ���ý� �߻� �̺�Ʈ
          switch (item.Name) {
            case "Ʋ ����":
              this.Sheet.focus(item.Owner.Row, item.Owner.Col);
              freezePanes(this.Sheet);
              break;
            case "Ʋ ���� ���":
              freezePanes(this.Sheet, "cancel");
              break;
          }
        },
      },
      // AlternateColor:"#F1F1F1",  //¦���࿡ ���� ����
      // Menu:{ //���콺 ������Ư Ŭ���� �������� �޴� ���� (�޴��󿡼� Appedix/Menu ����)
      //   "Items":[
      //     {"Name":"�ٿ�ε�","Caption":1},
      //     {"Name":"Excel","Value":"xls"},
      //     {"Name":"text","Value":"txt"},
      //     {"Name":"pdf","Value":"pdf"},
      //     // {"Name":"-"},
      //     {"Name":"������ ����","Caption":1},
      //     {"Name":"������ �߰�/����",Menu:1,"Items":[
      //       {"Name":"���� �� �߰�","Value":"addAbove"},
      //       {"Name":"�Ʒ��� �� �߰�","Value":"addBelow"},
      //       {"Name":"�� ����","Value":"del"}
      //     ]},
      //     {"Name":"������ �̵�",Menu:1,"Items":[
      //       {"Name":"���η� �̵�","Value":"moveAbove"},
      //       {"Name":"�Ʒ��� �̵�","Value":"moveBelow"},
      //     ]}

      //   ],
      //   "OnSave":function(item,data){//�޴� ���ý� �߻� �̺�Ʈ
      //     switch(item.Value){
      //       case 'xls':
      //         try{
      //           this.Sheet.down2Excel({FileName:"test.xlsx",SheetDesign:1});
      //         }catch(e){
      //           if(e.message.indexOf("down2Excel is not a function")>-1){
      //               console.log("%c ���","color:#FF0000"," : ibsheet-excel.js ������ �ʿ��մϴ�.");
      //           }
      //         }
      //         break;
      //       case 'txt':
      //         try{
      //           this.Sheet.down2Text();
      //         }catch(e){
      //           if(e.message.indexOf("down2Text is not a function")>-1){
      //             console.log("%c ���","color:#FF0000"," : ibsheet-excel.js ������ �ʿ��մϴ�.");
      //           }
      //         }
      //         break;
      //       case 'pdf':
      //         try{
      //           this.Sheet.down2Pdf();
      //         }catch(e){
      //           if(e.message.indexOf("down2Pdf is not a function")>-1){
      //             console.log("%c ���","color:#FF0000"," : ibsheet-excel.js ������ �ʿ��մϴ�.");
      //           }
      //         }
      //         break;
      //       case 'addAbove'://���� �߰�
      //         var nrow = item.Owner.Row;
      //         this.Sheet.addRow({next:nrow});
      //         break;
      //       case 'addBelow'://�Ʒ��߰�
      //         var nrow = this.Sheet.getNextRow(item.Owner.Row);
      //         this.Sheet.addRow({next:nrow});
      //         break;
      //       case 'del'://����
      //         var row = item.Owner.Row;
      //         this.Sheet.deleteRow(row);
      //         break;

      //       case 'moveAbove'://���� �̵�
      //           var row = item.Owner.Row;
      //           var nrow = this.Sheet.getPrevRow(item.Owner.Row);
      //           this.Sheet.moveRow({row:row,next:nrow});
      //         break;
      //       case 'moveBelow'://�Ʒ��� �̵�
      //           var row = item.Owner.Row;
      //           var nrow = this.Sheet.getNextRow(this.Sheet.getNextRow(item.Owner.Row));
      //           this.Sheet.moveRow({row:row,next:nrow});
      //         break;
      //     }
      //   }
      // }
    }
  },
  Events: {
    "onKeyDown": function (evtParam) {
      // Ctrl + Shift + F �Է½� ã�� â ����
      if (evtParam.prefix == "ShiftCtrl" && evtParam.key == 70) {
        evtParam.sheet.showFindDialog();
      }
      // Ctrl + Alt + T �Է� �� �ǹ� â ����
      else if (evtParam.prefix == "CtrlAlt" && evtParam.key == 84) {
        evtParam.sheet.createPivotDialog();
      }
    },
    "onRowAdd": function (evtParam) {

        var eSheet    = evtParam.sheet;
        var eRow      = evtParam.row;
        
        if(eSheet.getColIndex("STATUS") > 0) {
            eSheet.setValue(eRow, "STATUS", "INSERT", 1);
               
        }
        
    },
    "onBeforeRowDelete": function (evtParam) {

        var eSheet    = evtParam.sheet;
        var eRow      = evtParam.row;
        var eType     = evtParam.type;
        var eRows     = evtParam.rows;
        
        if(eSheet.getColIndex("STATUS") > 0) {

            var status  = "";
            if(eType == 0) {
                
                status = "DELETE";
            }

            eSheet.setValue(eRow, "STATUS", status, 1);
            var cRow    = eSheet.getChildRows(eRow);
            for(var i = 0; i < cRow.length; i++) {
                eSheet.setValue(cRow[i], "STATUS", status, 1);
            }
               
        }
        
    },
    "onAfterChange": function (evtParam) {

        var eSheet  = evtParam.sheet;
        var eRow    = evtParam.row;
    
        if(eSheet.getColIndex("STATUS") > 0) {
            if(eRow.Added) {
                eSheet.setValue(eRow, "STATUS", "INSERT", 1);
            } else if(eRow.Deleted) {
                eSheet.setValue(eRow, "STATUS", "DELETE", 1);
            } else if(eRow.Changed) {
                eSheet.setValue(eRow, "STATUS", "UPDATE", 1);
            } else {
                eSheet.setValue(eRow, "STATUS", "", 1);
            }
               
        }
    },
  }
};

_IBSheet.onBeforeCreate = function(init){

  //options�� LeftCols,Cols,RightCols���� EnumEdit Ÿ���� ������ ������ �ش�.
  var cols = ["LeftCols", "Cols", "RightCols"];
  var opt = init.options;
  
  cols.forEach((item,idx)=>{
    if(opt[item]){
      const tempCol = opt[item];
      tempCol.forEach((colObj,colIdx)=>{
        if(colObj["Type"] && colObj["Type"] === "EnumEdit"){
          if(colObj["Enum"] && colObj["EnumKeys"]){
            
            var text = colObj["Enum"].substring(1).split(colObj["Enum"].substring(0,1) );
            var keys = colObj["EnumKeys"].substring(1).split(colObj["EnumKeys"].substring(0,1) );
            var newFormat = {};
            for(var x=0;x<keys.length;x++){
              newFormat[keys[x]] = text[x];
            }
            colObj["Type"] = "Text";
            colObj["SuggestType"] = "Empty,Start,Arrows";
            colObj["Suggest"] =  colObj["EditEnum"]?colObj["EditEnum"]:colObj["Enum"];
            
            colObj["Icon"] = "Defaults";
            colObj["Defaults"] = colObj["EditEnum"];
            
            colObj["Format"] = newFormat;
            colObj["EditFormat"] = newFormat;
            colObj["OnChange"] = function(e){
              console.log("OnChange");
              var v = e.row[e.col];
              
             
              if(typeof(e.sheet.Cols[e.col].Format[v])!="undefined"){
                  return;
              }
              if(e.sheet.Cols[e.col]["EditEnum"]) {
                  
                  if(e.sheet.Cols[e.col].EditEnum.indexOf(v) <= 0) {
                      e.row[e.col] = "";           
                      return;
                  } else  {
                    //���� ���� EditEnum�� ���° ������ ã�� �ش��ϴ� EnumKeys�� ��� �ִ´�.
                    var idx = e.sheet.Cols[e.col]["EditEnum"].split("|").indexOf(v)
                    var key = e.sheet.Cols[e.col]["EnumKeys"].split("|")[idx];
                    e.row[e.col] = key;    
                    e.sheet.refreshCell(e.row, e.col);             
                    return;
                  } 
              } 
              
              //���� ���� �Է��������� ���� ó��
              //���������� �ǵ����ų� ���� ����.
              if(e.row[e.col+"BeforeVal"]){
                e.row[e.col] = e.row[e.col+"BeforeVal"];
              }else if(e.row[e.col+"Orgi"]){
                e.row[e.col] = e.row[e.col+"Orgi"];
              }else{
                e.row[e.col] = "";
              }
              e.sheet.refreshCell(e.row, e.col);             
              
            }//end OnChange
          }
          
        }
      })
    }
  });

  //�ݵ�� return�Ǿ�� ��
  return init;
};
window.IB_Preset = {
  // ��¥ �ð� ����
  "YMD"			: {Type: "Date"	, Align: "Center"	, Width: 110	, Format: 'yyyy-MM-dd'			, DataFormat: 'yyyyMMdd'		, EditFormat: 'yyyyMMdd'		, Size: 8	, EmptyValue: ""	},
  "YM" 			: {Type: "Date"	, Align: "Center"	, Width: 80		, Format: 'yyyy-MM'				, DataFormat: 'yyyyMM'			, EditFormat: 'yyyyMM'			, Size: 6	, EmptyValue: ""	},
  "MD" 			: {Type: "Date"	, Align: "Center"	, Width: 60		, Format: 'MM-dd'				, EditFormat: 'MMdd'			, DataFormat: 'MMdd'			, Size: 4	, EmptyValue: "" 	},
  "HMS"			: {Type: "Date"	, Align: "Center"	, Width: 70		, Format: 'HH:mm:ss'			, EditFormat: 'HHmmss'			, DataFormat: 'HHmmss'			, Size: 8	, EmptyValue: ""	},
  "HM" 			: {Type: "Date"	, Align: "Center"	, Width: 70		, Format: 'HH:mm'				, EditFormat: 'HHmm'			, DataFormat: 'HHmm'			, Size: 6	, EmptyValue: ""	},
  "YMDHMS"		: {Type: "Date"	, Align: "Center"	, Width: 150	, Format: 'yyyy-MM-dd HH:mm:ss'	, EditFormat: 'yyyyMMddHHmmss'	, DataFormat: 'yyyyMMddHHmmss'	, Size: 14	, EmptyValue: ""	},
  "YMDHM"		: {Type: "Date"	, Align: "Center"	, Width: 150	, Format: 'yyyy-MM-dd HH:mm'	, EditFormat: 'yyyyMMddHHmm'	, DataFormat: 'yyyyMMddHHmm'	, Size: 12	, EmptyValue: ""	},
  "MDY"			: {Type: "Date"	, Align: "Center"	, Width: 110	, Format: 'MM-dd-yyyy'			, EditFormat: 'MMddyyyy'		, DataFormat: 'yyyyMMdd'		, Size: 8	, EmptyValue: ""	},
  "DMY"			: {Type: "Date"	, Align: "Center"	, Width: 110	, Format: 'dd-MM-yyyy'			, EditFormat: 'ddMMyyyy'		, DataFormat: 'yyyyMMdd'		, Size: 8	, EmptyValue: ""	},
  "YWD100"		: {Type: "Date"	, Align: "Center"	, Width: 100	, Format: 'yyyy-MM-dd'			, DataFormat: 'yyyyMMdd'		, EditFormat: 'yyyyMMdd'		, Size: 8	, EmptyValue: ""	},
  
  // ���� ����
  "Integer"		: {Type: "Int"	, Align: "Right"	, Width: 120	, Format: "#,##0"			},
  "NullInteger"	: {Type: "Int"	, Align: "Right"	, Width: 120	, Format: "#,###"			},
  "Float"		: {Type: "Float", Align: "Right"	, Width: 120	, Format: "#,##0.######"	},
  "NullFloat"	: {Type: "Float", Align: "Right"	, Width: 120	, Format: "#,###.######"	},
  "Rate"		: {Type: "Float", Align: "Right"	, Width: 80		, Format: "#,##0.00"		},
  "Rate120"		: {Type: "Float", Align: "Right"	, Width: 120	, Format: "#,##0.00"		},
  "Integer100"	: {Type: "Int"	, Align: "Right"	, Width: 100	, Format: "#,##0"			},

  // ��Ÿ����
  "Ssn"			: {Type: "Text"	, Align: "Center"	, Width: 150	, CustomFormat: "IdNo"		, },
  "SsnMask"		: {Type: "Text"	, Align: "Center"	, Width: 150	, CustomFormat: "IdNoMask"	, },
  "BizNo"		: {Type: "Text"	, Align: "Center"	, Width: 150	, CustomFormat: function (v) {
      if (v.length > 10) return v.substr(0, 6) + "-" + v.substr(6);
      else return v.substr(0, 5) + "-" + v.substr(5);
    }
  },
  "PostNo"		: {},
  "CardNo"		: {},
  "PhoneNo"		: {},
  "Number"		: {},

  // ibsheet7 migration
  // Popup,PopupEdit
  "Popup"		: {Type: "Text"	, Align: "Center"	, Width: 100	, Button: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCBtZWV0IiB2aWV3Qm94PSIwIDAgNjQwIDY0MCIgd2lkdGg9IjE1IiBoZWlnaHQ9IjE1Ij48ZGVmcz48cGF0aCBkPSJNMjc5LjczIDM0LjdMMjg5LjAxIDM1LjY0TDI5OC4xNyAzNi45NUwzMDcuMjIgMzguNjFMMzE2LjEzIDQwLjYyTDMyNC45MiA0Mi45OEwzMzMuNTYgNDUuNjZMMzQyLjA1IDQ4LjY4TDM1MC4zOCA1Mi4wMUwzNTguNTUgNTUuNjZMMzY2LjU1IDU5LjYxTDM3NC4zNyA2My44NkwzODIuMDEgNjguMzlMMzg5LjQ1IDczLjIxTDM5Ni42OCA3OC4zMUw0MDMuNzEgODMuNjdMNDEwLjUzIDg5LjNMNDE3LjEyIDk1LjE3TDQyMy40OCAxMDEuMjlMNDI5LjYgMTA3LjY1TDQzNS40OCAxMTQuMjRMNDQxLjEgMTIxLjA2TDQ0Ni40NiAxMjguMDlMNDUxLjU2IDEzNS4zM0w0NTYuMzggMTQyLjc3TDQ2MC45MiAxNTAuNEw0NjUuMTcgMTU4LjIyTDQ2OS4xMiAxNjYuMjJMNDcyLjc2IDE3NC4zOUw0NzYuMSAxODIuNzJMNDc5LjExIDE5MS4yMkw0ODEuOCAxOTkuODZMNDg0LjE1IDIwOC42NEw0ODYuMTYgMjE3LjU2TDQ4Ny44MiAyMjYuNkw0ODkuMTMgMjM1Ljc2TDQ5MC4wNyAyNDUuMDRMNDkwLjY0IDI1NC40Mkw0OTAuODMgMjYzLjlMNDkwLjY0IDI3My4zOEw0OTAuMDcgMjgyLjc2TDQ4OS4xMyAyOTIuMDRMNDg3LjgyIDMwMS4yTDQ4Ni4xNiAzMTAuMjVMNDg0LjE1IDMxOS4xNkw0ODEuOCAzMjcuOTVMNDc5LjExIDMzNi41OUw0NzYuMSAzNDUuMDhMNDcyLjc2IDM1My40MUw0NjkuMTIgMzYxLjU4TDQ2NS4xNyAzNjkuNThMNDYwLjkyIDM3Ny40TDQ1Ni4zOCAzODUuMDRMNDUxLjczIDM5Mi4yMkw1OTYuOTcgNTM3LjQ2TDUzNC40MyA2MDBMMzg5LjE5IDQ1NC43NkwzODIuMDEgNDU5LjQxTDM3NC4zNyA0NjMuOTVMMzY2LjU1IDQ2OC4yTDM1OC41NSA0NzIuMTVMMzUwLjM4IDQ3NS43OUwzNDIuMDUgNDc5LjEzTDMzMy41NiA0ODIuMTRMMzI0LjkyIDQ4NC44M0wzMTYuMTMgNDg3LjE4TDMwNy4yMiA0ODkuMTlMMjk4LjE3IDQ5MC44NUwyODkuMDEgNDkyLjE2TDI3OS43MyA0OTMuMUwyNzAuMzUgNDkzLjY3TDI2MC44NyA0OTMuODZMMjUxLjM5IDQ5My42N0wyNDIuMDEgNDkzLjFMMjMyLjczIDQ5Mi4xNkwyMjMuNTcgNDkwLjg1TDIxNC41MyA0ODkuMTlMMjA1LjYxIDQ4Ny4xOEwxOTYuODMgNDg0LjgzTDE4OC4xOSA0ODIuMTRMMTc5LjY5IDQ3OS4xM0wxNzEuMzYgNDc1Ljc5TDE2My4xOSA0NzIuMTVMMTU1LjE5IDQ2OC4yTDE0Ny4zNyA0NjMuOTVMMTM5Ljc0IDQ1OS40MUwxMzIuMyA0NTQuNTlMMTI1LjA2IDQ0OS40OUwxMTguMDMgNDQ0LjEzTDExMS4yMSA0MzguNTFMMTA0LjYyIDQzMi42M0w5OC4yNiA0MjYuNTFMOTIuMTQgNDIwLjE1TDg2LjI3IDQxMy41Nkw4MC42NCA0MDYuNzRMNzUuMjggMzk5LjcxTDcwLjE4IDM5Mi40OEw2NS4zNiAzODUuMDRMNjAuODIgMzc3LjRMNTYuNTggMzY5LjU4TDUyLjYzIDM2MS41OEw0OC45OCAzNTMuNDFMNDUuNjUgMzQ1LjA4TDQyLjYzIDMzNi41OUwzOS45NSAzMjcuOTVMMzcuNTkgMzE5LjE2TDM1LjU4IDMxMC4yNUwzMy45MiAzMDEuMkwzMi42MSAyOTIuMDRMMzEuNjcgMjgyLjc2TDMxLjEgMjczLjM4TDMwLjkxIDI2My45TDMxLjEgMjU0LjQyTDMxLjY3IDI0NS4wNEwzMi42MSAyMzUuNzZMMzMuOTIgMjI2LjZMMzUuNTggMjE3LjU2TDM3LjU5IDIwOC42NEwzOS45NSAxOTkuODZMNDIuNjMgMTkxLjIyTDQ1LjY1IDE4Mi43Mkw0OC45OCAxNzQuMzlMNTIuNjMgMTY2LjIyTDU2LjU4IDE1OC4yMkw2MC44MiAxNTAuNEw2NS4zNiAxNDIuNzdMNzAuMTggMTM1LjMzTDc1LjI4IDEyOC4wOUw4MC42NCAxMjEuMDZMODYuMjcgMTE0LjI0TDkyLjE0IDEwNy42NUw5OC4yNiAxMDEuMjlMMTA0LjYyIDk1LjE3TDExMS4yMSA4OS4zTDExOC4wMyA4My42N0wxMjUuMDYgNzguMzFMMTMyLjMgNzMuMjFMMTM5Ljc0IDY4LjM5TDE0Ny4zNyA2My44NkwxNTUuMTkgNTkuNjFMMTYzLjE5IDU1LjY2TDE3MS4zNiA1Mi4wMUwxNzkuNjkgNDguNjhMMTg4LjE5IDQ1LjY2TDE5Ni44MyA0Mi45OEwyMDUuNjEgNDAuNjJMMjE0LjUzIDM4LjYxTDIyMy41NyAzNi45NUwyMzIuNzMgMzUuNjRMMjQyLjAxIDM0LjdMMjUxLjM5IDM0LjEzTDI2MC44NyAzMy45NEwyNzAuMzUgMzQuMTNMMjc5LjczIDM0LjdaTTI0OS4yMyAxMjIuNDhMMjQzLjUxIDEyMy4wNkwyMzcuODYgMTIzLjg3TDIzMi4yOCAxMjQuODlMMjI2Ljc3IDEyNi4xM0wyMjEuMzUgMTI3LjU5TDIxNi4wMiAxMjkuMjRMMjEwLjc4IDEzMS4xTDIwNS42NCAxMzMuMTZMMjAwLjYgMTM1LjQxTDE5NS42NiAxMzcuODVMMTkwLjg0IDE0MC40N0wxODYuMTMgMTQzLjI3TDE4MS41NCAxNDYuMjRMMTc3LjA3IDE0OS4zOUwxNzIuNzMgMTUyLjdMMTY4LjUzIDE1Ni4xN0wxNjQuNDYgMTU5Ljc5TDE2MC41NCAxNjMuNTdMMTU2Ljc2IDE2Ny40OUwxNTMuMTQgMTcxLjU2TDE0OS42NyAxNzUuNzZMMTQ2LjM2IDE4MC4xTDE0My4yMSAxODQuNTdMMTQwLjI0IDE4OS4xNkwxMzcuNDQgMTkzLjg3TDEzNC44MiAxOTguNjlMMTMyLjM4IDIwMy42M0wxMzAuMTMgMjA4LjY3TDEyOC4wNyAyMTMuODFMMTI2LjIxIDIxOS4wNUwxMjQuNTYgMjI0LjM4TDEyMy4xIDIyOS44TDEyMS44NiAyMzUuMzFMMTIwLjg0IDI0MC44OUwxMjAuMDMgMjQ2LjU0TDExOS40NSAyNTIuMjZMMTE5LjEgMjU4LjA1TDExOC45OCAyNjMuOUwxMTkuMSAyNjkuNzVMMTE5LjQ1IDI3NS41NEwxMjAuMDMgMjgxLjI2TDEyMC44NCAyODYuOTJMMTIxLjg2IDI5Mi41TDEyMy4xIDI5OEwxMjQuNTYgMzAzLjQyTDEyNi4yMSAzMDguNzVMMTI4LjA3IDMxMy45OUwxMzAuMTMgMzE5LjEzTDEzMi4zOCAzMjQuMTdMMTM0LjgyIDMyOS4xMUwxMzcuNDQgMzMzLjkzTDE0MC4yNCAzMzguNjRMMTQzLjIxIDM0My4yM0wxNDYuMzYgMzQ3LjdMMTQ5LjY3IDM1Mi4wNEwxNTMuMTQgMzU2LjI0TDE1Ni43NiAzNjAuMzFMMTYwLjU0IDM2NC4yM0wxNjQuNDYgMzY4LjAxTDE2OC41MyAzNzEuNjRMMTcyLjczIDM3NS4xMUwxNzcuMDcgMzc4LjQyTDE4MS41NCAzODEuNTZMMTg2LjEzIDM4NC41M0wxOTAuODQgMzg3LjMzTDE5NS42NiAzODkuOTZMMjAwLjYgMzkyLjM5TDIwNS42NCAzOTQuNjRMMjEwLjc4IDM5Ni43TDIxNi4wMiAzOTguNTZMMjIxLjM1IDQwMC4yMkwyMjYuNzcgNDAxLjY3TDIzMi4yOCA0MDIuOTFMMjM3Ljg2IDQwMy45NEwyNDMuNTEgNDA0Ljc0TDI0OS4yMyA0MDUuMzJMMjU1LjAyIDQwNS42N0wyNjAuODcgNDA1Ljc5TDI2Ni43MiA0MDUuNjdMMjcyLjUxIDQwNS4zMkwyNzguMjMgNDA0Ljc0TDI4My44OSA0MDMuOTRMMjg5LjQ3IDQwMi45MUwyOTQuOTcgNDAxLjY3TDMwMC4zOSA0MDAuMjJMMzA1LjcyIDM5OC41NkwzMTAuOTYgMzk2LjdMMzE2LjEgMzk0LjY0TDMyMS4xNCAzOTIuMzlMMzI2LjA4IDM4OS45NkwzMzAuOSAzODcuMzNMMzM1LjYxIDM4NC41M0wzNDAuMiAzODEuNTZMMzQ0LjY3IDM3OC40MkwzNDkuMDEgMzc1LjExTDM1My4yMSAzNzEuNjRMMzU3LjI4IDM2OC4wMUwzNjEuMiAzNjQuMjNMMzY0Ljk4IDM2MC4zMUwzNjguNjEgMzU2LjI0TDM3Mi4wOCAzNTIuMDRMMzc1LjM5IDM0Ny43TDM3OC41MyAzNDMuMjNMMzgxLjUgMzM4LjY0TDM4NC4zIDMzMy45M0wzODYuOTMgMzI5LjExTDM4OS4zNiAzMjQuMTdMMzkxLjYxIDMxOS4xM0wzOTMuNjcgMzEzLjk5TDM5NS41MyAzMDguNzVMMzk3LjE5IDMwMy40MkwzOTguNjQgMjk4TDM5OS44OCAyOTIuNUw0MDAuOTEgMjg2LjkyTDQwMS43MSAyODEuMjZMNDAyLjI5IDI3NS41NEw0MDIuNjQgMjY5Ljc1TDQwMi43NiAyNjMuOUw0MDIuNjQgMjU4LjA1TDQwMi4yOSAyNTIuMjZMNDAxLjcxIDI0Ni41NEw0MDAuOTEgMjQwLjg5TDM5OS44OCAyMzUuMzFMMzk4LjY0IDIyOS44TDM5Ny4xOSAyMjQuMzhMMzk1LjUzIDIxOS4wNUwzOTMuNjcgMjEzLjgxTDM5MS42MSAyMDguNjdMMzg5LjM2IDIwMy42M0wzODYuOTMgMTk4LjY5TDM4NC4zIDE5My44N0wzODEuNSAxODkuMTZMMzc4LjUzIDE4NC41N0wzNzUuMzkgMTgwLjFMMzcyLjA4IDE3NS43NkwzNjguNjEgMTcxLjU2TDM2NC45OCAxNjcuNDlMMzYxLjIgMTYzLjU3TDM1Ny4yOCAxNTkuNzlMMzUzLjIxIDE1Ni4xN0wzNDkuMDEgMTUyLjdMMzQ0LjY3IDE0OS4zOUwzNDAuMiAxNDYuMjRMMzM1LjYxIDE0My4yN0wzMzAuOSAxNDAuNDdMMzI2LjA4IDEzNy44NUwzMjEuMTQgMTM1LjQxTDMxNi4xIDEzMy4xNkwzMTAuOTYgMTMxLjFMMzA1LjcyIDEyOS4yNEwzMDAuMzkgMTI3LjU5TDI5NC45NyAxMjYuMTNMMjg5LjQ3IDEyNC44OUwyODMuODkgMTIzLjg3TDI3OC4yMyAxMjMuMDZMMjcyLjUxIDEyMi40OEwyNjYuNzIgMTIyLjEzTDI2MC44NyAxMjIuMDFMMjU1LjAyIDEyMi4xM0wyNDkuMjMgMTIyLjQ4WiIgaWQ9ImJpVVlobFRwNiI+PC9wYXRoPjwvZGVmcz48Zz48Zz48Zz48dXNlIHhsaW5rOmhyZWY9IiNiaVVZaGxUcDYiIG9wYWNpdHk9IjEiIGZpbGw9IiM1OTU5NTkiIGZpbGwtb3BhY2l0eT0iMSI+PC91c2U+PC9nPjwvZz48L2c+PC9zdmc+"},
  // Status Type
  "STATUS"		: {Type: "Text"	, Align: "Center"	, Width: 50		, Formula: "Row.Deleted ? 'D' : Row.Added ? 'I' : Row.Changed ? 'U' : 'R'", Format: { 'I': '�Է�', 'U': '����', 'D': '����', 'R': '' }},
  // DelCheck Type
  "DelCheck"	: {Type: "Bool"	, Width: 50,
    OnClick: function(evtParam){
    	//�θ� üũ�Ǿ� �ִ� ��� �� �̻� �������� �ʴ´�.
    	var chked = !(evtParam.row[evtParam.col]);
    	var prows = evtParam.sheet.getParentRows( evtParam.row);
    	if(!chked && prows[0] && prows[0][evtParam.col]) return true;	
    },
    OnChange: function (evtParam) {
    	var chked = evtParam.row[evtParam.col];
    	//�ű��࿡ ���ؼ��� ��� �����Ѵ�.
      if (evtParam.row.Added) {
        setTimeout(function () {
          evtParam.sheet.removeRow(evtParam.row);
        }, 30);
      } else {
      	//���� ���� ���·� ����
        evtParam.sheet.deleteRow(evtParam.row, evtParam.row[evtParam.col]);
        //�ڽ��� ����
        var rows = evtParam.sheet.getChildRows(evtParam.row);
        rows.push(evtParam.row);

        //��� üũ�ϰ� ���� �Ұ��� ����
        for(var i=0;i<rows.length;i++){
        	var row = rows[i];
        	evtParam.sheet.setValue (row ,evtParam.col, chked, 0 );
         	row.CanEdit = !evtParam.row[evtParam.col];
         	if (!row[evtParam.col+"CanEdit"]) {
		        row[evtParam.col+"CanEdit"] = true;
		      }
         	evtParam.sheet.refreshRow(row);	
        }
      }
    }
  }
};

function clone(obj) {
  if (obj === null || typeof (obj) !== 'object') return obj;
  var copy = obj.constructor();
  for (var attr in obj) {
    if (obj.hasOwnProperty(attr)) {
      copy[attr] = clone(obj[attr]);
    }
  }
  return copy;
}

/*
ibsheet7 migration functions
*/
if (!_IBSheet.v7) _IBSheet.v7 = {};

/*
 * ibsheet7 AcceptKey �Ӽ� ����
 * param list
 * objColumn : ��Ʈ ������ Cols��ü�� �÷�
 * str : ibsheet7 AcceptKeys�� �����ߴ� ��Ʈ��
 */
_IBSheet.v7.convertAcceptKeys = function (objColumn, str) {
  // EditMask�� ���� AcceptKeys�� �����ϰ� ����
  var acceptKeyArr = str.split("|");
  var mask = "";

  for (var i = 0; i < acceptKeyArr.length; i++) {
    switch (acceptKeyArr[i]) {
      case "E":
        mask += "|\\w";
        break;
      case "N":
        mask += "|\\d";
        break;
      case "K":
        mask += "|\\u3131-\\u314e|\\u314f-\\u3163|\\uac00-\\ud7a3"
        break;
      default:
        if (acceptKeyArr[i].substring(0, 1) == "[" && acceptKeyArr[i].substring(acceptKeyArr[i].length - 1) == "]") {
          var otherKeys = acceptKeyArr[i].substring(1, acceptKeyArr[i].length - 1);
          for (var x = 0; x < otherKeys.length; x++) {
            if (otherKeys[x] == "." || otherKeys[x] == "-") {
              mask += "|\\" + otherKeys[x];
            } else {
              mask += "|" + otherKeys[x];
            }
          }
        }
        break;
    }
  }
  objColumn.EditMask = "^[" + mask.substring(1) + "]*$";
};

//Date Format migration
//exam)
/*
//������ �ε� �̺�Ʈ���� ȣ���մϴ�.
options.Events.onBeforeDataLoad:function(obj){
  //��¥���� �÷��� ���� ibsheet8�� �°� �����Ͽ� �ε��Ŵ
  IBSheet.v7.convertDateFormat(obj);
}
*/
_IBSheet.v7.convertDateFormat = function (obj) {
  var cdata = obj.data;
  var changeCol = {};
  //��¥ �÷��� ���� ������ ������ ����
  var cols = obj.sheet.getCols();
  for (var i = 0; i < cols.length; i++) {
    var colName = cols[i];

    if (obj.sheet.Cols[colName].Type == "Date") {
      //DataFormat�� ������ EditFormat �̳� ���˿��� ���ĺ��� ����
      var format = (obj.sheet.Cols[colName].DataFormat) ? obj.sheet.Cols[colName].DataFormat : (obj.sheet.Cols[colName].EditFormat) ? obj.sheet.Cols[colName].EditFormat : obj.sheet.Cols[colName].Format.replace(/([^A-Za-z])+/g, "");
      changeCol[colName] = {
        format: format,
        length: format.length
      };
    }
  }

  if (Object.keys(changeCol).length !== 0) {
    var changeColKeys = Object.keys(changeCol);

    //DataFormat�� ���̸�ŭ ���ڿ��� �ڸ�
    for (var row = 0; row < cdata.length; row++) {
      for (var colName in cdata[row]) {
        if (changeColKeys.indexOf(colName) > -1) {
          // ���ڿ��� ó��
          if (typeof ((cdata[row])[colName]) == "string") {
            //���� ��
            var v = (cdata[row])[colName];
            //MMdd�� ���� 8�ڸ� �̻��̸� �߰��� 4�ڸ��� pick
            if (changeCol[colName].format == "MMdd" && v.length != 4) {
              if (v.length > 7) {
                v = v.substr(4, 4);
              }
            } else {
              //�Ϲ������� ��� ������ ���ڿ� ���̸�ŭ �ڸ�
              v = v.substr(0, changeCol[colName].length);
            }
            //������ ���� ���� ��ġ�� ����
            (cdata[row])[colName] = v;
          }
        }
      }
    }
  }
};

/* ibsheet7�� Tree ���� Json �����͸� ibsheet8 ���Ŀ� �°� �Ľ����ִ� �޼ҵ� */
_IBSheet.v7.convertTreeData = function (data7) {
    var targetArr;
    var toString = Object.prototype.toString;
    var startLevel = 0;
    switch (toString.call(data7)) {
      case "[object Object]":
        if (!(data7["data"] || data7["Data"]) ||
          toString.call((data7["data"] || data7["Data"])) !== "[object Array]")
          return false;
        targetArr = (data7["data"] || data7["Data"]);
        break;
      case "[object Array]":
        targetArr = data7;
        break;
      default:
        return false;
    }

    targetArr = targetArr.reduce(function (accum, currentVal, curretIndex, array) {
      var cloneObj = clone(currentVal);
      if (cloneObj["HaveChild"]) {
        cloneObj["Count"] = true;
        delete cloneObj["HaveChild"];
      }
      if (accum.length == 0) {
        startLevel = parseInt(cloneObj["Level"]);
        delete cloneObj["Level"];
        accum.push(cloneObj);
      } else if (currentVal["Level"] <= startLevel) {
        startLevel = parseInt(cloneObj["Level"]);
        delete cloneObj["Level"];
        accum.push(cloneObj);
      } else if (currentVal["Level"]) {
        var parent = accum[accum.length - 1];
        for (var i = startLevel; i < parseInt(currentVal["Level"]); i++) {
          if (i === parseInt(currentVal["Level"]) - 1) {
            if (!parent.Items) {
              parent.Items = [];
            }
            delete cloneObj["Level"];
            parent.Items.push(cloneObj);
          } else {
            parent = parent.Items[parent.Items.length - 1];
          }
        }
      }
      return accum;
    }, []);

    delete data7["Data"];
    data7["data"] = targetArr;

  return data7;
};

/*
 * �Ϲ� �޷� ���� ��� �Լ�
 * @param   : id          - fromȤ�� to ��¥�� ǥ�õ� input ��ü
 * @param   : format      - ��¥ ���� YMD
 * @version : 1.0.0.0,
 *
 * @sample1
 * <span>
 * <input  type="text" name="eDate" id="eDate" DATE='YMD'/>
 * <button class='calbtn' onclick='IBSheet.v7.IBS_Calendar("eDate","yyyy-MM-dd")'>�޷�</button>
 * </span>
 */
_IBSheet.v7.IBS_Calendar = function(id,format) {
    event.preventDefault();
    var opt = {
            Date:$("#"+id).val(),
            Format:format,
            OnButtonClick:function(evt){
                if(evt==2){ //�����
                    $("#"+id).val("");
                }
                calObj.Close();
            },
    };
    if(format=="yyyy-MM")opt.Buttons = 4;
    function calPickCallBack(v){
        $("#"+id).val(IBSheet.dateToString(parseInt(v), format) );
    }
    var calObj = IBSheet.showCalendar(opt,{Tag:id},calPickCallBack);
}
/**
 * ���� ���� ���� �ѹ��� hideRow�ϴ� API
 * @method     hideRows
 * @param      {array[row objct]}    rows   ������ �ο� ��ü�� ����ִ� �迭
 * @return     none
*/
Fn.hideRows = function(rows) {
  if (!Array.isArray(rows)) return;

  for (var i = 0; i < rows.length; i++) {
    this.hideRow(rows[i], 0, 1, 1);
  }
  this.renderBody();
}

/**
 * ��Ʈ���� �������� ������ �ο� ��ü���� ��ȯ�ϴ� API
 * @method     hideRows
 * @param      boolean   noSubTotal   �Ұ�/���� ���� �������� ����
 * @return     array[row object]
*/
Fn.getDataVisibleRows = function (noSubTotal) {
  var rows = [], row = this.getFirstVisibleRow();

  while (row) {
    if (row.Kind === 'Data') {
      if ((noSubTotal && row.Name !== "SubSum") || !noSubTotal) {
        rows[rows.length] = row;
      }
    }
    row = this.getNextVisibleRow(row);
  }

  return rows;
}

/*------------------------------------------------------------------------------
method : IBS_CopyForm2Sheet()
desc  : Form��ü�� �ִ� ������ ��Ʈ�� ����
param list
param : json ����

param ���� ������
sheet : ���� �Է� ���� ibsheet ��ü (�ʼ�)
form : copy�� ����ü (�ʼ�)
row : ibsheet ��ü�� �� (default : ���� ���õ� ��)
sheetPreFiex : ������ ��Ʈ�� SavaName �տ� PreFix ���� (default : "")
formPreFiex : ������ ����ü�� �̸� Ȥ�� id �տ�  PreFix ���� (default : "")
-------------------------------------------------------------------------------*/
_IBSheet.v7.IBS_CopyForm2Sheet = function(param) {
    var sheetobj,
        formobj,
        row,
        sheetPreFix,
        frmPreFix,
        col,
        colName,
        baseName,
        frmchild,
		fType,
		sType,
        sValue;

    if ((!param.sheet) || (typeof param.sheet.version != "function")) {
        _IBSheet.v7.IBS_ShowErrMsg("sheet ���ڰ� ���ų� ibsheet��ü�� �ƴմϴ�.");
        return false;
    }
    if (param.form == null || typeof param.form != "object" || param.form.tagName != "FORM") {
        _IBSheet.v7.IBS_ShowErrMsg("form ���ڰ� ���ų� FORM ��ü�� �ƴմϴ�.");
        return false;
    }

    sheetobj = param.sheet;
    formobj = param.form;
    row = param.row == null ? sheetobj.getFocusedRow() : param.row;
    sheetPreFix = param.sheetPreFix == null ? "" : param.sheetPreFix;
    frmPreFix = param.formPreFix == null ? "" : param.formPreFix;
    if (typeof row == "undefined") {
        _IBSheet.v7.IBS_ShowErrMsg("row ���ڰ� ����, ���õ� ���� �������� �ʽ��ϴ�.");
        return;
    }

    //Sheet�� �÷�������ŭ ã�Ƽ� HTML�� Form �� Control�� ���� �����Ѵ�.
    //�÷�������ŭ ���� ����
    cols = sheetobj.getCols();
    for (var col = 0; col < cols.length ; col++) {
        //�÷��� ������ ���ڿ��� �����´�.
        colName = cols[col];

        //PreFix�� ���� ���� ������ SaveName�� �����´�.
        baseName = colName.substring(sheetPreFix.length);

        frmchild = null;
        try {
            //���� �ִ� �ش� �̸��� ��Ʈ���� �����´�.��)"frm_CardNo"
            frmchild = formobj[frmPreFix + baseName];
        } catch (e) {

        }

        //���� �ش��ϴ� �̸��� ��Ʈ���� ���� ���� ��� �����Ѵ�.
        if (frmchild == null) continue;

        fType = frmchild.type;
        sValue = "";

        //radio�� ��� frmchild�� �迭���°� �ǹǷ�, frmchild.type���δ� Ÿ���� �˼� ����.
        if (typeof fType == "undefined" && frmchild.length > 0) {
            fType = frmchild[0].type;
        }
		sType = sheetobj.getType(row,colName);
		//�Ϻ� ������ �Ұ����� Ÿ���� �÷��� �ǳʶ���.
		if(sType=="Button" || sType == "Link" || sType == "Img") continue;

        //Ÿ�Ժ��� ���� �����Ѵ�.
        switch (fType) {
            case undefined:
            case "button":
            case "reset":
            case "submit":
                break;
            case "radio":
                for (var idx = 0; idx < frmchild.length; idx++) {
                    if (frmchild[idx].checked) {
                        sValue = frmchild[idx].value;
                        break;
                    }
                }
                break;
            case "checkbox":
                sValue = (frmchild.checked) ? 1 : 0;
                break;
            default:
                sValue = frmchild.value;
        } //end of switch
        sheetobj.setString(row, sheetPreFix + baseName, sValue, 0);
    } //end of for(col)
	sheetobj.refreshRow(row);
    //�������� ó���Ϸ�
    return true;
}
/*----------------------------------------------------------------------------
method : IBS_CopySheet2Form()
desc : ��Ʈ�� �� ���� ����ü�� ����  (ibsheet7 ibsheetinfo.js ���̱׷��̼�)

param list
param : json ����

param ���� ������
sheet : ���� �Է� ���� ibsheet ��ü (�ʼ�)
form : copy�� ����ü (�ʼ�)
row : ibsheet ��ü�� �� (default : ���� ���õ� ��)
sheetPreFix : ������ ��Ʈ�� SavaName �տ� PreFix ���� (default : "")
formPreFix : ������ ����ü�� �̸� Ȥ�� id �տ�  PreFix ���� (default : "")
-----------------------------------------------------------------------------*/
_IBSheet.v7.IBS_CopySheet2Form = function(param) {
    var sheetobj,
    formobj,
    row,
    sheetPreFix,
    frmPreFix,
    cols,
    col,
    rmax,
    colName,
    baseName,
    sheetvalue,
    sheetstring,
    frmchild,
    sType,
    fType,
    sValue;

    if ((!param.sheet) || (typeof param.sheet.version != "function")) {
        _IBSheet.v7.IBS_ShowErrMsg("sheet ���ڰ� ���ų� ibsheet��ü�� �ƴմϴ�.");
        return false;
    }

    if (param.form == null || typeof param.form != "object" || param.form.tagName != "FORM") {
        _IBSheet.v7.IBS_ShowErrMsg("form ���ڰ� ���ų� FORM ��ü�� �ƴմϴ�.");
        return false;
    }
    sheetobj = param.sheet;
    formobj = param.form;
    row = param.row == null ? sheetobj.getFocusedRow() : param.row;
    sheetPreFix = param.sheetPreFix == null ? "" : param.sheetPreFix;
    frmPreFix = param.formPreFix == null ? "" : param.formPreFix;

    if (typeof row == "undefined") {
        _IBSheet.v7.IBS_ShowErrMsg("row ���ڰ� ����, ���õ� ���� �������� �ʽ��ϴ�.");
        return false;
    }

    //Sheet�� �÷�������ŭ ã�Ƽ� HTML�� Form �� Control�� ���� �����Ѵ�.
    //�÷�������ŭ ���� ����
    cols = sheetobj.getCols();
    for (var col = 0; col < cols.length ; col++) {
        //�÷��� �̸��� �����´�.
        colName = cols[col];

        //PreFix�� ���� ���� ������ Name�� �����´�.
        baseName = colName.substring(sheetPreFix.length);

        sheetvalue = sheetobj.getValue(row, colName);

        frmchild = null;
        try {
            //���� �ִ� �ش� �̸��� ��Ʈ���� �����´�.��)"frm_CardNo"
            frmchild = formobj[frmPreFix + baseName];
        } catch (e) {

        }

        //���� �ش��ϴ� �̸��� ��Ʈ���� ���� ���� ��� �����Ѵ�.
        if (frmchild == null) {
            continue;
        }

        fType = frmchild.type;
        sValue = "";
        //radio�� ��� frmchild�� �迭���°� �ǹǷ�, frmchild.type���δ� Ÿ���� �˼� ����.
        if (typeof fType == "undefined" && frmchild.length > 0) {
            fType = frmchild[0].type;
        }
        sType = sheetobj.getType(row,colName);

        //�Ϻ� ������ �Ұ����� Ÿ���� �÷��� �ǳʶ���.
        if(sType=="Button" || sType == "Link" || sType == "Img") continue;

        //Ÿ�Ժ��� ���� �����Ѵ�.
        switch (fType) {
            case undefined:
            case "button":
            case "reset":
            case "submit":
                break;
            case "select-one":
                frmchild.value = sheetvalue;
                break;
            case "radio":
                for (var idx = 0, rmax = frmchild.length; idx < rmax; idx++) {
                    if (frmchild[idx].value == sheetvalue) {
                        frmchild[idx].checked = true;
                        break;
                    }
                }
                break;
            case "checkbox":
                frmchild.checked = (sheetvalue == 1);
                break;
            default:
                sheetstring = sheetobj.getString(row, colName);
                //���� ���� ����, EmptyValue�� �ִ� ���, EmptyValue ���� ����Ǵ°� ����.
                if(sheetvalue==="" && sheetstring!==""){
                    sheetstring = "";
                }
                frmchild.value = sheetstring;
                break;
        } //end of switch
    } //end of for(col)

    //�������� ó���Ϸ�
    return true;
}
//ibsheet7 ���� ���̱׷��̼�
/*
 * Form������Ʈ �ȿ� �ִ� ��Ʈ���� QueryString���� �����Ѵ�.
 * @param   : form          - form��ü Ȥ�� form��ü id
 * @param   : checkRequired - ����,�ʼ��Է� üũ ���� (boolean(default:true))
 * @param   : encoding      - ���ڿ� ���ڵ� ���� (boolean(default:true))
 * @return  : String        - Form������Ʈ �ȿ� elements�� QueryString���� ������ ���ڿ�
 *            undefined     - checkRequired���ڰ� true�̰�, �ʼ��Է¿� �ɸ���� return ��
 * @version : 1.0.0.0,
 *
 * @sample1
 *  var sCondParam=FormQueryString(document.frmSearch); //���:"txtname=�̰���&rdoYn=1&sltMoney=��ȭ";
 * @sample2
 *  <input type="text" name="txtName" required="�̸�">        //�ʼ� �Է� �׸��̸� required="�̸�" �� �����Ѵ�.
 *  var sCondParam = FormQueryString(document.mainForm, true);//�ʼ��Է±��� üũ�ϸ�, �ʼ��Է¿� �ɸ��� ���ϰ��� undefined
 *  if (sCondParam==null) return;
 */
_IBSheet.v7.IBS_FormQueryString = function(form, checkRequired, encoding) {
    if(typeof form == "string") form = document.getElementById(form)||document[form];
    if (typeof form != "object" || form.tagName != "FORM") {
        _IBSheet.v7.IBS_ShowErrMsg("FormQueryString �Լ��� ���ڴ� FORM �±װ� �ƴմϴ�.");
        return;
    }
    //default setting
    if(typeof checkRequired == "undefined") checkRequired = true;
    if(typeof encoding == "undefined") encoding = true;

    var name = new Array(form.elements.length);
    var value = new Array(form.elements.length);
    var j = 0;
    var plain_text = "";

    //��밡���� ��Ʈ���� �迭�� �����Ѵ�.
    var len = form.elements.length;
    for (var i = 0; i < len; i++) {
        var prev_j = j;
        switch (form.elements[i].type) {
            case undefined:
            case "button":
            case "reset":
            case "submit":
                break;
            case "radio":
            case "checkbox":
                if (form.elements[i].checked == true) {
                    name[j] = _IBSheet.v7.IBS_GetName(form.elements[i]);
                    value[j] = form.elements[i].value;
                    j++;
                }
                break;
            case "select-one":
                name[j] = _IBSheet.v7.IBS_GetName(form.elements[i]);
                var ind = form.elements[i].selectedIndex;
                if (ind >= 0) {

                    value[j] = form.elements[i].options[ind].value;

                } else {
                    value[j] = "";
                }
                j++;
                break;
            case "select-multiple":
                name[j] = _IBSheet.v7.IBS_GetName(form.elements[i]);
                var llen = form.elements[i].length;
                var increased = 0;
                for (var k = 0; k < llen; k++) {
                    if (form.elements[i].options[k].selected) {
                        name[j] = _IBSheet.v7.IBS_GetName(form.elements[i]);
                        value[j] = form.elements[i].options[k].value;
                        j++;
                        increased++;
                    }
                }
                if (increased > 0) {
                    j--;
                } else {
                    value[j] = "";
                }
                j++;
                break;
            default:
                name[j] = _IBSheet.v7.IBS_GetName(form.elements[i]);
                value[j] = form.elements[i].value;
                j++;
        }

        if (checkRequired) {
            //html ��Ʈ�� �±׿� required�Ӽ��� �����ϸ� �ʼ��Է��� Ȯ���� �� �ִ�.
            //<input type="text" name="txtName" required="�̸�">

            if (_IBSheet.v7.IBS_RequiredChk(form.elements[i]) && prev_j != j && value[prev_j] == "") {

                if (form.elements[i].getAttribute("required") == null ||
                    form.elements[i].getAttribute("required") == ""
                ) {
                    alert('"' + _IBSheet.v7.IBS_GetLabel(form.elements[i]) + '" �� �ʼ� �Է� �׸� �Դϴ�.' );
                } else {

                    alert('"' + form.elements[i].getAttribute("required") + '" �� �ʼ� �Է� �׸� �Դϴ�.');
                }
                //��Ʈ���� ������ �������� �����Ƿ� ���� ���Ѵ�.
                try {
                    form.elements[i].focus();
                } catch (ee) {;
                }

                return;
            }
        }
    }
    //QueryString�� �����Ѵ�.
    for (var i = 0; i < j; i++) {
        if (name[i] != ''){
            if(encoding){
                plain_text += encodeURIComponent(name[i]) + "=" + encodeURIComponent(value[i]) + "&";
            }else{
                plain_text += name[i] + "=" + value[i] + "&";
            }
        }
    }

    //�������� &�� ���ֱ� ����
    if (plain_text != "") plain_text = plain_text.substr(0, plain_text.length - 1);

    return plain_text;
}
//ibsheet7 ���� ���̱׷��̼�
/*
 * Form������Ʈ �ȿ� �ִ� ��Ʈ���� Json Object���� �����Ѵ�.
 * @param   : form          - form��ü Ȥ�� form��ü id
 * @param   : checkRequired - ����,�ʼ��Է� üũ ���� (boolean(default:true))
 * @param   : encoding      - ���ڿ� ���ڵ� ���� (boolean(default:true))
 * @return  : String        - Form������Ʈ �ȿ� elements�� QueryString���� ������ ���ڿ�
 *            undefined     - checkRequired���ڰ� true�̰�, �ʼ��Է¿� �ɸ���� return ��
 * @version : 1.0.0.0,
 *
 * @sample1
 *  var sCondParam=FormToJson(document.frmSearch); //���: {txtname:"�̰���" , "rdoYn":"on","sltMoney":"��ȭ"};
 * @sample2
 *  <input type="text" name="txtName" required="�̸�">        //�ʼ� �Է� �׸��̸� required="�̸�" �� �����Ѵ�.
 *  var sCondParam = FormToJson(document.mainForm, true);//�ʼ��Է±��� üũ�ϸ�, �ʼ��Է¿� �ɸ��� ���ϰ��� undefined
 *  if (sCondParam==null) return;
 */
_IBSheet.v7.IBS_FormToJson = function(form, checkRequired, encoding) {
    if(typeof form == "string") form = document.getElementById(form)||document[form];
    if (typeof form != "object" || form.tagName != "FORM") {
        _IBSheet.v7.IBS_ShowErrMsg("FormToJson �Լ��� ���ڴ� FORM �±װ� �ƴմϴ�.");
        return;
    }
    //default setting
    if(typeof checkRequired == "undefined") checkRequired = true;
    if(typeof encoding == "undefined") encoding = true;

    var name = new Array(form.elements.length);
    var value = new Array(form.elements.length);
    var j = 0;
    var plain_obj = {};

    //��밡���� ��Ʈ���� �迭�� �����Ѵ�.
    var len = form.elements.length;
    for (var i = 0; i < len; i++) {
        var prev_j = j;
        switch (form.elements[i].type) {
            case undefined:
            case "button":
            case "reset":
            case "submit":
                break;
            case "radio":
            case "checkbox":
                if (form.elements[i].checked == true) {
                    name[j] = _IBSheet.v7.IBS_GetName(form.elements[i]);
                    value[j] = form.elements[i].value;
                    j++;
                }
                break;
            case "select-one":
                name[j] = _IBSheet.v7.IBS_GetName(form.elements[i]);
                var ind = form.elements[i].selectedIndex;
                if (ind >= 0) {
                    value[j] = form.elements[i].options[ind].value;
                } else {
                    value[j] = "";
                }
                j++;
                break;
            case "select-multiple":
                name[j] = _IBSheet.v7.IBS_GetName(form.elements[i]);
                var llen = form.elements[i].length;
                var increased = 0;
                for (var k = 0; k < llen; k++) {
                    if (form.elements[i].options[k].selected) {
                        name[j] = _IBSheet.v7.IBS_GetName(form.elements[i]);
                        value[j] = form.elements[i].options[k].value;
                        j++;
                        increased++;
                    }
                }
                if (increased > 0) {
                    j--;
                } else {
                    value[j] = "";
                }
                j++;
                break;
            default:
                name[j] = _IBSheet.v7.IBS_GetName(form.elements[i]);
                value[j] = form.elements[i].value;
                j++;
        }

        if (checkRequired) {
            //html ��Ʈ�� �±׿� required�Ӽ��� �����ϸ� �ʼ��Է��� Ȯ���� �� �ִ�.
            //<input type="text" name="txtName" required="�̸�">

            if (_IBSheet.v7.IBS_RequiredChk(form.elements[i]) && prev_j != j && value[prev_j] == "") {

                if (form.elements[i].getAttribute("required") == null ||
                    form.elements[i].getAttribute("required") == ""
                ) {
                    alert('"' + _IBSheet.v7.IBS_GetLabel(form.elements[i]) + '" �� �ʼ� �Է� �׸� �Դϴ�.' );
                } else {

                    alert('"' + form.elements[i].getAttribute("required") + '" �� �ʼ� �Է� �׸� �Դϴ�.');
                }
                //��Ʈ���� ������ �������� �����Ƿ� ���� ���Ѵ�.
                try {
                    form.elements[i].focus();
                } catch (ee) {;
                }

                return;
            }
        }
    }

    //JSON�� �����Ѵ�.
    var tname = "";
    var tvalue = "";
    for (var i = 0; i < j; i++) {
        if(encoding){
            tname = encodeURIComponent(name[i]);
            tvalue = encodeURIComponent(value[i])
        }else{
            tname = name[i];
            tvalue = value[i];
        }
        if (name[i] != ''){
                //�̹� �ִٸ� �迭�� ����
                if(plain_obj[tname]){
                    //�̹� �迭�� ���
                    if( Array.isArray(plain_obj[tname]) ){
                        plain_obj[tname].push(tvalue);
                    }else{
                        plain_obj[tname] = [plain_obj[tname] , tvalue ];
                    }
                }else{
                    plain_obj[tname] = tvalue;
                }
        }
    }

    return plain_obj;
}
/*
 * FromToCalendar ���� ��� �Լ�
 * @param   : id          - fromȤ�� to ��¥�� ǥ�õ� input ��ü
 * @param   : format      - ��¥ ���� YMD
 * @version : 1.0.0.0,
 *
 * @sample1
 *  <span>
 *  <input type='text' name="fromID" id="fromID" DATE='FromYMD' DATE_REF="toID"/>
 *  <button class='calbtn' onclick='IBSheet.v7.IBS_FromToCalendar("fromID","yyyy-MM-dd")'>�޷�</button>
 *  ~ <input type='text' name="toID" id="toID" DATE='ToYMD' DATE_REF="fromID"/>
 *  <button class='calbtn' onclick='IBSheet.v7.IBS_FromToCalendar("toID","yyyy-MM-dd")'>�޷�</button>
 *  </span>
 */
_IBSheet.v7.IBS_FromToCalendar = function(id,format) {
    if(event!=null){
	    event.preventDefault();
    }
    var ele = document.getElementById(id);
    var isFrom = ele.getAttribute("DATE")=="FromYMD";
    var oppoID = ele.getAttribute("DATE_REF");
    var oppoValue = document.getElementById(oppoID).value;
    var oppoValueTimeStamp = oppoValue!=""?IBSheet.stringToDate(oppoValue,format):null;
    var opt = {
            Format:format,
            RowsPrev:2,
            RowsNext:2,
            Buttons:6,
            Texts:{Ok:"�ݱ�",Clear:"�����"},
            OnCanEditDate:function(d){
              if(oppoValue!=""){
                  if(isFrom){
                      if(d>oppoValueTimeStamp) return false;
                  }else{
                      if(d<oppoValueTimeStamp) return false;
                  }
              }
            },
            OnGetCalendarDate:function(d,dt,cls,r){
                var targetValue = document.getElementById(id).value;
                if(oppoValue=="" || targetValue =="") return;
                var targetValueTimeStamp = IBSheet.stringToDate(targetValue,format);
                if(isFrom){
                    if(d>=targetValueTimeStamp && d<=oppoValueTimeStamp)  return "<span style='color:orange'>"+dt+"</span>";
                }else{
                    if(d<=targetValueTimeStamp && d>=oppoValueTimeStamp)  return "<span style='color:orange'>"+dt+"</span>";
                }
            },
            OnButtonClick:function(evt){
                if(evt==2){ //�����
                    $("#"+id).val("");
                }
                fromtoCal.Close();
            }
    };
    //�޷¿��� ���� ���ý� callback(�ݴ��� �޷��� ����.)
    function calPickCallBack(v){
        $("#"+id).val(IBSheet.dateToString(parseInt(v), format) );
        var ele = document.getElementById(id);
        var oppoID = ele.getAttribute("DATE_REF");
        var oppoValue = document.getElementById(oppoID).value;
        if(oppoValue==""){
			if(event!=null){
                event.preventDefault();
            }
            _IBSheet.v7.IBS_FromToCalendar(oppoID,format);
        }
    }
    var fromtoCal = IBSheet.showCalendar(opt,{Tag:id},calPickCallBack.bind(id));
}
//ibsheet7 ���� ���̱׷��̼�
//��Ʈ�� �� �÷� Name�� ������ "|"������ string���� ����
//param : ibsheet ��ü
_IBSheet.v7.IBS_ConcatSaveName = function(sheet) {
    return sheet.getCols().join("|");
}

/**
 * �����޽����� ǥ���Ѵ�. IBS_ShowErrMsg ��� �� �Լ��� ����ؾ� �Ѵ�.
 * @param   : sMsg      - �޽���
 * @return  : ����
 * @version : 3.4.0.50
 * @sample
 *  IBS_ShowErrMsg("������ �߻��߽��ϴ�.");
 */
_IBSheet.v7.IBS_ShowErrMsg = function(sMsg) {
    return alert("[ibsheet-common]\n" + sMsg);
}

//required ���� Ȯ��
_IBSheet.v7.IBS_RequiredChk = function(obj) {
    return (obj.getAttribute("required") != null);
}
//��ü�� id Ȥ�� name�� ����
_IBSheet.v7.IBS_GetName = function(obj) {
    if (obj.name != "") {
        return obj.name;
    } else if (obj.id != "") {
        return obj.id;
    } else {
        return "";
    }
}

//��ü�� label Ȥ�� id Ȥ�� name�� ����
_IBSheet.v7.IBS_GetLabel = function(obj){
    if(obj.labels && obj.labels.length>0){
        return obj.labels[0].textContent;
    } else{
        return _IBSheet.v7.IBS_GetName(obj);
    }
}
}(window, document));

