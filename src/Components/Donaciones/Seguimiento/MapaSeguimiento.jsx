import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import * as turf from '@turf/turf';
import axios from 'axios';

// Custom markers for different points
const createCustomIcon = (color, size = [25, 41]) => {
    return L.icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        iconSize: size,
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        shadowSize: [41, 41]
    });
};

// Create a truck icon for the moving marker
const truckIcon = L.icon({
    iconUrl: '/camionc.png', // Assuming truck.png is in the public folder
    iconSize: [40, 40],
    iconAnchor: [20, 20],    // Center of the icon
    popupAnchor: [0, -20]
});

// Current position marker (red)
const currentPositionIcon = createCustomIcon('red');
// History points marker (blue)
const historyPointIcon = createCustomIcon('blue');
// First point marker (green)
const startPointIcon = createCustomIcon('green');

// Calculate bearing angle between two points in degrees
const calculateBearing = (startLat, startLng, destLat, destLng) => {
    const startLatRad = startLat * Math.PI / 180;
    const startLngRad = startLng * Math.PI / 180;
    const destLatRad = destLat * Math.PI / 180;
    const destLngRad = destLng * Math.PI / 180;

    const y = Math.sin(destLngRad - startLngRad) * Math.cos(destLatRad);
    const x = Math.cos(startLatRad) * Math.sin(destLatRad) -
        Math.sin(startLatRad) * Math.cos(destLatRad) * Math.cos(destLngRad - startLngRad);

    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    bearing = (bearing + 360) % 360; // Normalize to 0-360

    return bearing;
};

// This component will handle the routing and animation
const RoutingMachine = ({ seguimiento }) => {
    const map = useMap();
    const movingMarkerRef = useRef(null);
    const routePointsRef = useRef([]);
    const animationRef = useRef(null);
    const autoStartedRef = useRef(false);
    const routeLayerRef = useRef(null);
    const [isAnimating, setIsAnimating] = useState(false);

    const startAnimation = () => {
        if (isAnimating || routePointsRef.current.length === 0) return;

        setIsAnimating(true);
        let step = 0;
        const totalSteps = routePointsRef.current.length;
        let lastTimestamp = null;

        // Calculate how long the animation should take (in milliseconds)
        const totalAnimationTime = 90000; // 60 seconds (1 minute)

        // Time per step to achieve 1-minute total animation
        const timePerStep = totalAnimationTime / totalSteps;

        // Clear any existing animation
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }

        let startTime = null;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;

            // Calculate elapsed time
            const elapsedTime = timestamp - startTime;

            // Calculate the current step based on elapsed time
            const currentStep = Math.min(Math.floor(elapsedTime / timePerStep), totalSteps - 1);

            // If we've reached the end of the route
            if (currentStep >= totalSteps - 1) {
                // Set to the final position
                const finalPoint = routePointsRef.current[totalSteps - 1];
                if (movingMarkerRef.current && finalPoint) {
                    movingMarkerRef.current.setLatLng([finalPoint.lat, finalPoint.lng]);
                }
                setIsAnimating(false);
                return;
            }

            // Update marker position
            const currentPoint = routePointsRef.current[currentStep];
            const nextPoint = routePointsRef.current[Math.min(currentStep + 1, totalSteps - 1)];

            if (movingMarkerRef.current && currentPoint) {
                // Set the marker position
                movingMarkerRef.current.setLatLng([currentPoint.lat, currentPoint.lng]);

                // Calculate bearing angle to next point
                if (nextPoint) {
                    const bearing = calculateBearing(
                        currentPoint.lat, currentPoint.lng,
                        nextPoint.lat, nextPoint.lng
                    );

                    // Get marker element and apply rotation 
                    // The -90 adjustment is because the truck icon faces right (90°) by default
                    const markerElement = movingMarkerRef.current.getElement();
                    if (markerElement) {
                        const iconElement = markerElement.querySelector('img');
                        if (iconElement) {
                            iconElement.style.transform = `rotate(${bearing - 90}deg)`;
                        }
                    }
                }
            }

            // Continue animation
            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);
    };

    const stopAnimation = () => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            setIsAnimating(false);
        }
    };

    // Auto-start animation when route is ready
    const autoStartAnimation = () => {
        if (!autoStartedRef.current && routePointsRef.current.length > 0) {
            // Set the flag to prevent multiple auto-starts
            autoStartedRef.current = true;

            // Start the animation after a small delay to ensure the UI is ready
            setTimeout(() => {
                startAnimation();
            }, 500);
        }
    };

    // Get route using OpenRouteService API
    const getRouteFromOpenRouteService = async (waypoints) => {
        try {
            // OpenRouteService API key - register for free at openrouteservice.org
            const apiKey = '5b3ce3597851110001cf6248099d6d212bcf4f3c9a99b05ca49ae755'; 
            
            // Format coordinates for ORS: [lon, lat]
            const coordinates = waypoints.map(wp => [wp.lng, wp.lat]);
            
            // API request to OpenRouteService
            const response = await axios.post(
                'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
                {
                    coordinates: coordinates,
                    preference: 'fastest',
                    format: 'geojson',
                    instructions: false
                },
                {
                    headers: {
                        'Authorization': apiKey,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json, application/geo+json'
                    }
                }
            );
            
            // Return the route points
            if (response.data && response.data.features && response.data.features.length > 0) {
                // Extract coordinates from the GeoJSON LineString
                const routeCoordinates = response.data.features[0].geometry.coordinates;
                
                // Convert to [lat, lng] format expected by Leaflet
                return routeCoordinates.map(coord => ({
                    lat: coord[1],
                    lng: coord[0]
                }));
            }
            
            return [];
        } catch (error) {
            console.error('Error fetching route:', error);
            // Fallback to straight line if API fails
            return waypoints;
        }
    };

    useEffect(() => {
        if (!map || !seguimiento) return;

        // Create an array of all points in order (historial + current position)
        const historialPoints = seguimiento.historial.map(p => [p.latitud, p.longitud]);
        const allPoints = [...historialPoints, [seguimiento.latitud, seguimiento.longitud]];

        // Don't proceed if we don't have at least 2 points
        if (allPoints.length < 2) return;

        // Create waypoints for the routing
        const waypoints = allPoints.map(point => L.latLng(point[0], point[1]));

        // Create the moving marker at first point
        if (!movingMarkerRef.current) {
            // Create a custom marker element with rotatable icon
            movingMarkerRef.current = L.marker(waypoints[0], {
                icon: truckIcon,
                zIndexOffset: 1000, // Ensure it's on top of other markers
                rotationAngle: 0,   // Initial rotation angle
                rotationOrigin: 'center center' // Rotate around the center
            }).addTo(map);

            // Add popup to the moving marker
            movingMarkerRef.current.bindPopup('Vehículo en tránsito');
        }

        // Clean up function for when component unmounts
        const cleanup = () => {
            stopAnimation();
            if (movingMarkerRef.current) {
                map.removeLayer(movingMarkerRef.current);
                movingMarkerRef.current = null;
            }
            if (routeLayerRef.current) {
                map.removeLayer(routeLayerRef.current);
                routeLayerRef.current = null;
            }
            // Reset the auto-start flag when cleaning up
            autoStartedRef.current = false;
        };

        // Initialize the route drawing process
        const initRoute = async () => {
            try {
                // Get route points from OpenRouteService
                const routePoints = await getRouteFromOpenRouteService(waypoints);
                
                // Store route points for animation
                routePointsRef.current = routePoints;
                
                // Draw the route on the map
                if (routeLayerRef.current) {
                    map.removeLayer(routeLayerRef.current);
                }
                
                // Create a polyline for the route
                routeLayerRef.current = L.polyline(
                    routePoints.map(point => [point.lat, point.lng]),
                    { color: '#6FA1EC', weight: 4 }
                ).addTo(map);
                
                // Fit the map to the route
                map.fitBounds(routeLayerRef.current.getBounds(), {
                    padding: [50, 50]
                });
                
                // Reset marker to first position
                if (movingMarkerRef.current && routePoints.length > 0) {
                    const firstPoint = routePoints[0];
                    movingMarkerRef.current.setLatLng([firstPoint.lat, firstPoint.lng]);
                    
                    // Set initial rotation if we have at least 2 points
                    if (routePoints.length > 1) {
                        const nextPoint = routePoints[1];
                        const bearing = calculateBearing(
                            firstPoint.lat, firstPoint.lng,
                            nextPoint.lat, nextPoint.lng
                        );
                        
                        // Apply rotation to the marker
                        const markerElement = movingMarkerRef.current.getElement();
                        if (markerElement) {
                            const iconElement = markerElement.querySelector('img');
                            if (iconElement) {
                                iconElement.style.transform = `rotate(${bearing - 90}deg)`;
                            }
                        }
                    }
                }
                
                // Auto-start the animation
                autoStartAnimation();
            } catch (error) {
                console.error('Error initializing route:', error);
            }
        };
        
        // Start the routing process
        initRoute();

        // Clean up when component unmounts
        return cleanup;
    }, [map, seguimiento]);

    return null;
};

