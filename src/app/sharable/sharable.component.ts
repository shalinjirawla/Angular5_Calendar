import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { CalendarService } from '../calender.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import 'fullcalendar';
declare let $: any;
import { Event } from '../eventmodel';

@Component({
  selector: 'app-sharable',
  templateUrl: './sharable.component.html',
  styleUrls: ['./sharable.component.css']
})
export class SharableComponent implements OnInit {

  @ViewChild('modal1') modal;

  myEve: Event;
  newEvents = [];
  events: any = [];
  CustomDate: any;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private service: CalendarService,
    private ngZone: NgZone, ) { }

  private sub: Subscription;
  myForm: FormGroup;

  ngOnInit() {
    this.LoadForm();
    this.sub = this.route.params.subscribe(
      paramns => {
        let id = +paramns['id'];
        this.FillForm(id);
      });

    $('#calendar').fullCalendar({
      defaultView: 'month',
      height: 600,
      header: {
        left: 'prev,next today ',
        center: 'title',
        right: 'month,agendaWeek,agendaDay'
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
  FillForm(id: number) {
    this.service.getEventByID(id).subscribe(response => {
      console.log(response);
      let da = response;
      this.getAllEvents(da);
      var startdate = new Date(da.StartDate);
      var endDate = new Date(da.EndDate);

      let sd = this.GetDate(startdate);
      let ed = this.GetDate(endDate);

      this.myForm.patchValue({
        Title: da.Title,
        Description: da.Description,
        StartDate: sd,
        EndDate: ed
      });
    });
  }

  EventRenderFunctions(event, element, view) {
    const D = this;
    element.find(".fc-content").on('click', function () {  
      D.modal.show();
    });
  }


  GetDate(date) {
    var day = date.getDate();
    var month = date.getMonth();
    var year = date.getFullYear();

    var newD = day + '/' + month + '/' + year;
    return newD;
  }
  close() {
    this.modal.hide();
  }

  LoadForm() {
    this.myForm = this.fb.group({
      Title: [''],
      Description: [''],
      loginid: [''],
      Id: [''],
      StartDate: [''],
      EndDate: [''],
      Link: ['']
    });
  }

  getAllEvents(data) {
    while (this.newEvents.length) {
      this.newEvents.pop();
    }
    this.newEvents.push({
      title: data.Title,
      start: data.StartDate,
      end: data.EndDate,
      description: data.Description,
      imagePath: data.ImagePath,
    });
    $('#calendar').fullCalendar('renderEvents', this.newEvents, true);
    this.modal.show();
  }

}
