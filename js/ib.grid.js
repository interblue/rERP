document.write(
  '<link rel="stylesheet" type="text/css" href="/ibsheet8/css/webcash/main.css" />'
);
// Default
document.write(
  '<script type="text/javascript" src="/ibsheet8/ibleaders.js"></script>'
);
document.write(
  '<script type="text/javascript" src="/ibsheet8/ibsheet.js"></script>'
);
document.write(
  '<script type="text/javascript" src="/ibsheet8/locale/ko.js"></script>'
);
document.write(
  '<script type="text/javascript" src="/ibsheet8/locale/en.js"></script>'
);
// Plugins
document.write(
  '<script type="text/javascript" src="/ibsheet8/plugins/ibsheet-common.js"></script>'
);
document.write(
  '<script type="text/javascript" src="/ibsheet8/plugins/ibsheet-dialog.js"></script>'
);
document.write(
  '<script type="text/javascript" src="/ibsheet8/plugins/ibsheet-excel.js"></script>'
);
// Domains
document.write(
  '<script type="text/javascript" src="/js/domains/global.js"></script>'
);
document.write(
  '<script type="text/javascript" src="/js/domains/local.js"></script>'
);

var ib = ib || {};

const IBSheet_STS_INSERT = 'INSERT';
const IBSheet_STS_UPDATE = 'UPDATE';
const IBSheet_STS_DELETE = 'DELETE';
const IBSheet_STS_CODE = '|INSERT|UPDATE|DELETE';
const IBSheet_STS_NAME = '|입력|변경|삭제';

ib.grid = {
  addOption: function (options, ...params) {
    var opts = options;

    opts.Cfg = opts.Cfg ?? {};
    opts.Cfg.InfoRowConfig = opts.Cfg.InfoRowConfig ?? {};

    opts.Def = opts.Def ?? {};
    opts.Def.Header = opts.Def.Header ?? {};
    opts.Def.Header.Menu = opts.Def.Header.Menu ?? {};
    opts.Def.Row = opts.Def.Row ?? {};
    opts.Def.Row.Menu = opts.Def.Row.Menu ?? {};

    for (var i = 0; i < params.length; i++) {
      switch (params[i].toLowerCase()) {
        case 'canedit':
          opts.Cfg.CanEdit = 1;
          break;
        case 'disableheadercontext':
          opts.Def.Header.Menu.Items = [];
          break;
        case 'disablerowcontext':
          opts.Def.Row.Menu.Items = [];
          break;
        case 'headermerge':
          opts.Cfg.HeaderMerge = 4;
          break;
        case 'multirecord':
          opts.Cfg.MultiRecord = 1;
          break;
        case 'showinforow':
          opts.Cfg.InfoRowConfig.Visible = 1;
          break;
      }
    }

    return Object.assign(options, opts);
  },
  setGroup: function (options, params) {
    var opts = options;
    opts.Cfg = opts.Cfg ?? {};
    opts.Def = opts.Def ?? {};
    opts.Def.Row = opts.Def.Row ?? {};
    opts.Def.Group = opts.Def.Group ?? {};
    opts.Solid = opts.Solid ?? [{}];

    // Kind 의 값이 이미 지정되어 있으며 Group 이 아닌 경우
    if ('Group' !== (opts.Solid[0].Kind || 'Group')) {
      console.error('Cfg.Soild.Kind 옵션이 "Group"이 아닙니다.');
      return;
    }
    // Visible 이 0이면서 Group 이 지정되지 않은 경우
    else if (
      (params.Visible === false || params.Visible === 0) &&
      (params.Group || '') === ''
    ) {
      console.error(
        'Visible 을 1로 설정하거나 Group에 컬럼을 지정해야 합니다.'
      );
      return;
    }
    // GroupMain 이 지정되지 않은 경우
    else if (!params.GroupMain) {
      console.error('그룹핑 열을 표시할 컬럼을 GroupMain에 지정해야 합니다.');
      return;
    } else {
      // Cfg
      if ((params.Group || '') !== '') opts.Cfg.Group = params.Group;
      opts.Cfg.GroupMain = params.GroupMain;
      // Def
      opts.Def.Row.CanFormula = 1;
      opts.Def.Group.Expanded = params.Expanded ?? 1; // Default 펼침
      opts.Def.Group.Color = '#E6EFEF';
      if ((params.SumCols || '') !== '')
        this.setFormula(opts, params.SumCols, 'GroupSum');
      // Solid
      opts.Solid[0] = {
        Visible: params.Visible ?? 1,
        Kind: 'Group',
        Space: 0,
        id: 'GroupDiv',
        Cells: 'Custom,btnCollapseAll,btnExpandAll',
        btnCollapseAll: {
          Type: 'Button',
          Button: 'Button',
          AddClass: 'targetBtn',
          ButtonText: '모두접기',
          OnClick: collapseAll,
        },
        btnExpandAll: {
          Type: 'Button',
          Button: 'Button',
          AddClass: 'targetBtn',
          ButtonText: '모두펼치기',
          OnClick: expandAll,
        },
      };
    }

    function collapseAll(e) {
      e.sheet.showTreeLevel(1);
    }

    function expandAll(e) {
      e.sheet.showTreeLevel(10);
    }

    return Object.assign(options, opts);
  },
  setFormula: function (options, cols, kind) {
    var arr = cols.split(',');
    var opts = options;
    opts.Def = opts.Def ?? {};
    opts.Def.Group = opts.Def.Group ?? {};

    arr.map(function (v) {
      opts.Def.Group[v] = {Formula: ib.formula[kind]};
    });

    return Object.assign(options, opts);
  },
};

