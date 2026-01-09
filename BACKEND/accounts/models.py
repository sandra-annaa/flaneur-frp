from django.db import models
from django.contrib.auth.models import User

class Trip(models.Model):
    BUDGET_CHOICES = [
        ('budget', 'Budget'),
        ('midrange', 'Mid-range'),
        ('luxury', 'Luxury'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    destination = models.CharField(max_length=100)
    start_date = models.DateField()
    duration = models.IntegerField()  # in days
    travelers = models.CharField(max_length=100)  # e.g., "2 Adults, 1 Child"
    budget = models.CharField(max_length=20, choices=BUDGET_CHOICES)
    interests = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    travel_mode = models.CharField(max_length=20, blank=True)  # flight, train, etc
    accommodation = models.CharField(max_length=20, blank=True)
    itinerary = models.JSONField(blank=True, null=True)  # Store AI-generated itinerary
    packing_list = models.JSONField(blank=True, null=True)  # Store packing list
    generated_at = models.DateTimeField(blank=True, null=True)  # When itinerary was generated
    
    def __str__(self):
        return f"{self.destination} - {self.user.email}"