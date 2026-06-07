import json
from channels.generic.websocket import WebsocketConsumer, AsyncWebsocketConsumer


class TrackingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name='fleet_tracking'

        await self.channel_layer.group_add(self.room_group_name,self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name,self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)

        # Broadcast the location update to everyone connected to the map
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'vehicle_location_update',
                'vehicle': data['vehicle'],
                'lat': data['lat'],
                'lng': data['lng']
            }
        )

    async def vehicle_location_update(self, event):
        await self.send(text_data=json.dumps({
            'vehicle': event['vehicle'],
            'lat': event['lat'],
            'lng': event['lng']
        }))