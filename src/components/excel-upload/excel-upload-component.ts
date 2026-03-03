import { Component, EventEmitter, Output } from '@angular/core';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-excel-upload',
  template: `
    <div class="flex flex-col items-center justify-center">
      <label class="block">
        <span class="sr-only">Browse Excel file to Upload</span>
        <input
          type="file"
          (change)="onFileChange($event)"
          accept=".xlsx, .xls"
          class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
        />
      </label>
    </div>
  `,
  standalone: true,
})
export class ExcelUploadComponent {
  @Output() fileLoaded: EventEmitter<any> = new EventEmitter();

  onFileChange(event: any) {
    const target: DataTransfer = <DataTransfer>event.target;
    if (target.files.length !== 1) throw new Error('Cannot use multiple files');

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

      const headers = data[0] as any[];
      const rows = data.slice(1);

      const jsonArray = rows.map((row: any) => {
        const obj: any = {};
        headers.forEach((header: string, index: number) => {
          obj[header] = row[index];
        });
        return obj;
      });

      this.fileLoaded.emit(jsonArray);
    };
    reader.readAsBinaryString(target.files[0]);
  }
}
