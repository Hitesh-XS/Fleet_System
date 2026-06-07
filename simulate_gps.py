import websocket
import json
import time
import requests


def get_real_road_coordinates(start_lat, start_lng, end_lat, end_lng):
    print(f"🗺️ Asking OSRM for the real street route...")

    # OSRM expects coordinates in Longitude,Latitude format
    url = f"http://router.project-osrm.org/route/v1/driving/{start_lng},{start_lat};{end_lng},{end_lat}?overview=full&geometries=geojson"

    response = requests.get(url)
    data = response.json()

    # OSRM gives us a list of coordinates that perfectly follow the road
    raw_coordinates = data['routes'][0]['geometry']['coordinates']

    # OSRM returns [Longitude, Latitude]. We flip it to [Latitude, Longitude] for Leaflet
    return [[coord[1], coord[0]] for coord in raw_coordinates]


def simulate_realistic_movement():
    print("📡 Connecting to Fleet Tracking Satellite...")
    ws = websocket.WebSocket()
    ws.connect("ws://127.0.0.1:8000/ws/tracking/")
    print("✅ Connection established.")

    # Let's drive Vehicle MH-02-MD02 from Andheri to Dadar
    start_lat, start_lng = 19.1130, 72.8690
    end_lat, end_lng = 19.0176, 72.8561

    # Get the actual road path!
    road_path = get_real_road_coordinates(start_lat, start_lng, end_lat, end_lng)

    print(f"🚦 Engine started! Driving through {len(road_path)} road waypoints...")

    # Iterate through the actual street coordinates
    for lat, lng in road_path:
        payload = {
            "vehicle": "MH-02-MD02",
            "lat": lat,
            "lng": lng
        }

        ws.send(json.dumps(payload))
        print(f"🚚 Van Location: {lat:.4f}, {lng:.4f}")

        # Drive speed: Wait 0.5 seconds between each waypoint
        time.sleep(0.5)

    ws.close()
    print("🏁 Vehicle arrived safely at destination.")


if __name__ == "__main__":
    simulate_realistic_movement()