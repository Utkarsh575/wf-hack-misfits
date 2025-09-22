from django.db import models

class AMLRequest(models.Model):
    wallet_address = models.CharField(max_length= 255)
    risk_score = models.IntegerField(default= 0)

    def __str__(self):
        return f"{self.wallet_address} - {self.risk_score}"
