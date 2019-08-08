import { MarkerData } from './models/markerData.model';
import { MarkersService } from './markers.service';
import { Subscription } from 'rxjs';
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy
} from '@angular/core';
import {} from 'googlemaps';
import { CATEGORIES } from './categories';
import { Loc } from './models/loc.model';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, OnDestroy {
  @ViewChild('map', { static: true }) mapElement: ElementRef;
  isLoading = true;
  placesService: google.maps.places.PlacesService;
  map: google.maps.Map;
  currentLocationMarker: google.maps.Marker;
  markers: MarkerData[] = [];
  singleLoc;
  infoWindow = new google.maps.InfoWindow({ content: '' });
  categoryMap = new Map<string, google.maps.Marker[]>();
  categories = CATEGORIES;
  markerSub: Subscription;

  constructor(private markerService: MarkersService) {}

  ngOnInit() {

    this.markerSub = this.markerService
      .getMarkersUpdateListener()
      .subscribe(data => {
        this.addMarkers(data.markers);
        this.isLoading = false;
      });
    this.initializeCategoryMap();
    this.initializeMap();
  }

  ngOnDestroy() {
    this.markerSub.unsubscribe();
  }

  initializeCategoryMap = () => this.categories.forEach(c => this.categoryMap.set(c.value, []));

  onToggle = type => this.categoryMap.get(type).forEach(m => m.setVisible(!m.getVisible()));

  initializeMap() {
    this.markerService.getMarkers();
    const mapProperties = {
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDoubleClickZoom: true,
      disableDefaultUI: true
    };

    this.map = new google.maps.Map(
      this.mapElement.nativeElement,
      mapProperties
    );

    this.placesService = new google.maps.places.PlacesService(this.map);

    // click to place marker
    this.map.addListener('click', e => {
      this.addSingleMarker(e.latLng.lat(), e.latLng.lng());
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position =>
        this.createCurrentGeoMarker(position)
      );
    }
  }

  zoomInOut = (arg: number) => this.map.setZoom(this.map.getZoom() + arg);

  createCurrentGeoMarker(position) {
    const location = new google.maps.LatLng(
      position.coords.latitude,
      position.coords.longitude
    );
    this.map.panTo(location);
    this.placeCurrentMarker(location);
  }

  saveMarkers() {
    const markersToSave: MarkerData[] = this.markers.filter(m => m.id === null);
    // remove marker that doesn't have ID
    markersToSave.forEach(m => m.marker.setMap(null));
    this.markers = this.markers.filter(m => m.id !== null);
    const dataToSave: Loc[] = [];
    markersToSave.forEach(m => {
      const singleLoc = { location: [m.lng, m.lat] };
      dataToSave.push(singleLoc);
    });
    if (dataToSave.length > 0) {
      this.markerService.bulkSave(dataToSave);
    }
  }

  addMarkers(markers) {
    markers.forEach(singleMarker => {
      const lat = singleMarker.location[1];
      const lng = singleMarker.location[0];
      this.addSingleMarker(lat, lng, singleMarker.id);
    });
  }

  private addSingleMarker(lat: any, lng: any, id: string = null) {
    if (!this.markerExists(lat, lng)) {
      const markerLatLng = new google.maps.LatLng(lat, lng);
      const gMarker = new google.maps.Marker({
        map: this.map,
        position: markerLatLng
      });
      const markerData = { id, lat, lng, marker: gMarker };
      gMarker.addListener('click', () => this.openInfoWindow(gMarker));
      this.markers.push(markerData);
    }
  }

  private markerExists(lat: number, lng: number) {
    let exists = false;
    this.markers.forEach(marker => {
      if (marker.lat === lat && marker.lng === lng) {
        exists = true;
      }
    });
    return exists;
  }

  placeCurrentMarker(location) {
    if (!this.currentLocationMarker) {
      this.currentLocationMarker = new google.maps.Marker({
        position: location,
        map: this.map,
        title: 'Current Location',
        icon: 'http://maps.gstatic.com/mapfiles/markers2/icon_green.png'
      });
    } else {
      this.currentLocationMarker.setPosition(location);
    }
    this.categories.forEach(c => this.searchByType(c));
  }

  setMapOnAll = map => this.markers.forEach(m => m.marker.setMap(map));

  clearMarkers = () => this.setMapOnAll(null);

  showMarkers = () => this.setMapOnAll(this.map);

  deleteMarkers() {
    if (this.markers.length > 0 ) {
    this.clearMarkers();
    this.markers = [];
    this.markerService.deleteAllMarkers();
    }

  }

  searchByType(category) {
    this.placesService.nearbySearch(
      {
        location: this.currentLocationMarker.getPosition(),
        radius: 1500,
        type: category.value
      },
      (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          results.forEach(r => this.createCategoryMarker(r, category));
        }
      }
    );
  }

  createCategoryMarker(place, category) {
    const marker = new google.maps.Marker({
      map: this.map,
      position: place.geometry.location,
      icon: category.icon
    });
    marker.setVisible(false);

    google.maps.event.addListener(marker, 'click', () =>
      this.openInfoWindow(marker, place)
    );
    this.categoryMap.get(category.value).push(marker);
  }

  openInfoWindow = (marker, place = null) => {
    if (!place) {
      this.infoWindow.open(this.map, marker);
      this.infoWindow.setContent(marker.getPosition().toString());
      return;
    }
    this.placesService.getDetails(
      { placeId: place.place_id },
      (details, status) => {
        this.infoWindow.open(this.map, marker);
        this.infoWindow.setContent(
          `<h3 align="center">${details.name}</h3>
          ${details.adr_address}</br></br>
          <a href="${details.website}">${details.website}</a></br>
          ${details.formatted_phone_number}`
        );
      }
    );
  }
}
