import { Component, ViewChild, ElementRef, NgZone, OnInit } from '@angular/core';
import 'fullcalendar';
declare let $: any;
import { FormGroup, FormBuilder } from '@angular/forms';
import { Event } from './eventmodel';
import { CalendarService } from './calender.service';
import { EventComponent } from './Event/event.component';
import {
  MatDialog, MatDialogRef, MAT_DIALOG_DATA
} from '@angular/material';
import { PapaParseService } from 'ngx-papaparse';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';

@Component({
  selector: 'app-showdata',
  templateUrl: './showdata.component.html',
  styleUrls: ['./showdata.component.scss']
})
export class ShowdataComponent implements OnInit {

  myEve: Event;
  newEvents = [];
  events: any = [];
  myForm: FormGroup;
  CustomDate: any;

  constructor(private ngZone: NgZone,
    private fb: FormBuilder,
    private service: CalendarService,
    public dialog: MatDialog,
    private papap: PapaParseService,
    private spinnerService: Ng4LoadingSpinnerService) { }

  calOptions = [];

  ngOnInit() {
    this.LoadCUstomButtons();
    this.getAllEvents();

    $('#myCalendar').fullCalendar({
      defaultView: 'month',
      height: 600,
      customButtons: {
        // myCustomButton: {
        //   text: 'New Event',
        //   click: this.clickday.bind(this),
        // },
        // DownLoadRept: {
        //   text: 'Download Report',
        //   click: this.DownloadReports.bind(this),
        // },
        UploadCSV: {
          text: 'Upload CSV',
          click: this.UploadCSV.bind(this),
        }
      },
      header: {
        left: 'prevYear,prev,next,nextYear today',
        center: 'title',
        right: 'UploadCSV month,agendaWeek,agendaDay'
      },
      defaultDate: Date(),
      editable: true,
      firstDay: 0,
      eventRender: this.EventRenderFunctions.bind(this),
      weekends: true,
      eventLimit: true,
      displayEventTime: false,
      events: []
    });

  }
  UploadCSV() {
    var a = document.getElementById('uploadfile');
    a.click();
  }

  DownloadReports() {
    var loginid = 1;
    this.service.GetCSV(loginid).subscribe(response => {
      console.log(response);

      var csvData = this.ConvertToCSV(response);
      var a = document.createElement("a");
      a.setAttribute('style', 'display:none;');
      document.body.appendChild(a);
      var blob = new Blob([csvData], { type: 'text/csv' });
      var url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = 'SampleExport.csv';
      a.click();
    });
  }

  CallME() {
    var files = $('#uploadfile')[0].files;
    const Dis = this;
    var config = this.buildConfig();
    if (files.length > 0) {
      $('#uploadfile').parse({
        config: config
      });
    }
    else {
      var results = this.papap.parse(files, config);
    }
  }

  buildConfig() {
    const V = this;
    return {
      complete: function (results, file) {
        console.log("Parsing complete:", results, file);
        V.savedata(results);
        $('#uploadfile').val('');
      }
    }
  }
  savedata(data) {

    data.data.splice(0, 1);
    data.data.pop();
    let newData;
    let X = data.data;
    let arrayofData = [];

    for (var i = 0; i < X.length; i++) {
      newData = {
        Title: X[i][1],
        Description: X[i][2],
        StartDate: X[i][3],
        EndDate: X[i][4],
        ImagePath: X[i][5],
        LoginID: 1
      };
      arrayofData.push(newData);
    }

    this.service.PostCSV(arrayofData, 1).subscribe(resp => {
      this.getAllEvents();

    })
  }

  ConvertToCSV(objArray) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';
    var row = "";

    for (var index in objArray[0]) {

      row += index + ',';
    }
    row = row.slice(0, -1);

    str += row + '\r\n';

    for (var i = 0; i < array.length; i++) {
      var line = '';
      for (var index in array[i]) {
        if (line != '') line += ','

        line += array[i][index];
      }
      str += line + '\r\n';
    }
    return str;
  }

  openDialog(id: number): void {
    debugger
    let x;
    id > 0 ? x = '81%' : x = '73%';

    let dialogRef = this.dialog.open(EventComponent, {
      width: '35%',
      height: x,
      disableClose: true,
      autoFocus: false
    });
    dialogRef.componentInstance.data = id;
    dialogRef.afterClosed().subscribe(x => {
      this.getAllEvents();
    });
  }

  clickday(date, jsEvent, view): void {
    this.openDialog(0);
  }

  getAllEvents() {
    this.spinnerService.show();
    setTimeout(function () {
      this.spinnerService.hide();
    }.bind(this), 1000);

    $('#myCalendar').fullCalendar('removeEvents');
    while (this.newEvents.length) {
      this.newEvents.pop();
    }
    this.service.getAllEvents().subscribe(response => {
      var a = response.length;
      for (var i = 0; i < a; i++) {
        this.newEvents.push({
          title: response[i].Title,
          start: response[i].StartDate,
          end: response[i].EndDate,
          description: response[i].Description,
          imagePath: response[i].ImagePath,
          type: response[i].Id,
          color: '#C2185B'
        });
      }
      $('#myCalendar').fullCalendar('renderEvents', this.newEvents, true);
    });
  }


  EventRenderFunctions(event, element, view) {
    const D = this;
    if (view.name == 'listDay') {
      element.find(".fc-list-item-time").append("<span class='closeon glyphicon glyphicon-remove' style='float:right;'></span>");
    } else {
      element.find(".fc-content").append("<span class='closeon glyphicon glyphicon-remove'  style='float:right;'></span>");
    }
    element.find(".closeon").on('click', function () {
      $('#myCalendar').fullCalendar('removeEvents', event._id);
      var a = event.type;
      D.ngZone.run(() => {
        D.DeleteEvents(a);
      });
    });

    element.find(".fc-content").on('click', function () {
      var a = event.type;
      D.ngZone.run(() => {
        D.BindValues(a);
      });
    });
  }

  BindValues(id) {
    this.openDialog(id);
  }

  DeleteEvents(id) {
    this.service.DeleteEventByID(id).subscribe(response => {
      this.getAllEvents();
    });
  }

  LoadCUstomButtons() {
    var x = $('.FAB__mini-action-button').find('.mini-action-button--hide').length * 60 + 60;

    $('.FAB').hover(function () {
      $('.FAB').height(x);
    }, function () {
      $('.mini-action-button--show').attr('class', 'mini-action-button--hide');
      $('.FAB').height(0);
    });

    $('.mini-action-button').hover(function () {
      $(this).find('.mini-action-button__text--hide').attr('class', 'mini-action-button__text--show');
    }, function () {
      $(this).find('.mini-action-button__text--show').attr('class', 'mini-action-button__text--hide');
    });

    $('.FAB__action-button').hover(function () {
      $(this).find('.action-button__text--hide').attr('class', 'action-button__text--show');
      $('.mini-action-button--hide').attr('class', 'mini-action-button--show');
    }, function () {
      $(this).find('.action-button__text--show').attr('class', 'action-button__text--hide');
    });
  }
}