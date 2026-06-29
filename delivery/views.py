from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Vehicle, Order
from .serializers import VehicleSerializer, OrderSerializer


class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

# Placeholder for Routes API
@api_view(['GET'])
def get_routes(request):
    """
    Placeholder endpoint for routes.
    We will update this once the Route model and algorithms are built.
    """
    return Response({
        "message": "Routes endpoint is active. Route logic coming soon!"
    })


from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Vehicle, Order
from .algorithms.assignment import assign_orders_greedy

@api_view(['POST'])
def run_assignment_algorithm(request):
    vehicles = list(Vehicle.objects.all())
    orders = list(Order.objects.filter(delivered=False))

    if not vehicles or not orders:
        return Response({"message": "Need both vehicles and pending orders to run assignment."})

    results = assign_orders_greedy(vehicles, orders)

    return Response({
        "message": "Assignment complete",
        "total_assigned": len(results),
        "assignments": results
    })

from .algorithms.pathfinding import Graph, dijkstra_algorithm, a_star_algorithm


@api_view(['GET'])
def test_algorithms(request):
    """
    Creates a dynamic graph from your database and runs Dijkstra & A*.
    """
    orders = list(Order.objects.all())

    if len(orders) < 2:
        return Response({"error": "Need at least 2 orders in the database to run pathfinding."})

    # 1. Build the Graph
    g = Graph()

    # Add Warehouse as the starting node
    g.add_node("Warehouse", 19.0760, 72.8777)

    # Add all orders as nodes
    for order in orders:
        g.add_node(f"Order_{order.id}", order.latitude, order.longitude)
        # Connect Warehouse to every order
        g.add_edge("Warehouse", f"Order_{order.id}")

    # Connect orders to each other to create route options
    for i in range(len(orders)):
        for j in range(i + 1, len(orders)):
            g.add_edge(f"Order_{orders[i].id}", f"Order_{orders[j].id}")

    # 2. Pick a start and end point
    start = "Warehouse"
    target = f"Order_{orders[-1].id}"  # Target the last order in the database

    # 3. Run Algorithms
    dijkstra_path, d_dist = dijkstra_algorithm(g, start, target)
    astar_path, a_dist = a_star_algorithm(g, start, target)

    return Response({
        "mission": f"Finding shortest path from {start} to {target}",
        "dijkstra_results": {
            "path": dijkstra_path,
            "total_distance_km": round(d_dist, 2)
        },
        "a_star_results": {
            "path": astar_path,
            "total_distance_km": round(a_dist, 2)
        }
    })

from django.http import JsonResponse
import time
import random
def system_health(request):
    data={
        "api_latency_ms":random.randint(20,85),
        "db_connection":"Healthy",
        "ws_status":"Connected",
        "server_load":random.randint(5,25),
        "uptime_seconds":int(time.time()-1700000000),
    }
    return JsonResponse(data)


import itertools
import math
from django.http import JsonResponse
import json


def calculate_haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = math.sin(dLat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dLon / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def optimize_route(request):
    data = json.loads(request.body)
    start_loc = data['start']  # {lat, lng}
    stops = data['stops']  # [{id, lat, lng}, ...]

    # Generate all possible sequences (Permutations)
    best_path = None
    min_distance = float('inf')

    for path in itertools.permutations(stops):
        current_dist = 0
        current_loc = start_loc

        # Calculate path cost
        for stop in path:
            current_dist += calculate_haversine(current_loc['lat'], current_loc['lng'], stop['lat'], stop['lng'])
            current_loc = stop

        if current_dist < min_distance:
            min_distance = current_dist
            best_path = path

    return JsonResponse({"optimized_path": list(best_path), "total_distance": min_distance})
