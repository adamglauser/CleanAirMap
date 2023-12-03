import { StyleSheet, View } from 'react-native';
import MapGL, {MapRef, Marker, ViewState} from 'react-map-gl/maplibre';
import { useRef, useState, useCallback } from "react";
import { MapGeoJSONFeature, LngLatLike } from 'maplibre-gl';
import { router } from 'expo-router'
import { Point, Feature} from "geojson";
import { viewState } from '../../storage/global';
import NewLocationModal from './NewLocationModal';
import distance from '@turf/distance';
import SearchBar from "./SearchBar";
import 'maplibre-gl/dist/maplibre-gl.css';
import MyMarker from './Marker';
import { reverseGeocode } from './data';


export default function CleanAirMap() {

  useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapRef | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<MapGeoJSONFeature | null>(null);
  const [showModalForNewLocation, setShowModalForNewLocation] = useState<any | null>(null);

  const createNewLocation = useCallback((item: Feature) => {
    // TODO: Replace the new one after fetching this. There's no pointin getting it twice.
    if (!item?.properties?.formatted) {
      reverseGeocode(item).then((data) => {
        setShowModalForNewLocation(data);
      });
    }
    else {
      setShowModalForNewLocation(item);
    }
  }, []);

  const selectSearchResult = useCallback((item: Feature) => {
    mapRef?.current?.flyTo({ center: (item.geometry as Point).coordinates as LngLatLike});
    setSelectedLocation(item as MapGeoJSONFeature);
  }, []);

  const onClickMap = useCallback((evt: maplibregl.MapLayerMouseEvent, selectedFeature: Feature) => {
    // Look for a POI that was clicked on directly first.
    let targetItem = mapRef?.current?.queryRenderedFeatures(evt.point)
      ?.filter(a => a.sourceLayer == "poi" && a.properties.name?.length > 0)
      ?.[0];

    // If there isn't an open popup and no POI was clicked on directly, look for the closest POI within
    // 100 meters.
    // We can assume that if a location was alrady selected, the user was just clicking
    // away from the popup to dismiss it.
    // Note that the callback doesn't seem to have access to the up-to-date selectedLocation state, so
    // I passed it in as a parameter. I suspect this is a sign I'm doing something wrong.
    if (!targetItem && !selectedFeature) {
      targetItem = mapRef?.current?.querySourceFeatures('default', { sourceLayer: 'poi' })
        ?.filter(item => item.properties.name?.length > 0)
        ?.filter(item => distance(evt.lngLat.toArray(), (item.geometry as Point).coordinates, {units: 'meters'}) < 100)
        ?.reduce((closest, current) => {
          if (!closest) {
            return current;
          }
          const distanceToCurrent =  distance(evt.lngLat.toArray(), (current.geometry as Point).coordinates, {units: 'meters'});
          const distanceToClosest =  distance(evt.lngLat.toArray(), (closest.geometry as Point).coordinates, {units: 'meters'});
          return (distanceToClosest < distanceToCurrent) ? closest : current;
        }, undefined as MapGeoJSONFeature | undefined);
    }

    evt.preventDefault();
    setSelectedLocation(targetItem ?? null);
    return;
  }, []);

  const handleMapMove = useCallback((state: ViewState) => {
    viewState(state);
    router?.setParams({ lat: state.latitude.toString(), lng: state.longitude.toString() });
  }, []);

    return (
      <View style={styles.page}>
        {showModalForNewLocation != null &&
          (<NewLocationModal
              location={showModalForNewLocation}
              onDismiss={() => setShowModalForNewLocation(null)} />)
        }
        <View style={styles.map}>
         
         <MapGL reuseMaps
            initialViewState = {viewState()}
            ref={mapRef}
            onClick={(e) => onClickMap(e, selectedLocation as Feature)}
            onMove={e => handleMapMove(e.viewState)}
            style={styles.map}
            mapStyle={`https://maps.geoapify.com/v1/styles/osm-bright/style.json?apiKey=${process.env.EXPO_PUBLIC_GEOAPIFY_TOKEN}`}>
            {selectedLocation != null && (
              <Marker
                anchor='bottom'
                latitude={(selectedLocation.geometry as Point).coordinates[1]}
                longitude={(selectedLocation.geometry as Point).coordinates[0]}
                >
                <MyMarker
                  onAddNewLocation={() => createNewLocation(selectedLocation)}
                  onClose={() => setSelectedLocation(null)}
                  location={selectedLocation}
                />
              </Marker>
            )}
        </MapGL>
        <SearchBar
          style={styles.searchbar}
          onPickItem={(item: any) => selectSearchResult(item)}/>
        </View>
      </View>
    );
};

const styles = StyleSheet.create({
  page: {
    height: '100%',
    width:'100%'
  },
  map: {
      height: '100%',
      width:'100%'
  },
  searchbar: {
    top: 25,
    left: 25,
    position: 'absolute',
  }
});