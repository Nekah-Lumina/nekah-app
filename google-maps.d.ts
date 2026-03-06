// Google Maps type definitions
declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: HTMLElement, opts?: MapOptions);
      setCenter(latlng: LatLng): void;
      setZoom(zoom: number): void;
      setMapTypeId(mapTypeId: MapTypeId): void;
    }

    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      setPosition(latlng: LatLng): void;
      setMap(map: Map | null): void;
    }

    class Polyline {
      constructor(opts?: PolylineOptions);
      setMap(map: Map | null): void;
    }

    interface MapOptions {
      center?: LatLng;
      zoom?: number;
      mapTypeId?: MapTypeId;
      styles?: any[];
    }

    interface MarkerOptions {
      position?: LatLng;
      map?: Map;
      title?: string;
      icon?: any;
    }

    interface PolylineOptions {
      path?: LatLng[];
      geodesic?: boolean;
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
    }

    enum MapTypeId {
      ROADMAP = 'roadmap',
      SATELLITE = 'satellite',
      HYBRID = 'hybrid',
      TERRAIN = 'terrain'
    }

    enum SymbolPath {
      CIRCLE = 0
    }

    namespace geometry {
      namespace spherical {
        function computeDistanceBetween(from: LatLng, to: LatLng): number;
      }
    }
  }
}