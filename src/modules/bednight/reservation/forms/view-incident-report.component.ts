import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncidentReportService } from '../incident-report.service';
import { TableComponent } from "../../../../components/table/table.component";

@Component({
  selector: 'app-view-incident-report',
  standalone: true,
  imports: [CommonModule, TableComponent],
  template: `
    <ng-container>
      <div *ngIf="reportData; else noData">
        <app-table
          [data]="reportData"
          [columns]="columns"
          [dataLength]="dataLength"
          [tableClass]="'min-w-full bg-white rounded-lg shadow-lg'"
          [showPagination]=false
        ></app-table>
      </div>
      <ng-template #noData>No data available</ng-template>
    </ng-container>
  `,
})
export class ViewIncidentReportFormComponent implements OnInit {
  reportData: any;
  constructor(private service: IncidentReportService) {}

  ngOnInit() {
    this.service.reportData$.subscribe((val) => {
      this.reportData = val;
    });
  }

  columns = [
    { label: 'Incident Type', value: 'incidentTypeName' },
    { label: 'Comment', value: 'comment' },
  ];
}