const MapaSeguimiento = ({ seguimiento }) => {
    const [mapReady, setMapReady] = useState(false);

    // Prepare the points
    const historialPoints = seguimiento.historial.map(p => [p.latitud, p.longitud]);
    const currentPosition = [seguimiento.latitud, seguimiento.longitud];

    // Get the first and last points for bounds
    const firstPoint = seguimiento.historial[0];
    const currentPoint = [seguimiento.latitud, seguimiento.longitud];

    // Calculate the center point
    const center = [
        (parseFloat(firstPoint.latitud) + parseFloat(seguimiento.latitud)) / 2,
        (parseFloat(firstPoint.longitud) + parseFloat(seguimiento.longitud)) / 2
    ];

    return (
        <MapContainer
            center={center}
            zoom={5}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Marker for the first historical point */}
            <Marker
                position={[firstPoint.latitud, firstPoint.longitud]}
                icon={startPointIcon}
            >
                <Popup>
                    Origen: {seguimiento.origen || 'No especificado'}
                </Popup>
            </Marker>

            {/* Current position marker */}
            <Marker
                position={currentPoint}
                icon={currentPositionIcon}
            >
                <Popup>
                    Ubicación actual
                </Popup>
            </Marker>

            {/* History points as markers */}
            {seguimiento.historial.slice(1).map((point, index) => (
                <Marker
                    key={index}
                    position={[point.latitud, point.longitud]}
                    icon={historyPointIcon}
                >
                    <Popup>
                        Punto de ruta: {index + 2}
                    </Popup>
                </Marker>
            ))}

            {/* Routing component */}
            <RoutingMachine seguimiento={seguimiento} />
        </MapContainer>
    );
};

export default MapaSeguimiento;
