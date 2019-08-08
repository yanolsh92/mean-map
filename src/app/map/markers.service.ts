import { Marker } from './models/marker.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Loc } from './models/loc.model';

const BACKEND_URL = environment.apiUrl + '/markers/';

@Injectable({
  providedIn: 'root'
})
export class MarkersService {
  private markers: Marker[] = [];
  private markersUpdated = new Subject<{ markers: Marker[]}>();
  constructor(private http: HttpClient) { }

  addMarkerToDb(location) {
    const loc = {lng: location.lng, lat: location.lat };
    this.http.post<{message: string, marker: Marker}>(BACKEND_URL, loc)
      .subscribe((responseData) => {
        this.markers.push(responseData.marker);
        this.markersUpdated.next({
          markers: [...this.markers]
        });
      });
  }

  bulkSave(location: Array<Loc>) {
    this.http.post<{message: string, markers: Array<any>}>(`${BACKEND_URL}bulkSave`, {markers: location})
    .pipe(map((markersData) => {
      return { markers: markersData.markers.map(marker => {
        return {
          id: marker._id,
          location: marker.location
        };
      })};
    })).subscribe((transformedMarkerData) => {
        this.markers = this.markers.concat(transformedMarkerData.markers);
        this.markersUpdated.next({
          markers: [...this.markers]
        });
      });
  }

  getMarkers() {
    this.http.get<{message: string; markers: Array<any>}>(BACKEND_URL)
    .pipe(map((markersData) => {
      return { markers: markersData.markers.map(marker => {
        return {
          id: marker._id,
          location: marker.location
        };
      })};
    }))
      .subscribe(transformedMarkerData => {
        this.markers = transformedMarkerData.markers;
        this.markersUpdated.next({
          markers: [...this.markers]
        });
      });
  }

  deleteAllMarkers() {
    this.http.delete<{message: string}>(`${BACKEND_URL}bulkDelete`).subscribe(response => {
      console.log(response.message);
      this.markers = [];
      this.markersUpdated.next({
        markers: [...this.markers]
      });
    });
  }

  getMarkersUpdateListener() {
    return this.markersUpdated.asObservable();
  }

}
