import { Component, OnInit, Inject, ViewChild, ChangeDetectorRef } from '@angular/core';
import {
  MatDialog, MatDialogRef, MAT_DIALOG_DATA
} from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { of as observableOf } from 'rxjs/observable/of';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CalendarService } from '../calender.service';
import { DomSanitizer } from '@angular/platform-browser'

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styles: [`
  .fontclass{
    font-size:25px;
  }
  `]
})
export class EventComponent implements OnInit {
  Event: string;
  FileName: string = "";
  imgSHow = false;
  imag: string = "";

  constructor(public dialog: MatDialog,
    private dialogRefs: MatDialogRef<EventComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private service: CalendarService,
    private changeDetectorRef: ChangeDetectorRef,
    private sanitizer: DomSanitizer) { }

  myForm: FormGroup;
  EditOnly = false;

  ngOnInit() {
    this.imag = "";
    this.InitialForm();
    let ID = this.dialogRefs.componentInstance.data;
    if (ID > 0) {
      this.Event = "Edit Event";
      this.BindValues(ID);
    } else {
      this.imgSHow = false;
      this.Event = "New Event";
    }
  }
  fileInput: any;
  myEve: Event;
  newEvents = [];
  events: any = [];
  CustomDate: any;

  InitialForm() {
    this.myForm = this.fb.group({
      Title: [''],
      Description: [''],
      loginid: [''],
      Id: [''],
      StartDate: [''],
      EndDate: [''],
      Link: [''],
      ImagePath: ['']
    });
  }

  SaveDetail() {

    var Title = this.myForm.value.Title;
    var Description = this.myForm.value.Description;

    var loginid = localStorage.getItem('loginuser');
    var id = this.myForm.value.Id;
    var DT = this.myForm.value.Date;

    var filldata;

    let date = this.myForm.value.StartDate;
    let endDat = this.myForm.value.EndDate;
    let dateSt = new Date(date);
    let endDT = new Date(endDat);
    let StartDate = this.CustomDateGet(dateSt);
    let EDate = this.CustomDateGet(endDT);

    if (id > 0) {
      filldata = Object.assign({}, this.myEve, {
        Title: Title,
        Description: Description,
        StartDate: StartDate,
        LoginID: loginid,
        ImagePath: this.FileName,
        Id: id,
        EndDate: EDate,
      });
      this.service.updateEvent(id, filldata).subscribe(response => {
        this.Close();
      });
    }
    else {
      filldata = Object.assign({}, this.myEve, {
        Title: Title,
        Description: Description,
        StartDate: StartDate,
        LoginID: loginid,
        ImagePath: this.FileName,
        EndDate: EDate
      });

      this.service.insertEvent(filldata).subscribe(x => {
        this.Close();
      });
    }

  }

  CustomDateGet(date) {

    let month = date.getMonth() + 1;
    let cdate = date.getDate();
    let year = date.getFullYear();

    let newDate = year + '/' + month + '/' + cdate;
    return newDate;
  }

  BindValues(id) {
    var nid = parseInt(id);
    this.service.getEventByID(nid).subscribe(response => {

      this.EditOnly = true;
      var d = "http://localhost:4200/publicEvent/" + id;
      this.imag = response.ImagePath;

      this.sanitizer.bypassSecurityTrustUrl(this.imag);
      this.imgSHow = true;
      this.myForm.patchValue({
        Title: response.Title,
        Description: response.Description,
        loginid: response.LoginID,
        Id: response.Id,
        StartDate: response.StartDate,
        EndDate: response.EndDate,
        Link: d
      });
    })
  }

  Close(): void {
    this.myForm.reset();
    this.dialogRefs.close();
  }

  fileChange(event) {

    //let fileList: FileList = event;
    let a = [];
    a.push(event);
    if (a.length > 0) {
      let file: File = a[0];
      let formData: FormData = new FormData();
      formData.append('files', file, file.name);

      this.service.FileUpload(formData).subscribe(
        data => {
          console.log(data);
          this.FileName = "";
          this.FileName = data;
          this.fileInput = "";
          //  this.imag = data;
          //  this.imgSHow = true;
        },
        error => console.log(error)
      );
    }
  }

  fileChanges(input) {

    this.readFiles(input.target.files);
  }

  readFile(file, reader, callback) {

    reader.onload = () => {

      callback(reader.result);
    }
    reader.readAsDataURL(file);
  }

  readFiles(files) {

    let files_src = [];

    let reader = new FileReader();

    for (var i = 0; i < files.length; i++) {

      if (files[i]) {

        this.readFile(files[i], reader, (result) => {

          var img = document.createElement("img");
          img.src = result;


          this.resize(img, 800, 600, (resized_jpeg, before, after) => {
            files_src.push(resized_jpeg);


            this.fileInput = this.dataURItoBlob(resized_jpeg);

            this.fileChange(this.fileInput);

          });
        });
      } else {

        this.changeDetectorRef.detectChanges();
      }
    }
  }


  resize(img, MAX_WIDTH: number, MAX_HEIGHT: number, callback) {

    return img.onload = () => {
      var width = img.width;
      var height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }


      var canvas = document.createElement("canvas");

      canvas.width = width;
      canvas.height = height;
      var ctx = canvas.getContext("2d");

      ctx.drawImage(img, 0, 0, width, height);
      var dataUrl = canvas.toDataURL('image/jpeg');
      callback(dataUrl, img.src.length, dataUrl.length);
    };
  }
  dataURItoBlob(dataURI) {
    var binary = atob(dataURI.split(',')[1]);
    var array = [];
    for (var i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    let filename = 'imageFile.jpg';
    var blob = new Blob([new Uint8Array(array)], { type: 'image/jpeg' });
    var file = new File([blob], filename, { type: 'image/jpeg', lastModified: Date.now() });
    return file;
  }
}
