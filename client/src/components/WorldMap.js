import React from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const coffeeOrigins = {
  "Ethiopia": { coordinates: [40.4897, 9.145], name: "Ethiopia", count: 1 },
  "Colombia": { coordinates: [-74.2973, 4.5709], name: "Colombia", count: 1 },
  "Indonesia": { coordinates: [113.9213, -0.7893], name: "Indonesia", count: 1 },
  "Guatemala": { coordinates: [-90.2308, 15.7835], name: "Guatemala", count: 1 },
  "Kenya": { coordinates: [37.9062, -0.0236], name: "Kenya", count: 1 }
};

const WorldMap = ({ coffeeBeans = [] }) => {
  // Count beans by origin
  const originCounts = coffeeBeans.reduce((acc, bean) => {
    if (bean.origin) {
      acc[bean.origin] = (acc[bean.origin] || 0) + 1;
    }
    return acc;
  }, {});

  // Create markers for origins with beans
  const markers = Object.entries(originCounts).map(([origin, count]) => {
    const originData = coffeeOrigins[origin];
    if (originData) {
      return {
        ...originData,
        count
      };
    }
    return null;
  }).filter(Boolean);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Coffee Origins Map</h3>
      <div className="relative">
        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{
            scale: 147
          }}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#EAEAEC"
                  stroke="#D6D6DA"
                  strokeWidth={0.5}
                />
              ))
            }
          </Geographies>
          {markers.map(({ coordinates, name, count }) => (
            <Marker key={name} coordinates={coordinates}>
              <circle r={Math.max(4, count * 2)} fill="#F59E0B" stroke="#fff" strokeWidth={2} />
              <text
                textAnchor="middle"
                y={-10}
                style={{ fontFamily: "system-ui", fill: "#5D5A6D", fontSize: "10px" }}
              >
                {name}
              </text>
            </Marker>
          ))}
        </ComposableMap>
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p>Circle size indicates number of coffee beans from each origin</p>
      </div>
    </div>
  );
};

export default WorldMap; 