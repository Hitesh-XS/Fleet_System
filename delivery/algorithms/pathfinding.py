import heapq
import math


def calculate_distance(lat1, lon1, lat2, lon2):
    """Haversine formula to calculate distance between two coordinates in km."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


class Graph:
    def __init__(self):
        self.edges = {}
        self.nodes = {}

    def add_node(self, node_id, lat, lon):
        self.nodes[node_id] = (lat, lon)
        if node_id not in self.edges:
            self.edges[node_id] = []

    def add_edge(self, from_node, to_node):
        """Creates a bidirectional edge weighted by real-world distance."""
        dist = calculate_distance(
            self.nodes[from_node][0], self.nodes[from_node][1],
            self.nodes[to_node][0], self.nodes[to_node][1]
        )
        self.edges[from_node].append((to_node, dist))
        self.edges[to_node].append((from_node, dist))


def dijkstra_algorithm(graph, start_node, target_node):
    """
    Finds the absolute shortest path using Dijkstra's Algorithm.
    Explores all nodes equally. Great for resumes.
    """
    queue = []
    heapq.heappush(queue, (0, start_node))

    distances = {node: float('inf') for node in graph.nodes}
    distances[start_node] = 0

    previous_nodes = {node: None for node in graph.nodes}

    while queue:
        current_distance, current_node = heapq.heappop(queue)

        if current_node == target_node:
            break

        if current_distance > distances[current_node]:
            continue

        for neighbor, weight in graph.edges[current_node]:
            distance = current_distance + weight

            if distance < distances[neighbor]:
                distances[neighbor] = distance
                previous_nodes[neighbor] = current_node
                heapq.heappush(queue, (distance, neighbor))

    # Reconstruct path
    path = []
    current = target_node
    while current is not None:
        path.append(current)
        current = previous_nodes[current]
    return path[::-1], distances[target_node]


def a_star_algorithm(graph, start_node, target_node):
    """
    Finds the shortest path using A* (A-Star).
    Uses Haversine distance as a heuristic to 'guess' the right direction,
    making it much faster than Dijkstra on large maps.
    """
    queue = []
    heapq.heappush(queue, (0, start_node))

    g_scores = {node: float('inf') for node in graph.nodes}
    g_scores[start_node] = 0

    previous_nodes = {node: None for node in graph.nodes}

    while queue:
        _, current_node = heapq.heappop(queue)

        if current_node == target_node:
            break

        for neighbor, weight in graph.edges[current_node]:
            tentative_g_score = g_scores[current_node] + weight

            if tentative_g_score < g_scores[neighbor]:
                previous_nodes[neighbor] = current_node
                g_scores[neighbor] = tentative_g_score

                # Heuristic: Straight-line distance to the target
                h_score = calculate_distance(
                    graph.nodes[neighbor][0], graph.nodes[neighbor][1],
                    graph.nodes[target_node][0], graph.nodes[target_node][1]
                )

                f_score = tentative_g_score + h_score
                heapq.heappush(queue, (f_score, neighbor))

    # Reconstruct path
    path = []
    current = target_node
    while current is not None:
        path.append(current)
        current = previous_nodes[current]
    return path[::-1], g_scores[target_node]