ib.formula = {
  GroupSum: function (obj) {
    var sum = 0;
    var rows = obj.Sheet.getChildRows(obj.Row);

    for (var i = 0; i < rows.length; i++) {
      if (rows[i].id && rows[i].id.indexOf(obj.Sheet.GroupIdPrefix) >= 0) {
        continue;
      }
      sum += rows[i][obj.Col];
    }

    return sum;
  },
};

ib.data = {
  getData: function (_sheet) {
    var ibKeywords = ['_ConstWidth']; // 예외처리 keyword
    var opts = _sheet.getUserOptions(2); // 옵션의 컬럼정보 리턴
    var cols = []; // 필터링된 컬럼 목록
    var tmpObj = {}; // 임시 JSON 데이터
    var result = []; // 리턴값

    if (!_sheet || !opts.hasOwnProperty('Cols'))
      console.log('그리드 옵션을 찾을 수 없습니다.');
    else {
      // 컬럼목록 필터링
      for (var row of opts.Cols) {
        if (row.hasOwnProperty('Name') && !ibKeywords.includes(row.Name))
          cols.push(row.Name);
      }
      // 컬럼목록 기준으로 JSON Array 생성
      for (var row of _sheet.getDataRows()) {
        for (var key in row) {
          if (cols.includes(key)) tmpObj[key] = row[key];
        }
        result.push(tmpObj);
        tmpObj = {};
      }
    }

    return result;
  },
  getEnumStr: function (obj, key) {
    var str = '';

    for (var row of obj) {
      str += row.hasOwnProperty(key) ? `|${row[key]}` : '';
    }

    return str;
  },
  getEnumObj: function (obj, map) {
    var keyStr = '';
    var valStr = '';
    var key = map?.KEY ?? 'KEY';
    var val = map?.VAL ?? 'VAL';

    for (var row of obj) {
      keyStr += row.hasOwnProperty(key) ? `|${row[key]}` : '';
      valStr += row.hasOwnProperty(val) ? `|${row[val]}` : '';
    }

    return {
      enumKeys: keyStr,
      enum: valStr,
    };
  },
  getEnumStr2: function (obj, key, opt) {
    if (
      typeof obj == 'undefined' ||
      typeof obj == 'null' ||
      obj == 'null' ||
      obj == null
    ) {
      return '|';
    }
    var str = '';

    if (!!!opt || (!!opt && opt.length == 0)) {
      str = '';
    } else {
      if (opt == '|') {
        str = opt;
      } else {
        str = '|' + opt;
      }
    }

    for (var row of obj) {
      str += row.hasOwnProperty(key) ? `|${row[key]}` : '';
    }

    return str;
  },
  getEditEnum: function (obj, key, val, optVal) {
    if (
      typeof obj == 'undefined' ||
      typeof obj == 'null' ||
      obj == 'null' ||
      obj == null
    ) {
      return '|';
    }
    var str = '';

    if (!!!optVal || (!!optVal && optVal.length == 0)) {
      str = '';
    } else {
      if (optVal == '|') {
        str = optVal;
      } else {
        str = '|' + optVal + '\t';
      }
    }

    for (var row of obj) {
      str += row.hasOwnProperty(key) ? `|${row[val]}\t${row[key]}` : '';
    }

    return str;
  },
};

ib.event = {
  onAfterChange: function (evtParam) {
    var eSheet = evtParam.sheet;
    var eRow = evtParam.row;

    if (eSheet.getColIndex('STATUS') > 0) {
      if (eRow.Added) {
        eSheet.setValue(eRow, 'STATUS', 'INSERT', 1);
      } else if (eRow.Deleted) {
        eSheet.setValue(eRow, 'STATUS', 'DELETE', 1);
      } else if (eRow.Changed) {
        eSheet.setValue(eRow, 'STATUS', 'UPDATE', 1);
      } else {
        eSheet.setValue(eRow, 'STATUS', '', 1);
      }
    }
  },
};

ib.def = {
  getDefault: function (colDefs) {
    let result = [];

    // 컬럼 정보에 domain 정보 추가
    for (let col of colDefs) {
      let __global = __global__[col.Name];
      let __local = __local__['UNIV_10']
        ? __local__['UNIV_10'][col.Name]
        : null;
      // global domain 이 없는 경우 warn
      if (!__global) {
        console.warn(`[${col.Name}] DOMAIN NOT FOUND`);
        result.push(col);
      } else {
        // 우선순위 : colDefs > local domain > global domain
        if (!!__local) Object.assign(__global, __local);
        result.push(Object.assign(__global, col));
      }
    }

    Object.assign(colDefs, result);
  },
};
