from rest_framework import serializers
from .models import AMLRequest

class AMLRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = AMLRequest
        fields = ['wallet_address', 'risk_score']

