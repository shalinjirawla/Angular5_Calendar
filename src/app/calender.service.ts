import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/Observable/of';
import 'rxjs/add/operator/catch';

import { Event } from './eventmodel';

@Injectable()
export class CalendarService {
    private base_url = 'http://localhost:9409/api/Event';

    constructor(private http: Http) { }

    getAllEvents(): Observable<Event[]> {
        const url = `${this.base_url}/GetEvents`;
        return this.http.get(url)
            .map(this.extractData);
    }

    getEventByID(id: number): Observable<Event> {
        const url = `${this.base_url}/GetEventById/${id}`;
        return this.http.get(url)
            .map(this.extractData);
    }

    insertEvent(data: Event): Observable<Event> {
        const url = `${this.base_url}/SaveEvent`;
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });

        return this.http.post(url, data, options)
            .map(this.extractData);
    }

    updateEvent(id, data: Event): Observable<Event> {
        const url = `${this.base_url}/PutEvent/${id}`;
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });

        return this.http.put(url, data, options)
            .map(this.extractData);
    }

    DeleteEventByID(id: number): Observable<Event> {
        const url = `${this.base_url}/DeleteEvent/${id}`;
        return this.http.delete(url)
            .map(this.extractData);
    }

    GetCSV(id: number): Observable<Event[]> {
        const url = `${this.base_url}/Getcsv/${id}`;
        return this.http.get(url)
            .map(this.extractData);
    }

    PostCSV(data: Event[], id: number): Observable<any> {
        const url = `${this.base_url}/Storecsv/${id}`;
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });

        return this.http.post(url, data, options)
            .map(this.extractData);
    }

    Login(pin: number): Observable<any> {
        const url = `${this.base_url}/Login/${pin}`;
        return this.http.get(url)
            .map(this.extractData);
    }

    FileUpload(data: FormData): Observable<any> {
        const url = `${this.base_url}/FilePost`;

        let headers = new Headers();
        headers.append('Accept', 'application/json');
        let options = new RequestOptions({ headers: headers });

        return this.http.post(`${this.base_url}/FilePost`, data, options)
            .map(this.extractData);
    }


    private extractData(response: Response) {
        let body = response.json();
        return body;
    }

}