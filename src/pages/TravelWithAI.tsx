import React, { useEffect, useState } from "react";

import { loadApiKey } from "../utils/api";
import { saveUserLocation } from "../utils/api";
import { fetchNearbyPlaces } from "../utils/api";

import { Place } from "../types/Place";

import "../styles/TravelWithAI.css";

declare global {
  interface Window {
    naver: any;
  }
}

const TravelWithAI: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [map, setMap] = useState<any>(null);
  const [currentMarker, setCurrentMarker] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [activeTab, setActiveTab] = useState<string>("custom");
  const [placeMarkers, setPlaceMarkers] = useState<any[]>([]);


  useEffect(() => {
      const fetchApiKey = async () => {
        const key = await loadApiKey();
        if (key) {
          setApiKey(key);
        } else {
          console.error("API Key 불러오기 실패!");
        }
      };

      fetchApiKey();
    }, []);

  useEffect(() => {
    if (!apiKey) return;

    const script = document.createElement("script");
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${apiKey}`;
    script.async = true;

    script.onload = () => {
      console.log("네이버 지도 API 로드 완료");

      const mapElement = document.getElementById("map");
      if (!mapElement) {
          console.error("#map 요소가 존재하지 않습니다!");
          return;
        }

       // 현위치 가져오기
       navigator.geolocation.watchPosition(
                  (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setUserLocation({ lat, lng });
                    console.log("현위치:", lat, lng);
                    { enableHighAccuracy: true}

                    /** 네이버 지도 객체 생성 */
                    const newMap = new window.naver.maps.Map(mapElement, {
                      center: new window.naver.maps.LatLng(lat, lng), // 현재 위치를 지도 중심으로 설정
                      zoom: 16,
                    });

        setMap(newMap);
        addCurrentMarker(newMap, lat, lng);
        saveUserLocation(lat, lng);
        },
        () => alert("위치 정보를 가져올 수 없습니다."),
        { enableHighAccuracy: true }
      );
    };

    document.head.appendChild(script);
  }, [apiKey]);


  const addCurrentMarker = (map: any, lat: number, lng: number) => {
      if (currentMarker) currentMarker.setMap(null);

      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(lat, lng),
        map: map,
        icon: {
          content: '<div style="width: 12px; height: 12px; background-color: red; border-radius: 50%;"></div>',
          anchor: new window.naver.maps.Point(7, 7),
        },
      });

      setCurrentMarker(marker);
    };

  const handleFetchPlaces = async() => {
        if (!userLocation) return;
        try{
        const fetchedPlaces = await fetchNearbyPlaces(userLocation.lat, userLocation.lng);
                setPlaces(fetchedPlaces);
                setActiveTab("all"); // "모든 명소" 탭 활성화
        } catch (error) {
            console.error("명소 불러오기 실패:", error);
            }
      };


  useEffect(() => {
    if (!map || places.length === 0) return;

    // ✅ 기존 마커 제거 (중복 방지)
    placeMarkers.forEach(marker => marker.setMap(null));
  // 명소 마커 추가
    const newMarkers = places.map(place => {
      return new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(place.latitude, place.longitude),
        map: map,
        title: place.name,
      });
    });
    setPlaceMarkers(newMarkers);
    }, [places, map]);

  return (
      <div className="map-container">
        <div className="map-sidebar">
          {/* 카테고리 버튼 영역 */}
          <div className="map-sidebar-categories">
            <button className="map-category">
              <img src="/icons/travelwithai_custom.svg" className="category-icon" alt="맞춤 명소" />
              맞춤 명소
            </button>
            <button className={`map-category ${activeTab === "all" ? "active" : ""}`} onClick={handleFetchPlaces}>
              <img src="/icons/travelwithai_all.svg" className="category-icon" alt="모든 명소" />
              모든 명소
            </button>
            <button className="map-category">
              <img src="/icons/travelwithai_favorites.svg" className="category-icon" alt="즐겨찾기" />
              즐겨찾기
            </button>
          </div>

          {/* 명소 리스트 영역 */}
          <div className="map-sidebar-places">
            {places.length > 0 ? (
              places.map((place, index) => (
                <div key={index} className="place-item">
                  <h3>{place.name} <span className="place-category">{place.types}</span></h3>
                  <p className="place-address">{place.address}</p>
                  <p className="place-tel">{place.tel}</p>
                </div>
              ))
            ) : (
              <p className="no-places">주변 명소를 찾을 수 없습니다.</p>
            )}
          </div>
        </div>

        {/* 지도 영역 */}
        <div className="map-wrapper">
          <div id="map"></div>
        </div>
      </div>
    );
};

export default TravelWithAI;
