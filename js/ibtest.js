let data = [
  {
    PRJ_NO: '20240101',
    PRJ_NM: '과제A',
    PRJ_CHRG_GRP_NM: '과제담당자A',
    SUP_ORG_NM: '지원기관A',
    REQ_SEQ_NO: '',
    SUP_ENTP_NM: '지원사업A',
    RCH_ST_DT: '20240101',
  },
  {
    PRJ_NO: '20240102',
    PRJ_NM: '과제B',
    PRJ_CHRG_GRP_NM: '과제담당자A',
    SUP_ORG_NM: '지원기관A',
    REQ_SEQ_NO: '20240102000100001',
    SUP_ENTP_NM: '지원사업A',
    RCH_ST_DT: '20240201',
  },
  {
    PRJ_NO: '20240103',
    PRJ_NM: '과제C',
    PRJ_CHRG_GRP_NM: '과제담당자B',
    SUP_ORG_NM: '지원기관B',
    REQ_SEQ_NO: '20240103000100001',
    SUP_ENTP_NM: '지원사업C',
    RCH_ST_DT: '20240301',
    RCH_END_DT: '20250228',
  },
];

setGrid = () => {
  const colDefs = [
    //{Name: 'PRJ_NO', Header: ['과제정보', '과제번호']},
    //{Name: 'PRJ_NM', Header: ['과제정보', '과제명'], Width: 300},
    {Name: 'PRJ_NO'},
    {Name: 'PRJ_NM', Width: 300},
    {Name: 'PRJ_CHRG_GRP_NM'},
    {Name: 'SUP_ORG_NM'},
    {Name: 'REQ_SEQ_NO'},
    {Name: 'SUP_ENTP_NM'},
    {Name: 'RCH_ST_DT'},
    {Name: 'RCH_END_DT'},
  ];

  ib.def.getDefault(colDefs);

  const options = {Cols: colDefs};

  //ib.grid.addOption(options, 'HeaderMerge');

  IBSheet.create({id: 'sheet', el: 'divSheet', options});
};

setGridData = () => {
  sheet.loadSearchData(data);
};

setGrid();

setGridData();
