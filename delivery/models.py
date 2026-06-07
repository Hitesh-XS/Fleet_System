from django.db import models


class Vehicle(models.Model):
    vehicle_number = models.CharField(max_length=20, unique=True)
    capacity = models.IntegerField()
    # Changed to current_load so your React frontend can read it properly!
    current_load = models.IntegerField(default=0)

    latitude = models.FloatField()
    longitude = models.FloatField()

    # Added max_length=20 here (Django requires this for CharFields)
    status = models.CharField(max_length=20)

    def __str__(self):
        return self.vehicle_number


class Order(models.Model):
    # Removed the ForeignKey and brought back customer_name!
    customer_name = models.CharField(max_length=100)

    latitude = models.FloatField()
    longitude = models.FloatField()
    weight = models.IntegerField()
    priority = models.IntegerField()
    delivered = models.BooleanField(default=False)

    def __str__(self):
        return f"Order for {self.customer_name}"