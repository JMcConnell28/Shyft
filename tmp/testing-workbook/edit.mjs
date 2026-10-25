import fs from 'node:fs/promises';
import { SpreadsheetFile, Workbook } from '@oai/artifact-tool';

if (process.argv.includes('--preview-final')) {
  const view=JSON.parse(await fs.readFile('preview.json','utf8'));
  const previewBook=Workbook.create();
  const previewSheet=previewBook.worksheets.add('Test Library');
  previewSheet.getRange('A1:P4').values=view.rows;
  previewSheet.getRange('A1:P4').format.font={name:'Carlito',size:11};
  previewSheet.getRange('A1:P4').format.wrapText=true;
  previewSheet.getRange('A1:P4').format.verticalAlignment='top';
  previewSheet.getRange('A1:P1').format={fill:'#172033',font:{name:'Carlito',size:11,bold:true,color:'#FFFFFF'},rowHeight:32};
  previewSheet.getRange('A2:P4').format.rowHeight=180;
  for(const [col,width] of Object.entries(view.widths)) previewSheet.getRange(`${col}:${col}`).format.columnWidth=width;
  previewSheet.showGridLines=false;
  previewBook.recalculate();
  const png=await previewBook.render({sheetName:'Test Library',range:'I1:L3',scale:1,format:'png'});
  await fs.writeFile('final-detail.png',new Uint8Array(await png.arrayBuffer()));
  console.log('Final content preview saved');
  process.exit(0);
}

const source = JSON.parse(await fs.readFile('source.json','utf8'));
const additions = JSON.parse(await fs.readFile('additions.json','utf8'));
const removed = source['Test Library'].slice(1).filter(r =>
  r[1] === 'Leave & Holidays' || r[0] === 'RR-0128'
).map(r => r[0]);
const rows = source['Test Library'].filter(r => !removed.includes(r[0]));
for (const [index, item] of additions.entries()) {
  const [area,feature,type,scenario,priority,preconditions,steps,data,expected,automation,gate] = item;
  rows.push([
    `RR-${String(474+index).padStart(4,'0')}`,area,feature,type,scenario,priority,
    priority==='Critical'?'High':'Medium','Beta',preconditions,steps,data,expected,
    automation,gate,'Active','Added 25 October 2026. Record results after testing the deployed release.'
  ]);
}
const forgotten = rows.find(r => r[0]==='RR-0244');
forgotten[8] = 'Staging location with scheduled entry; configured reminder and automatic clock-out thresholds.';
forgotten[9] = 'Leave a test attendance entry open past its expected finish. Check the reminder, then automatic closure. Inspect the estimated finish and manager review workflow in dashboard and timesheets.';
forgotten[11] = 'Open entries are flagged before closure. At the configured cutoff the entry closes with an estimated finish and requires manager review. It is not silently treated as a confirmed finish.';
const wb = Workbook.create();
const sheet = wb.worksheets.add('Test Library');
sheet.getRange(`A1:P${rows.length}`).values=rows;
sheet.getRange(`A1:P${rows.length}`).format.font={name:'Aptos',size:10};
sheet.getRange('A1:P1').format={fill:'#17365D',font:{name:'Aptos',size:10,bold:true,color:'#FFFFFF'},rowHeight:32};
sheet.getRange(`A2:P${rows.length}`).format.rowHeight=66;
sheet.getRange(`A1:P${rows.length}`).format.wrapText=true;
sheet.getRange('A:A').format.columnWidth=13;
sheet.getRange('B:C').format.columnWidth=27;
sheet.getRange('D:D').format.columnWidth=17;
sheet.getRange('E:E').format.columnWidth=53;
sheet.getRange('F:H').format.columnWidth=15;
sheet.getRange('I:P').format.columnWidth=50;
sheet.showGridLines=false;
sheet.freezePanes.freezeRows(1);
wb.recalculate();
await fs.writeFile('plan.json',JSON.stringify({removed,added:rows.slice(-additions.length).map(r=>r[0]),count:rows.length-1},null,2));
await (await SpreadsheetFile.exportXlsx(wb)).save('authored-library.xlsx');
console.log(JSON.stringify({removed:removed.length,added:additions.length,total:rows.length-1}));
try {
  const preview = await wb.render({sheetName:'Test Library',range:`A${rows.length-3}:H${rows.length}`,scale:1,format:'png'});
  await fs.writeFile('after.png',new Uint8Array(await preview.arrayBuffer()));
  console.log('Preview saved');
} catch(error) {console.log('Preview unavailable:',String(error));}
