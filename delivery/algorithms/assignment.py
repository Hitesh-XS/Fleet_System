import math


def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate the great-circle distance between two points on the Earth surface."""
    R = 6371.0  # Radius of the Earth in kilometers

    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)

    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c


def assign_orders_greedy(vehicles, orders):
    """
    Simple Greedy Strategy:
    For each order, find the closest vehicle that has enough remaining capacity.
    """
    assignments = []

    for order in orders:
        if order.delivered:
            continue

        best_vehicle = None
        min_dist = float('inf')

        for vehicle in vehicles:
            # Check if vehicle has capacity for this order
            if vehicle.current_load + order.weight <= vehicle.capacity:
                dist = calculate_distance(order.latitude, order.longitude, vehicle.latitude, vehicle.longitude)

                if dist < min_dist:
                    min_dist = dist
                    best_vehicle = vehicle

        if best_vehicle:
            # Record the assignment
            assignments.append({
                'order_id': order.id,
                'customer': order.customer_name,
                'vehicle_id': best_vehicle.id,
                'vehicle_number': best_vehicle.vehicle_number,
                'distance_km': round(min_dist, 2)
            })

            # Temporarily update the vehicle's load in memory so it doesn't get overbooked
            best_vehicle.current_load += order.weight

    return assignments