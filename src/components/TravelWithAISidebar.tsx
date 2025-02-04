import React from "react";
import { Place } from "../types/Place";

import "../styles/TravelWithAISidebar.css";

interface TravelWithAISidebarProps {
  places: Place[];
  activeTab: string;
  onFetchPlaces: () => void;
  onFetchPlacesByInterests: () => void;
}

const TravelWithAISidebar: React.FC<TravelWithAISidebarProps> = ({
  places,
  activeTab,
  onFetchPlaces,
  onFetchPlacesByInterests,
}) => {
  return (
    <div className="map-sidebar">
      {/* 카테고리 버튼 영역 */}
      <div className="map-sidebar-categories">
        <button
          className={`map-category ${activeTab === "interest" ? "active" : ""}`}
          onClick={onFetchPlacesByInterests}
        >
          <img
            src="src/assets/images/travelwithai_custom.svg"
            className="place-category-icon"
            alt="맞춤 명소"
          />
          맞춤 명소
        </button>
        <button
          className={`map-category ${activeTab === "all" ? "active" : ""}`}
          onClick={onFetchPlaces}
        >
          <img
            src="src/assets/images/travelwithai_all.svg"
            className="place-category-icon"
            alt="모든 명소"
          />
          모든 명소
        </button>
      </div>

      {/* 명소 리스트 영역 */}
      <div className="map-sidebar-places">
        {places.length > 0 ? (
          places.map((place, index) => (
            <div key={index} className="place-item">
              <h3>
                {place.name} <span className="place-category">{place.types}</span>
              </h3>
              <p className="place-address">{place.address}</p>
              <p className="place-tel">{place.tel}</p>
            </div>
          ))
        ) : (
          <p className="no-places">주변 명소를 찾을 수 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default TravelWithAISidebar;
