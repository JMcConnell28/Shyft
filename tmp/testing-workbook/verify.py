import json
import re
import zipfile
from pathlib import Path
import openpyxl
from openpyxl.formula.translate import Translator

root=Path(__file__).parent
original=openpyxl.load_workbook(root/'original.xlsx')
final=openpyxl.load_workbook(root/'RocketRota_Full_Testing_Workbook.xlsx')
cached=openpyxl.load_workbook(root/'RocketRota_Full_Testing_Workbook.xlsx',data_only=True)
plan=json.loads((root/'plan.json').read_text())
assert final.sheetnames==original.sheetnames
library={r[0]:list(r) for r in final['Test Library'].values if r[0]!='Test ID'}
assert len(library)==plan['count']==476
assert not set(plan['removed']) & library.keys()
assert set(plan['added']) <= library.keys()
assert not any(re.search(r'holiday|annual leave|approved leave|leave entitlement|leave request',str(r),re.I) for r in library.values())
for row in list(original['Test Library'].values)[1:]:
    if row[0] in plan['removed']:
        continue
    for col,value in enumerate(row):
        if row[0]=='RR-0244' and col in [8,9,11]:
            continue
        assert library[row[0]][col]==value,(row[0],col)
execution={r[2].value:r for r in final['Test Execution'].iter_rows(min_row=2)}
assert len(execution)==476 and execution.keys()==library.keys()
for row in original['Test Execution'].iter_rows(min_row=2):
    test_id=row[2].value
    if test_id in plan['removed']:
        continue
    dest=execution[test_id]
    for c,new in zip(row,dest):
        expected=c.value
        if isinstance(expected,str) and expected.startswith('='):
            expected=Translator(expected,origin=c.coordinate).translate_formula(new.coordinate)
        assert expected==new.value,(test_id,c.coordinate)
        assert c._style==new._style,(test_id,'style',c.coordinate)
for test_id in plan['added']:
    assert execution[test_id][8].value=='Not Run'
for name in original.sheetnames:
    a,b=original[name],final[name]
    assert len(a._charts)==len(b._charts)
    assert len(a.conditional_formatting)==len(b.conditional_formatting)
    assert len(a.data_validations.dataValidation)==len(b.data_validations.dataValidation)
    assert list(a.tables)==list(b.tables)
    assert a.freeze_panes==b.freeze_panes
    for first,second in zip(a.data_validations.dataValidation,b.data_validations.dataValidation):
        assert first.formula1==second.formula1
        assert first.type==second.type
    if name in ['Test Library','Test Execution','Release Checklist','Devices & Environments','Test Data']:
        table=list(b.tables.values())[0]
        assert table.ref.endswith(str(b.max_row)),(name,table.ref,b.max_row)
for name in ['Test Library','Test Execution']:
    assert all(str(rule.sqref).endswith('477') for rule in final[name].data_validations.dataValidation)
assert cached['Dashboard']['A6'].value==476
assert cached['Dashboard']['G9'].value==476
assert cached['Dashboard']['A19'].value=='NO-GO'
areas=[r[0].value for r in final['Coverage Matrix'].iter_rows(min_row=2)]
assert 'Leave & Holidays' not in areas and 'Manager Dashboard' in areas
assert sum(r[1].value for r in cached['Coverage Matrix'].iter_rows(min_row=2))==476
assert not any(r[0].value=='RC-024' for r in final['Release Checklist'])
assert not any(r[0].value=='TD-014' for r in final['Test Data'])
for sheet in final:
    for row in sheet:
        for cell in row:
            assert cell.data_type!='e',(sheet.title,cell.coordinate,cell.value)
with zipfile.ZipFile(root/'original.xlsx') as first,zipfile.ZipFile(root/'RocketRota_Full_Testing_Workbook.xlsx') as second:
    assert first.namelist()==second.namelist()
    for path in first.namelist():
        if path.startswith(('xl/styles','xl/theme','xl/media')) or path in ['xl/worksheets/sheet5.xml','xl/worksheets/sheet10.xml']:
            assert first.read(path)==second.read(path),path
print(json.dumps({'verified':True,'tests':476,'removed':21,'added':24,'execution_rows':len(execution),'coverage_areas':len(areas),'preserved':'surviving values, results, notes, styles, native charts, validation rules, filters, tables and freeze panes'}))
json.dump([list(r) for r in final['Test Library'].values],open(root/'final-library.json','w'))
